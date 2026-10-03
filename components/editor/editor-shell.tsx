"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  appendMessages,
  createDesign,
  getDesign,
  saveLayout,
  saveNote,
  titleFromPrompt,
  updateDesign,
  type Design,
  type DesignSettings,
} from "@/components/designs/design-store";
import { ChatPanel, type Message } from "@/components/editor/chat-panel";
import { CanvasStage, type CanvasImage } from "@/components/editor/canvas-stage";
import { GenerateProvider } from "@/components/editor/generate-context";
import { Inspector } from "@/components/editor/inspector";
import { PanelResizer } from "@/components/editor/panel-resizer";
import { takeDraft } from "@/components/prompt-handoff";
import type { Pending } from "@/components/editor/studio-client";
import { ZoomProvider } from "@/components/editor/zoom-context";

const CHAT = { default: 320, min: 240, max: 560 };
const INSPECTOR = { default: 308, min: 260, max: 480 };

/**
 * Owns the two side-panel widths so the canvas can be widened or narrowed from
 * either edge. The panels themselves are width-agnostic (`w-full`); only this
 * shell decides how much room they get.
 *
 * Below `lg` the canvas and inspector are hidden and the chat panel fills the
 * screen — a 320px canvas is not usable, and the generate settings move inside
 * the chat instead.
 */
type Loaded = { design: Design; messages: Message[]; images: CanvasImage[]; draft: string };

