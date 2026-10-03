import type { NextConfig } from "next";

/**
 * Sent with every response. No full script CSP: Next's inline scripts would
 * need per-request nonces, which turns every static page dynamic. The CSP here
 * only covers framing, <base> and form targets, which are safe to lock down.
 */
const SECURITY_HEADERS = [
  // HTTPS only, for two years (Vercel serves https; this makes browsers insist on it).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // No one can put the site in a frame (clickjacking); X-Frame-Options for old browsers.
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Other sites see only our origin, never the path (design ids stay private).
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Dev only: let phones and other devices on the local network use the dev
  // server (scripts and live reload), e.g. http://10.34.90.252:3000. Private
  // address ranges only; each `*` is one label of the hostname.
  allowedDevOrigins: ["10.*.*.*", "192.168.*.*", "172.*.*.*", "*.local"],
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
