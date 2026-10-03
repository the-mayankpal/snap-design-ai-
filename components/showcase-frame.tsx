import { FadeImage } from "@/components/fade-image";

import type { Design } from "@/components/showcase-data";

/**
 * A showcase card. With a `design` it renders that design at its own aspect
 * ratio — portrait and square sit alongside landscape without being cropped.
 * With none it renders the empty frame.
 */
export function ShowcaseFrame({
  design,
  className = "",
  sizes = "(max-width: 640px) 88vw, 420px",
  eager = false,
}: {
  design?: Design;
  className?: string;
  sizes?: string;
  /** Opt out of lazy loading. The marquee needs this: it moves continuously, so
   *  a card that has not loaded arrives on screen blank. */
  eager?: boolean;
}) {
  return (
    <figure
      // A white card on a white page needs its border and shadow to do the
      // defining, and the inner surface has to sit clearly below the frame.
      className={`overflow-hidden rounded-[14px] border border-black/[0.07] bg-surface dark:border-white/[0.07] p-2.5 shadow-[0_1px_2px_rgba(20,15,10,0.05),0_12px_30px_-14px_rgba(20,15,10,0.28)] ${className}`}
    >
      <div
        className="relative h-full overflow-hidden rounded-[8px] bg-frame ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.04]"
        style={{
          aspectRatio: design
            ? `${design.width} / ${design.height}`
            : "16 / 10",
        }}
      >
        {design ? (
          <FadeImage
            src={design.src}
            alt={design.alt}
            fill
            sizes={sizes}
            loading={eager ? "eager" : "lazy"}
            className="object-cover"
          />
        ) : null}
      </div>
    </figure>
  );
}
