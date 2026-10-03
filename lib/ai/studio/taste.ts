import "server-only";

/**
 * The Taste System (D72): curated art-direction blocks on five independent
 * axes. The art director picks one block per axis by id; the compiler expands
 * the id into `detail`. Blocks combine (10 × 10 × 10 × 9 × 7 ≈ 63k directions
 * before per-design tweaks), so taste is curated without being a template set.
 *
 * Writing rules for a block:
 * - `use` is what the model reads to choose: when it fits, in one line.
 * - `detail` is what the image model reads: concrete, named, no adjectives
 *   like "modern" or "stunning". Named styles and techniques carry the most
 *   taste per word.
 * - A block must work across many asset families, not one category.
 * Our IP — never sent to the browser.
 */

export type Block = {
  id: string;
  name: string;
  /** For the art director: when this block fits. */
  use: string;
  /** For the image prompt: the art direction itself. */
  detail: string;
};

export const TYPE_BLOCKS: Block[] = [
  {
    id: "T01",
    name: "Swiss grotesk",
    use: "Clear, confident, rational: tech, architecture, events, modern services.",
    detail:
      "a neo-grotesk sans (Helvetica / Neue Haas style) in two weights, tight tracking on display, flush-left ragged-right text, strong size contrast between headline and body",
  },
  {
    id: "T02",
    name: "Editorial high-contrast serif",
    use: "Premium, cultural, fashion, beauty, food with ambition, magazines.",
    detail:
      "a high-contrast Didone-style display serif set large with tight leading, paired with a small clean sans for body and captions, italic used once for emphasis",
  },
  {
    id: "T03",
    name: "Condensed poster type",
    use: "Loud announcements, sport, music, sales, events, anything that must shout.",
    detail:
      "tall condensed bold sans in all caps, stacked lines filling the width, very tight leading, supporting text small and sparse so the headline dominates",
  },
  {
    id: "T04",
    name: "Warm humanist",
    use: "Friendly, approachable: local businesses, health, education, community.",
    detail:
      "a humanist sans with open letterforms for everything, semibold headlines in sentence case, generous line spacing, friendly but disciplined",
  },
  {
    id: "T05",
    name: "Technical mono + grotesk",
    use: "Data, developer, science, specialty coffee, labels that feel precise.",
    detail:
      "a grotesk for headlines with a monospace for labels, numbers and small details, uppercase micro-labels with wide tracking, like a technical spec sheet",
  },
  {
    id: "T06",
    name: "Expressive retro display",
    use: "Playful, nostalgic, youth, snacks, drinks, festivals, bold personality.",
    detail:
      "a chunky retro display face (70s soft-serif or rounded heavy sans) for the headline, slightly tight, paired with a plain sans for small text",
  },
  {
    id: "T07",
    name: "Classic book serif + small caps",
    use: "Heritage, formal, legal, wine, hotels, invitations, quiet luxury.",
    detail:
      "a classic old-style book serif (Garamond / Caslon style) with letter-spaced small caps for labels, centred or carefully aligned, restrained sizes",
  },
  {
    id: "T08",
    name: "Script accent + clean sans",
    use: "Hospitality, bakeries, weddings, personal brands that need warmth and a human touch.",
    detail:
      "one short word or name in a confident brush or monoline script as the accent, everything else in a clean geometric sans; the script appears once only",
  },
  {
    id: "T09",
    name: "Wide extended sans",
    use: "Current, fashion-forward, studios, streetwear, beauty, launches that feel of the moment.",
    detail:
      "an extra-wide extended sans in all caps for the headline, letter-spaced and set small-to-medium rather than huge, paired with a plain narrow sans for details",
  },
  {
    id: "T10",
    name: "Lowercase serif with italic mix",
    use: "Soft editorial, lifestyle, cafés, candles, personal brands, the saved-on-Pinterest look.",
    detail:
      "a soft contemporary serif set all lowercase, one or two words switched to its italic mid-line, relaxed leading, captions in a tiny clean sans",
  },
];

