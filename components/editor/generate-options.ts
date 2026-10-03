/**
 * The generate options, in a plain module (no "use client") so server code can
 * validate saved settings against the same lists the controls offer.
 */

/** Every ratio is drawn to its true proportion, so the shape is the label. */
export const RATIOS = [
  { id: "1:1", w: 1, h: 1 },
  { id: "4:5", w: 4, h: 5 },
  { id: "3:4", w: 3, h: 4 },
  { id: "9:16", w: 9, h: 16 },
  { id: "16:9", w: 16, h: 9 },
  { id: "3:2", w: 3, h: 2 },
  { id: "4:3", w: 4, h: 3 },
  { id: "2:1", w: 2, h: 1 },
] as const;

export const KIND_IDS = ["website", "marketing", "slides", "graphic"] as const;
export type KindId = (typeof KIND_IDS)[number];

export const KIND_LABELS: Record<KindId, string> = {
  website: "Website",
  marketing: "Marketing",
  slides: "Slides",
  graphic: "Graphic",
};

export const COUNTS = ["1", "2", "3", "Auto"] as const;
