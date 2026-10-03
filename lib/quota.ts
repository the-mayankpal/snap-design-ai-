import "server-only";

import { createHmac, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";

import { HttpError, NotConfiguredError } from "@/lib/api";
import type { User } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * The free tier (D83): 5 images for life, counted at once per email, per
 * network and per browser. A request is refused when ANY of them is used up,
 * so a new account on the same laptop or Wi-Fi gets nothing new. Only HMACs
 * of those values are stored. Exempt emails (the owner's) skip all of it.
 */

export const FREE_IMAGES = 5;
/** Chat turns cost a model call even without an image; this caps them for life too. */
export const FREE_TURNS = 25;

const DEVICE_COOKIE = "sd_device";
const DEVICE_SECONDS = 60 * 60 * 24 * 400;

/** Throwaway inbox services: no free images from these. */
const DISPOSABLE = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "sharklasers.com", "grr.la",
  "10minutemail.com", "10minutemail.net", "temp-mail.org", "tempmail.com", "tempmail.net",
  "tempmailo.com", "temp-mail.io", "throwawaymail.com", "yopmail.com", "yopmail.net",
  "getnada.com", "nada.email", "dispostable.com", "maildrop.cc", "trashmail.com",
  "fakeinbox.com", "mintemail.com", "mohmal.com", "emailondeck.com", "moakt.com",
  "tempinbox.com", "spamgourmet.com", "mailnesia.com", "mailcatch.com", "burnermail.io",
  "tmail.ws", "tmpmail.org", "tmpmail.net", "1secmail.com", "1secmail.net", "1secmail.org",
  "emailfake.com", "fakemail.net", "discard.email", "inboxkitten.com", "mail.tm",
  "byom.de", "trash-mail.com", "spambox.us", "mytemp.email", "tempr.email", "harakirimail.com",
]);

export const OUT_OF_FREE = `You've used your ${FREE_IMAGES} free images. Thanks for trying snapdesign!`;

/** Lowercase, drop `+tags`, and for Gmail drop dots, so one inbox is one email. */
export function normalizeEmail(email: string) {
  const [rawLocal = "", rawDomain = ""] = email.trim().toLowerCase().split("@");
  let local = rawLocal.split("+")[0];
  let domain = rawDomain;
  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") local = local.replaceAll(".", "");
  return `${local}@${domain}`;
}

function hmac(value: string) {
  const secret = process.env.QUOTA_SECRET;
  if (!secret) throw new NotConfiguredError("Set QUOTA_SECRET in .env.local.");
  return createHmac("sha256", secret).update(value).digest("hex");
}

export const emailKey = (email: string) => `email:${hmac(normalizeEmail(email))}`;

/** Emails with no limit (the owner's own), from QUOTA_EXEMPT_EMAILS. */
export function isExempt(email: string) {
  const list = (process.env.QUOTA_EXEMPT_EMAILS ?? "").split(",").map((item) => item.trim());
  return list.filter(Boolean).map(normalizeEmail).includes(normalizeEmail(email));
}

/** The caller's network: the first forwarded address (set by Vercel), IPv6 cut to its /64. */
async function clientNetwork() {
  const list = await headers();
  const ip = (list.get("x-forwarded-for")?.split(",")[0] ?? list.get("x-real-ip") ?? "").trim();
  if (!ip) return null;
  if (!ip.includes(":") || ip.startsWith("::ffff:")) return ip.replace(/^::ffff:/, "");
  const groups = ip.split("::")[0].split(":");
  return `${groups.slice(0, 4).join(":")}::/64`;
}

/** A long-lived random id for this browser, httpOnly so page scripts can't read or change it. */
async function deviceId() {
  const store = await cookies();
  const existing = store.get(DEVICE_COOKIE)?.value;
  if (existing && /^[0-9a-f-]{36}$/.test(existing)) return existing;
  const id = randomUUID();
  store.set(DEVICE_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEVICE_SECONDS,
  });
  return id;
}

export type FreeAccount = { keys: string[]; blocked: string | null };

/** The keys this request is counted against, or null for an exempt email. */
export async function freeAccount(user: User): Promise<FreeAccount | null> {
  if (isExempt(user.email)) return null;
  const network = await clientNetwork();
  const keys = [
    emailKey(user.email),
    `device:${hmac(await deviceId())}`,
    ...(network ? [`ip:${hmac(network)}`] : []),
  ];

  const domain = normalizeEmail(user.email).split("@")[1] ?? "";
  if (!user.email || DISPOSABLE.has(domain)) {
    return { keys, blocked: "Free images need a permanent email address, not a temporary inbox." };
  }
  const { data, error } = await supabaseAdmin().auth.admin.getUserById(user.id);
  if (error) throw error;
  if (!data.user.email_confirmed_at) {
    return { keys, blocked: "Confirm your email address to start your free images." };
  }
  return { keys, blocked: null };
}

/** Images used: the most used by any of the keys. */
export async function freeUsed(account: FreeAccount) {
  const { data, error } = await supabaseAdmin()
    .from("free_usage")
    .select("images, turns")
    .in("key", account.keys);
  if (error) throw error;
  return {
    images: Math.max(0, ...(data ?? []).map((row) => row.images as number)),
    turns: Math.max(0, ...(data ?? []).map((row) => row.turns as number)),
  };
}

async function take(account: FreeAccount, kind: "image" | "turn", max: number) {
  const { data, error } = await supabaseAdmin().rpc("take_free", {
    keys: account.keys,
    kind,
    max_units: max,
  });
  if (error) throw error;
  return data === true;
}

/** Before the art director runs: refuses when free images or turns are used up. */
export async function allowTurn(account: FreeAccount | null) {
  if (!account) return;
  if (account.blocked) throw new HttpError(402, account.blocked);
  const used = await freeUsed(account);
  if (used.images >= FREE_IMAGES) throw new HttpError(402, OUT_OF_FREE);
  if (!(await take(account, "turn", FREE_TURNS))) {
    throw new HttpError(402, "You've reached the free chat limit. Thanks for trying snapdesign!");
  }
}

/** Takes one free image before rendering, atomically across all keys; false when used up. */
export async function takeImage(account: FreeAccount) {
  if (account.blocked) return false;
  return take(account, "image", FREE_IMAGES);
}

/** Gives the image back after a render that failed or was blocked. */
export async function refundImage(account: FreeAccount) {
  const { error } = await supabaseAdmin().rpc("refund_free_image", { keys: account.keys });
  if (error) throw error;
}

/** What the editor shows: null for exempt, else images left. */
export async function freeSummary(account: FreeAccount | null) {
  if (!account) return null;
  if (account.blocked) return { limit: FREE_IMAGES, left: 0, reason: account.blocked };
  const used = await freeUsed(account);
  return { limit: FREE_IMAGES, left: Math.max(0, FREE_IMAGES - used.images), reason: null };
}
