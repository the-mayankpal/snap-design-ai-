import type { Metadata } from "next";

/**
 * Site-wide identity for metadata, the sitemap, robots and structured data.
 * Set NEXT_PUBLIC_SITE_URL in each environment (e.g. a preview deploy) —
 * canonical URLs, social previews and the sitemap all derive from it.
 */
export const SITE = {
  name: "snapdesign",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://snapdesign.ai").replace(/\/$/, ""),
  title: "snapdesign — AI design generator: describe it, get a design",
  // Kept under ~155 characters, where search results cut a description off.
  description:
    "Describe what you need and snapdesign's AI design generator makes a polished website design, social post, slide deck, invoice or graphic in seconds.",
} as const;

/**
 * Public pages, in the order they belong in the sitemap. `updated` is when the
 * page's content last really changed — bump it with the content, not on every
 * deploy, or search engines learn to ignore it. (Terms and Privacy follow the
 * "Last updated" date shown on those pages.)
 */
export const PUBLIC_ROUTES = [
  { path: "/", updated: "2026-10-02", changeFrequency: "weekly", priority: 1 },
  { path: "/showcase", updated: "2026-10-02", changeFrequency: "weekly", priority: 0.9 },
  { path: "/about", updated: "2026-10-02", changeFrequency: "monthly", priority: 0.7 },
  { path: "/signup", updated: "2026-10-02", changeFrequency: "yearly", priority: 0.6 },
  { path: "/terms", updated: "2026-09-26", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", updated: "2026-09-26", changeFrequency: "yearly", priority: 0.3 },
] as const;

/**
 * A page's own `openGraph` replaces the root one (it does not merge), so
 * pages spread this in to keep the site name, type, locale and image.
 */
export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "snapdesign — AI design generator: describe it, get a design",
};

export const OG_BASE = {
  type: "website",
  siteName: SITE.name,
  locale: "en_US",
  images: [OG_IMAGE],
} satisfies NonNullable<Metadata["openGraph"]>;
