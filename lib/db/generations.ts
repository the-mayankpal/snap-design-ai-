import "server-only";

import { isFinalNote, type DesignSettings } from "@/components/designs/design-model";
import { HttpError } from "@/lib/api";
import type { StyleLock } from "@/lib/ai/studio/director";
import { readSpec, type Action, type DesignSpec } from "@/lib/ai/studio/spec";
import { isUuid } from "@/lib/ids";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Generation records for the art-director pipeline (D71). A turn writes a
 * `pending` row holding the spec and compiled prompt; rendering claims it
 * (`rendering`) and ends it `succeeded` or `failed`, so every attempt is on
 * record. `final_prompt` is our IP: stored here, never returned to the browser.
 * Every read is scoped by the design's `user_id` (see lib/db/designs.ts).
 */

const db = () => supabaseAdmin();

/** How many of a design's most recent images the art director sees. */
const CONTEXT_ASSETS = 12;

export type Asset = { id: string; handle: string; spec: DesignSpec; imagePath: string; note: string | null };

/**
 * Everything the art director needs about a design this user owns: the
 * newest images, plus `selectedId` (the image clicked on the canvas) even
 * when it is older than those.
 */
export async function loadStudio(owner: string, designId: string, selectedId: string | null) {
  if (!isUuid(designId)) throw new HttpError(404, "Design not found.");
  const { data, error } = await db()
    .from("designs")
    .select("id, settings, style_lock")
    .eq("id", designId)
    .eq("user_id", owner)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(404, "Design not found.");
  const design = data as { settings: DesignSettings; style_lock: StyleLock | null };

  const rows = await db()
    .from("generations")
    .select("id, spec, image_path, note")
    .eq("design_id", designId)
    .eq("status", "succeeded")
    .not("spec", "is", null)
    .order("created_at", { ascending: false })
    .limit(CONTEXT_ASSETS);
  if (rows.error) throw rows.error;

  type Row = { id: string; spec: unknown; image_path: string; note: string | null };
  const recent = (rows.data as Row[]).reverse();
  if (selectedId && isUuid(selectedId) && !recent.some((row) => row.id === selectedId)) {
    const older = await db()
      .from("generations")
      .select("id, spec, image_path, note")
      .eq("id", selectedId)
      .eq("design_id", designId)
      .eq("status", "succeeded")
      .maybeSingle();
    if (older.error) throw older.error;
    if (older.data) recent.unshift(older.data as Row);
  }

  const assets = recent
    .flatMap((row) => {
      const spec = readSpec(row.spec);
      return spec ? [{ id: row.id, spec, imagePath: row.image_path, note: row.note }] : [];
    })
    .map((asset, index): Asset => ({ ...asset, handle: `A${index + 1}` }));

  const selected = assets.find((asset) => asset.id === selectedId) ?? null;
  return { settings: design.settings, style: design.style_lock, assets, selected };
}