export const COLOR_BLOCKS: Block[] = [
  {
    id: "C01",
    name: "Paper, ink, burnt accent",
    use: "Warm and crafted: food, coffee, books, studios, artisanal goods.",
    detail:
      "warm off-white paper background, near-black ink for type, one burnt orange or brick accent used on under 10% of the area",
  },
  {
    id: "C02",
    name: "Monochrome + one signal colour",
    use: "Sharp and graphic: tech, events, fashion, sales where one thing must pop.",
    detail:
      "white and black only, plus a single saturated signal colour (for example cadmium red or electric blue) reserved for one element",
  },
  {
    id: "C03",
    name: "Deep dark + warm light",
    use: "Night, premium, bars, cinema, luxury tech; moody but readable.",
    detail:
      "a deep charcoal or midnight-navy ground with cream type and one warm metallic or amber accent, matte finish, no glow effects",
  },
  {
    id: "C04",
    name: "Earthy natural",
    use: "Wellness, organic, outdoor, skincare, interiors, sustainability.",
    detail:
      "muted olive, clay, sand and bone tones, low saturation, dark olive or brown for text, colours sitting side by side as calm flat fields",
  },
  {
    id: "C05",
    name: "Bold flat duotone",
    use: "Energetic and modern: youth brands, campaigns, apps, festivals, social.",
    detail:
      "two saturated flat colours that clash on purpose (for example cobalt and tomato, or forest green and pink), no gradients, text in one of the two or in white",
  },
  {
    id: "C06",
    name: "Tonal pastel",
    use: "Soft, calm, gentle: beauty, baby, stationery, desserts, wellness apps.",
    detail:
      "one pastel hue family in three tones (light, mid, deep), the deepest tone used for type so contrast stays strong, flat fills",
  },
  {
    id: "C07",
    name: "Pure black and white",
    use: "Timeless, editorial, architecture, photography, minimal luxury.",
    detail:
      "strictly black and white with greys only inside photography, maximum contrast, colour appears nowhere",
  },
  {
    id: "C08",
    name: "Rich jewel tones",
    use: "Premium celebration: restaurants, hotels, wine, festive, finance with heritage.",
    detail:
      "deep emerald or burgundy as the ground, soft gold or cream for type and fine details, one supporting jewel tone, velvety and restrained",
  },
  {
    id: "C09",
    name: "Cherry red and cream",
    use: "Confident and nostalgic: cafés, bakeries, wine bars, fashion, retro-modern brands.",
    detail:
      "a warm cream ground with a single deep cherry red used for type and one bold shape, nothing else; flat print-like colour",
  },
  {
    id: "C10",
    name: "Butter yellow and chocolate",
    use: "Warm, soft, current: desserts, coffee, lifestyle, interiors, beauty.",
    detail:
      "a soft butter-yellow ground with dark chocolate brown type and one milky beige supporting tone, flat and creamy",
  },
];

export const LAYOUT_BLOCKS: Block[] = [
  {
    id: "L01",
    name: "Strict modular grid",
    use: "Information with order: schedules, features, spec sheets, clean pages.",
    detail:
      "a visible 12-column modular grid with consistent gutters, every element snapped to it, clear top-to-bottom reading order, generous margins",
  },
  {
    id: "L02",
    name: "Type as image",
    use: "When the message is the hero: announcements, bold brands, posters with no strong photo.",
    detail:
      "the headline set huge and cropped by the edges so the letters become the main visual, small supporting text tucked into one corner",
  },
  {
    id: "L03",
    name: "Single object, vast space",
    use: "One product or idea to celebrate: product launches, packaging, premium ads.",
    detail:
      "one object placed off-centre with at least 60% empty space around it, a small headline aligned to a margin, nothing else competing",
  },
  {
    id: "L04",
    name: "Editorial asymmetric split",
    use: "Story plus image: landing heroes, magazine-like ads, slides, about sections.",
    detail:
      "an asymmetric split (roughly 5/7) with a text column on one side and a large image on the other, aligned to a shared baseline, calm pacing",
  },
  {
    id: "L05",
    name: "Full-bleed image, typographic zone",
    use: "Strong atmosphere from a photo: travel, food, fashion, events, hero banners.",
    detail:
      "a full-bleed photograph with a deliberately calm area where the text sits directly on the image, no boxes behind text, text never over busy detail",
  },
  {
    id: "L06",
    name: "Structured document",
    use: "Lists and figures: menus, invoices, price lists, résumés, timetables.",
    detail:
      "clear sections with small caps headers, rows with names left and figures right joined by fine dotted leaders or hairlines, two columns if long",
  },
  {
    id: "L07",
    name: "Layered collage",
    use: "Playful, youthful, creative, music, fashion drops, social campaigns.",
    detail:
      "cut-out photos, shapes and type layered and overlapping at slight angles, controlled chaos around one clear focal point, still with a readable headline",
  },
  {
    id: "L08",
    name: "Centred classical symmetry",
    use: "Formal and ceremonial: invitations, certificates, fine dining, heritage labels.",
    detail:
      "a centred symmetrical composition with a clear axis, balanced top and bottom margins, text in a stacked hierarchy from largest to smallest",
  },
  {
    id: "L09",
    name: "Scrapbook moodboard",
    use: "Personal, curated, lifestyle: travel, events, brand moodboards, social carousels, recaps.",
    detail:
      "photos and paper pieces arranged like a pinned moodboard, a few pieces overlapping at small angles, lots of breathing room between, one clear headline anchoring it",
  },
  {
    id: "L10",
    name: "Bento grid",
    use: "Several things at once: feature pages, product highlights, portfolios, recaps.",
    detail:
      "a bento box grid of rounded rectangular tiles in different sizes, one large hero tile and smaller tiles around it, even gaps, each tile holding one idea",
  },
];

