"use client";

import { MinusIcon, PlusIcon } from "@phosphor-icons/react";

import { MAX_ZOOM, MIN_ZOOM, useZoom } from "@/components/editor/zoom-context";

export function ZoomControl() {
  const { zoom, zoomIn, zoomOut, reset } = useZoom();

  return (
    <div className="flex h-9 items-center rounded-lg bg-ed-field ring-1 ring-inset ring-ed-hairline">
      <button
        type="button"
        aria-label="Zoom out"
        onClick={zoomOut}
        disabled={zoom <= MIN_ZOOM}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ed-text transition-colors hover:bg-ed-raised disabled:pointer-events-none disabled:opacity-30"
      >
        <MinusIcon size={15} weight="bold" aria-hidden />
      </button>

      <button
        type="button"
        onClick={reset}
        title="Reset to 100%"
        className="h-9 min-w-[54px] border-x border-ed-border px-1 text-center font-mono text-[13px] tabular-nums text-ed-text transition-colors hover:bg-ed-raised"
      >
        {Math.round(zoom * 100)}%
      </button>

      <button
        type="button"
        aria-label="Zoom in"
        onClick={zoomIn}
        disabled={zoom >= MAX_ZOOM}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ed-text transition-colors hover:bg-ed-raised disabled:pointer-events-none disabled:opacity-30"
      >
        <PlusIcon size={15} weight="bold" aria-hidden />
      </button>
    </div>
  );
}
