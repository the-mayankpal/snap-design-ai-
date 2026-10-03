"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckIcon, NotePencilIcon, PushPinIcon } from "@phosphor-icons/react";

import { isFinalNote, MAX_NOTE, type Frame } from "@/components/designs/design-model";
import { BASE_DOT_GAP, MAX_ZOOM, MIN_ZOOM, useZoom } from "@/components/editor/zoom-context";
import { LoadedImg } from "@/components/loaded-img";

/** Head chases the cursor; tail chases the head. The gap between them is the trail. */
const HEAD_EASE = 0.34;
const TAIL_EASE = 0.11;
const OFFSCREEN = -999;

/** A generated image, ready to draw — `url` is a short-lived signed link. */
export type CanvasImage = {
  id: string;
  url: string;
  width: number;
  height: number;
  prompt: string;
  /** Saved place on the board; absent until first placed. */
  frame?: Frame | null;
  /** The user's label under it ("final v1"). */
  note?: string | null;
};

/** Height a newly placed image gets, in canvas units. */
const IMAGE_HEIGHT = 280;
/** Room between stacked images for the label above and the note below. */
const GAP = 64;
const MIN_WIDTH = 80;
/** Screen px a press must travel before it counts as a drag, not a click. */
const DRAG_SLOP = 3;
const HANDLE = 10;

type Size = { width: number; height: number };
type Point = { x: number; y: number };
type Frames = Record<string, Frame>;
type Corner = "nw" | "ne" | "sw" | "se";
const CORNERS: Corner[] = ["nw", "ne", "sw", "se"];

const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
const heightOf = (frame: Frame, size: Size) => (frame.w * size.height) / size.width;

/** The next free spot: below everything, lined up with the newest image. */
function nextSlot(frames: Frames, images: CanvasImage[], size: Size): Frame {
  const w = (IMAGE_HEIGHT * size.width) / size.height;
  const placed = images.filter((image) => frames[image.id]);
  if (!placed.length) return { x: -w / 2, y: -IMAGE_HEIGHT / 2, w };
  const bottom = Math.max(...placed.map((image) => frames[image.id].y + heightOf(frames[image.id], image)));
  return { x: frames[placed.at(-1)!.id].x, y: bottom + GAP, w };
}

/** Every image with a frame: its own, or the next free spot in order. */
function placeAll(images: CanvasImage[], frames: Frames): Frames {
  const all = { ...frames };
  for (const image of images) all[image.id] ??= nextSlot(all, images, image);
  return all;
}

function centerOf(frames: Frames, images: CanvasImage[]): Point {
  if (!images.length) return { x: 0, y: 0 };
  const rects = images.map((image) => {
    const frame = frames[image.id];
    return { ...frame, h: heightOf(frame, image) };
  });
  const left = Math.min(...rects.map((r) => r.x));
  const top = Math.min(...rects.map((r) => r.y));
  const right = Math.max(...rects.map((r) => r.x + r.w));
  const bottom = Math.max(...rects.map((r) => r.y + r.h));
  return { x: (left + right) / 2, y: (top + bottom) / 2 };
}

/** A resize from `corner`, keeping the aspect ratio and pinning the opposite corner. */
function resized(from: Frame, size: Size, corner: Corner, dx: number, dy: number): Frame {
  const aspect = size.height / size.width;
  const fromH = from.w * aspect;
  const sx = corner.includes("e") ? 1 : -1;
  const sy = corner.includes("s") ? 1 : -1;
  const byX = from.w + sx * dx;
  const byY = (fromH + sy * dy) / aspect;
  const w = Math.max(MIN_WIDTH, Math.abs(byX - from.w) >= Math.abs(byY - from.w) ? byX : byY);
  const h = w * aspect;
  return {
    w,
    x: sx > 0 ? from.x : from.x + from.w - w,
    y: sy > 0 ? from.y : from.y + fromH - h,
  };
}

type Props = {
  images: CanvasImage[];
  /** An image being generated, drawn as a placeholder in the spot it will take. */
  pending?: Size | null;
  coverId: string | null;
  onSetCover: (id: string) => void;
  /** The image the chat is focused on; clicking an image selects it, clicking empty canvas clears it. */
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** The whole board after a move or resize, to be saved. */
  onLayout: (frames: ({ id: string } & Frame)[]) => void;
  /** Sets or clears the note under an image. */
  onNote: (id: string, note: string | null) => void;
};

