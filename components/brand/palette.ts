/**
 * The colour system in TypeScript, for places a Tailwind class can't reach.
 * The source of truth is `:root` in app/globals.css — see
 * documentation/architecture.md §3 "Colour" for what each colour is for.
 */

/**
 * CSS-variable references, for SVG `fill`/`stroke` attributes and inline
 * `style` colours in the page. Prefer a Tailwind class (`bg-sun`,
 * `text-accent`) wherever one works.
 */
export const COLOR = {
  accent: "var(--accent)",
  accentSoft: "var(--accent-soft)",
  accentTint: "var(--accent-tint)",
  inkSketch: "var(--ink-sketch)",
  surfaceMuted: "var(--surface-muted)",
  sun: "var(--sun)",
  cobalt: "var(--cobalt)",
  leaf: "var(--leaf)",
  pink: "var(--pink)",
  rose: "var(--rose)",
  lilac: "var(--lilac)",
  sage: "var(--sage)",
  blue: "var(--blue)",
  mint: "var(--mint)",
  butter: "var(--butter)",
  sky: "var(--sky)",
} as const;

/**
 * Literal hex, only for generated images (share card, app icon): the image
 * renderer has no stylesheet, so CSS variables don't resolve there. Keep in
 * step with globals.css.
 */
export const HEX = {
  accent: "#EF7A43",
  foreground: "#0D0B0C",
  inkMuted: "#807C78",
  paper: "#FBFAF7",
  paperRule: "#EBE7DE",
} as const;
