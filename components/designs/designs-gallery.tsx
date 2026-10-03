"use client";

import { hasPendingPrompt, openPendingPrompt } from "@/components/prompt-handoff";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BrowserIcon,
  ChatCircleIcon,
  ImagesIcon,
  MegaphoneIcon,
  PaintBrushIcon,
  PlusIcon,
  PresentationIcon,
  PushPinIcon,
  SquaresFourIcon,
  TrashIcon,
} from "@phosphor-icons/react";

import { AccountMenu } from "@/components/designs/account-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  createDesign,
  StoreError,
  deleteDesign,
  listDesigns,
  pinDesign,
  saveOrder,
  type DesignSummary,
} from "@/components/designs/design-store";
import { reorder, useReorder } from "@/components/designs/use-reorder";
import {
  KIND_LABELS,
  RATIOS,
  type KindId,
} from "@/components/editor/generate-context";
import { LoadedImg } from "@/components/loaded-img";
import { Wordmark } from "@/components/brand/wordmark";

const KIND_ICONS: Record<KindId, typeof BrowserIcon> = {
  website: BrowserIcon,
  marketing: MegaphoneIcon,
  slides: PresentationIcon,
  graphic: PaintBrushIcon,
};

/** Same breakpoints as before (sm: 2, lg: 3 columns). */
const COLUMN_QUERIES = ["(min-width: 1024px)", "(min-width: 640px)"];

function subscribeColumns(onChange: () => void) {
  const lists = COLUMN_QUERIES.map((query) => window.matchMedia(query));
  for (const list of lists) list.addEventListener("change", onChange);
  return () => lists.forEach((list) => list.removeEventListener("change", onChange));
}

const columnsNow = () =>
  window.matchMedia(COLUMN_QUERIES[0]).matches ? 3 : window.matchMedia(COLUMN_QUERIES[1]).matches ? 2 : 1;

/**
 * Masonry that reads left to right, row by row: item i goes in column
 * i % columns. CSS columns read top to bottom, which made a dragged card's
 * new place hard to predict (D82).
 */
function Masonry({ items, className = "" }: { items: ReactNode[]; className?: string }) {
  const columns = useSyncExternalStore(subscribeColumns, columnsNow, () => 3);
  return (
    <div className={`flex items-start gap-5 ${className}`}>
      {Array.from({ length: columns }, (_, column) => (
        <ul key={column} className="flex min-w-0 flex-1 flex-col gap-5">
          {items.filter((_, index) => index % columns === column)}
        </ul>
      ))}
    </div>
  );
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function editedAgo(timestamp: number) {
  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) {
      return relative.format(Math.round(seconds / size), unit);
    }
  }
  return "just now";
}

/**
 * The step between signing in and the canvas: every design this user has
 * made, newest first. Opening one lands in the editor with its chat history.
 */
const LOAD_FAILED = "Your designs couldn't be loaded. Check your connection and reload the page.";

