"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpIcon,
  MicrophoneIcon,
  NotePencilIcon,
  PaperclipIcon,
  SlidersHorizontalIcon,
  SparkleIcon,
  StopIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";

import { GenerateControls } from "@/components/editor/generate-controls";
import {
  IMAGE_TYPES,
  MAX_IMAGE_MB,
  MAX_IMAGES,
} from "@/components/designs/design-model";
import { KIND_LABELS, useGenerate } from "@/components/editor/generate-context";
import { useDictation } from "@/components/use-dictation";
import type { CanvasImage } from "@/components/editor/canvas-stage";
import {
  OUT_OF_FREE_STATUS,
  readFree,
  renderImage,
  runTurn,
  type Free,
  type Pending,
} from "@/components/editor/studio-client";
import { LoadedImg } from "@/components/loaded-img";
import { Wordmark } from "@/components/brand/wordmark";

/**
 * Explicit formats rather than `image/*`: that wildcard also admits HEIC,
 * TIFF and SVG, which most browsers cannot preview from a blob URL. The same
 * list is enforced by the Storage bucket.
 */
const IMAGE_ACCEPT = IMAGE_TYPES.join(",");
const NOTICE_MS = 6000;

/**
 * A new attachment carries `blob`, which gets uploaded, and a session-only
 * preview `url`. One loaded from a saved design has only a signed `url`.
 */
export type Attachment = { id: number; url: string; name: string; blob?: Blob };

export type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
  images?: Attachment[];
  /** For a reply that made an image: that generation's id. */
  generationId?: string;
};

const SUGGESTIONS = [
  "A bold landing page for a family-run roofing company",
  "A launch poster for an independent coffee roaster",
  "An invoice for a small design studio, clean and minimal",
];

/**
 * The reply older designs saved before the chat had a model. It is left out
 * of the history sent to the model so it doesn't learn to repeat it.
 */
const NOT_WIRED_REPLY =
  "Generation isn't connected yet, so there's no design to show. Your prompt is captured here and will run once the pipeline is live.";

/** How many recent messages the art director sees; matches the turn route's limit. */
const HISTORY_TURNS = 20;

/** Text-only turns for the art director. It can't see images yet, so they become a marker. */
function toTurns(history: Message[]) {
  return history
    .filter((message) => message.text !== NOT_WIRED_REPLY)
    .map(({ role, text, images }) => ({
      role,
      text: [images?.length ? "[image attached]" : "", text].filter(Boolean).join(" "),
    }))
    .filter((turn) => turn.text)
    .slice(-HISTORY_TURNS);
}

type Props = {
  designId: string;
  /** The open design's history. The shell remounts the panel per design. */
  initialMessages: Message[];
  /** A prompt carried from the homepage: sent once, as soon as the editor opens. */
  autoSend?: string;
  /** Receives the messages a send added, plus the full history, for saving. */
  onSend: (added: Message[], history: Message[]) => Promise<void>;
  /** An image is being made at this size (null when it finished or failed). */
  onRendering: (pending: Pending | null) => void;
  onRendered: (image: CanvasImage) => void;
  /** The canvas images, so replies can show the image they made. */
  images: CanvasImage[];
  /** The image selected on the canvas; the next message edits it by default. */
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onNewDesign: () => void;
};

