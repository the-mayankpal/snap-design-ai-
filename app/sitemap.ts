import type { MetadataRoute } from "next";

import { PUBLIC_ROUTES, SITE } from "@/components/site";

/** Public, indexable pages only — the app (/designs, /editor) and sign-in are not listed. */
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map(({ path, updated, changeFrequency, priority }) => ({
    url: `${SITE.url}${path === "/" ? "" : path}`,
    lastModified: updated,
    changeFrequency,
    priority,
  }));
}
