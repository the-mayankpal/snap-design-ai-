import Link from "next/link";

import { PenUnderline } from "@/components/brand/pen-underline";

/**
 * The snapdesign wordmark with its orange pen stroke, the same everywhere.
 * The stroke is sized in `em`, so it keeps the navbar's proportions at any
 * font size; pass size and colour with `className`.
 */
export function Wordmark({
  href,
  label,
  className = "",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`relative inline-block shrink-0 font-extrabold leading-none tracking-[-0.045em] transition-opacity hover:opacity-80 ${className}`}
    >
      snapdesign
      <PenUnderline className="absolute -bottom-[0.45em] left-[-0.09em] h-[0.5em] w-[calc(100%+0.27em)]" />
    </Link>
  );
}