/**
 * A free board, like FigJam: drag an image to move it, drag a corner of the
 * selected image to resize it, drag empty space or scroll to pan, pinch or
 * ⌘/Ctrl + scroll to zoom toward the cursor. Positions are canvas units at
 * 100% zoom; `center` is the canvas point shown at the middle of the stage.
 */
export function CanvasStage({
  images,
  pending = null,
  coverId,
  onSetCover,
  selectedId,
  onSelect,
  onLayout,
  onNote,
}: Props) {
  const stageRef = useRef<HTMLElement>(null);
  const { zoom, zoomBy, zoomIn, zoomOut, reset } = useZoom();

  const [frames, setFrames] = useState<Frames>(() =>
    Object.fromEntries(images.flatMap((image) => (image.frame ? [[image.id, image.frame]] : []))),
  );
  const layout = useMemo(() => placeAll(images, frames), [images, frames]);
  const [center, setCenter] = useState<Point>(() => centerOf(layout, images));
  const [stageSize, setStageSize] = useState<Size | null>(null);
  const [panning, setPanning] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const slot = pending ? nextSlot(layout, images, pending) : null;

  // A new placeholder out of view brings the view to it.
  const [seenPending, setSeenPending] = useState(pending);
  if (pending !== seenPending) {
    setSeenPending(pending);
    if (slot && pending && stageSize) {
      const left = stageSize.width / 2 + (slot.x - center.x) * zoom;
      const top = stageSize.height / 2 + (slot.y - center.y) * zoom;
      const visible =
        left >= 0 &&
        top >= 0 &&
        left + slot.w * zoom <= stageSize.width &&
        top + heightOf(slot, pending) * zoom <= stageSize.height;
      if (!visible) setCenter({ x: slot.x + slot.w / 2, y: slot.y + heightOf(slot, pending) / 2 });
    }
  }

  // Pointer state lives in refs, not React state: this updates every frame and
  // must never trigger a re-render.
  const target = useRef({ x: OFFSCREEN, y: OFFSCREEN });
  const head = useRef({ x: OFFSCREEN, y: OFFSCREEN });
  const tail = useRef({ x: OFFSCREEN, y: OFFSCREEN });
  const seeded = useRef(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let frame = 0;
    const tick = () => {
      head.current.x += (target.current.x - head.current.x) * HEAD_EASE;
      head.current.y += (target.current.y - head.current.y) * HEAD_EASE;
      tail.current.x += (head.current.x - tail.current.x) * TAIL_EASE;
      tail.current.y += (head.current.y - tail.current.y) * TAIL_EASE;

      stage.style.setProperty("--hx", `${head.current.x}px`);
      stage.style.setProperty("--hy", `${head.current.y}px`);
      stage.style.setProperty("--tx", `${tail.current.x}px`);
      stage.style.setProperty("--ty", `${tail.current.y}px`);

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) =>
      setStageSize({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onWheel = (event: WheelEvent) => {
      // The board scrolls itself; the page never does.
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        // Zoom toward the cursor: the canvas point under it stays put.
        // Pinch sends small deltas, a mouse wheel large ones; cap a wheel notch.
        const factor = Math.exp(-Math.max(-50, Math.min(50, event.deltaY)) * 0.004);
        const next = clampZoom(zoom * factor);
        const rect = stage.getBoundingClientRect();
        const cx = event.clientX - rect.left - rect.width / 2;
        const cy = event.clientY - rect.top - rect.height / 2;
        setCenter((c) => ({ x: c.x + cx / zoom - cx / next, y: c.y + cy / zoom - cy / next }));
        zoomBy(next / zoom);
        return;
      }
      setCenter((c) => ({ x: c.x + event.deltaX / zoom, y: c.y + event.deltaY / zoom }));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      if (event.key === "=" || event.key === "+") {
        event.preventDefault();
        zoomIn();
      } else if (event.key === "-") {
        event.preventDefault();
        zoomOut();
      } else if (event.key === "0") {
        event.preventDefault();
        reset();
      }
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      stage.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [zoom, zoomBy, zoomIn, zoomOut, reset]);

  /** Follows one press to its release; `onMove` gets the drag in canvas units once past the slop. */
  const track = (
    start: React.PointerEvent,
    onMove: (dx: number, dy: number) => void,
    onEnd: (moved: boolean) => void,
  ) => {
    start.preventDefault();
    const x0 = start.clientX;
    const y0 = start.clientY;
    let moved = false;
    const move = (event: PointerEvent) => {
      if (!moved && Math.hypot(event.clientX - x0, event.clientY - y0) < DRAG_SLOP) return;
      moved = true;
      onMove((event.clientX - x0) / zoom, (event.clientY - y0) / zoom);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      onEnd(moved);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const save = (next: Frames) =>
    onLayout(images.map((image) => ({ id: image.id, ...next[image.id] })));

  /** Applies a drag to one image; the board is saved when the press ends. */
  const editFrame = (start: React.PointerEvent, id: string, change: (dx: number, dy: number) => Frame) => {
    let latest = layout;
    track(
      start,
      (dx, dy) => {
        latest = { ...layout, [id]: change(dx, dy) };
        setFrames(latest);
      },
      (moved) => {
        if (moved) save(latest);
      },
    );
  };

  const pressBackground = (event: React.PointerEvent) => {
    if (event.button !== 0 && event.button !== 1) return;
    const from = center;
    setPanning(true);
    track(
      event,
      (dx, dy) => setCenter({ x: from.x - dx, y: from.y - dy }),
      (moved) => {
        setPanning(false);
        if (!moved) onSelect(null);
      },
    );
  };

  const pressImage = (event: React.PointerEvent, image: CanvasImage) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    const from = layout[image.id];
    let selected = false;
    editFrame(event, image.id, (dx, dy) => {
      if (!selected) {
        selected = true;
        onSelect(image.id);
      }
      return { ...from, x: from.x + dx, y: from.y + dy };
    });
    // A press that never moved is a click: toggle selection.
    const up = () => {
      window.removeEventListener("pointerup", up);
      if (!selected) onSelect(image.id === selectedId ? null : image.id);
    };
    window.addEventListener("pointerup", up);
  };

  const pressHandle = (event: React.PointerEvent, image: CanvasImage, corner: Corner) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    const from = layout[image.id];
    editFrame(event, image.id, (dx, dy) => resized(from, image, corner, dx, dy));
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    target.current = { x, y };

    // On the first move, drop head and tail onto the cursor so the comet does
    // not fly in from the corner where they were parked.
    if (!seeded.current) {
      head.current = { x, y };
      tail.current = { x, y };
      seeded.current = true;
    }
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLElement>) => {
    event.currentTarget.dataset.pointer = "outside";
    seeded.current = false;
  };

  const offset = { x: -center.x * zoom, y: -center.y * zoom };
  const ui = 1 / zoom;

  return (
    // An open dotted board holding this design's generated images. Results
    // are refined through the chat panel; here they are arranged.
    <section
      ref={stageRef}
      data-pointer="outside"
      onPointerMove={handlePointerMove}
      onPointerEnter={(event) => {
        event.currentTarget.dataset.pointer = "inside";
      }}
      onPointerLeave={handlePointerLeave}
      onPointerDown={pressBackground}
      className={`canvas-dots relative flex min-w-0 flex-1 touch-none select-none flex-col overflow-hidden ${
        panning ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={
        {
          "--dot-gap": `${BASE_DOT_GAP * zoom}px`,
          "--dot-x": `calc(50% + ${offset.x}px)`,
          "--dot-y": `calc(50% + ${offset.y}px)`,
        } as React.CSSProperties
      }
    >
      <div className="canvas-comet canvas-comet-tail" aria-hidden />
      <div className="canvas-comet canvas-comet-head" aria-hidden />

      <div
        className="absolute left-1/2 top-1/2 z-[1] h-0 w-0"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {images.map((image) => {
          const frame = layout[image.id];
          const isCover = image.id === coverId;
          const isSelected = image.id === selectedId;
          return (
            <div
              key={image.id}
              className="group absolute"
              style={{
                left: frame.x,
                top: frame.y,
                width: frame.w,
                height: heightOf(frame, image),
                zIndex: isSelected ? 2 : 1,
              }}
            >
              {/* Selecting brings this image's conversation into view in the chat. */}
              <button
                type="button"
                aria-label={`Select: ${image.prompt}`}
                aria-pressed={isSelected}
                onPointerDown={(event) => pressImage(event, image)}
                onClick={(event) => {
                  // Pointer clicks are handled on press; this is the keyboard path.
                  if (event.detail === 0) onSelect(isSelected ? null : image.id);
                }}
                className="block h-full w-full cursor-default rounded-[6px] bg-ed-raised focus-visible:outline-none"
              >
                {/* A short-lived signed Storage link, revealed only once fully loaded. */}
                <LoadedImg
                  src={image.url}
                  alt=""
                  decoding="async"
                  draggable={false}
                  className="pointer-events-none block h-full w-full rounded-[6px] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.8)] light:shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_28px_-14px_rgba(0,0,0,0.22)] ring-1 ring-ed-hairline"
                />
              </button>

              {isSelected ? (
                <>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[6px] border-ed-blue"
                    style={{ borderWidth: 2 * ui, margin: -3 * ui }}
                  />
                  {CORNERS.map((corner) => (
                    <span
                      key={corner}
                      aria-hidden
                      onPointerDown={(event) => pressHandle(event, image, corner)}
                      className={`absolute rounded-[2px] border-ed-blue bg-white ${
                        corner === "nw" || corner === "se" ? "cursor-nwse-resize" : "cursor-nesw-resize"
                      }`}
                      style={{
                        width: HANDLE * ui,
                        height: HANDLE * ui,
                        borderWidth: 1.5 * ui,
                        [corner.includes("n") ? "top" : "bottom"]: -(HANDLE / 2 + 3) * ui,
                        [corner.includes("w") ? "left" : "right"]: -(HANDLE / 2 + 3) * ui,
                      }}
                    />
                  ))}
                </>
              ) : null}

              {/* A label above the top-left corner, like a frame name: never over the
                  design, and the same size on screen at any zoom. */}
              <div
                className="absolute left-0 flex h-5 items-center"
                style={{ bottom: `calc(100% + ${6 * ui}px)`, transform: `scale(${ui})`, transformOrigin: "0 100%" }}
              >
                {isCover ? (
                  <span className="flex items-center gap-1 whitespace-nowrap text-[11px] font-medium text-ed-blue">
                    <CheckIcon size={11} weight="bold" aria-hidden />
                    Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => onSetCover(image.id)}
                    className="whitespace-nowrap text-[11px] font-medium text-ed-muted opacity-0 transition-opacity hover:text-ed-text focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    Set as cover
                  </button>
                )}
              </div>

              {/* The note, below the bottom-left corner — same screen size at any zoom. */}
              <div
                className="absolute left-0"
                onPointerDown={(event) => event.stopPropagation()}
                style={{
                  top: `calc(100% + ${6 * ui}px)`,
                  transform: `scale(${ui})`,
                  transformOrigin: "0 0",
                  width: Math.max(160, frame.w * zoom),
                }}
              >
                {editingId === image.id ? (
                  <input
                    autoFocus
                    defaultValue={image.note ?? ""}
                    maxLength={MAX_NOTE}
                    placeholder="e.g. final v1"
                    aria-label="Note"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") event.currentTarget.blur();
                      if (event.key === "Escape") {
                        event.currentTarget.value = image.note ?? "";
                        event.currentTarget.blur();
                      }
                    }}
                    onBlur={(event) => {
                      setEditingId(null);
                      const next = event.currentTarget.value.replace(/\s+/g, " ").trim() || null;
                      if (next !== (image.note ?? null)) onNote(image.id, next);
                    }}
                    className="h-6 w-full rounded-md bg-ed-field px-2 text-[12px] text-ed-text outline-none ring-1 ring-ed-blue placeholder:text-ed-dim"
                  />
                ) : image.note ? (
                  <button
                    type="button"
                    title="Edit note"
                    onClick={() => setEditingId(image.id)}
                    className="flex h-6 max-w-full items-center gap-1 text-left text-[12px] text-ed-text hover:text-ed-muted"
                  >
                    {isFinalNote(image.note) ? (
                      <PushPinIcon size={12} weight="fill" className="shrink-0 text-ed-blue" aria-label="Final" />
                    ) : null}
                    <span className="truncate">{image.note}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingId(image.id)}
                    className={`flex h-6 items-center gap-1 text-[12px] text-ed-dim transition-opacity hover:text-ed-text focus-visible:opacity-100 group-hover:opacity-100 ${
                      isSelected ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <NotePencilIcon size={12} aria-hidden />
                    Add note
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {slot && pending ? (
          <div
            role="status"
            aria-label="Designing"
            aria-live="polite"
            className="absolute animate-pulse rounded-[6px] bg-ed-raised ring-1 ring-ed-hairline motion-reduce:animate-none"
            style={{ left: slot.x, top: slot.y, width: slot.w, height: heightOf(slot, pending) }}
          />
        ) : null}
      </div>
    </section>
  );
}
