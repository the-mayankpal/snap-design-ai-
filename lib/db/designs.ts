import "server-only";

import {
  DEFAULT_SETTINGS,
  UNTITLED,
  type Design,
  type DesignSettings,
  type DesignSummary,
  type Frame,
  type Generation,
  type SaveMessage,
} from "@/components/designs/design-model";
import { HttpError } from "@/lib/api";
import { isUuid } from "@/lib/ids";
import { removePaths, signPaths } from "@/lib/storage/images";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Every query is scoped by `user_id`, the signed-in user from `requireUser`
 * (D77) — the service-role client bypasses RLS, so this scoping is what keeps
 * one person's designs from another's. Never drop it from a query.
 */

type DesignRow = {
  id: string;
  title: string;
  settings: DesignSettings;
  cover_generation_id: string | null;
  created_at: string;
  updated_at: string;
  pinned_at: string | null;
};

type ImageRef = { id: number; name: string; path: string };

type MessageRow = {
  seq: number;
  role: "user" | "assistant";
  text: string;
  images: ImageRef[];
  generation_id: string | null;
};

/** Only `succeeded` rows are ever read here, so the image fields are set. */
type GenerationRow = {
  id: string;
  raw_prompt: string;
  image_path: string;
  width: number;
  height: number;
  created_at: string;
  canvas_x: number | null;
  canvas_y: number | null;
  canvas_w: number | null;
  note: string | null;
};

const DESIGN_COLUMNS = "id, title, settings, cover_generation_id, created_at, updated_at, pinned_at";
const GENERATION_COLUMNS =
  "id, raw_prompt, image_path, width, height, created_at, canvas_x, canvas_y, canvas_w, note";

const db = () => supabaseAdmin();

function toGeneration(row: GenerationRow, urls: Map<string, string>): Generation {
  return {
    id: row.id,
    url: urls.get(row.image_path) ?? "",
    width: row.width,
    height: row.height,
    prompt: row.raw_prompt,
    createdAt: Date.parse(row.created_at),
    frame:
      row.canvas_x !== null && row.canvas_y !== null && row.canvas_w !== null
        ? { x: Number(row.canvas_x), y: Number(row.canvas_y), w: Number(row.canvas_w) }
        : null,
    note: row.note,
  };
}

/** 404s unless the design exists and belongs to this user. */
export async function assertOwned(owner: string, id: string) {
  if (!isUuid(id)) throw new HttpError(404, "Design not found.");
  const { data, error } = await db()
    .from("designs")
    .select("id")
    .eq("id", id)
    .eq("user_id", owner)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(404, "Design not found.");
}

/** The chosen cover, else the newest generation — as `coverOf`, on raw rows. */
function coverRow(row: DesignRow & { generations: GenerationRow[] }) {
  return (
    row.generations.find((generation) => generation.id === row.cover_generation_id) ??
    row.generations.at(-1) ??
    null
  );
}

/**
 * Newest-edited first. A design opened and left without a single prompt is
 * noise, not work — it is deleted here rather than listed as a blank card.
 */
export async function listDesigns(owner: string): Promise<DesignSummary[]> {
  const { data, error } = await db()
    .from("designs")
    .select(`${DESIGN_COLUMNS}, messages(role), generations!generations_design_id_fkey(${GENERATION_COLUMNS})`)
    .eq("user_id", owner)
    .eq("generations.status", "succeeded")
    // The user's own arrangement (D82); designs never arranged come first, newest-edited first.
    .order("position", { ascending: true, nullsFirst: true })
    .order("updated_at", { ascending: false })
    .order("created_at", { referencedTable: "generations", ascending: true });
  if (error) throw error;

  const rows = data as (DesignRow & {
    messages: { role: string }[];
    generations: GenerationRow[];
  })[];

  const empty = rows.filter((row) => row.messages.length === 0).map((row) => row.id);
  if (empty.length) {
    const { error: deleteError } = await db()
      .from("designs")
      .delete()
      .eq("user_id", owner)
      .in("id", empty);
    if (deleteError) throw deleteError;
  }

  const kept = rows.filter((row) => row.messages.length > 0);
  const covers = kept.map(coverRow);
  const urls = await signPaths(
    covers.flatMap((cover) => (cover ? [cover.image_path] : [])),
  );

  return kept.map((row, index) => {
    const cover = covers[index];
    return {
      id: row.id,
      title: row.title,
      updatedAt: Date.parse(row.updated_at),
      settings: row.settings,
      pinnedAt: row.pinned_at ? Date.parse(row.pinned_at) : null,
      prompts: row.messages.filter((message) => message.role === "user").length,
      shots: row.generations.length,
      cover: cover ? toGeneration(cover, urls) : null,
    };
  });
}

export async function getDesign(owner: string, id: string): Promise<Design | null> {
  if (!isUuid(id)) return null;
  const { data, error } = await db()
    .from("designs")
    .select(
      `${DESIGN_COLUMNS}, messages(seq, role, text, images, generation_id), generations!generations_design_id_fkey(${GENERATION_COLUMNS})`,
    )
    .eq("id", id)
    .eq("user_id", owner)
    .eq("generations.status", "succeeded")
    .order("seq", { referencedTable: "messages", ascending: true })
    .order("created_at", { referencedTable: "generations", ascending: true })
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as DesignRow & { messages: MessageRow[]; generations: GenerationRow[] };
  const urls = await signPaths([
    ...row.messages.flatMap((message) => message.images.map((image) => image.path)),
    ...row.generations.map((generation) => generation.image_path),
  ]);

  return {
    id: row.id,
    title: row.title,
    createdAt: Date.parse(row.created_at),
    updatedAt: Date.parse(row.updated_at),
    settings: row.settings,
    coverId: row.cover_generation_id,
    messages: row.messages.map((message) => ({
      id: message.seq,
      role: message.role,
      text: message.text,
      images: message.images.length
        ? message.images.map((image) => ({
            id: image.id,
            name: image.name,
            url: urls.get(image.path) ?? "",
          }))
        : undefined,
      ...(message.generation_id && { generationId: message.generation_id }),
    })),
    generations: row.generations.map((generation) => toGeneration(generation, urls)),
  };
}

