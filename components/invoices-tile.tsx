import Image from "next/image";
import { CheckCircleIcon } from "@phosphor-icons/react/ssr";

import { altOf } from "@/components/showcase-data";
import { TILE } from "@/components/tile";

/**
 * Invoices — four real invoices dropped on the desk at odd angles, like
 * papers left on a table. They fan out further on hover (mouse) or on tap
 * (touch, where hover does not exist); a second tap settles them again.
 *
 * The tap is a transparent native checkbox over the whole card, so it works
 * with no JavaScript at all; each paper's spread is written under both
 * `group-hover:` and `group-has-[:checked]:`.
 */
const INVOICES = [
  {
    slug: "invoice-nexlane-studio-corporate",
    pos: "left-[0%] top-[14%]",
    tilt: "-rotate-[13deg] group-hover:-rotate-[17deg] group-hover:-translate-x-2 group-has-[:checked]:-rotate-[17deg] group-has-[:checked]:-translate-x-2",
  },
  {
    slug: "invoice-crumb-co-bakery",
    pos: "left-[22%] top-[0%]",
    tilt: "rotate-[6deg] group-hover:rotate-[9deg] group-hover:-translate-y-1.5 group-has-[:checked]:rotate-[9deg] group-has-[:checked]:-translate-y-1.5",
  },
  {
    slug: "invoice-vanta-studio-dark",
    pos: "left-[42%] top-[18%]",
    tilt: "-rotate-[4deg] group-hover:-rotate-[7deg] group-hover:translate-y-1 group-has-[:checked]:-rotate-[7deg] group-has-[:checked]:translate-y-1",
  },
  {
    slug: "invoice-ashgrove-tide-vintage",
    pos: "left-[60%] top-[2%]",
    tilt: "rotate-[12deg] group-hover:rotate-[16deg] group-hover:translate-x-2 group-has-[:checked]:rotate-[16deg] group-has-[:checked]:translate-x-2",
  },
];

export function InvoicesTile() {
  return (
    <article
      className={`${TILE} group flex min-h-[300px] select-none flex-col bg-paper-warm [-webkit-tap-highlight-color:transparent]`}
    >
      <input
        type="checkbox"
        aria-label="Spread out the invoices"
        className="absolute inset-0 z-20 m-0 h-full w-full cursor-pointer appearance-none rounded-[18px] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink-900/30"
      />
      <div className="relative flex-1">
        {INVOICES.map(({ slug, pos, tilt }) => (
          <div
            key={slug}
            className={`absolute ${pos} w-[40%] ${tilt} aspect-[1055/1491] overflow-hidden rounded-[4px] bg-white shadow-[0_1px_2px_rgba(60,40,20,0.15),0_14px_28px_-10px_rgba(60,40,20,0.45)] ring-1 ring-black/[0.06] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none`}
          >
            <Image src={`/showcase/${slug}.webp`} alt={altOf(`/showcase/${slug}.webp`)} fill sizes="(max-width: 768px) 40vw, 160px" className="object-cover" />
          </div>
        ))}

        <span className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-[10px] bg-white px-2.5 py-1.5 text-[10.5px] text-ink-500 shadow-[0_6px_16px_-8px_rgba(60,40,20,0.35)]">
          <CheckCircleIcon size={12} weight="fill" className="text-sage" aria-hidden />
          Paid · 2 min ago
        </span>
      </div>

      {/* The papers run under the caption; the fade keeps it readable. */}
      <div className="relative -mt-16 bg-gradient-to-t from-paper-warm from-55% to-transparent px-5 pb-5 pt-14 sm:px-6 sm:pb-6">
        <h3 className="text-[17px] font-medium leading-snug tracking-[-0.01em] text-ink-900">
          Invoices and documents that match your brand
        </h3>
      </div>
    </article>
  );
}
