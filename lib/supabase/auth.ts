import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { HttpError, NotConfiguredError } from "@/lib/api";

/**
 * Supabase Auth on the server (D77). The session lives in Supabase's own
 * cookies; this client reads them with the publishable key, so it can only
 * act as the signed-in user. Data access still goes through the service-role
 * client (lib/supabase/server.ts), scoped by the user id returned here.
 */

export function authConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new NotConfiguredError(
      "Sign-in isn't configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.",
    );
  }
  return { url, key };
}

export async function authClient() {
  // Cookies first: reading them is what marks a page as per-request. If the
  // config check threw first, a page like /admin would look static and the
  // build would try to prerender it (and fail) whenever the env is missing.
  const store = await cookies();
  const { url, key } = authConfig();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Called from a Server Component, where cookies are read-only. The
          // proxy refreshes the session on every request, so nothing is lost.
        }
      },
    },
  });
}

export type User = { id: string; email: string };

/** The signed-in user, verified from the session's JWT — or null. */
export async function readUser(): Promise<User | null> {
  const { data } = await (await authClient()).auth.getClaims();
  const claims = data?.claims;
  return claims?.sub ? { id: claims.sub, email: String(claims.email ?? "") } : null;
}

/** The signed-in user's id; 401 otherwise. Every data route starts here. */
export async function requireUser() {
  return (await requireAccount()).id;
}

/** The signed-in user with their email, for routes that count free use (D83); 401 otherwise. */
export async function requireAccount() {
  const user = await readUser();
  if (!user) throw new HttpError(401, "Please sign in to continue.");
  return user;
}
