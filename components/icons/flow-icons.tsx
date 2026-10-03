import { COLOR } from "@/components/brand/palette";

/**
 * Custom two-tone icons for the hero's Describe → Design → Download pill.
 * Drawn on a 20×20 grid in the "How it works" card palette, so the three
 * steps carry the same colours there and here.
 */

type IconProps = { size?: number; className?: string };

const ORANGE = COLOR.accentSoft;
const PURPLE = COLOR.lilac;
const GREEN = COLOR.sage;
const INK = COLOR.inkSketch;

/** A speech bubble mid-sentence, with a spark — you say what you want. */
export function DescribeIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path
        d="M3 5.5A2.5 2.5 0 0 1 5.5 3h7A2.5 2.5 0 0 1 15 5.5v4.5a2.5 2.5 0 0 1-2.5 2.5H8.2l-3 2.6a.5.5 0 0 1-.83-.38V12.4A2.5 2.5 0 0 1 3 10z"
        fill={ORANGE}
        fillOpacity={0.18}
        stroke={ORANGE}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path d="M6 6.6h5.8M6 9.1h3.6" stroke={ORANGE} strokeWidth={1.5} strokeLinecap="round" />
      <path
        d="M16.3 10.8l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z"
        fill={INK}
        stroke={INK}
        strokeWidth={0.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Three primitives overlapping into a composition — the design taking form. */
export function DesignIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <rect x={8.5} y={8.5} width={8.5} height={8.5} rx={2} fill={GREEN} fillOpacity={0.2} stroke={GREEN} strokeWidth={1.5} />
      <circle cx={7.5} cy={7.5} r={4.5} fill={PURPLE} fillOpacity={0.85} />
      <path d="M13.6 2.8l2.6 4.4h-5.2z" fill={ORANGE} stroke={ORANGE} strokeWidth={1.1} strokeLinejoin="round" />
    </svg>
  );
}

/** A finished image with a download badge — yours to take away. */
export function DownloadIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <rect x={2.5} y={3} width={12.5} height={11} rx={2.2} stroke={INK} strokeWidth={1.5} />
      <circle cx={6.4} cy={6.8} r={1.2} fill={ORANGE} />
      <path d="M3.2 12.6l3.4-3.3 2.4 2.2 2-1.8 3.3 3" stroke={GREEN} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={15} cy={14.5} r={4} fill={ORANGE} stroke="#fff" strokeWidth={1.3} />
      <path d="M15 12.6v3.6M13.5 14.9l1.5 1.4 1.5-1.4" stroke="#fff" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
