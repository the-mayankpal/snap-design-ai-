import "server-only";

import { cookies } from "next/headers";

const COOKIE = "sd_device";
const YEAR_SECONDS = 60 * 60 * 24 * 365;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: string) => UUID.test(value);

/**
 * Until auth ships, a browser is identified by a random id in an httpOnly
 * cookie. It scopes every query, so testers never see each other's designs.
 * It is not a login: clearing cookies loses access to the designs, exactly as
 * clearing IndexedDB did before.
 */
export async function readDevice() {
  const value = (await cookies()).get(COOKIE)?.value;
  return value && isUuid(value) ? value : null;
}

/** Like `readDevice`, but issues an id if there is none. Route handlers only — it sets a cookie. */
export async function ensureDevice() {
  const existing = await readDevice();
  if (existing) return existing;
  const id = crypto.randomUUID();
  (await cookies()).set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: YEAR_SECONDS,
  });
  return id;
}