export function EditorShell({ designId }: { designId: string }) {
  const router = useRouter();
  const [chatWidth, setChatWidth] = useState(CHAT.default);
  const [inspectorWidth, setInspectorWidth] = useState(INSPECTOR.default);
  const [loaded, setLoaded] = useState<Loaded | "missing" | "failed" | null>(null);
  const [coverId, setCoverId] = useState<string | null>(null);
  // The image being made right now, drawn on the canvas as a placeholder.
  const [rendering, setRendering] = useState<Pending | null>(null);
  // The image the chat is focused on; the next message edits it by default.
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDesign(designId)
      .then((design) => {
        if (cancelled) return;
        if (!design) {
          setLoaded("missing");
          return;
        }
        // Stored images arrive as signed links, usable directly as `src`.
        const messages: Message[] = design.messages;
        const images = design.generations.map(({ id, url, width, height, prompt, frame, note }) => ({
          id,
          url,
          width,
          height,
          prompt,
          frame,
          note,
        }));
        setCoverId(design.coverId);
        // A prompt carried over from the homepage is sent as soon as the chat mounts.
        setLoaded({ design, messages, images, draft: takeDraft(designId) });
      })
      .catch(() => {
        // A 404 resolves to null above; anything thrown is the server or
        // network, which must not read as "deleted".
        if (!cancelled) setLoaded("failed");
      });

    return () => {
      cancelled = true;
    };
  }, [designId]);

  const saveMessages = useCallback(
    (added: Message[], history: Message[]) => {
      // Titled from the first prompt with words in it; there is no rename yet.
      const firstPrompt = history.find(
        (message) => message.role === "user" && message.text,
      );
      return appendMessages(
        designId,
        added.map((message) => ({
          id: message.id,
          role: message.role,
          text: message.text,
          // Only new attachments are in `added`, and every new one has a file.
          images: message.images?.flatMap(({ id, name, blob }) =>
            blob ? [{ id, name, blob }] : [],
          ),
          generationId: message.generationId,
        })),
        titleFromPrompt(firstPrompt?.text ?? ""),
      );
    },
    [designId],
  );

  const addImage = useCallback((image: CanvasImage) => {
    setLoaded((current) =>
      current && typeof current === "object"
        ? { ...current, images: [...current.images, image] }
        : current,
    );
    // A fresh image becomes the focus, so "make the headline smaller" means this one.
    setSelectedId(image.id);
  }, []);

  const saveSettings = useCallback(
    (settings: DesignSettings) => void updateDesign(designId, { settings }),
    [designId],
  );

  const chooseCover = useCallback(
    (id: string) => {
      setCoverId(id);
      void updateDesign(designId, { coverId: id });
    },
    [designId],
  );

  const arrange = useCallback(
    (frames: Parameters<typeof saveLayout>[1]) => void saveLayout(designId, frames).catch(() => {}),
    [designId],
  );

  const writeNote = useCallback(
    (id: string, note: string | null) => {
      const apply = (value: string | null) =>
        setLoaded((current) =>
          current && typeof current === "object"
            ? {
                ...current,
                images: current.images.map((image) => (image.id === id ? { ...image, note: value } : image)),
              }
            : current,
        );
      const previous =
        loaded && typeof loaded === "object" ? (loaded.images.find((image) => image.id === id)?.note ?? null) : null;
      apply(note);
      // A failed save puts the old note back rather than showing one that was never stored.
      saveNote(designId, id, note).catch(() => apply(previous));
    },
    [designId, loaded],
  );

  const newDesign = useCallback(async () => {
    const design = await createDesign();
    router.push(`/editor/${design.id}`);
  }, [router]);

  if (loaded === null) {
    return <div className="h-dvh w-full bg-ed-canvas" aria-busy />;
  }

  if (loaded === "missing" || loaded === "failed") {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center bg-ed-canvas px-6 text-center">
        <p className="text-[14px] text-ed-text">
          {loaded === "missing"
            ? "This design couldn’t be found"
            : "This design couldn’t be loaded"}
        </p>
        <p className="mt-1.5 max-w-sm text-[12px] leading-relaxed text-ed-muted">
          {loaded === "missing"
            ? "It may have been deleted, or it was made in another browser. Designs are saved to the browser they were created in."
            : "Something went wrong reaching the server. Check your connection and reload the page."}
        </p>
        <Link
          href="/designs"
          className="mt-5 rounded-lg bg-ed-text px-3.5 py-2 text-[13px] font-medium text-ed-panel transition-opacity hover:opacity-90"
        >
          Back to your designs
        </Link>
      </div>
    );
  }

  return (
    <GenerateProvider initial={loaded.design.settings} onChange={saveSettings}>
      <ZoomProvider>
        <div className="flex h-dvh w-full overflow-hidden bg-ed-canvas">
          {/* Width applies from `lg` up only, so the panel is full-bleed on
              phones while the drag value still drives the desktop layout. */}
          <div
            style={{ "--chat-w": `${chatWidth}px` } as React.CSSProperties}
            className="w-full shrink-0 lg:w-[var(--chat-w)]"
          >
            <ChatPanel
              initialMessages={loaded.messages}
              autoSend={loaded.draft}
              designId={designId}
              onRendering={setRendering}
              onRendered={addImage}
              images={loaded.images}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onSend={saveMessages}
              onNewDesign={newDesign}
            />
          </div>

          <div className="hidden lg:flex">
            <PanelResizer
              edge="left"
              label="Resize chat panel"
              width={chatWidth}
              min={CHAT.min}
              max={CHAT.max}
              defaultWidth={CHAT.default}
              onResize={setChatWidth}
            />
          </div>

          <div className="hidden min-w-0 flex-1 lg:flex">
            <CanvasStage
              images={loaded.images}
              pending={rendering}
              selectedId={selectedId}
              onSelect={setSelectedId}
              // With no explicit pick, the newest image is the cover.
              coverId={coverId ?? loaded.images.at(-1)?.id ?? null}
              onSetCover={chooseCover}
              onLayout={arrange}
              onNote={writeNote}
            />
          </div>

          <div className="hidden lg:flex">
            <PanelResizer
              edge="right"
              label="Resize inspector panel"
              width={inspectorWidth}
              min={INSPECTOR.min}
              max={INSPECTOR.max}
              defaultWidth={INSPECTOR.default}
              onResize={setInspectorWidth}
            />
          </div>

          <div
            style={{ "--inspector-w": `${inspectorWidth}px` } as React.CSSProperties}
            className="hidden shrink-0 lg:block lg:w-[var(--inspector-w)]"
          >
            <Inspector />
          </div>
        </div>
      </ZoomProvider>
    </GenerateProvider>
  );
}
