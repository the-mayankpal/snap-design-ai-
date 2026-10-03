"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Supabase Auth in the browser (D77): sign up, sign in, reset, sign out. */
export function supabaseBrowser() {
  client ??= createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
  return client;
}

/** A relative path to return to after signing in; anything else falls back to the designs list. */
export { safeNext } from "@/lib/safe-next";

/** A session that ended mid-visit (signed out elsewhere, expired): back to sign-in, then here again. */
export function toSignIn() {
  const here = window.location.pathname + window.location.search;
  // A full load on purpose: this runs outside components, and it drops any
  // state that belonged to the ended session.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`/login?next=${encodeURIComponent(here)}`);
}
