"use client";

import { useSyncExternalStore } from "react";

/**
 * What the auth mascot reacts to: which kind of field has focus, and when the
 * last error appeared. The fields write it; every mascot on the page reads it.
 */

export type MascotFocus =
  | { kind: "text"; length: number }
  | { kind: "password"; visible: boolean }
  | null;

type MascotState = { focus: MascotFocus; oops: number };

const INITIAL: MascotState = { focus: null, oops: 0 };
let state = INITIAL;
const listeners = new Set<() => void>();

function emit(next: Partial<MascotState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

export const setMascotFocus = (focus: MascotFocus) => emit({ focus });

/** A form error: the mascot shakes its head. */
export const mascotOops = () => emit({ oops: Date.now() });

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMascot() {
  return useSyncExternalStore(subscribe, () => state, () => INITIAL);
}
