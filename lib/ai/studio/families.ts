import "server-only";

import type { KindId } from "@/components/editor/generate-options";

/**
 * Asset families (D72): designs grouped by how they are read, not by what
 * they are about. "Sushi menu", "invoice" and "price list" are one family;
 * subject matter comes from the model's own world knowledge. A new kind of
 * asset maps onto a family (or `other`) and needs no new code.
 */

export type Family = {
  id: string;
  label: string;
  examples: string;
  /** How it is read and what it needs — for the art director. */
  guide: string;
  /** How many words of copy it can carry before it stops reading well. */
  maxCopyWords: number;
  /** Format line for the image prompt. */
  render: string;
  /** The ratio it naturally takes when the selected one doesn't fit. */
  ratio: string;
};

export const FAMILIES: Family[] = [
  {
    id: "screen",
    label: "Screen",
    examples: "landing page, website hero or section, app screen, dashboard, email",
    guide:
      "Read in seconds, top-left first. One headline that says what it is and for whom, one primary action, a navbar with a wordmark and a few real links when it is a web page. Show real product or service imagery, not decoration.",
    maxCopyWords: 70,
    render: "flat screen-accurate UI design, straight-on, no browser chrome, no device mockup",
    ratio: "16:9",
  },
  {
    id: "slide",
    label: "Slide",
    examples: "presentation slide, pitch deck slide, title slide",
    guide:
      "One idea per slide. A short assertive title, at most three supporting points or one chart or one image. Presenter-readable from a distance: big type, lots of space.",
    maxCopyWords: 45,
    render: "flat presentation slide, straight-on, full frame",
    ratio: "16:9",
  },
  {
    id: "document",
    label: "Structured document",
    examples: "restaurant menu, invoice, price list, résumé, timetable, certificate",
    guide:
      "Scanned, not read: clear sections, consistent rows, names left and figures right. Real, believable items and prices. Hierarchy comes from size, weight and space, not boxes.",
    maxCopyWords: 130,
    render: "flat print-ready document design, straight-on, full page, no mockup, no hands",
    ratio: "3:4",
  },
  {
    id: "poster",
    label: "Poster / flyer",
    examples: "promotional poster, event flyer, gig poster, sale poster",
    guide:
      "Seen from across a room. One dominant element, a headline readable at a glance, then the essentials (what, when, where) small and grouped together.",
    maxCopyWords: 35,
    render: "flat print-ready poster design, straight-on, full bleed, no wall or frame mockup",
    ratio: "3:4",
  },
  {
    id: "social",
    label: "Ad / social",
    examples: "Instagram post or story, ad creative, banner, LinkedIn graphic, thumbnail",
    guide:
      "Stops a scrolling thumb in under a second. One visual hook, a very short headline, at most one line of support and one call to action. Works small.",
    maxCopyWords: 25,
    render: "flat social media graphic, straight-on, edge to edge, no phone mockup",
    ratio: "4:5",
  },
  {
    id: "packaging",
    label: "Packaging / label",
    examples: "product box, jar or bottle label, pouch, can, cosmetic packaging",
    guide:
      "Brand name first, then what the product is, then one key claim. Shelf-readable, with a clear front face. Show the pack as a clean product render when a physical object is asked for.",
    maxCopyWords: 30,
    render: "clean product packaging render on a plain backdrop, front-facing, studio light",
    ratio: "1:1",
  },
  {
    id: "stationery",
    label: "Stationery / card",
    examples: "business card, invitation, greeting card, thank-you card, gift voucher",
    guide:
      "Small, held in the hand. Few words set with care: a name or occasion, the essentials, lots of margin. Quality comes from restraint and detail.",
    maxCopyWords: 30,
    render: "flat print design shown straight-on, full card face, no hands or table",
    ratio: "3:2",
  },
  {
    id: "logo",
    label: "Logo / mark",
    examples: "logo, wordmark, monogram, badge, emblem",
    guide:
      "Must work at 16px and on a billboard: simple, distinctive, one idea, few colours, no fine detail. Name spelled exactly.",
    maxCopyWords: 6,
    render: "flat vector logo centred on a plain background, no mockup",
    ratio: "1:1",
  },
  {
    id: "illustration",
    label: "Illustration / sticker",
    examples: "sticker, spot illustration, icon set, mascot, pattern",
    guide:
      "The image is the message. Clear silhouette, limited palette, consistent style; text only if asked.",
    maxCopyWords: 8,
    render: "flat illustration on a plain background, crisp edges",
    ratio: "1:1",
  },
  {
    id: "image",
    label: "Image",
    examples: "photo, artwork, scene, character, wallpaper, product shot, concept art — a picture, not a layout",
    guide:
      "The picture is the whole thing: no layout, no typography, no text unless they ask for words in the scene. Put the effort into subject, light, lens or medium, materials and texture. copy is empty unless text is asked for.",
    maxCopyWords: 0,
    render: "a finished image, not a graphic design layout",
    ratio: "1:1",
  },
  {
    id: "other",
    label: "Other",
    examples: "anything that doesn't fit the families above",
    guide:
      "Work out how this thing is actually used and read, then apply the same principles: one focal point, clear hierarchy, real content.",
    maxCopyWords: 50,
    render: "flat finished design, straight-on, no mockup",
    ratio: "1:1",
  },
];

export const FAMILY_IDS = FAMILIES.map((family) => family.id);

export function familyOf(id: string) {
  return FAMILIES.find((family) => family.id === id) ?? FAMILIES.at(-1)!;
}

/** What the editor's "type" selector suggests. A signal, never a rule. */
export const KIND_HINTS: Record<KindId, string> = {
  website: "probably a screen (web page or section)",
  marketing: "probably a poster, ad or social graphic",
  slides: "probably a slide",
  graphic: "any graphic or plain image; decide from the request",
};

export function familyGuide() {
  return FAMILIES.map(
    (family) =>
      `${family.id} — ${family.label} (${family.examples}). ${family.guide} Natural ratio ${family.ratio}. At most ${family.maxCopyWords} words of copy.`,
  ).join("\n");
}
