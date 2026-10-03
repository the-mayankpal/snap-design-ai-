import { DragMarquee } from "@/components/drag-marquee";
import { ShowcaseFrame } from "@/components/showcase-frame";
import { DESIGNS, type Design } from "@/components/showcase-data";

const bySlug = (slug: string): Design => {
  const design = DESIGNS.find(({ src }) => src === `/showcase/${slug}.webp`);
  if (!design) throw new Error(`HeroMosaic: no showcase design "${slug}"`);
  return design;
};

/**
 * Hand-placed columns, left to right. Widths and drops are in design px at
 * desktop size and scale by `--u`. Narrow columns carry the tall pieces (decks,
 * portrait posts), wide ones the landing pages. Each drop is set so the column
 * *ends* within ~60px of the others: the tops stagger, the bottoms land close
 * to one line, and every card is shown whole — nothing is cropped. Change a
 * column's designs and its drop needs re-deriving from the card heights.
 */
const COLUMNS: { width: number; drop: number; slugs: string[] }[] = [
  { width: 360, drop: 144, slugs: ["website-clarix-analytics", "website-vestra-streetwear"] },
  { width: 230, drop: 91, slugs: ["graphic-evolve-sticker-sheet", "marketing-marmita-fit-meals"] },
  { width: 170, drop: 113, slugs: ["slides-ember-bean-brand-guideline", "graphic-sunsip-can-packaging"] },
  { width: 400, drop: 128, slugs: ["website-lumen-ai-model", "website-velmora-luxury-fashion"] },
  { width: 400, drop: 26, slugs: ["website-coinvo-digital-assets", "website-atria-art-gallery"] },
  { width: 230, drop: 20, slugs: ["marketing-rosehaus-roselle-latte", "marketing-suvo-juice-campaign"] },
  { width: 360, drop: 70, slugs: ["website-monoma-finance-platform", "graphic-portfolio-design-poster"] },
  { width: 170, drop: 244, slugs: ["slides-reelhouse-festival-proposal", "website-solvena-clothing"] },
  { width: 360, drop: 154, slugs: ["website-virella-fashion-store", "website-elvana-wellness-store"] },
];

/**
 * The hero's showcase: real designs as framed cards in a staggered, full-bleed
 * mosaic that drifts left forever. `--u` is the
 * scale — 1px of layout per design px on desktop, less on smaller screens —
 * so the whole composition shrinks as one piece instead of reflowing.
 *
 * The columns are rendered twice and DragMarquee slides them by one period,
 * so the second copy lands exactly where the first began. It never pauses;
 * a sideways trackpad swipe or a drag pushes it along, with momentum.
 */
export function HeroMosaic() {
  return (
    <div
      aria-hidden
      // In-flow, so the mosaic is as tall as its longest column; the bottom
      // padding keeps the cards' shadows from being clipped.
      className="relative overflow-hidden pb-[calc(40*var(--u))] [--u:0.5px] sm:[--u:0.72px] lg:[--u:1px]"
    >
      <DragMarquee
        secondsPerLoop={110}
        trackClassName="flex w-max items-start gap-[calc(16*var(--u))]"
      >
        {[...COLUMNS, ...COLUMNS].map(({ width, drop, slugs }, index) => (
          <div
            key={index}
            className="flex shrink-0 flex-col gap-[calc(16*var(--u))]"
            style={{
              width: `calc(${width} * var(--u))`,
              marginTop: `calc(${drop} * var(--u))`,
            }}
          >
            {slugs.map((slug) => (
              <ShowcaseFrame
                key={slug}
                design={bySlug(slug)}
                className="w-full !p-[max(6px,calc(9*var(--u)))]"
                sizes="(max-width: 640px) 200px, 400px"
                // Moving continuously, so a lazy card could arrive blank.
                eager
              />
            ))}
          </div>
        ))}
      </DragMarquee>
    </div>
  );
}
