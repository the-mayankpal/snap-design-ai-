"use client";

import { useEffect, useState } from "react";

/** What the status line says, from the second it applies. The plan is already made when this shows. */
const STAGES: [number, string][] = [
  [0, "Composing the layout"],
  [4, "Setting the type"],
  [9, "Rendering details"],
  [20, "Adding final touches"],
  [35, "Almost there"],
];

/** Progress eases toward 95% on this time constant (seconds): honest, never stuck at 100%. */
const TAU = 12;

type Block = { x: number; y: number; w: number; h: number };

/** A wireframe of a design in this shape: copy and a button on one side, an image area on the other. */
function wireframe(wide: boolean): Block[] {
  return wide
    ? [
        { x: 6, y: 7, w: 18, h: 4 },
        { x: 70, y: 7, w: 24, h: 4 },
        { x: 6, y: 26, w: 40, h: 9 },
        { x: 6, y: 38, w: 32, h: 9 },
        { x: 6, y: 54, w: 36, h: 3.5 },
        { x: 6, y: 60, w: 28, h: 3.5 },
        { x: 6, y: 70, w: 16, h: 7 },
        { x: 52, y: 20, w: 42, h: 72 },
      ]
    : [
        { x: 8, y: 5, w: 30, h: 3 },
        { x: 8, y: 12, w: 70, h: 7 },
        { x: 8, y: 21, w: 52, h: 7 },
        { x: 8, y: 32, w: 60, h: 2.5 },
        { x: 8, y: 36, w: 44, h: 2.5 },
        { x: 8, y: 42, w: 26, h: 5 },
        { x: 8, y: 52, w: 84, h: 42 },
      ];
}

/**
 * The image being made, drawn as a design taking shape: wireframe blocks
 * appear in turn, a scan line sweeps down, and a status line with elapsed
 * seconds sits below. Flat colours only; still under reduced motion.
 */
export function GeneratingCard({
  width,
  height,
  scale,
  style,
}: {
  width: number;
  height: number;
  /** 1 / zoom, so the status line keeps its screen size. */
  scale: number;
  style: React.CSSProperties;
}) {
  const [started] = useState(() => Date.now());
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((Date.now() - started) / 1000), 250);
    return () => clearInterval(timer);
  }, [started]);

  const stage = [...STAGES].reverse().find(([from]) => seconds >= from)![1];
  const progress = 95 * (1 - Math.exp(-seconds / TAU));
  const blocks = wireframe(width > height);

  return (
    <div role="status" aria-live="polite" aria-label={`Designing: ${stage}`} className="absolute" style={style}>
      <div className="relative h-full w-full overflow-hidden rounded-[6px] bg-ed-field ring-1 ring-ed-hairline">
        {blocks.map((block, index) => (
          <span
            key={index}
            aria-hidden
            className="gen-block absolute rounded-[3px] bg-ed-raised"
            style={{
              left: `${block.x}%`,
              top: `${block.y}%`,
              width: `${block.w}%`,
              height: `${block.h}%`,
              animationDelay: `${index * 0.18}s`,
            }}
          />
        ))}
        <span aria-hidden className="gen-scan absolute inset-x-0 top-0 h-[2px] bg-ed-blue" />
      </div>

      {/* Status below the card, the same size on screen at any zoom. */}
      <div
        className="absolute left-0 w-[220px]"
        style={{ top: `calc(100% + ${8 * scale}px)`, transform: `scale(${scale})`, transformOrigin: "0 0" }}
      >
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-ed-raised">
          <div
            className="h-full rounded-full bg-ed-blue transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1.5 flex items-center justify-between gap-3 text-[11.5px]">
          <span className="text-ed-text">{stage}…</span>
          <span className="font-mono tabular-nums text-ed-dim">{Math.floor(seconds)}s</span>
        </p>
      </div>
    </div>
  );
}
