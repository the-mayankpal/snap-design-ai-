import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { NotConfiguredError } from "@/lib/api";

export const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "designs";

let client: SupabaseClient | null = null;

/**
 * The service-role client. It bypasses RLS, which is why it must never leave
 * the server: until auth ships (D59) every table has RLS on with no policies,
 * and this client is the only thing that can read or write them.
 */
export function supabaseAdmin() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new NotConfiguredError(
      "Supabase isn't configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.",
    );
  }
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}
