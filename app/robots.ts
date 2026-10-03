import type { MetadataRoute } from "next";

import { SITE } from "@/components/site";

/**
 * Crawlers stay out of the signed-in app and the API. Sign-in is crawlable but
 * carries a `noindex` tag, so it is kept out of results without hiding that tag.
 */
const PRIVATE = ["/designs", "/editor", "/admin", "/api/", "/auth/"];

/**
 * AI assistants and AI search are welcome on the public pages (so people asking
 * them about design tools can find snapdesign). A crawler with its own group
 * ignores the `*` one, so each repeats the private paths.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