export const IMAGERY_BLOCKS: Block[] = [
  {
    id: "I01",
    name: "Hard-flash still life",
    use: "Products and food with attitude: drinks, snacks, fashion accessories, campaigns.",
    detail:
      "direct hard flash photography with crisp shadows, saturated true colours, the object shot close and graphic, editorial still-life style",
  },
  {
    id: "I02",
    name: "Natural-light documentary",
    use: "Real people and places: local businesses, services, hospitality, community.",
    detail:
      "natural window-light photography, authentic unposed moments, real textures, gentle depth of field, no stock-photo smiles",
  },
  {
    id: "I03",
    name: "Flat vector illustration",
    use: "Explaining or charming: apps, education, kids, playful brands, infographics.",
    detail:
      "flat vector illustration using only the palette colours, simple confident shapes, no gradients or 3D, consistent line weight",
  },
  {
    id: "I04",
    name: "Risograph print texture",
    use: "Crafted, indie, cultural: cafés, zines, gigs, bookshops, small brands.",
    detail:
      "two-colour risograph print look with visible grain, slight misregistration and halftone shading on images and shapes",
  },
  {
    id: "I05",
    name: "Pure typography, no imagery",
    use: "When text and shape carry the design: minimal posters, documents, formal pieces.",
    detail:
      "no photographs or illustrations; the design is built from type, rules and flat colour fields only",
  },
  {
    id: "I06",
    name: "Studio product on colour",
    use: "Clean commerce: skincare, packaging shots, gadgets, product ads.",
    detail:
      "product photographed in a studio on a seamless coloured backdrop that matches the palette, soft directional light, one clean shadow",
  },
  {
    id: "I07",
    name: "Hand-drawn line art",
    use: "Human and artisanal: menus, bakeries, wine, craft, personal brands.",
    detail:
      "fine hand-drawn ink line illustrations with slight irregularity, used sparingly as spot drawings, single colour",
  },
  {
    id: "I08",
    name: "35mm film snapshot",
    use: "Candid, nostalgic, human: lifestyle, cafés, travel, fashion, events, youth brands.",
    detail:
      "35mm film photography with natural grain, slightly warm film tones, a candid off-centre moment, on-camera flash or soft daylight, imperfect and real",
  },
  {
    id: "I09",
    name: "Styled flat lay",
    use: "Curated objects from above: food, stationery, beauty, fashion, recipe and product posts.",
    detail:
      "a styled top-down flat lay on a plain textured surface, a few chosen objects arranged with deliberate spacing, soft daylight shadows",
  },
];

export const GRAPHIC_BLOCKS: Block[] = [
  {
    id: "G01",
    name: "Fine rules and labels",
    use: "Refined and organised: editorial, documents, premium, technical.",
    detail:
      "hairline rules dividing sections, small uppercase labels and numbers as quiet navigation, nothing decorative beyond that",
  },
  {
    id: "G02",
    name: "Bold geometric shapes",
    use: "Energetic and modern: campaigns, youth, tech, events.",
    detail:
      "a few large flat geometric shapes (circles, arches, bars) in palette colours, cropped by edges, used as structure rather than decoration",
  },
  {
    id: "G03",
    name: "Stamps and badges",
    use: "Playful commerce and food: offers, labels, launches, markets.",
    detail:
      "one or two round stamps or badge shapes carrying a short offer or claim, slightly rotated, printed-ink feel",
  },
  {
    id: "G04",
    name: "Pure restraint",
    use: "Luxury, minimal, serious: when anything extra would cheapen it.",
    detail: "no graphic devices at all; space, alignment and type do all the work",
  },
  {
    id: "G05",
    name: "Frames and ornament",
    use: "Classic and ceremonial: invitations, labels, heritage menus, certificates.",
    detail:
      "a thin double-line frame or delicate corner ornaments in a single colour, symmetrical and precise",
  },
  {
    id: "G06",
    name: "Halftone and grain",
    use: "Tactile, analogue, cultural: gig posters, streetwear, zines, retro campaigns.",
    detail:
      "halftone dot patterns and fine paper grain over flat areas, giving a printed analogue surface",
  },
  {
    id: "G07",
    name: "Tape, paper and annotations",
    use: "Personal and handmade: moodboards, recaps, invites, social, cafés, creators.",
    detail:
      "a few strips of masking tape and torn paper edges holding images, one or two short handwritten notes or a hand-drawn arrow pointing at the key element",
  },
];

export const AXES = {
  type: TYPE_BLOCKS,
  color: COLOR_BLOCKS,
  layout: LAYOUT_BLOCKS,
  imagery: IMAGERY_BLOCKS,
  graphic: GRAPHIC_BLOCKS,
} as const;

export type Axis = keyof typeof AXES;
export const AXIS_NAMES = Object.keys(AXES) as Axis[];

export type Direction = Record<Axis, string>;

/** Written-out art direction per axis, when no block fits (null = use the block). */
export type Custom = Record<Axis, string | null>;

const BY_ID = new Map(
  Object.values(AXES).flatMap((blocks) => blocks.map((block) => [block.id, block] as const)),
);

export function block(id: string) {
  return BY_ID.get(id) ?? null;
}

export function axisIds(axis: Axis) {
  return AXES[axis].map((entry) => entry.id);
}

/** The index the art director chooses from: id, name and when to use it. */
export function tasteIndex() {
  return AXIS_NAMES.map(
    (axis) =>
      `${axis.toUpperCase()}\n${AXES[axis].map((entry) => `${entry.id} ${entry.name}: ${entry.use}`).join("\n")}`,
  ).join("\n\n");
}