export function ChatPanel({
  designId,
  initialMessages,
  autoSend = "",
  onSend,
  onRendering,
  onRendered,
  images: canvasImages,
  selectedId,
  onSelect,
  onNewDesign,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [images, setImages] = useState<Attachment[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  // "thinking" while the art director reads the turn, "designing" while the image renders.
  const [status, setStatus] = useState<"thinking" | "designing" | null>(null);
  // Next steps from the last reply, shown as chips; cleared on the next send.
  const [suggestions, setSuggestions] = useState<string[]>([]);
  // Free images left (D83): undefined until read, null for no limit.
  const [free, setFree] = useState<Free | undefined>(undefined);
  const outOfFree = Boolean(free && free.left === 0);

  const listRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // Continue numbering past the loaded history so new ids never collide.
  const nextId = useRef(
    Math.max(
      0,
      ...initialMessages.flatMap((message) => [
        message.id + 1,
        ...(message.images ?? []).map((image) => image.id + 1),
      ]),
    ),
  );
  const createdUrls = useRef<string[]>([]);

  const [optionsOpen, setOptionsOpen] = useState(false);
  const { ratio, kind, count } = useGenerate();
  const dictation = useDictation(setDraft);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, status, suggestions]);

  // Selecting an image on the canvas brings the reply that made it into view.
  useEffect(() => {
    if (!selectedId) return;
    listRef.current
      ?.querySelector(`[data-generation="${selectedId}"]`)
      ?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [selectedId]);

  const selectedImage = canvasImages.find((image) => image.id === selectedId) ?? null;

  // Object URLs stay alive for the session so thumbnails in sent messages keep
  // resolving; they are released together when the panel unmounts.
  useEffect(
    () => () => createdUrls.current.forEach((url) => URL.revokeObjectURL(url)),
    [],
  );

  useEffect(() => {
    void readFree().then(setFree);
  }, []);

  /** The server refused for the free limit: show it for good, not as a passing notice. */
  const refusedFree = (message: string) =>
    setFree((current) => ({ limit: current?.limit ?? 5, left: 0, reason: message }));

  // A notice is a one-off nudge, not a persistent error — it clears itself.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const all = Array.from(files);
    const wrongType = all.filter((file) => !IMAGE_TYPES.includes(file.type));
    const tooBig = all.filter(
      (file) =>
        IMAGE_TYPES.includes(file.type) && file.size > MAX_IMAGE_MB * 1024 * 1024,
    );
    const valid = all.filter(
      (file) => !wrongType.includes(file) && !tooBig.includes(file),
    );
    const room = Math.max(0, MAX_IMAGES - images.length);
    const picked = valid.slice(0, room);

    // The OS picker's filter can be switched to "All files", so the accept
    // attribute alone does not guarantee images — tell people what was skipped.
    const problems: string[] = [];
    if (wrongType.length) {
      problems.push(
        wrongType.length === 1
          ? `"${wrongType[0].name}" isn't an image. Use PNG, JPG, WebP or GIF.`
          : `${wrongType.length} files weren't images. Use PNG, JPG, WebP or GIF.`,
      );
    }
    if (tooBig.length) {
      problems.push(
        tooBig.length === 1
          ? `"${tooBig[0].name}" is over ${MAX_IMAGE_MB} MB.`
          : `${tooBig.length} images are over ${MAX_IMAGE_MB} MB.`,
      );
    }
    if (valid.length > room) {
      problems.push(`You can attach up to ${MAX_IMAGES} images per message.`);
    }
    setNotice(problems.length ? problems.join(" ") : null);

    const added = picked.map((file) => {
      const url = URL.createObjectURL(file);
      createdUrls.current.push(url);
      return { id: nextId.current++, url, name: file.name, blob: file };
    });

    setImages((current) => [...current, ...added]);
  };

  const save = (added: Message[], history: Message[]) =>
    onSend(added, history).catch(() =>
      setNotice("That message couldn't be saved. It will be gone if you reload."),
    );

  /** Sends the draft, or `text` when a suggestion chip was picked. */
  const send = async (text?: string) => {
    const trimmed = (text ?? draft).trim();
    const attached = text === undefined ? images : [];
    if ((!trimmed && attached.length === 0) || status || outOfFree) return;
    if (dictation.listening) dictation.stop();

    const question: Message = {
      id: nextId.current++,
      role: "user",
      text: trimmed,
      images: attached.length ? attached : undefined,
    };
    const history = [...messages, question];
    setMessages(history);
    if (text === undefined) {
      setDraft("");
      setImages([]);
    }
    setNotice(null);
    setSuggestions([]);
    void save([question], history);

    setStatus("thinking");
    const turn = await runTurn(designId, toTurns(history), { ratio, kind }, selectedId);
    if (!turn.ok) {
      setStatus(null);
      if (turn.status === OUT_OF_FREE_STATUS) refusedFree(turn.message);
      else setNotice(turn.message);
      return;
    }
    const { reply, clarify, pending } = turn.data;
    const answer: Message = {
      id: nextId.current++,
      role: "assistant",
      text: [reply, clarify?.question].filter(Boolean).join(" "),
      ...(pending && { generationId: pending.id }),
    };
    const next = [...history, answer];
    setMessages(next);
    void save([answer], next);
    const chips = clarify?.options.length ? clarify.options : turn.data.suggestions;

    if (!pending) {
      setStatus(null);
      setSuggestions(chips);
      return;
    }
    setStatus("designing");
    onRendering(pending);
    const image = await renderImage(pending.id);
    onRendering(null);
    setStatus(null);
    if (!image.ok) {
      if (image.status === OUT_OF_FREE_STATUS) refusedFree(image.message);
      else setNotice(image.message);
      return;
    }
    const { free: left, ...rendered } = image.data;
    if (left !== undefined) setFree(left);
    onRendered(rendered);
    setSuggestions(chips);
  };

  // A homepage prompt designs straight away; the ref keeps it to one send.
  const autoSent = useRef(false);
  useEffect(() => {
    if (!autoSend || autoSent.current) return;
    autoSent.current = true;
    void send(autoSend);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on arrival
  }, [autoSend]);

  const canSend = (draft.trim().length > 0 || images.length > 0) && !status && !outOfFree;

  return (
    <aside className="flex h-full w-full flex-col bg-ed-panel">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-ed-border px-4">
        {/* The brand mark doubles as the way back to the designs list. */}
        <Wordmark href="/designs" label="snapdesign — back to your designs" className="-mt-1 text-[20px] text-ed-text" />
        <h2 className="sr-only">Chat</h2>
        <button
          type="button"
          aria-label="New design"
          title="New design"
          onClick={onNewDesign}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-ed-field text-ed-text ring-1 ring-inset ring-ed-hairline transition-colors hover:bg-ed-raised"
        >
          <NotePencilIcon size={18} aria-hidden />
        </button>
      </div>

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <SparkleIcon size={22} className="text-ed-muted" aria-hidden />
            <p className="mt-3 text-[13px] text-ed-text">
              Describe a design to get started
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-ed-muted">
              Plain words are enough. Ask for changes as you go.
            </p>
            <ul className="mt-6 w-full space-y-2">
              {SUGGESTIONS.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    onClick={() => setDraft(suggestion)}
                    className="w-full rounded-lg bg-ed-field px-3 py-2.5 text-left text-[12px] leading-relaxed text-ed-muted transition-colors hover:bg-ed-raised hover:text-ed-text"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ol className="space-y-5">
            {messages.map(({ id, role, text, images: sent, generationId }) =>
              role === "user" ? (
                <li key={id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-ed-raised px-3.5 py-2.5">
                    {sent ? (
                      <ul className="mb-2 flex flex-wrap gap-1.5">
                        {sent.map((image) => (
                          <li key={image.id}>
                            {/* Blob URLs — next/image cannot optimise these. */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={image.url}
                              loading="lazy"
                              decoding="async"
                              alt={image.name}
                              className="h-12 w-12 rounded-md object-cover"
                            />
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {text ? (
                      <p className="text-[13px] leading-relaxed text-ed-text">
                        {text}
                      </p>
                    ) : null}
                  </div>
                </li>
              ) : (
                <li
                  key={id}
                  data-generation={generationId}
                  className={`-mx-2 flex gap-2.5 rounded-lg px-2 py-1 transition-colors ${
                    generationId && generationId === selectedId ? "bg-ed-field" : ""
                  }`}
                >
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ed-blue"
                  >
                    <SparkleIcon size={11} weight="fill" className="text-white" />
                  </span>
                  <div className="min-w-0">
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ed-muted">
                      {text}
                    </p>
                    {(() => {
                      const made = canvasImages.find((image) => image.id === generationId);
                      if (!made) return null;
                      const isSelected = made.id === selectedId;
                      return (
                        <button
                          type="button"
                          aria-label={isSelected ? "Selected design" : "Select this design"}
                          aria-pressed={isSelected}
                          onClick={() => onSelect(isSelected ? null : made.id)}
                          className="mt-2 block rounded-md bg-ed-raised"
                        >
                          {/* A short-lived signed Storage link, revealed only once fully loaded. */}
                          <LoadedImg
                            src={made.url}
                            loading="lazy"
                            decoding="async"
                            // The button already names it; prompt text must not show while it loads.
                            alt=""
                            style={{ aspectRatio: `${made.width} / ${made.height}` }}
                            className={`h-20 w-auto rounded-md object-cover ${
                              isSelected ? "ring-2 ring-ed-blue" : "ring-1 ring-ed-hairline hover:ring-ed-dim/50"
                            }`}
                          />
                        </button>
                      );
                    })()}
                  </div>
                </li>
              ),
            )}
            {status ? (
              <li className="flex gap-2.5" aria-live="polite">
                <span
                  aria-hidden
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ed-blue"
                >
                  <SparkleIcon size={11} weight="fill" className="text-white" />
                </span>
                <p className="animate-pulse text-[13px] leading-relaxed text-ed-muted">
                  {status === "thinking" ? "Thinking…" : "Designing…"}
                </p>
              </li>
            ) : null}
            {suggestions.length && !status ? (
              <li>
                <ul className="flex flex-wrap gap-1.5 pl-[30px]" aria-label="Suggestions">
                  {suggestions.map((suggestion) => (
                    <li key={suggestion}>
                      <button
                        type="button"
                        onClick={() => void send(suggestion)}
                        className="rounded-full bg-ed-field px-3 py-1.5 text-[12px] text-ed-muted transition-colors hover:bg-ed-raised hover:text-ed-text"
                      >
                        {suggestion}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ) : null}
          </ol>
        )}
      </div>

      {/* Generate settings — mobile only, opened from the sliders button in
          the composer. On desktop these live in the inspector, and both read
          the same GenerateProvider state. */}
      <div
        id="chat-generate-options"
        className={`grid shrink-0 transition-[grid-template-rows] duration-300 ease-out lg:hidden ${
          optionsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-ed-border pt-3">
            <GenerateControls showHeading={false} />
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0 px-4 pb-4 pt-4 lg:pt-0">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void send();
          }}
          className="rounded-xl bg-ed-field p-3 ring-1 ring-inset ring-ed-hairline focus-within:ring-ed-dim/50"
        >
          {/* The design the next message will change */}
          {selectedImage ? (
            <div className="mb-2.5 flex items-center gap-2 rounded-lg bg-ed-raised p-1.5 pr-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage.url}
                alt=""
                style={{ aspectRatio: `${selectedImage.width} / ${selectedImage.height}` }}
                className="h-8 w-auto rounded object-cover"
              />
              <span className="min-w-0 flex-1 text-[12px] leading-snug">
                <span className="block text-ed-text">Editing this design</span>
                <span className="block truncate text-ed-muted">{selectedImage.prompt}</span>
              </span>
              <button
                type="button"
                aria-label="Stop editing this design"
                onClick={() => onSelect(null)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-ed-muted hover:text-ed-text"
              >
                <XIcon size={11} aria-hidden />
              </button>
            </div>
          ) : null}

          {/* Pending attachments */}
          {images.length > 0 ? (
            <ul className="mb-2.5 flex flex-wrap gap-2">
              {images.map((image) => (
                <li key={image.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    loading="lazy"
                    decoding="async"
                    alt={image.name}
                    className="h-12 w-12 rounded-md object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${image.name}`}
                    onClick={() =>
                      setImages((current) =>
                        current.filter((item) => item.id !== image.id),
                      )
                    }
                    className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ed-text text-ed-panel"
                  >
                    <XIcon size={9} weight="bold" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {free ? (
            outOfFree ? (
              <p role="status" className="mb-2.5 text-[12px] leading-relaxed text-ed-text">
                {free.reason ?? `You've used your ${free.limit} free images.`}
              </p>
            ) : (
              <p className="mb-2 text-[11px] text-ed-muted tabular-nums">
                {free.left} of {free.limit} free {free.left === 1 ? "image" : "images"} left
              </p>
            )
          ) : null}

          {notice ? (
            <p
              role="alert"
              className="mb-2.5 flex items-start gap-1.5 text-[12px] leading-relaxed text-ed-text"
            >
              <WarningCircleIcon
                size={14}
                weight="fill"
                className="mt-[3px] shrink-0 text-ed-muted"
                aria-hidden
              />
              <span className="min-w-0 flex-1">{notice}</span>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setNotice(null)}
                className="-mr-1 flex h-5 w-5 shrink-0 items-center justify-center rounded text-ed-muted hover:text-ed-text"
              >
                <XIcon size={11} aria-hidden />
              </button>
            </p>
          ) : null}

          <label htmlFor="chat-input" className="sr-only">
            Describe a design
          </label>
          <textarea
            id="chat-input"
            rows={2}
            // Focused when a carried-over prompt is waiting, so Enter sends it.
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
            placeholder={
              dictation.listening
                ? "Listening…"
                : selectedImage
                  ? "Describe a change…"
                  : "Describe a design…"
            }
            className="w-full resize-none bg-transparent text-[13px] leading-relaxed text-ed-text outline-none placeholder:text-ed-muted"
          />

          <div className="mt-1.5 flex items-center gap-1">
            <input
              ref={fileRef}
              type="file"
              accept={IMAGE_ACCEPT}
              multiple
              className="hidden"
              onChange={(event) => {
                addFiles(event.target.files);
                // Reset so picking the same file twice still fires onChange.
                event.target.value = "";
              }}
            />
            {dictation.supported ? (
              <button
                type="button"
                aria-label={dictation.listening ? "Stop dictation" : "Dictate"}
                aria-pressed={dictation.listening}
                onClick={() =>
                  dictation.listening
                    ? dictation.stop()
                    : dictation.start(draft)
                }
                className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                  dictation.listening
                    ? "bg-ed-blue text-white"
                    : "text-ed-muted hover:bg-ed-raised hover:text-ed-text"
                }`}
              >
                {dictation.listening ? (
                  <StopIcon size={13} weight="fill" aria-hidden />
                ) : (
                  <MicrophoneIcon size={15} aria-hidden />
                )}
              </button>
            ) : null}

            {/* Mobile only — shows the current ratio so it reads at a glance
                without opening the settings. */}
            <button
              type="button"
              aria-label="Generate settings"
              title={`${ratio} · ${KIND_LABELS[kind]} · ${count === "Auto" ? "Auto" : `${count} variation${count === "1" ? "" : "s"}`}`}
              aria-expanded={optionsOpen}
              aria-controls="chat-generate-options"
              onClick={() => setOptionsOpen((open) => !open)}
              className={`flex h-7 items-center gap-1.5 rounded-md px-1.5 text-[12px] transition-colors lg:hidden ${
                optionsOpen
                  ? "bg-ed-raised text-ed-text"
                  : "text-ed-muted hover:bg-ed-raised hover:text-ed-text"
              }`}
            >
              <SlidersHorizontalIcon size={15} aria-hidden />
              {ratio}
            </button>

            <span className="ml-auto flex items-center gap-2">
              {dictation.error ? (
                <span className="text-[11px] text-ed-muted">
                  {dictation.error}
                </span>
              ) : null}
              <button
                type="button"
                aria-label="Attach images"
                title={`Attach images (${images.length}/${MAX_IMAGES})`}
                aria-disabled={images.length >= MAX_IMAGES}
                onClick={() =>
                  images.length >= MAX_IMAGES
                    ? setNotice(
                        `You can attach up to ${MAX_IMAGES} images per message. Remove one to add another.`,
                      )
                    : fileRef.current?.click()
                }
                className="flex h-7 w-7 items-center justify-center rounded-md text-ed-muted transition-colors hover:bg-ed-raised hover:text-ed-text aria-disabled:opacity-30"
              >
                <PaperclipIcon size={15} aria-hidden />
              </button>
              <button
                type="submit"
                aria-label="Send"
                disabled={!canSend}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-ed-text text-ed-panel transition-opacity hover:opacity-90 disabled:opacity-30"
              >
                <ArrowUpIcon size={13} weight="bold" aria-hidden />
              </button>
            </span>
          </div>
        </form>
      </div>
    </aside>
  );
}
