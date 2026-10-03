import {
  COUNTS,
  KIND_IDS,
  RATIOS,
  type KindId,
} from "@/components/editor/generate-options";

/**
 * The design shapes shared by the browser store and the API routes. A plain
 * module (no "use client", no server imports) so both sides can use it.
 */

export type DesignSettings = { ratio: string; kind: KindId; count: string };

/** An attachment as read back: `url` is a short-lived signed link. */
export type StoredImage = { id: number; name: string; url: string };

export type StoredMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
  images?: StoredImage[];
  /** For a reply that made an image: that generation's id. */
  generationId?: string;
};

/** An image the pipeline produced for this design. */
export type Generation = {
  id: string;
  /** Short-lived signed link to the stored image. */
  url: string;
  /** Intrinsic size — cards and the canvas take their aspect ratio from it. */
  width: number;
  height: number;
  /** The prompt that produced it. */
  prompt: string;
  createdAt: number;
  /** Where it sits on the canvas; null until it is first placed. */
  frame: Frame | null;
  /** The user's own label under it ("final v1"); null when none. */
  note: string | null;
};

export const MAX_NOTE = 80;

/** A note that marks an image as the chosen one ("final", "approved v2", "use this"). */
export function isFinalNote(note: string | null) {
  return (
    !!note &&
    /\b(final(i[sz]ed)?|approved?|locked?|chosen|winner|keeper|go with this|use this|this one)\b/i.test(note) &&
    !/\b(not|no|isn'?t|never|almost|nearly)\b/i.test(note)
  );
}

/** Position and width on the canvas, in canvas units at 100% zoom. Height follows the aspect ratio. */
export type Frame = { x: number; y: number; w: number };

export const MAX_FRAMES = 200;
const LIMIT = 1_000_000;

export function isFrame(value: unknown): value is Frame {
  const frame = value as Partial<Frame> | null;
  return (
    !!frame &&
    [frame.x, frame.y, frame.w].every((n) => typeof n === "number" && Number.isFinite(n) && Math.abs(n) < LIMIT) &&
    frame.w! > 0
  );
}

export type Design = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  settings: DesignSettings;
  messages: StoredMessage[];
  generations: Generation[];
  /** The generation shown on the design's card; falls back to the newest. */
  coverId: string | null;
};

/** What the designs gallery needs per card — no full history. */
export type DesignSummary = {
  id: string;
  title: string;
  updatedAt: number;
  settings: DesignSettings;
  prompts: number;
  shots: number;
  cover: Generation | null;
  /** When it was pinned to the top of the dashboard; null when not pinned. */
  pinnedAt: number | null;
};

/** A message as sent to be saved; attachments were already uploaded to `path`. */
export type SaveMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
  images?: { id: number; name: string; path: string }[];
  generationId?: string;
};

/** The image types the chat accepts and Storage allows (see the migration). */
export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
export const MAX_IMAGES = 5;
export const MAX_IMAGE_MB = 10;

export const DEFAULT_SETTINGS: DesignSettings = {
  ratio: "16:9",
  kind: "website",
  count: "1",
};

export const UNTITLED = "Untitled design";

export function isSettings(value: unknown): value is DesignSettings {
  if (!value || typeof value !== "object") return false;
  const { ratio, kind, count } = value as Record<string, unknown>;
  return (
    RATIOS.some(({ id }) => id === ratio) &&
    KIND_IDS.includes(kind as KindId) &&
    COUNTS.includes(count as (typeof COUNTS)[number])
  );
}

/** First line of the opening prompt, trimmed to card length. */
export function titleFromPrompt(text: string) {
  const line = text.split("\n")[0].trim();
  if (!line) return UNTITLED;
  return line.length > 60 ? `${line.slice(0, 57).trimEnd()}…` : line;
}

/** The card image: the chosen cover, else the most recent generation. */
export function coverOf(generations: Generation[], coverId: string | null) {
  return (
    generations.find((generation) => generation.id === coverId) ??
    generations.at(-1) ??
    null
  );
}
