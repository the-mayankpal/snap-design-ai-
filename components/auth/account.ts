"use client";

import { useEffect, useState } from "react";

import { supabaseBrowser } from "@/lib/supabase/browser";

/**
 * The signed-in person, from the Supabase session (D77). The name lives in
 * the user's metadata, set at sign-up and editable from the account menu.
 */

export type Account = { name: string; email: string };

export function useAccount() {
  // undefined while the session is read, null when signed out.
  const [account, setAccount] = useState<Account | null | undefined>(undefined);

  useEffect(() => {
    const auth = supabaseBrowser().auth;
    const { data } = auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setAccount(
        user
          ? {
              email: user.email ?? "",
              name: String(user.user_metadata?.name ?? "") || nameFromEmail(user.email ?? ""),
            }
          : null,
      );
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return account;
}

export async function renameAccount(name: string) {
  const { error } = await supabaseBrowser().auth.updateUser({ data: { name } });
  if (error) throw error;
}

export async function signOut() {
  await supabaseBrowser().auth.signOut();
}

/** "maya.pal@studio.com" → "Maya Pal". Used when sign-up gives no name. */
export function nameFromEmail(email: string) {
  return email
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

/** Up to two initials for the avatar. */
export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts.at(-1)![0] : "")).toUpperCase() || "?";
}
