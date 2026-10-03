"use client";

import { createDesign } from "@/components/designs/design-store";

/**
 * Carries a homepage prompt into the editor. The prompt waits in
 * localStorage — across a detour through sign-up, including a confirmation
 * link that opens in a new tab — then becomes the new design's first message, sent as the editor opens.
 * Nothing is generated on the homepage itself.
 */

const PENDING = "snapdesign.pendingPrompt";
const draftKey = (designId: string) => `snapdesign.draft.${designId}`;

/** The pending prompt must survive a new tab; a design's draft only this one. */
const storeFor = (key: string) => (key === PENDING ? localStorage : sessionStorage);

function read(key: string) {
  try {
    return storeFor(key).getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) storeFor(key).removeItem(key);
    else storeFor(key).setItem(key, value);
  } catch {
    // Storage blocked: the editor still opens, just without the draft.
  }
}

export function savePendingPrompt(prompt: string) {
  write(PENDING, prompt);
}

export function hasPendingPrompt() {
  return Boolean(read(PENDING));
}

/** Creates a design, hands it the pending prompt as its draft, and returns the editor path. */
export async function openPendingPrompt() {
  const design = await createDesign();
  const prompt = read(PENDING);
  if (prompt) write(draftKey(design.id), prompt);
  write(PENDING, null);
  return `/editor/${design.id}`;
}

/** The draft waiting for this design, read once. */
export function takeDraft(designId: string) {
  const draft = read(draftKey(designId));
  write(draftKey(designId), null);
  return draft ?? "";
}
