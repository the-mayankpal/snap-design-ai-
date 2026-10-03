"use client";

import type { CanvasImage } from "@/components/editor/canvas-stage";
import { toSignIn } from "@/lib/supabase/browser";

/**
 * The browser side of a chat turn (D71): `runTurn` returns the art director's
 * reply at once — plus a pending image when the turn makes one — and
 * `renderImage` then waits for that image.
 */

export type Pending = { id: string; width: number; height: number };

export type TurnResult = {
  reply: string;
  suggestions: string[];
  clarify: { question: string; options: string[] } | null;
  pending: Pending | null;
};

type Result<T> = { ok: true; data: T } | { ok: false; message: string; status?: number };

/** Free images left (D83); null when the account has no limit. */
export type Free = { limit: number; left: number; reason: string | null } | null;

/** 402: the free allowance is used up (or the account can't have one). */
export const OUT_OF_FREE_STATUS = 402;

const DISABLED_COPY = "Design generation is switched off while we test privately. Check back soon.";
const OFFLINE_COPY = "We couldn't reach snapdesign. Check your connection and try again.";

async function post<T>(url: string, body?: unknown): Promise<Result<T>> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    return { ok: false, message: OFFLINE_COPY };
  }
  const data = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (response.status === 401) toSignIn();
  if (response.status === 403) return { ok: false, message: DISABLED_COPY };
  if (!response.ok || !data) {
    return {
      ok: false,
      message: data?.error ?? "Something went wrong. Please try again.",
      status: response.status,
    };
  }
  return { ok: true, data };
}

export function runTurn(
  designId: string,
  messages: { role: "user" | "assistant"; text: string }[],
  settings: { ratio: string; kind: string },
  /** The image selected on the canvas; edits default to it. */
  targetId: string | null,
) {
  return post<TurnResult>(`/api/designs/${designId}/turn`, {
    messages,
    settings,
    ...(targetId ? { targetId } : {}),
  });
}

export function renderImage(generationId: string) {
  return post<CanvasImage & { free?: Free }>(`/api/generations/${generationId}/render`);
}

/** The account's free images left, or undefined if it couldn't be read. */
export async function readFree(): Promise<Free | undefined> {
  try {
    const response = await fetch("/api/usage");
    if (!response.ok) return undefined;
    return ((await response.json()) as { free: Free }).free;
  } catch {
    return undefined;
  }
}
