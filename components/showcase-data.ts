export type DesignCategory = "website" | "marketing" | "graphic" | "slides" | "invoice";

export type Design = {
  src: string;
  alt: string;
  category: DesignCategory;
  width: number;
  height: number;
};

/**
 * Designs made with snapdesign. Source PNGs live in `assets/showcase/` named
 * `<category>-<subject>`; these are the optimised WebP copies in
 * `public/showcase/`.
 *
 * `width`/`height` are the intrinsic dimensions — the frame sets its aspect
 * ratio from them, so square, portrait and tall decks sit alongside landscape
 * without being cropped.
 *
 * Ordered so formats mix wherever the list is shown in sequence (the /showcase
 * gallery): 11 websites to 8 other pieces, arranged so no more than two
 * websites sit together and the look-alike fashion stores are spread apart.
 * Add a design by slotting it into that rhythm, not by appending. The two
 * invoices sit far apart (3rd and 19th): opposite columns and opposite ends
 * of the gallery at both 2 and 3 columns. The hero
 * mosaic places its designs by hand and does not depend on this order.
 */
export const DESIGNS: Design[] = [
  { src: "/showcase/website-clarix-analytics.webp", alt: "Clarix AI analytics landing page", category: "website", width: 1600, height: 900 },
  { src: "/showcase/website-monoma-finance-platform.webp", alt: "Monoma finance platform landing page", category: "website", width: 1448, height: 1086 },
  { src: "/showcase/invoice-vanta-studio-dark.webp", alt: "Vanta bold dark studio invoice", category: "invoice", width: 1055, height: 1491 },
  { src: "/showcase/marketing-marmita-fit-meals.webp", alt: "Marmita Fit meal prep social campaign grid", category: "marketing", width: 1254, height: 1254 },
  { src: "/showcase/graphic-portfolio-design-poster.webp", alt: "2022 portfolio design poster", category: "graphic", width: 1600, height: 900 },
  { src: "/showcase/website-vestra-streetwear.webp", alt: "Vestra streetwear store landing page", category: "website", width: 1600, height: 900 },
  { src: "/showcase/website-elvana-wellness-store.webp", alt: "Elvana wellness store landing page", category: "website", width: 1600, height: 900 },
  { src: "/showcase/slides-ember-bean-brand-guideline.webp", alt: "Ember & Bean brand guideline deck", category: "slides", width: 992, height: 1586 },
  { src: "/showcase/marketing-rosehaus-roselle-latte.webp", alt: "Rose Haus Roselle latte social campaign grid", category: "marketing", width: 1086, height: 1448 },
  { src: "/showcase/website-coinvo-digital-assets.webp", alt: "Coinvo digital assets landing page", category: "website", width: 1600, height: 900 },
  { src: "/showcase/website-lyric-marketing-workspace.webp", alt: "Lyric marketing workspace landing page", category: "website", width: 1600, height: 900 },
  { src: "/showcase/website-atria-art-gallery.webp", alt: "Atria art gallery landing page", category: "website", width: 1448, height: 1086 },
  { src: "/showcase/website-virella-fashion-store.webp", alt: "Virella.S fashion store landing page", category: "website", width: 1600, height: 900 },
  { src: "/showcase/graphic-sunsip-can-packaging.webp", alt: "Sunsip sparkling drink can packaging", category: "graphic", width: 1254, height: 1254 },
  { src: "/showcase/slides-reelhouse-festival-proposal.webp", alt: "Reelhouse film festival proposal deck", category: "slides", width: 1024, height: 1536 },
  { src: "/showcase/website-lumen-ai-model.webp", alt: "Lumen AI model landing page", category: "website", width: 1600, height: 900 },
  { src: "/showcase/website-solvena-clothing.webp", alt: "Solvena clothing brand landing page", category: "website", width: 1600, height: 900 },
  { src: "/showcase/website-velmora-luxury-fashion.webp", alt: "Velmora luxury fashion landing page", category: "website", width: 1600, height: 900 },
  { src: "/showcase/invoice-ashgrove-tide-vintage.webp", alt: "Ashgrove & Tide vintage nautical invoice", category: "invoice", width: 1055, height: 1491 },
  { src: "/showcase/graphic-evolve-sticker-sheet.webp", alt: "Illustrated sticker sheet", category: "graphic", width: 1122, height: 1402 },
  { src: "/showcase/marketing-suvo-juice-campaign.webp", alt: "Suvo juice social media campaign grid", category: "marketing", width: 1122, height: 1402 },
];

/** Pieces shown on the home page that are not in the gallery above. */
const EXTRA_ALTS: Record<string, string> = {
  "/showcase/invoice-nexlane-studio-corporate.webp": "Nexlane Studio corporate invoice",
  "/showcase/invoice-crumb-co-bakery.webp": "Crumb & Co. illustrated bakery invoice",
};

/**
 * The one alt text for a showcase image, wherever it appears — so the same
 * picture is never described two different ways across the site.
 */
export function altOf(src: string) {
  return DESIGNS.find((design) => design.src === src)?.alt ?? EXTRA_ALTS[src] ?? "";
}
