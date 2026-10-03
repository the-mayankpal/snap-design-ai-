import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { COLOR } from "@/components/brand/palette";

/**
 * Scrapbook pieces for the About page: taped polaroids, washi tape, stamp-edged
 * stickers, pen-sketch arrows and a hand-drawn box. All flat — paper, ink and
 * tape, no gradients.
 */

/** A strip of washi tape. `tone` is any CSS colour; it is drawn translucent. */
export function Tape({ className = "", tone = COLOR.sky }: { className?: string; tone?: string }) {
  return (
    <span
      aria-hidden
      // Multiply tints the paper beneath; on dark paper it would turn the tape black.
      className={`absolute h-5 w-14 opacity-80 mix-blend-multiply dark:mix-blend-normal ${className}`}
      style={{ backgroundColor: tone }}
    />
  );
}

/** A taped polaroid of a real design, with a handwritten caption. */
export function Polaroid({
  src,
  alt,
  caption,
  aspect = "4 / 5",
  className = "",
  style,
  tapes = [COLOR.sky, COLOR.butter],
}: {
  src: string;
  alt: string;
  caption: string;
  aspect?: string;
  className?: string;
  style?: CSSProperties;
  tapes?: [string, string];
}) {
  return (
    <figure
      // No `relative` here: callers pass `absolute` or `relative`, and a
      // built-in `relative` would override an `absolute` placement.
      data-keep-light
      className={`bg-white p-2 pb-8 shadow-[0_1px_2px_rgba(20,15,10,0.08),0_14px_30px_-14px_rgba(20,15,10,0.35)] ${className}`}
      style={style}
    >
      <Tape tone={tapes[0]} className="-left-4 -top-2 -rotate-[28deg]" />
      <Tape tone={tapes[1]} className="-right-4 -top-2 rotate-[24deg]" />
      <div className="relative w-full overflow-hidden bg-frame" style={{ aspectRatio: aspect }}>
        <Image src={src} alt={alt} fill sizes="240px" className="object-cover object-top" />
      </div>
      <figcaption className="absolute inset-x-0 bottom-1.5 text-center font-hand text-[15px] text-ink-500">
        {caption}
      </figcaption>
    </figure>
  );
}

/**
 * Stamp-edged sticker: a jagged outline cut with a clip-path whose teeth are a
 * fixed 4px deep, so the edge looks the same on short and long labels.
 */
const TEETH_X = 16;
const TEETH_Y = 4;
const D = "4px";
function stampPath() {
  const pts: string[] = [];
  for (let i = 0; i <= TEETH_X; i++) pts.push(`${(i / TEETH_X) * 100}% ${i % 2 ? D : "0"}`);
  for (let i = 1; i <= TEETH_Y; i++)
    pts.push(`${i % 2 ? `calc(100% - ${D})` : "100%"} ${(i / TEETH_Y) * 100}%`);
  for (let i = TEETH_X - 1; i >= 0; i--)
    pts.push(`${(i / TEETH_X) * 100}% ${i % 2 ? `calc(100% - ${D})` : "100%"}`);
  for (let i = TEETH_Y - 1; i >= 1; i--) pts.push(`${i % 2 ? D : "0"} ${(i / TEETH_Y) * 100}%`);
  return `polygon(${pts.join(", ")})`;
}
const STAMP = stampPath();

export function Sticker({
  children,
  bg,
  fg = "#fff",
  className = "",
}: {
  children: ReactNode;
  bg: string;
  fg?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center px-3.5 py-2 text-[14px] font-semibold sm:px-4 sm:py-2.5 sm:text-[15px] ${className}`}
      style={{ backgroundColor: bg, color: fg, clipPath: STAMP }}
    >
      {children}
    </span>
  );
}

/** A pen-sketch arrow: one loose stroke and a two-line head. */
export function SketchArrow({ d, head, className = "" }: { d: string; head: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 80 50" fill="none" className={className}>
      <path d={d} stroke={COLOR.inkSketch} strokeWidth={1.4} strokeLinecap="round" />
      <path d={head} stroke={COLOR.inkSketch} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A hand-drawn box — slightly off-square, overshooting at one corner. */
export function ScribbleBox({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 400 140" preserveAspectRatio="none" fill="none" className={className}>
      <path
        d="M8 10 C 120 4, 280 6, 392 9 C 395 50, 394 95, 391 131 C 280 135, 120 134, 9 130 C 5 92, 6 50, 10 6 L 30 12"
        stroke={COLOR.accent}
        strokeWidth={2.2}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** A small sticky tag, tilted, as pinned around the wordmark. */
export function Tag({
  children,
  tone,
  hand,
  className = "",
}: {
  children: ReactNode;
  tone: string;
  hand?: boolean;
  className?: string;
}) {
  return (
    <span
      data-keep-light
      // No display class here — callers decide (`inline-block`, or
      // `hidden md:inline-block`); a built-in one would fight theirs.
      className={`rounded-[4px] px-2.5 py-1 shadow-[0_1px_2px_rgba(20,15,10,0.12)] ${
        hand
          ? "font-hand text-[17px] leading-none text-ink-900"
          : "font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-900"
      } ${className}`}
      style={{ backgroundColor: tone }}
    >
      {children}
    </span>
  );
}