export async function createDesign(owner: string): Promise<Design> {
  const { data, error } = await db()
    .from("designs")
    .insert({ user_id: owner, title: UNTITLED, settings: DEFAULT_SETTINGS })
    .select(DESIGN_COLUMNS)
    .single();
  if (error) throw error;
  const row = data as DesignRow;
  return {
    id: row.id,
    title: row.title,
    createdAt: Date.parse(row.created_at),
    updatedAt: Date.parse(row.updated_at),
    settings: row.settings,
    coverId: null,
    messages: [],
    generations: [],
  };
}

export async function updateDesign(
  owner: string,
  id: string,
  patch: { title?: string; settings?: DesignSettings; coverId?: string | null },
) {
  await assertOwned(owner, id);
  if (patch.coverId) {
    const { data, error } = await db()
      .from("generations")
      .select("id")
      .eq("id", patch.coverId)
      .eq("design_id", id)
      .eq("status", "succeeded")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new HttpError(400, "That image isn't part of this design.");
  }
  await writeDesign(owner, id, patch);
}

/** Pins or unpins on the dashboard. Not an edit, so `updated_at` stays as it was. */
export async function pinDesign(owner: string, id: string, pinned: boolean) {
  await assertOwned(owner, id);
  const { error } = await db()
    .from("designs")
    .update({ pinned_at: pinned ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("user_id", owner);
  if (error) throw error;
}

/**
 * Saves the dashboard order (D82): each id's position is its index. Ids not
 * owned by this user match no row, so they change nothing. Like pinning, not
 * an edit: `updated_at` stays as it was.
 */
export async function saveOrder(owner: string, ids: string[]) {
  const results = await Promise.all(
    ids.map((id, position) =>
      db().from("designs").update({ position }).eq("id", id).eq("user_id", owner),
    ),
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
}

/** Applies a patch and bumps `updated_at`. Callers check ownership first. */
async function writeDesign(
  owner: string,
  id: string,
  patch: { title?: string; settings?: DesignSettings; coverId?: string | null },
) {
  const { error } = await db()
    .from("designs")
    .update({
      ...(patch.title !== undefined && { title: patch.title }),
      ...(patch.settings && { settings: patch.settings }),
      ...(patch.coverId !== undefined && { cover_generation_id: patch.coverId }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", owner);
  if (error) throw error;
}

/** Deletes the rows (messages and generations cascade) and every stored image. */
export async function deleteDesign(owner: string, id: string) {
  await assertOwned(owner, id);
  const [messages, generations] = await Promise.all([
    db().from("messages").select("images").eq("design_id", id),
    db().from("generations").select("image_path").eq("design_id", id).not("image_path", "is", null),
  ]);
  if (messages.error) throw messages.error;
  if (generations.error) throw generations.error;

  const { error } = await db()
    .from("designs")
    .delete()
    .eq("id", id)
    .eq("user_id", owner);
  if (error) throw error;

  // Rows first: a failed file cleanup leaves an orphaned file, never a design
  // pointing at a missing image.
  await removePaths([
    ...(messages.data as { images: ImageRef[] }[]).flatMap((row) =>
      row.images.map((image) => image.path),
    ),
    ...(generations.data as { image_path: string }[]).map((row) => row.image_path),
  ]);
}

/**
 * Saves new chat messages. `seq` is unique per design, so a retried save is a
 * no-op instead of a duplicate. `title` renames the design in the same write.
 */
export async function appendMessages(
  owner: string,
  id: string,
  messages: SaveMessage[],
  title?: string,
) {
  await assertOwned(owner, id);
  await assertGenerationsIn(id, messages.flatMap((message) => message.generationId ?? []));
  const { error } = await db()
    .from("messages")
    .upsert(
      messages.map((message) => ({
        design_id: id,
        seq: message.id,
        role: message.role,
        text: message.text,
        images: message.images ?? [],
        generation_id: message.generationId ?? null,
      })),
      { onConflict: "design_id,seq", ignoreDuplicates: true },
    );
  if (error) throw error;
  await writeDesign(owner, id, title ? { title } : {});
}

/** 400s unless every id is a generation of this design, so a reply can't point at another design's image. */
async function assertGenerationsIn(designId: string, ids: string[]) {
  if (ids.length === 0) return;
  const { data, error } = await db()
    .from("generations")
    .select("id")
    .eq("design_id", designId)
    .in("id", ids);
  if (error) throw error;
  if ((data as { id: string }[]).length !== new Set(ids).size) {
    throw new HttpError(400, "A message refers to an image that isn't part of this design.");
  }
}

/** Saves where images sit on the canvas. Ids outside this design are ignored by the design_id filter. */
export async function saveLayout(owner: string, id: string, frames: { id: string; frame: Frame }[]) {
  await assertOwned(owner, id);
  const results = await Promise.all(
    frames.map(({ id: generationId, frame }) =>
      db()
        .from("generations")
        .update({ canvas_x: frame.x, canvas_y: frame.y, canvas_w: frame.w })
        .eq("id", generationId)
        .eq("design_id", id),
    ),
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
}
