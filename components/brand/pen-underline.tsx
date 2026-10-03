import { HEX } from "@/components/brand/palette";

/** The stroke's shapes, in a 120×12 box — also drawn by the share image and app icon. */
export const PEN_VIEWBOX = "0 0 120 12";
export const PEN_STROKE =
  "M2 8.4 C 20 4.8, 52 3.8, 80 5 S 110 7, 118 3.6 L 117.2 5.4 C 108 9.8, 84 8.8, 60 8.4 S 20 9.8, 3 11.4 Z";
export const PEN_SECOND_PASS = "M6 10.6 C 18 9.4, 30 9, 40 9.2";
export const PEN_COLOR = HEX.accent;

/**
 * The brand's pen stroke: one loose swoosh in the accent that thickens
 * mid-way and tapers off, plus a faint short second pass at the start, as a
 * hand would draw it. Stretches to its box — size and place it with
 * `className` (it is absolutely positioned by the caller).
 */
export function PenUnderline({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox={PEN_VIEWBOX}
      fill="none"
      preserveAspectRatio="none"
      className={`pointer-events-none ${className}`}
    >
      <path
        d={PEN_STROKE}
        fill={PEN_COLOR}
      />
      <path
        d={PEN_SECOND_PASS}
        stroke={PEN_COLOR}
        strokeWidth={1.1}
        strokeLinecap="round"
        opacity={0.7}
      />
    </svg>
  );
}
