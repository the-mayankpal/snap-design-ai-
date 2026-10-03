"use client";

import {
  BrowserIcon,
  MegaphoneIcon,
  PresentationIcon,
  PaintBrushIcon,
} from "@phosphor-icons/react";

import { SectionHeader } from "@/components/editor/controls";
import {
  COUNTS,
  KIND_LABELS,
  KIND_IDS,
  RATIOS,
  useGenerate,
  type KindId,
} from "@/components/editor/generate-context";

const KIND_ICONS: Record<KindId, typeof BrowserIcon> = {
  website: BrowserIcon,
  marketing: MegaphoneIcon,
  slides: PresentationIcon,
  graphic: PaintBrushIcon,
};

/** Longest side of a ratio swatch, in px. The short side is derived. */
const SWATCH = 22;

export function GenerateControls({ showHeading = true }: { showHeading?: boolean }) {
  const { ratio, setRatio, kind, setKind, count, setCount } = useGenerate();

  return (
    <div className={showHeading ? "pt-3" : ""}>
      {showHeading ? <SectionHeader title="Generate" /> : null}

      {/* Ratio */}
      <div className="px-4 pb-1 pt-1">
        <p className="mb-2 text-[12px] text-ed-muted">Ratio</p>
        <div className="grid grid-cols-4 gap-1.5">
          {RATIOS.map(({ id, w, h }) => {
            const isActive = ratio === id;
            const landscape = w >= h;
            const width = landscape ? SWATCH : Math.round((SWATCH * w) / h);
            const height = landscape ? Math.round((SWATCH * h) / w) : SWATCH;

            return (
              <button
                key={id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setRatio(id)}
                className={`group flex flex-col items-center gap-1.5 rounded-md py-2 transition-colors duration-200 ${
                  isActive ? "bg-ed-raised" : "hover:bg-ed-field"
                }`}
              >
                {/* Fixed-height box so every swatch is centred in the same
                    space — otherwise portrait and landscape shapes push their
                    labels to different heights and the row reads ragged. */}
                <span
                  aria-hidden
                  className="flex items-center justify-center"
                  style={{ height: SWATCH }}
                >
                  <span
                    style={{ width, height }}
                    className={`block rounded-[3px] border transition-colors duration-200 ${
                      isActive
                        ? "border-ed-blue bg-ed-blue/25"
                        : "border-ed-dim group-hover:border-ed-muted"
                    }`}
                  />
                </span>
                <span
                  className={`text-[10px] leading-none transition-colors duration-200 ${
                    isActive ? "text-ed-text" : "text-ed-muted"
                  }`}
                >
                  {id}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Design type */}
      <div className="px-4 pb-1 pt-4">
        <p className="mb-2 text-[12px] text-ed-muted">Designing</p>
        <div className="grid grid-cols-2 gap-1.5">
          {KIND_IDS.map((id) => {
            const Icon = KIND_ICONS[id];
            const label = KIND_LABELS[id];
            const isActive = kind === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setKind(id)}
                className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-[12px] transition-colors duration-200 ${
                  isActive
                    ? "bg-ed-raised text-ed-text"
                    : "bg-ed-field text-ed-muted hover:text-ed-text"
                }`}
              >
                <Icon
                  size={14}
                  weight={isActive ? "fill" : "regular"}
                  className={isActive ? "text-ed-blue" : ""}
                  aria-hidden
                />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Count — a sliding thumb rather than four separate fills, so the
          selection glides between segments instead of blinking. */}
      <div className="px-4 pb-4 pt-4">
        <p className="mb-2 text-[12px] text-ed-muted">Variations</p>
        <div className="relative grid grid-cols-4 rounded-md bg-ed-field p-1">
          <span
            aria-hidden
            className="absolute inset-y-1 left-1 rounded-[5px] bg-ed-raised transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              width: "calc((100% - 0.5rem) / 4)",
              transform: `translateX(${COUNTS.indexOf(count as (typeof COUNTS)[number]) * 100}%)`,
            }}
          />
          {COUNTS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={count === value}
              onClick={() => setCount(value)}
              className={`relative z-10 rounded-[5px] py-1.5 text-[12px] transition-colors duration-200 ${
                count === value ? "text-ed-text" : "text-ed-muted hover:text-ed-text"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
