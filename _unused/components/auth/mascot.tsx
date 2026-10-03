"use client";

import { useEffect, useRef, useState } from "react";

import { useMascot } from "@/components/auth/mascot-store";

/**
 * Snap, the auth mascot: a flat orange rounded square. Its eyes follow the
 * pointer, then the text as you type; it covers its eyes while you type a
 * hidden password, watches when you show it, and shakes its head on an error.
 * `formSide` is where the form sits relative to it, so it looks the right way.
 */

const REACH = 8; // how far a pupil can travel inside its eye
const EYES = { left: 95, right: 145, y: 125 };
const HAND_REST = { left: { x: 54, y: 196 }, right: { x: 186, y: 196 } };

type Offset = { x: number; y: number };

export function Mascot({
  formSide,
  className,
}: {
  formSide: "right" | "below";
  className?: string;
}) {
  const { focus, oops } = useMascot();
  const ref = useRef<SVGSVGElement>(null);
  const [pointer, setPointer] = useState<Offset | null>(null);

  const idle = focus === null;
  useEffect(() => {
    if (!idle || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = ref.current?.getBoundingClientRect();
        if (!box || box.width === 0) return;
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + (box.height * EYES.y) / 240);
        const distance = Math.hypot(dx, dy) || 1;
        const pull = Math.min(1, distance / 260) * REACH;
        setPointer({ x: (dx / distance) * pull, y: (dy / distance) * pull });
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [idle]);

  const covering = focus?.kind === "password" && !focus.visible;
  const watching = focus?.kind === "password" && focus.visible;

  const toForm = formSide === "right" ? 1 : -1;
  let look: Offset;
  if (focus?.kind === "text") {
    // Reading along the line: the eyes move with the text as it grows.
    const progress = Math.min(focus.length, 28) / 28;
    look = { x: toForm * (-3 + progress * 11), y: 6 };
  } else if (watching) {
    look = { x: toForm * 7, y: 5 };
  } else {
    look = pointer ?? { x: toForm * 5, y: 2 };
  }

  const eyeScale = watching ? 1.14 : 1;
  const hand = (side: "left" | "right") => {
    const rest = HAND_REST[side];
    const target = covering ? { x: EYES[side], y: EYES.y + 2 } : rest;
    return `translate(${target.x}px, ${target.y}px) rotate(${covering ? (side === "left" ? 12 : -12) : 0}deg)`;
  };

  return (
    <svg
      ref={ref}
      viewBox="0 0 240 240"
      className={className}
      role="img"
      aria-label="Snap, the snapdesign mascot"
    >
      <ellipse cx="120" cy="224" rx="72" ry="8" className="fill-[var(--paper-rule)]" />

      <g key={oops} className={oops ? "mascot-shake" : undefined}>
        {/* Antenna */}
        <rect x="117" y="38" width="6" height="26" rx="3" className="fill-auth-ink" />
        <circle cx="120" cy="36" r="9" className="fill-auth-ink" />

        <rect x="40" y="60" width="160" height="152" rx="52" className="fill-accent" />
        <ellipse cx="70" cy="156" rx="11" ry="6.5" className="fill-accent-tint" />
        <ellipse cx="170" cy="156" rx="11" ry="6.5" className="fill-accent-tint" />

        <g className={covering ? undefined : "mascot-blink"}>
          {(["left", "right"] as const).map((side) => (
            <g
              key={side}
              className="mascot-move"
              style={{
                transformOrigin: `${EYES[side]}px ${EYES.y}px`,
                // Squeezed shut behind the hands, so no white shows round them.
                transform: covering ? "scale(1, 0.1)" : `scale(${eyeScale})`,
              }}
            >
              <circle cx={EYES[side]} cy={EYES.y} r="20" fill="#fff" />
              <g className="mascot-move" style={{ transform: `translate(${look.x}px, ${look.y}px)` }}>
                <circle cx={EYES[side]} cy={EYES.y} r="9.5" className="fill-auth-ink" />
                <circle cx={EYES[side] - 3} cy={EYES.y - 3.5} r="3" fill="#fff" />
              </g>
            </g>
          ))}
        </g>

        {/* Mouth: a smile; an "o" when it sees the password; pressed shut while hiding. */}
        <g className={oops ? "mascot-mouth" : undefined}>
          {watching ? (
            <ellipse cx="120" cy="166" rx="7" ry="8.5" className="fill-auth-ink" />
          ) : (
            <path
              d={covering ? "M111 166 Q120 170 129 166" : "M108 160 Q120 173 132 160"}
              className="fill-none stroke-auth-ink"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          )}
        </g>
        {oops ? (
          <path
            d="M109 170 Q120 160 131 170"
            className="mascot-frown fill-none stroke-auth-ink"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        ) : null}

        {(["left", "right"] as const).map((side) => (
          <g key={side} className="mascot-hand" style={{ transform: hand(side) }}>
            <rect x="-24" y="-20" width="48" height="40" rx="20" className="fill-[var(--mascot-hand)]" />
            <path
              d="M-9 -20 v9 M3 -20 v9 M15 -18 v7"
              className="stroke-[var(--mascot-hand-line)]"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
