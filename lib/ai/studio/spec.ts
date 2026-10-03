import "server-only";

import { RATIOS } from "@/components/editor/generate-options";
import { FAMILY_IDS } from "@/lib/ai/studio/families";
import { AXIS_NAMES, axisIds, type Custom, type Direction } from "@/lib/ai/studio/taste";

/**
 * The art director's output (D71): what this turn is, and — when it makes an
 * image — the design spec. The spec is the source of truth for an asset: the
 * image is one rendering of it, edits patch it, and the project style is read
 * from it. Kept short on purpose: the model picks ids and writes only what
 * must be specific to this design; the compiler expands the rest.
 */

export const ACTIONS = ["new", "edit", "series_next", "variation", "clarify", "chat"] as const;
export type Action = (typeof ACTIONS)[number];

/** Actions that produce an image. */
export const RENDERING: readonly Action[] = ["new", "edit", "series_next", "variation"];

export const RATIO_IDS = RATIOS.map((ratio) => ratio.id) as string[];

export type CopyLine = { role: string; text: string };

export type DesignSpec = {
  assetType: string;
  family: string;
  ratio: string;
  concept: string;
  signature: string;
  direction: Direction;
  /**
   * Per axis, the art direction written out when no block fits — usually a
   * look the user named themselves ("Y2K", "like a Wes Anderson film"). It
   * replaces that axis's block detail; the id stays as the nearest block.
   */
  custom: Custom;
  composition: string;
  copy: CopyLine[];
  palette: string | null;
  imagery: string;
  locked: string[];
  avoid: string[];
  /** For an edit: exactly what changes. Null otherwise. */
  edit: string | null;
};

export type TurnPlan = {
  action: Action;
  /** Canvas handle ("A1", "A2", …) of the asset an edit, variation or next-in-series is based on. */
  target: string | null;
  reply: string;
  suggestions: string[];
  clarify: { question: string; options: string[] } | null;
  design: DesignSpec | null;
};

const text = { type: "string" };
const texts = { type: "array", items: text };
const nullable = <T extends object>(schema: T) => ({ anyOf: [schema, { type: "null" }] });

const DESIGN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "assetType",
    "family",
    "ratio",
    "concept",
    "signature",
    "direction",
    "custom",
    "composition",
    "copy",
    "palette",
    "imagery",
    "locked",
    "avoid",
    "edit",
  ],
  properties: {
    assetType: text,
    family: { type: "string", enum: FAMILY_IDS },
    ratio: { type: "string", enum: RATIO_IDS },
    concept: text,
    signature: text,
    direction: {
      type: "object",
      additionalProperties: false,
      required: AXIS_NAMES,
      properties: Object.fromEntries(
        AXIS_NAMES.map((axis) => [axis, { type: "string", enum: axisIds(axis) }]),
      ),
    },
    custom: {
      type: "object",
      additionalProperties: false,
      required: AXIS_NAMES,
      properties: Object.fromEntries(AXIS_NAMES.map((axis) => [axis, { type: ["string", "null"] }])),
    },
    composition: text,
    copy: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["role", "text"],
        properties: { role: text, text },
      },
    },
    palette: { type: ["string", "null"] },
    imagery: text,
    locked: texts,
    avoid: texts,
    edit: { type: ["string", "null"] },
  },
};

/** Strict Structured Outputs: every key required, absence expressed as null. */
export const PLAN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["action", "target", "reply", "suggestions", "clarify", "design"],
  properties: {
    action: { type: "string", enum: [...ACTIONS] },
    target: { type: ["string", "null"] },
    reply: text,
    suggestions: texts,
    clarify: nullable({
      type: "object",
      additionalProperties: false,
      required: ["question", "options"],
      properties: { question: text, options: texts },
    }),
    design: nullable(DESIGN_SCHEMA),
  },
};

const LIMITS = {
  reply: 160,
  suggestion: 32,
  short: 120,
  long: 400,
  copyLine: 300,
  copyLines: 40,
  list: 8,
} as const;

/** Control characters out, whitespace collapsed, length capped: this text is quoted into prompts. */
function clean(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  const tidy = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  return tidy.length > max ? tidy.slice(0, max).trimEnd() : tidy;
}

function cleanList(value: unknown, max: number, count: number) {
  return Array.isArray(value)
    ? value.map((item) => clean(item, max)).filter(Boolean).slice(0, count)
    : [];
}

const oneOf = (list: readonly string[], value: unknown, fallback: string) =>
  typeof value === "string" && list.includes(value) ? value : fallback;

/**
 * Validates a design spec of unknown shape — the model's output, or one read
 * back from the DB. Returns null when the essentials are missing.
 */
export function readSpec(value: unknown): DesignSpec | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const rawDirection = (raw.direction ?? {}) as Record<string, unknown>;
  const direction = Object.fromEntries(
    AXIS_NAMES.map((axis) => [axis, oneOf(axisIds(axis), rawDirection[axis], axisIds(axis)[0])]),
  ) as Direction;
  const rawCustom = (raw.custom ?? {}) as Record<string, unknown>;
  const custom = Object.fromEntries(
    AXIS_NAMES.map((axis) => [axis, clean(rawCustom[axis], LIMITS.long) || null]),
  ) as Custom;

  const spec: DesignSpec = {
    assetType: clean(raw.assetType, LIMITS.short),
    family: oneOf(FAMILY_IDS, raw.family, "other"),
    ratio: oneOf(RATIO_IDS, raw.ratio, "1:1"),
    concept: clean(raw.concept, LIMITS.long),
    signature: clean(raw.signature, LIMITS.long),
    direction,
    custom,
    composition: clean(raw.composition, LIMITS.long),
    copy: Array.isArray(raw.copy)
      ? raw.copy
          .map((line) => {
            const entry = (line ?? {}) as Record<string, unknown>;
            return { role: clean(entry.role, 40), text: clean(entry.text, LIMITS.copyLine) };
          })
          .filter((line) => line.text)
          .slice(0, LIMITS.copyLines)
      : [],
    palette: clean(raw.palette, LIMITS.long) || null,
    imagery: clean(raw.imagery, LIMITS.long),
    locked: cleanList(raw.locked, LIMITS.short, LIMITS.list),
    avoid: cleanList(raw.avoid, LIMITS.short, LIMITS.list),
    edit: clean(raw.edit, LIMITS.long) || null,
  };
  return spec.assetType && spec.concept ? spec : null;
}

/** Validates the model's whole plan. A rendering action without a usable spec becomes a chat reply. */
export function readPlan(value: unknown): TurnPlan | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const reply = clean(raw.reply, LIMITS.reply);
  let action = oneOf(ACTIONS, raw.action, "chat") as Action;
  const design = RENDERING.includes(action) ? readSpec(raw.design) : null;
  if (RENDERING.includes(action) && !design) action = "chat";

  const rawClarify = raw.clarify as { question?: unknown; options?: unknown } | null;
  const clarify =
    action === "clarify" && rawClarify
      ? {
          question: clean(rawClarify.question, LIMITS.short),
          options: cleanList(rawClarify.options, LIMITS.suggestion, 4),
        }
      : null;
  if (action === "clarify" && !clarify?.question) action = "chat";

  if (!reply && !clarify) return null;
  return {
    action,
    target: typeof raw.target === "string" ? clean(raw.target, 8) : null,
    reply,
    suggestions: cleanList(raw.suggestions, LIMITS.suggestion, 3),
    clarify,
    design,
  };
}
