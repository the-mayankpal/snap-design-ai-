"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

/**
 * Drag-to-reorder for the dashboard cards (D82). A mouse drag starts after a
 * few pixels; on touch, press and hold first, so a normal swipe still
 * scrolls. While dragging, `onMove` reports the card under the pointer and
 * which side of it to drop on; `onDrop` fires once at the end. The click that
 * ends a drag is swallowed, so the card's link doesn't open.
 */

const MOUSE_SLOP = 6;
const HOLD_MS = 350;
const TOUCH_SLOP = 8;

export type Ghost = { id: string; x: number; y: number; width: number };

type Options = {
  onMove: (dragId: string, overId: string, after: boolean) => void;
  onDrop: () => void;
};

export function useReorder({ onMove, onDrop }: Options) {
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const callbacks = useRef({ onMove, onDrop });
  useEffect(() => {
    callbacks.current = { onMove, onDrop };
  });
  const swallowClick = useRef(false);
  const cleanup = useRef<(() => void) | null>(null);

  useEffect(() => () => cleanup.current?.(), []);

  const start = (event: ReactPointerEvent<HTMLElement>, id: string) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
    const card = event.currentTarget.getBoundingClientRect();
    const origin = { x: event.clientX, y: event.clientY };
    // Where the pointer grabbed the card, so it stays under the finger.
    const grab = { x: origin.x - card.left, y: origin.y - card.top };
    const touch = event.pointerType !== "mouse";
    let active = false;
    let last = "";
    let holdTimer: ReturnType<typeof setTimeout> | null = null;

    const place = (x: number, y: number) =>
      setGhost({ id, x: x - grab.x, y: y - grab.y, width: card.width });

    const begin = (x: number, y: number) => {
      active = true;
      document.body.style.userSelect = "none";
      navigator.vibrate?.(10);
      place(x, y);
    };

    const move = (event: PointerEvent) => {
      const { clientX: x, clientY: y } = event;
      const distance = Math.hypot(x - origin.x, y - origin.y);
      if (!active) {
        if (touch) {
          // Moving before the hold completes is a scroll, not a drag.
          if (distance > TOUCH_SLOP) end();
          return;
        }
        if (distance < MOUSE_SLOP) return;
        begin(x, y);
      }
      place(x, y);
      const over = document
        .elementsFromPoint(x, y)
        .map((element) => element.closest<HTMLElement>("[data-reorder]"))
        .find((element) => element && element.dataset.reorder !== id);
      if (!over) return;
      const rect = over.getBoundingClientRect();
      const after = y > rect.top + rect.height / 2;
      const key = `${over.dataset.reorder}:${after}`;
      if (key === last) return;
      last = key;
      callbacks.current.onMove(id, over.dataset.reorder!, after);
    };

    // A drag on touch must not scroll the page under it.
    const blockScroll = (event: TouchEvent) => {
      if (active) event.preventDefault();
    };

    const up = () => {
      const dropped = active;
      end();
      if (!dropped) return;
      swallowClick.current = true;
      setTimeout(() => (swallowClick.current = false), 0);
      callbacks.current.onDrop();
    };

    function end() {
      if (holdTimer) clearTimeout(holdTimer);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", end);
      window.removeEventListener("touchmove", blockScroll);
      document.body.style.userSelect = "";
      active = false;
      setGhost(null);
      cleanup.current = null;
    }

    cleanup.current?.();
    cleanup.current = end;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", end);
    window.addEventListener("touchmove", blockScroll, { passive: false });
    if (touch) holdTimer = setTimeout(() => begin(origin.x, origin.y), HOLD_MS);
  };

  /** Spread onto each draggable card. */
  const handlers = (id: string) => ({
    "data-reorder": id,
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => start(event, id),
    onClickCapture: (event: React.MouseEvent) => {
      if (!swallowClick.current) return;
      event.preventDefault();
      event.stopPropagation();
    },
    // The browser's own link/image drag would fight this one.
    onDragStart: (event: React.DragEvent) => event.preventDefault(),
    // A long press on touch would open the context menu instead.
    onContextMenu: (event: React.MouseEvent) => {
      if (event.nativeEvent instanceof PointerEvent && event.nativeEvent.pointerType !== "mouse") {
        event.preventDefault();
      }
    },
  });

  return { ghost, handlers };
}

/** Moves `dragId` next to `overId` (before, or after when `after`). */
export function reorder<T extends { id: string }>(items: T[], dragId: string, overId: string, after: boolean) {
  const dragged = items.find((item) => item.id === dragId);
  if (!dragged || dragId === overId) return items;
  const rest = items.filter((item) => item.id !== dragId);
  const index = rest.findIndex((item) => item.id === overId);
  if (index < 0) return items;
  rest.splice(after ? index + 1 : index, 0, dragged);
  return rest;
}
