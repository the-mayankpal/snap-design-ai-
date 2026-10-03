"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * An endless horizontal drift that never pauses, and that people can push:
 * a sideways two-finger swipe on a trackpad, or a drag with mouse or finger,
 * moves it faster in either direction; let go and it glides with momentum,
 * then settles back into the drift. Vertical scrolling passes straight
 * through to the page.
 *
 * `children` must be the content rendered twice in a row — the loop wraps
 * by one period (half the track plus half a gap), so the seam never shows.
 */
export function DragMarquee({
  children,
  secondsPerLoop = 110,
  className = "",
  trackClassName = "",
  trackStyle,
}: {
  children: ReactNode;
  secondsPerLoop?: number;
  className?: string;
  trackClassName?: string;
  trackStyle?: React.CSSProperties;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let period = 1;
    const measure = () => {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      period = (track.scrollWidth + gap) / 2 || 1;
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(track);

    let offset = 0; // px moved left
    let momentum = 0; // px/s from a fling, decays to 0
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    let dragVelocity = 0;
    let prev = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      if (!dragging) {
        const drift = reduced ? 0 : period / secondsPerLoop;
        offset += (drift + momentum) * dt;
        momentum *= Math.pow(0.04, dt); // ~96% gone after a second
        if (Math.abs(momentum) < 1) momentum = 0;
      }
      offset = ((offset % period) + period) % period;
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    // Two-finger sideways swipe (and shift + wheel). Only take the event when
    // it is mostly horizontal, so the page still scrolls vertically.
    const onWheel = (event: WheelEvent) => {
      const dx = event.deltaX || (event.shiftKey ? event.deltaY : 0);
      if (Math.abs(dx) <= Math.abs(event.deltaY) && !event.shiftKey) return;
      event.preventDefault();
      offset += dx;
      momentum = 0;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      dragging = true;
      momentum = 0;
      dragVelocity = 0;
      lastX = event.clientX;
      lastT = performance.now();
      viewport.setPointerCapture(event.pointerId);
      viewport.dataset.dragging = "true";
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = event.clientX - lastX;
      offset -= dx;
      const dt = Math.max(1, now - lastT) / 1000;
      dragVelocity = 0.8 * (-dx / dt) + 0.2 * dragVelocity;
      lastX = event.clientX;
      lastT = now;
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      // Only fling if the finger was still moving when it let go.
      momentum = performance.now() - lastT < 80 ? Math.max(-4000, Math.min(4000, dragVelocity)) : 0;
      viewport.releasePointerCapture?.(event.pointerId);
      delete viewport.dataset.dragging;
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerUp);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", onPointerUp);
      viewport.removeEventListener("pointercancel", onPointerUp);
    };
  }, [secondsPerLoop]);

  return (
    <div
      ref={viewportRef}
      // `pan-y`: a vertical swipe still scrolls the page on touch screens;
      // horizontal drags come to us.
      className={`cursor-grab touch-pan-y select-none data-[dragging=true]:cursor-grabbing ${className}`}
      onDragStart={(event) => event.preventDefault()}
    >
      <div ref={trackRef} className={`will-change-transform ${trackClassName}`} style={trackStyle}>
        {children}
      </div>
    </div>
  );
}