export function DesignsGallery() {
  const router = useRouter();
  const [designs, setDesigns] = useState<DesignSummary[] | null>(null);
  // Why the list or a new design failed; the server's own copy when it gave one.
  const [failed, setFailed] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  // Arriving from an email confirmation link with a homepage prompt still
  // waiting: open it in the editor, as signing in directly would have.
  useEffect(() => {
    if (!hasPendingPrompt()) return;
    openPendingPrompt()
      .then((path) => router.replace(path))
      .catch(() => {});
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    // Designs left without a prompt are pruned server-side, not listed.
    listDesigns()
      .then((all) => {
        if (!cancelled) setDesigns(all);
      })
      .catch(() => {
        if (!cancelled) setFailed(LOAD_FAILED);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const startNew = async () => {
    setCreating(true);
    try {
      const design = await createDesign();
      router.push(`/editor/${design.id}`);
    } catch (error) {
      setCreating(false);
      setFailed(
        error instanceof StoreError && error.status === 503
          ? error.message
          : "A new design couldn't be created. Please try again.",
      );
    }
  };

  const remove = async (id: string) => {
    await deleteDesign(id);
    setDesigns((current) => current?.filter((design) => design.id !== id) ?? null);
    setConfirming(null);
  };

  const togglePin = async (design: DesignSummary) => {
    const pinnedAt = design.pinnedAt ? null : Date.now();
    const set = (value: number | null) =>
      setDesigns((current) => current?.map((d) => (d.id === design.id ? { ...d, pinnedAt: value } : d)) ?? null);
    set(pinnedAt);
    // A failed save puts the card back where it was.
    await pinDesign(design.id, pinnedAt !== null).catch(() => set(design.pinnedAt));
  };

  // Drag to reorder (D82): cards move live within their own section, and the
  // whole order is saved once on drop.
  const latest = useRef(designs);
  useEffect(() => {
    latest.current = designs;
  });
  const { ghost, handlers } = useReorder({
    onMove: (dragId, overId, after) =>
      setDesigns((current) => {
        const dragged = current?.find((design) => design.id === dragId);
        const over = current?.find((design) => design.id === overId);
        if (!current || !dragged || !over || !dragged.pinnedAt !== !over.pinnedAt) return current;
        return reorder(current, dragId, overId, after);
      }),
    onDrop: () => {
      const ids = latest.current?.map((design) => design.id) ?? [];
      if (ids.length === 0) return;
      // A failed save reloads the order the server has.
      saveOrder(ids).catch(() => listDesigns().then(setDesigns).catch(() => {}));
    },
  });
  const ghostDesign = ghost ? designs?.find((design) => design.id === ghost.id) : undefined;

  // Both sections keep the saved order.
  const pinned = (designs ?? []).filter((design) => design.pinnedAt);
  const rest = (designs ?? []).filter((design) => !design.pinnedAt);

  const card = (design: DesignSummary) => (
    <li
      key={design.id}
      {...handlers(design.id)}
      className="group relative touch-manipulation select-none"
    >
      <div className={ghost?.id === design.id ? "invisible" : ""}>
        <DesignCard design={design} />
      </div>
      {ghost?.id === design.id ? (
        // Where the dragged card will land.
        <div className="pointer-events-none absolute inset-0 rounded-[14px] border-[1.5px] border-dashed border-ed-dim/70 bg-ed-panel/40" />
      ) : null}

      {confirming === design.id || ghost?.id === design.id ? null : (
        <button
          type="button"
          aria-label={design.pinnedAt ? `Unpin ${design.title}` : `Pin ${design.title}`}
          aria-pressed={!!design.pinnedAt}
          title={design.pinnedAt ? "Unpin" : "Pin to top"}
          onClick={() => void togglePin(design)}
          className={`absolute right-[3.75rem] top-4 flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-inset shadow-[0_1px_2px_rgba(0,0,0,0.35),0_6px_16px_-4px_rgba(0,0,0,0.5)] backdrop-blur-md transition-[opacity,transform,background-color] duration-150 hover:-translate-y-px focus-visible:opacity-100 ${
            design.pinnedAt
              ? "bg-ed-blue text-white ring-white/25"
              : `bg-[#0b0b0c]/85 text-white ring-white/15 hover:bg-[#0b0b0c] [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100`
          }`}
        >
          <PushPinIcon size={15} weight={design.pinnedAt ? "fill" : "bold"} aria-hidden />
        </button>
      )}

      {confirming === design.id ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[14px] bg-ed-panel/95 px-4 text-center">
          <p className="text-[12px] text-ed-text">
            Delete this design and its chat?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(null)}
              className="rounded-md bg-ed-field px-3 py-1.5 text-[12px] text-ed-text transition-colors hover:bg-ed-raised"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void remove(design.id)}
              className="rounded-md bg-red-500/90 px-3 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
            >
              Delete
            </button>
          </div>
        </div>
      ) : ghost?.id === design.id ? null : (
        // Always visible on touch screens, where there is no hover.
        <button
          type="button"
          aria-label={`Delete ${design.title}`}
          onClick={() => setConfirming(design.id)}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-inset shadow-[0_1px_2px_rgba(0,0,0,0.35),0_6px_16px_-4px_rgba(0,0,0,0.5)] backdrop-blur-md transition-[opacity,transform,background-color] duration-150 hover:-translate-y-px focus-visible:opacity-100 bg-[#0b0b0c]/85 text-white ring-white/15 hover:bg-[#0b0b0c] hover:text-red-300 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
        >
          <TrashIcon size={15} weight="bold" aria-hidden />
        </button>
      )}
    </li>
  );

  // `compact` drops the label below `sm`, where the header is short on room.
  const newButton = (compact = false) => (
    <button
      type="button"
      onClick={startNew}
      disabled={creating}
      aria-label="New design"
      className={`flex h-9 items-center gap-1.5 rounded-lg bg-ed-text text-[13px] font-medium text-ed-panel transition-opacity hover:opacity-90 disabled:opacity-50 ${
        compact ? "w-9 justify-center sm:w-auto sm:px-3.5" : "px-3.5"
      }`}
    >
      <PlusIcon size={14} weight="bold" aria-hidden />
      <span className={compact ? "hidden sm:inline" : ""}>New design</span>
    </button>
  );

  return (
    <div className="min-h-dvh w-full bg-ed-canvas text-ed-text">
      <header className="sticky top-0 z-10 border-b border-ed-border bg-ed-panel/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Wordmark href="/" label="snapdesign — home" className="-mt-1 text-[20px] text-ed-text" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/showcase"
              aria-label="Mockups"
              className="flex h-9 w-9 items-center justify-center gap-1.5 rounded-lg bg-ed-field text-[13px] font-medium text-ed-text ring-1 ring-inset ring-ed-hairline transition-colors hover:bg-ed-raised hover:ring-ed-dim/50 sm:w-auto sm:px-3.5"
            >
              <SquaresFourIcon size={14} weight="bold" aria-hidden />
              <span className="hidden sm:inline">Mockups</span>
            </Link>
            {newButton(true)}
            <ThemeToggle
              fallback="dark"
              className="h-9 w-9 rounded-lg text-ed-muted hover:bg-ed-field hover:text-ed-text"
            />
            <span aria-hidden className="mx-1 h-5 w-px bg-ed-border" />
            <AccountMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">
            Your designs
          </h1>
          {designs?.length ? (
            <p className="text-[12px] text-ed-muted">
              {designs.length} design{designs.length === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>

        {failed ? (
          <p className="mt-10 text-[13px] text-ed-muted">
            {failed}
          </p>
        ) : designs === null ? (
          <ul className="mt-6 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {["16 / 10", "1 / 1", "4 / 5"].map((aspect) => (
              <li
                key={aspect}
                style={{ aspectRatio: aspect }}
                className="mb-5 animate-pulse break-inside-avoid rounded-[14px] bg-ed-panel"
              />
            ))}
          </ul>
        ) : designs.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <p className="text-[14px] text-ed-text">No designs yet</p>
            <p className="mt-1.5 max-w-xs text-[12px] leading-relaxed text-ed-muted">
              Start one by describing what you need. Everything you make shows
              up here so you can pick it back up.
            </p>
            <div className="mt-5">{newButton()}</div>
          </div>
        ) : (
          <>
            {pinned.length ? (
              <section aria-labelledby="pinned-heading" className="mt-6">
                <h2 id="pinned-heading" className="flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-ed-muted">
                  <PushPinIcon size={12} weight="fill" aria-hidden />
                  Pinned
                </h2>
                {/* Masonry rather than a grid: each card keeps its cover's own height. */}
                <Masonry className="mt-3" items={pinned.map((design) => card(design))} />
              </section>
            ) : null}

            {pinned.length && rest.length ? (
              <h2 className="mt-8 text-[12px] font-medium uppercase tracking-[0.08em] text-ed-muted">
                All designs
              </h2>
            ) : null}
            <Masonry
              className={pinned.length && rest.length ? "mt-3" : pinned.length ? "mt-5" : "mt-6"}
              items={[
              <li key="new">
                <button
                  type="button"
                  onClick={startNew}
                  disabled={creating}
                  className="group/new flex aspect-[16/10] w-full flex-col items-center justify-center rounded-[14px] border-[1.5px] border-dashed border-ed-dim/60 bg-ed-panel transition-colors hover:border-ed-muted hover:bg-ed-field disabled:opacity-50"
                >
                  {/* Inverted disc: white on the dark theme, black on the light one. */}
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ed-text text-ed-panel transition-transform group-hover/new:scale-105">
                    <PlusIcon size={22} weight="bold" aria-hidden />
                  </span>
                  <span className="mt-3.5 text-[15px] font-semibold text-ed-text">New design</span>
                  <span className="mt-1 text-[12.5px] text-ed-muted">Describe it in a sentence</span>
                </button>
              </li>,
              ...rest.map((design) => card(design)),
              ]}
            />
          </>
        )}
      </main>

      {ghost && ghostDesign ? (
        // The card under the pointer while dragging; not a second copy for keyboards or screen readers.
        <div
          inert
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-50"
          style={{
            width: ghost.width,
            transform: `translate(${ghost.x}px, ${ghost.y}px) rotate(1.5deg) scale(1.03)`,
          }}
        >
          <div className="rounded-[14px] shadow-[0_28px_60px_-18px_rgba(0,0,0,0.65)]">
            <DesignCard design={ghostDesign} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * The showcase frame, in the editor's dark palette: an outer card with the
 * cover inset at its own aspect ratio, and the design's details beneath.
 */
function DesignCard({ design }: { design: DesignSummary }) {
  const { cover, prompts, shots } = design;
  const ratio = RATIOS.find(({ id }) => id === design.settings.ratio) ?? RATIOS[4];
  const Icon = KIND_ICONS[design.settings.kind];

  return (
    <Link
      href={`/editor/${design.id}`}
      className="block overflow-hidden rounded-[14px] border border-ed-hairline bg-ed-panel p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.3),0_12px_30px_-14px_rgba(0,0,0,0.7)] light:shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_28px_-14px_rgba(0,0,0,0.22)] transition-colors hover:border-ed-dim/50"
    >
      <div
        className="relative overflow-hidden rounded-[8px] bg-ed-field ring-1 ring-inset ring-ed-hairline"
        style={{
          aspectRatio: cover
            ? `${cover.width} / ${cover.height}`
            : `${ratio.w} / ${ratio.h}`,
        }}
      >
        {cover?.url ? (
          // A short-lived signed Storage link — next/image would cache it
          // past expiry, so it is shown as-is, revealed only once fully loaded.
          <LoadedImg
            src={cover.url}
            loading="lazy"
            decoding="async"
            // The card title names it; prompt text must not show while it loads.
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          // Nothing generated yet: the empty frame the design will fill, at
          // the ratio it was set to — not a stand-in image.
          <div className="canvas-dots absolute inset-0 flex items-center justify-center">
            <Icon size={22} className="text-ed-dim" aria-hidden />
          </div>
        )}
      </div>

      <div className="px-1 pb-0.5 pt-3">
        <p className="line-clamp-2 text-[13px] leading-snug text-ed-text">
          {design.title}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-ed-muted">
          <span>
            {KIND_LABELS[design.settings.kind]} &middot; {design.settings.ratio}
          </span>
          <span aria-hidden>&middot;</span>
          <span className="flex items-center gap-1">
            <ChatCircleIcon size={11} aria-hidden />
            <span className="sr-only">Prompts:</span>
            {prompts}
          </span>
          {shots ? (
            <>
              <span aria-hidden>&middot;</span>
              <span className="flex items-center gap-1">
                <ImagesIcon size={11} aria-hidden />
                <span className="sr-only">Images:</span>
                {shots}
              </span>
            </>
          ) : null}
          <span className="ml-auto">{editedAgo(design.updatedAt)}</span>
        </p>
      </div>
    </Link>
  );
}
