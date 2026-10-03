import "server-only";

import {
  titleFromPrompt,
  type DesignSettings,
} from "@/components/designs/design-model";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * The generation record for Prompt Studio. A row is written `pending` before
 * any provider call and ends `succeeded` or `failed`, so every attempt —
 * including its final prompt — is on record. `final_prompt` is our IP: it is
 * stored here and never returned to the browser.
 */

const db = () => supabaseAdmin();

export async function insertPendingGeneration(row: {
  category: string;
  rawPrompt: string;
  brief: unknown;
  answers: Record<string, string> | null;
}) {
  const { data, error } = await db()
    .from("generations")
    .insert({
      category: row.category,
      raw_prompt: row.rawPrompt,
      brief: row.brief,
      answers: row.answers,
      status: "pending",
    })
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function recordFinalPrompt(id: string, finalPrompt: string, brief: unknown) {
  const { error } = await db()
    .from("generations")
    .update({ final_prompt: finalPrompt, brief })
    .eq("id", id);
  if (error) throw error;
}

export async function markSucceeded(
  id: string,
  result: { designId: string; model: string; imagePath: string; width: number; height: number },
) {
  const { error } = await db()
    .from("generations")
    .update({
      status: "succeeded",
      design_id: result.designId,
      model: result.model,
      image_path: result.imagePath,
      width: result.width,
      height: result.height,
    })
    .eq("id", id);
  if (error) throw error;
}

/** `reason` is a short internal code (e.g. "generate: 500"), never a provider message. */
export async function markFailed(id: string, reason: string) {
  const { error } = await db()
    .from("generations")
    .update({ status: "failed", error: reason.slice(0, 200) })
    .eq("id", id);
  if (error) throw error;
}

/**
 * Creates the design a successful generation opens in: titled from the
 * prompt, with the prompt as its first message so the editor's chat shows how
 * it started (and the gallery, which skips empty designs, lists it).
 */
export async function createDesignForGeneration(
  device: string,
  rawPrompt: string,
  settings: DesignSettings,
) {
  const { data, error } = await db()
    .from("designs")
    .insert({ device_id: device, title: titleFromPrompt(rawPrompt), settings })
    .select("id")
    .single();
  if (error) throw error;
  const designId = (data as { id: string }).id;

  await insertExchange(designId, 0, rawPrompt);
  return designId;
}

/**
 * Adds a generation's prompt and reply to an existing design (`projectId`),
 * after its current history, and marks the design as just edited. The caller
 * has already checked this browser owns it.
 */
export async function addGenerationMessages(designId: string, rawPrompt: string) {
  const { data, error } = await db()
    .from("messages")
    .select("seq")
    .eq("design_id", designId)
    .order("seq", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  const next = data ? (data as { seq: number }).seq + 1 : 0;
  await insertExchange(designId, next, rawPrompt);

  const { error: touchError } = await db()
    .from("designs")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", designId);
  if (touchError) throw touchError;
  return designId;
}

async function insertExchange(designId: string, seq: number, rawPrompt: string) {
  const { error } = await db()
    .from("messages")
    .insert([
      { design_id: designId, seq, role: "user", text: rawPrompt },
      { design_id: designId, seq: seq + 1, role: "assistant", text: "Here's a design from your prompt." },
    ]);
  if (error) throw error;
}