export async function insertPlanned(row: {
  designId: string;
  parentId: string | null;
  action: Action;
  rawPrompt: string;
  spec: DesignSpec;
  finalPrompt: string;
  width: number;
  height: number;
  knowledgeVersion: string;
  planMs: number;
}) {
  const { data, error } = await db()
    .from("generations")
    .insert({
      design_id: row.designId,
      parent_id: row.parentId,
      action: row.action,
      category: row.spec.family,
      raw_prompt: row.rawPrompt,
      spec: row.spec,
      final_prompt: row.finalPrompt,
      width: row.width,
      height: row.height,
      knowledge_version: row.knowledgeVersion,
      plan_ms: row.planMs,
      status: "pending",
    })
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export type Claimed = {
  id: string;
  designId: string;
  parentId: string | null;
  action: Action;
  rawPrompt: string;
  spec: DesignSpec;
  finalPrompt: string;
  width: number;
  height: number;
};

/**
 * Moves a pending generation to `rendering` and returns it. The status guard
 * makes this atomic: a second render request for the same row gets a 409.
 */
export async function claimPending(owner: string, id: string): Promise<Claimed> {
  if (!isUuid(id)) throw new HttpError(404, "Generation not found.");
  const owned = await db()
    .from("generations")
    .select("id, designs!generations_design_id_fkey!inner(user_id)")
    .eq("id", id)
    .eq("designs.user_id", owner)
    .maybeSingle();
  if (owned.error) throw owned.error;
  if (!owned.data) throw new HttpError(404, "Generation not found.");

  const { data, error } = await db()
    .from("generations")
    .update({ status: "rendering" })
    .eq("id", id)
    .eq("status", "pending")
    .select("id, design_id, parent_id, action, raw_prompt, spec, final_prompt, width, height");
  if (error) throw error;
  const row = (data as Record<string, unknown>[])[0];
  if (!row) throw new HttpError(409, "This image is already being made.");
  const spec = readSpec(row.spec);
  if (!spec) throw new HttpError(500, "This generation has no usable spec.");
  return {
    id: row.id as string,
    designId: row.design_id as string,
    parentId: (row.parent_id as string | null) ?? null,
    action: row.action as Action,
    rawPrompt: row.raw_prompt as string,
    spec,
    finalPrompt: row.final_prompt as string,
    width: row.width as number,
    height: row.height as number,
  };
}

/** The stored image of a generation in the same design, for edits and series. */
export async function imagePathOf(designId: string, id: string) {
  const { data, error } = await db()
    .from("generations")
    .select("image_path")
    .eq("id", id)
    .eq("design_id", designId)
    .eq("status", "succeeded")
    .maybeSingle();
  if (error) throw error;
  return (data as { image_path: string } | null)?.image_path ?? null;
}

export async function markSucceeded(
  id: string,
  designId: string,
  result: { model: string; imagePath: string; renderMs: number },
) {
  const { error } = await db()
    .from("generations")
    .update({
      status: "succeeded",
      model: result.model,
      image_path: result.imagePath,
      render_ms: result.renderMs,
    })
    .eq("id", id);
  if (error) throw error;

  const { error: touchError } = await db()
    .from("designs")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", designId);
  if (touchError) throw touchError;
}

/** `reason` is a short internal code (e.g. "render: 500"), never a provider message. */
export async function markFailed(id: string, reason: string) {
  const { error } = await db()
    .from("generations")
    .update({ status: "failed", error: reason.slice(0, 200) })
    .eq("id", id);
  if (error) throw error;
}

/**
 * The project's look (D73). A `new` design sets it — it follows the project
 * style unless the user asked for a different look, so either way it is the
 * look to keep. Other actions only fill it when the project has none yet.
 */
export async function saveStyle(designId: string, spec: DesignSpec, overwrite: boolean) {
  const { type, color, imagery, graphic } = spec.direction;
  const custom = {
    type: spec.custom.type,
    color: spec.custom.color,
    imagery: spec.custom.imagery,
    graphic: spec.custom.graphic,
  };
  const style: StyleLock = { type, color, imagery, graphic, palette: spec.palette, custom };
  let query = db().from("designs").update({ style_lock: style }).eq("id", designId);
  if (!overwrite) query = query.is("style_lock", null);
  const { error } = await query;
  if (error) throw error;
}

/**
 * Saves the user's note on an image of their design. A note that marks it
 * final makes its look the project style, so later assets follow it (D80).
 */
export async function saveNote(owner: string, designId: string, id: string, note: string | null) {
  if (!isUuid(id) || !isUuid(designId)) throw new HttpError(404, "Image not found.");
  const { data, error } = await db()
    .from("generations")
    .update({ note })
    .eq("id", id)
    .eq("design_id", designId)
    .eq("status", "succeeded")
    .select("spec, designs!generations_design_id_fkey!inner(user_id)")
    .eq("designs.user_id", owner)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(404, "Image not found.");
  const spec = readSpec((data as { spec: unknown }).spec);
  if (spec && isFinalNote(note)) await saveStyle(designId, spec, true);
}
