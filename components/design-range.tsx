import Image from "next/image";

import { InvoicesTile } from "@/components/invoices-tile";
import { altOf } from "@/components/showcase-data";
import { TILE } from "@/components/tile";
import {
  BookmarkSimpleIcon,
  BrowserIcon,
  ChatCircleIcon,
  DotsThreeIcon,
  HeartIcon,
  PaperPlaneTiltIcon,
  PresentationIcon,
  SparkleIcon,
} from "@phosphor-icons/react/ssr";
import { COLOR } from "@/components/brand/palette";

/**
 * "Design anything" — a bento of what snapdesign makes. Four tiles in the
 * reference's arrangement: websites (wide), marketing (tall, full-bleed),
 * invoices (small), and slides & graphics (small). Every image is real work.
 */
export function DesignRange() {
  return (
    <section className="mx-auto w-full max-w-[1120px] px-6 pb-24">
      <header className="text-center">
        <h2 className="font-serif text-[clamp(2rem,4.4vw,3.25rem)] font-bold leading-none tracking-[-0.025em] text-ink-900">
          Design anything
        </h2>
        <p className="mx-auto mt-4 max-w-[520px] text-balance text-[17px] text-ink-500 sm:text-[19px]">
          From invoices to marketing slides, and everything in between.
        </p>
      </header>

      <div data-keep-light className="mt-12 grid gap-3 sm:gap-4 md:grid-cols-3 md:grid-rows-[300px_300px]">
        <WebsitesTile />
        <MarketingTile />
        <InvoicesTile />
        <SlidesTile />
      </div>
    </section>
  );
}


/** The spark from the Describe icon, drawn large and faint as decoration. */
function Spark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M12 1.5l2.6 7.9 7.9 2.6-7.9 2.6L12 22.5l-2.6-7.9L1.5 12l7.9-2.6z" fill="currentColor" />
    </svg>
  );
}

/** Websites — a real landing page in a browser window, headline beside it. */
function WebsitesTile() {
  return (
    <article className={`${TILE} min-h-[300px] bg-tint-sage md:col-span-2`}>
      <Spark className="absolute -right-6 bottom-[-30px] h-40 w-40 text-white/45" />
      <Spark className="absolute right-[34%] top-6 h-5 w-5 text-white/70" />

      {/* Browser window bleeding off the bottom-left corner. */}
      <div className="absolute bottom-[-18px] left-5 w-[47%] rotate-[-4deg] overflow-hidden rounded-[10px] bg-white shadow-[0_18px_40px_-14px_rgba(20,40,20,0.45)] ring-1 ring-black/[0.06] sm:left-8">
        <div className="flex h-5 items-center gap-1 border-b border-black/[0.05] px-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F28B82]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#FBD38D]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#9AE6B4]" />
        </div>
        <div className="relative aspect-[16/10]">
          <Image
            src="/showcase/website-lumen-ai-model.webp"
            alt={altOf("/showcase/website-lumen-ai-model.webp")}
            fill
            sizes="(max-width: 768px) 50vw, 360px"
            className="object-cover object-top"
          />
        </div>
      </div>

      <div className="relative ml-auto flex h-full w-[45%] flex-col justify-center py-8 pr-6 sm:pr-10">
        <h3 className="text-[clamp(1.2rem,2.3vw,1.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-900">
          Websites that look designed, not templated.
        </h3>
        <span className="mt-5 inline-flex w-fit items-center gap-2.5 rounded-[10px] border border-black/[0.06] bg-white px-3 py-2 text-[12.5px] font-medium text-ink-900 shadow-[0_1px_2px_rgba(20,40,20,0.05)]">
          <BrowserIcon size={15} weight="bold" className="text-sage" aria-hidden />
          Landing pages
          <span aria-hidden className="h-3.5 w-px bg-ink-900/15" />
          <span className="text-ink-500">Hero sections</span>
        </span>
      </div>
    </article>
  );
}

