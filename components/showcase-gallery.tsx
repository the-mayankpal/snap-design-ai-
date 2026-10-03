"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { XIcon } from "@phosphor-icons/react";

import { ShowcaseFrame } from "@/components/showcase-frame";
import type { Design } from "@/components/showcase-data";

/** Indices of `designs` split into `count` columns, shortest-first. */
function balance(designs: Design[], count: number) {
  const columns: number[][] = Array.from({ length: count }, () => []);
  const heights = new Array<number>(count).fill(0);
  designs.forEach((design, index) => {
    const shortest = heights.indexOf(Math.min(...heights));
    columns[shortest].push(index);
    heights[shortest] += design.height / design.width;
  });
  return columns;
}

/**
 * The /showcase gallery: two columns on phones (one was a wall of huge cards),
 * three on desktop. Tapping a design opens it large over the page, with
 * everything behind blurred. Escape, the close button or a tap outside it
 * closes; arrow keys step through the set.
 */
export function ShowcaseGallery({ designs }: { designs: Design[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const open = openIndex === null ? null : designs[openIndex];

  useEffect(() => {
    if (openIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenIndex(null);
      else if (event.key === "ArrowRight")
        setOpenIndex((index) => (index === null ? index : (index + 1) % designs.length));
      else if (event.key === "ArrowLeft")
        setOpenIndex((index) =>
          index === null ? index : (index - 1 + designs.length) % designs.length,
        );
    };

    // Hold the page still behind the overlay.
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
      // However it closed, hand focus back to the card that opened it.
      returnFocus.current?.focus();
    };
    // Keyed on open/closed only: stepping between designs must not re-run it.
  }, [openIndex === null, designs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => setOpenIndex(null);

  // Deal each design into the currently shortest column (by height relative
  // to width), keeping columns balanced and the list order roughly intact.
  const twoColumns = useMemo(() => balance(designs, 2), [designs]);
  const threeColumns = useMemo(() => balance(designs, 3), [designs]);

  const card = (index: number) => {
    const design = designs[index];
    return (
      <button
        key={design.src}
        type="button"
        aria-label={`Open ${design.alt}`}
        onClick={(event) => {
          returnFocus.current = event.currentTarget;
          setOpenIndex(index);
        }}
        className="block w-full cursor-zoom-in rounded-[10px] text-left outline-none transition-transform duration-300 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ink-900/40 sm:rounded-[14px]"
      >
        <ShowcaseFrame
          design={design}
          className="!rounded-[10px] !p-1.5 sm:!rounded-[14px] sm:!p-2.5"
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 45vw, 340px"
        />
      </button>
    );
  };

  return (
    <>
      {/* Masonry from real column containers, not CSS `columns`: lazy images
          inside multi-column layout sometimes never load (notably Safari),
          leaving blank cards. Two layouts — 2 columns below `lg`, 3 above —
          and the hidden one's lazy images are never fetched. */}
      <div className="mt-10 flex gap-3 sm:mt-12 sm:gap-5 lg:hidden">
        {twoColumns.map((column, index) => (
          <div key={index} className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-5">
            {column.map((index) => card(index))}
          </div>
        ))}
      </div>
      <div className="mt-12 hidden gap-5 lg:flex">
        {threeColumns.map((column, index) => (
          <div key={index} className="flex min-w-0 flex-1 flex-col gap-5">
            {column.map((index) => card(index))}
          </div>
        ))}
      </div>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={open.alt}
          onClick={close}
          className="lightbox-backdrop fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-white/40 p-4 backdrop-blur-xl sm:p-8"
        >
          <button
            ref={closeRef}
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-[11px] bg-ink-900 text-surface shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)] transition-opacity hover:opacity-90 sm:right-6 sm:top-6"
          >
            <XIcon size={16} weight="bold" aria-hidden />
          </button>

          <figure
            key={open.src}
            onClick={(event) => event.stopPropagation()}
            className="lightbox-card overflow-hidden rounded-[14px] border border-black/[0.07] bg-surface p-2 shadow-[0_30px_80px_-20px_rgba(20,15,10,0.45)] sm:p-3"
            // Fit inside the viewport on whichever side runs out first.
            style={{
              width: `min(94vw, 1200px, calc(82dvh * ${open.width} / ${open.height}))`,
            }}
          >
            <div
              className="relative w-full overflow-hidden rounded-[8px] bg-frame"
              style={{ aspectRatio: `${open.width} / ${open.height}` }}
            >
              <Image
                src={open.src}
                alt={open.alt}
                fill
                sizes="(max-width: 640px) 94vw, 1200px"
                className="object-contain"
                priority
              />
            </div>
          </figure>
          <p className="lightbox-card max-w-[90vw] text-center text-[13px] font-medium text-ink-900">
            {open.alt}
          </p>
        </div>
      ) : null}
    </>
  );
}
