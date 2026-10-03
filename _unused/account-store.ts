"use client";

/**
 * Who is "signed in", kept in localStorage. Supabase Auth is not wired, so
 * this is only what the person typed into the sign-up or sign-in form — no
 * credential was checked. It exists so the app can greet them by name; swap it
 * for the real session once auth lands.
 */

export type Account = { name: string; email: string };

const KEY = "snapdesign.account";

export function getAccount(): Account | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Account>;
    return parsed.email ? { name: parsed.name || nameFromEmail(parsed.email), email: parsed.email } : null;
  } catch {
    return null;
  }
}

export function saveAccount(account: Account) {
  try {
    localStorage.setItem(KEY, JSON.stringify(account));
  } catch {
    // Storage blocked (private window, strict settings) — the app still works,
    // it just cannot show a name.
  }
}

export function clearAccount() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

/** "maya.pal@studio.com" → "Maya Pal". Used when sign-in gives no name. */
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