/**
 * The Suvo campaign image is a 3×3 grid of 4:5 posts — Instagram's portrait
 * size — so each carousel slide is one real post cropped out of it.
 * [column, row] of each cell, in slide order; the first repeats at the end so
 * the loop wraps without a jump.
 */
const CAROUSEL: [number, number][] = [
  [1, 0],
  [1, 1],
  [0, 0],
  [2, 1],
  [1, 2],
  [1, 0],
];

/** Marketing — the request, and the carousel it became, swiping on its own. */
function MarketingTile() {
  return (
    <article
      className={`${TILE} flex min-h-[600px] flex-col items-center justify-between gap-4 bg-tint-rose p-5 md:row-span-2 md:min-h-0`}
    >
      <Spark className="absolute left-5 top-16 h-6 w-6 text-white" />
      <Spark className="absolute bottom-24 right-5 h-4 w-4 text-white" />

      <h3 className="sr-only">Social posts and campaigns, ready to publish</h3>

      {/* The request */}
      <p className="relative self-end rounded-[14px] rounded-br-[4px] bg-ink-900 px-3.5 py-2.5 text-[13px] text-white shadow-[0_8px_18px_-10px_rgba(20,15,10,0.6)]">
        Turn this into an Instagram carousel
      </p>

      {/* The post */}
      <div className="relative w-full max-w-[270px] overflow-hidden rounded-[16px] bg-white shadow-[0_2px_4px_rgba(60,30,40,0.06),0_24px_44px_-18px_rgba(60,30,40,0.45)]">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <span className="rounded-full bg-[conic-gradient(var(--accent),var(--rose),var(--lilac),var(--accent))] p-[2px]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage text-[9px] font-bold text-white ring-2 ring-white">
              S
            </span>
          </span>
          <span className="flex-1 leading-tight">
            <span className="block text-[11.5px] font-semibold text-ink-900">suvo.drinks</span>
            <span className="block text-[9.5px] text-ink-300">Sponsored</span>
          </span>
          <DotsThreeIcon size={16} weight="bold" className="text-ink-900" aria-hidden />
        </div>

        {/* Slides — a track of real posts sliding one frame at a time. */}
        <div className="relative aspect-[4/5] overflow-hidden bg-tint-rose">
          <div className="carousel-track flex h-full w-[600%]">
            {CAROUSEL.map(([col, row], index) => (
              <div key={index} className="relative h-full w-1/6 overflow-hidden">
                {/* The full grid, scaled so one cell fills the slide; the
                    slight over-scale hides the grid's white gutters. */}
                <div
                  className="absolute h-[300%] w-[300%] scale-[1.035]"
                  style={{ left: `${-100 * col}%`, top: `${-100 * row}%`, transformOrigin: `${col * 50}% ${row * 50}%` }}
                >
                  <Image
                    src="/showcase/marketing-suvo-juice-campaign.webp"
                    alt={index === 0 ? altOf("/showcase/marketing-suvo-juice-campaign.webp") : ""}
                    fill
                    sizes="(max-width: 768px) 90vw, 810px"
                    // Always in motion, so never lazy — a slide must not
                    // arrive blank. All six share one URL, fetched once.
                    loading="eager"
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
          <span className="absolute right-2.5 top-2.5 rounded-full bg-black/55 px-2 py-0.5 text-[9.5px] font-medium tabular-nums text-white backdrop-blur-sm">
            <span className="carousel-count" />
          </span>
        </div>

        <div className="px-3 pb-3 pt-2.5">
          <div className="relative flex items-center">
            <span className="flex gap-3 text-ink-900">
              <HeartIcon size={18} weight="fill" className="text-rose" aria-hidden />
              <ChatCircleIcon size={18} aria-hidden />
              <PaperPlaneTiltIcon size={18} aria-hidden />
            </span>
            {/* Carousel dots, centred as on Instagram; the active one moves. */}
            <span aria-hidden className="absolute left-1/2 flex -translate-x-1/2 gap-1">
              {[0, 1, 2, 3, 4].map((dot) => (
                <span key={dot} className="h-1.5 w-1.5 rounded-full bg-ink-900/20" />
              ))}
              <span className="carousel-dot absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-blue" />
            </span>
            <BookmarkSimpleIcon size={18} className="ml-auto text-ink-900" aria-hidden />
          </div>
          <p className="mt-2 text-[11px] font-semibold text-ink-900">2,418 likes</p>
          <p className="mt-0.5 text-[11px] leading-snug text-ink-500">
            <span className="font-semibold text-ink-900">suvo.drinks</span> Pure matcha, pure power.
            Swipe for the full lineup →
          </p>
        </div>
      </div>

      {/* The reply */}
      <p className="relative flex items-center gap-1.5 self-start rounded-[12px] bg-white/85 px-3 py-2 text-[12px] font-medium text-ink-900 shadow-[0_6px_16px_-8px_rgba(60,30,40,0.35)] backdrop-blur-sm">
        <SparkleIcon size={13} weight="fill" className="text-accent" aria-hidden />
        5 slides, ready to post
      </p>
    </article>
  );
}

/** Slides & graphics — a request, and the pieces it could come back as. */
function SlidesTile() {
  const tiles = [
    "/showcase/slides-ember-bean-brand-guideline.webp",
    "/showcase/graphic-portfolio-design-poster.webp",
    "/showcase/graphic-evolve-sticker-sheet.webp",
  ];

  return (
    <article className={`${TILE} flex min-h-[300px] flex-col items-center justify-center gap-3 bg-tint-sky p-5 sm:p-6`}>
      {/* One loop (see "Request loop" in globals.css): the prompt types out, a
          cursor comes in and presses Generate, the pieces arrive one by one,
          hold, then everything clears and it starts again. */}
      <div className="relative flex w-full max-w-[250px] items-center justify-between rounded-[12px] bg-white py-1.5 pl-3.5 pr-1.5 shadow-[0_6px_16px_-8px_rgba(30,50,90,0.3)]">
        <span className="rq-type overflow-hidden whitespace-nowrap border-r-[1.5px] font-mono text-[12.5px] text-ink-900">
          Coffee brand pitch deck
        </span>
        <span className="relative ml-2 shrink-0">
          <span aria-hidden className="rq-ring absolute inset-0 rounded-[9px] bg-periwinkle" />
          <span className="rq-press relative flex h-7 w-7 items-center justify-center rounded-[9px] bg-periwinkle text-white">
            <SparkleIcon size={14} weight="fill" aria-hidden />
          </span>
        </span>

        {/* The cursor that presses Generate. */}
        <svg
          viewBox="0 0 16 16"
          aria-hidden
          className="rq-cursor pointer-events-none absolute -bottom-3 right-1 h-5 w-5 drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]"
        >
          <path d="M2 1.5l11 6.2-4.9 1.1-2.2 4.6z" fill={COLOR.inkSketch} stroke="#fff" strokeWidth={1.1} strokeLinejoin="round" />
        </svg>
      </div>

      <div className="grid w-full max-w-[250px] grid-cols-2 gap-2">
        {tiles.map((src) => (
          <div key={src} className="rq-thumb relative aspect-[4/3] overflow-hidden rounded-[8px] bg-white shadow-[0_4px_12px_-6px_rgba(30,50,90,0.3)]">
            <Image src={src} alt={altOf(src)} fill sizes="130px" className="object-cover object-top" />
          </div>
        ))}
        <div className="rq-thumb flex aspect-[4/3] items-center justify-center rounded-[8px] bg-white shadow-[0_4px_12px_-6px_rgba(30,50,90,0.3)]">
          <PresentationIcon size={22} className="text-periwinkle" aria-hidden />
        </div>
      </div>

      <h3 className="text-[12px] font-medium text-ink-500">Slides, posters and graphics</h3>
    </article>
  );
}
