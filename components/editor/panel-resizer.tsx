"use client";

import { useRef, useState } from "react";

type Props = {
  /** Which panel this handle resizes — decides the sign of the drag delta. */
  edge: "left" | "right";
  width: number;
  min: number;
  max: number;
  defaultWidth: number;
  label: string;
  onResize: (width: number) => void;
};

const KEY_STEP = 16;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function PanelResizer({
  edge,
  width,
  min,
  max,
  defaultWidth,
  label,
  onResize,
}: Props) {
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={Math.round(width)}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={(event) => {
        // Pointer capture keeps the drag alive even when the cursor outruns the
        // 5px handle, which it will.
        event.currentTarget.setPointerCapture(event.pointerId);
        startX.current = event.clientX;
        startWidth.current = width;
        setDragging(true);
      }}
      onPointerMove={(event) => {
        if (!dragging) return;
        const delta = event.clientX - startX.current;
        const next =
          edge === "left" ? startWidth.current + delta : startWidth.current - delta;
        onResize(clamp(next, min, max));
      }}
      onPointerUp={(event) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        setDragging(false);
      }}
      onDoubleClick={() => onResize(defaultWidth)}
      onKeyDown={(event) => {
        const towards = edge === "left" ? 1 : -1;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          onResize(clamp(width - KEY_STEP * towards, min, max));
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          onResize(clamp(width + KEY_STEP * towards, min, max));
        }
      }}
      className="group relative w-[5px] shrink-0 cursor-col-resize outline-none"
    >
      {/* The visible hairline. The handle is wider than the line so it is
          actually grabbable — a 1px target is not. */}
      <span
        aria-hidden
        className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors ${
          dragging
            ? "bg-ed-blue"
            : "bg-ed-border group-hover:bg-ed-blue group-focus-visible:bg-ed-blue"
        }`}
      />
    </div>
  );
}
