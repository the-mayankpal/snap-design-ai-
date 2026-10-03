"use client";

import { toSignIn } from "@/lib/supabase/browser";
import type {
  Design,
  DesignSettings,
  DesignSummary,
  Frame,
  SaveMessage,
} from "@/components/designs/design-model";

export {
  coverOf,
  DEFAULT_SETTINGS,
  titleFromPrompt,
  UNTITLED,
  type Design,
  type DesignSettings,
  type DesignSummary,
  type Frame,
  type Generation,
  type StoredImage,
  type StoredMessage,
} from "@/components/designs/design-model";

/**
 * Designs live in Supabase, reached only through our own `/api/designs`
 * routes — the browser never reads the database directly. A design belongs to
 * the signed-in user (D77); a 401 means the session ended, so it goes back to
 * sign-in.
 *
 * Every read and write goes through this module, so components never know
 * where designs are stored.
 */

export class StoreError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function api<T>(path: string, init?: { method: string; body?: unknown }): Promise<T> {
  const response = await fetch(`/api/designs${path}`, {
    method: init?.method ?? "GET",
    headers: init?.body ? { "content-type": "application/json" } : undefined,
    body: init?.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  if (response.status === 401) toSignIn();
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new StoreError(response.status, body?.error ?? `Request failed (${response.status}).`);
  }
  return (response.status === 204 ? undefined : await response.json()) as T;
}

/** In the user's own order, unarranged ones first. Designs with no messages are pruned server-side. */
export function listDesigns() {
  return api<DesignSummary[]>("");
}

export async function getDesign(id: string) {
  try {
    return await api<Design>(`/${id}`);
  } catch (error) {
    if (error instanceof StoreError && error.status === 404) return null;
    throw error;
  }
}

export function createDesign() {
  return api<Design>("", { method: "POST" });
}

export function deleteDesign(id: string) {
  return api<void>(`/${id}`, { method: "DELETE" });
}

export function updateDesign(
  id: string,
  patch: { title?: string; settings?: DesignSettings; coverId?: string | null },
) {
  return api<void>(`/${id}`, { method: "PATCH", body: patch });
}

export function pinDesign(id: string, pinned: boolean) {
  return api<void>(`/${id}`, { method: "PATCH", body: { pinned } });
}

/** The whole dashboard order after a drag, first to last (D82). */
export function saveOrder(ids: string[]) {
  return api<void>("/order", { method: "PUT", body: { ids } });
}

export function saveNote(id: string, generationId: string, note: string | null) {
  return api<void>(`/${id}/generations/${generationId}`, { method: "PATCH", body: { note } });
}

export function saveLayout(id: string, frames: ({ id: string } & Frame)[]) {
  return api<void>(`/${id}/layout`, { method: "PUT", body: { frames } });
}

/** A message about to be saved. New attachments still carry their file. */
export type OutgoingMessage = Omit<SaveMessage, "images"> & {
  images?: { id: number; name: string; blob: Blob }[];
};

/**
 * Saves new messages. Attachments go straight to Storage first, through signed
 * upload URLs, so large images never pass through our server.
 */
export async function appendMessages(
  id: string,
  messages: OutgoingMessage[],
  title?: string,
) {
  const files = messages.flatMap((message) => message.images ?? []);
  const paths: string[] = [];
  if (files.length) {
    const slots = await api<{ path: string; url: string }[]>(`/${id}/uploads`, {
      method: "POST",
      body: { files: files.map(({ blob }) => ({ type: blob.type, size: blob.size })) },
    });
    await Promise.all(slots.map((slot, index) => upload(slot.url, files[index].blob)));
    paths.push(...slots.map((slot) => slot.path));
  }

  let next = 0;
  const saved: SaveMessage[] = messages.map(({ images, ...message }) => ({
    ...message,
    images: images?.map(({ id: imageId, name }) => ({ id: imageId, name, path: paths[next++] })),
  }));
  await api<void>(`/${id}/messages`, { method: "POST", body: { messages: saved, title } });
}

async function upload(url: string, blob: Blob) {
  const response = await fetch(url, {
    method: "PUT",
    headers: { "content-type": blob.type, "x-upsert": "false" },
    body: blob,
  });
  if (!response.ok) throw new StoreError(response.status, "Couldn't upload an image.");
}
