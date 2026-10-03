/**
 * A `?next=` value that is safe to send someone to after signing in: a path on
 * this site, or the designs list. Checking only for a leading "/" is not
 * enough — browsers read `/\evil.com` and `/\t/evil.com` as `//evil.com` — so
 * the value is resolved the way a browser would and must stay on this origin.
 * Used by the proxy, the auth callback and the sign-in form.
 */
const HOME = "/designs";
const BASE = "https://snapdesign.invalid";

export function safeNext(value: string | null | undefined) {
  if (!value || !value.startsWith("/")) return HOME;
  try {
    const url = new URL(value, BASE);
    return url.origin === BASE ? url.pathname + url.search + url.hash : HOME;
  } catch {
    return HOME;
  }
}
