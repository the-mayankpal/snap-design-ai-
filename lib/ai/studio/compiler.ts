import "server-only";

import { ALWAYS_AVOID, AVOID_EXCEPT } from "@/lib/ai/studio/constitution";
import { familyOf } from "@/lib/ai/studio/families";
import type { DesignSpec } from "@/lib/ai/studio/spec";
import { block, type Axis } from "@/lib/ai/studio/taste";

/**
 * Spec → image prompt, in code (D71). Eight slots in a fixed order — image
 * models weigh early words most — each with a word budget, so the prompt stays
 * medium length (~170–210 words, plus the design's own copy) however much the
 * spec says. The model never
 * writes the prompt itself: that keeps it fast, consistent and editable slot
 * by slot. The compiled prompt is stored with the generation and never sent
 * to the browser.
 */

/** Output sizes: divisible by 16, aspect within 1:3–3:1, as the GPT image models require. */
const SIZES: Record<string, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "4:5": { width: 1024, height: 1280 },
  "3:4": { width: 1152, height: 1536 },
  "9:16": { width: 864, height: 1536 },
  "16:9": { width: 1536, height: 864 },
  "3:2": { width: 1536, height: 1024 },
  "4:3": { width: 1536, height: 1152 },
  "2:1": { width: 1536, height: 768 },
};

export function sizeFor(ratio: string) {
  return SIZES[ratio] ?? SIZES["1:1"];
}

const BUDGET = {
  format: 22,
  concept: 34,
  composition: 40,
  type: 28,
  color: 26,
  imagery: 30,
  graphic: 16,
  finish: 14,
  avoid: 60,
} as const;

/**
 * Caps text at `max` words. An over-long text is cut back to its last
 * sentence or clause break inside the budget, so no phrase is left half-said.
 */
function cap(text: string, max: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  let kept = words.join(" ");
  if (words.length > max) {
    const cut = words.slice(0, max).join(" ");
    const lastBreak = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(", "), cut.lastIndexOf("; "));
    kept = (lastBreak > cut.length / 2 ? cut.slice(0, lastBreak) : cut).replace(/[,;:]$/, "");
  }
  return kept && !/[.!?]$/.test(kept) ? `${kept}.` : kept;
}

/**
 * The constant bans, minus any the asset itself contradicts: a logo request
 * keeps logos, and a look the user asked for ("a neon sign", "a sunset
 * gradient") keeps its gradient or neon. The user's choice beats our taste.
 */
function standingBans(spec: DesignSpec) {
  const except = AVOID_EXCEPT[spec.family] ?? [];
  const asked = [spec.assetType, spec.imagery, spec.palette, ...Object.values(spec.custom)].join(" ").toLowerCase();
  return ALWAYS_AVOID.filter(
    ({ ban, words }) => !except.includes(ban) && !words.some((word) => new RegExp(`\\b${word}s?\\b`).test(asked)),
  ).map(({ ban }) => ban);
}

/** Whole items only, until the budget runs out. */
function avoidSlot(items: string[]) {
  const kept: string[] = [];
  let words = 1;
  for (const item of items) {
    const size = item.split(/\s+/).length;
    if (words + size > BUDGET.avoid) break;
    kept.push(item);
    words += size;
  }
  return `Avoid: ${kept.join("; ")}.`;
}

/** The axis's art direction: the custom text when there is one, else the block's detail. */
const detail = (spec: DesignSpec, axis: Axis) =>
  spec.custom[axis] ?? block(spec.direction[axis])?.detail ?? "";

function orientation(ratio: string) {
  const [w, h] = ratio.split(":").map(Number);
  return w === h ? "Square" : w > h ? "Horizontal" : "Vertical";
}

/** Quoted copy, grouped by role. Never truncated mid-line — the family's word limit is enforced by the director. */
function copySlot(spec: DesignSpec) {
  if (spec.copy.length === 0) return "No text on the design.";
  const lines = spec.copy.map((line) => `${line.role ? `${line.role}: ` : ""}"${line.text}"`);
  return `Text, exactly as written and nothing else: ${lines.join("; ")}.`;
}

export function compilePrompt(spec: DesignSpec): string {
  if (spec.family === "image") return compileImage(spec);
  const family = familyOf(spec.family);
  const imagery = spec.imagery && spec.imagery.toLowerCase() !== "none" ? `${spec.imagery}; ` : "";

  const slots = [
    cap(`${orientation(spec.ratio)} ${spec.ratio} ${spec.assetType}, ${family.render}`, BUDGET.format),
    cap(`Concept: ${spec.concept} Signature: ${spec.signature}`, BUDGET.concept),
    cap(`Composition: ${spec.composition} Layout: ${detail(spec, "layout")}`, BUDGET.composition),
    `${cap(`Typography: ${detail(spec, "type")}`, BUDGET.type)} ${copySlot(spec)}`,
    cap(`Colour: ${spec.palette ? `${spec.palette}; ` : ""}${detail(spec, "color")}`, BUDGET.color),
    `${cap(`Imagery: ${imagery}${detail(spec, "imagery")}`, BUDGET.imagery)} ${cap(`Graphics: ${detail(spec, "graphic")}`, BUDGET.graphic)}`,
    cap(
      `Finish: art-directed like a leading independent studio; crisp edges, real textures, perfect spelling, consistent spacing`,
      BUDGET.finish,
    ),
    avoidSlot([...standingBans(spec), ...spec.avoid]),
  ];
  return slots.join("\n");
}

/**
 * A plain image — a picture, not a layout. Type, layout and graphic blocks
 * don't apply; the words go to subject, colour, medium and texture instead.
 */
function compileImage(spec: DesignSpec) {
  const subject = spec.imagery && spec.imagery.toLowerCase() !== "none" ? spec.imagery : spec.concept;
  return [
    cap(`${orientation(spec.ratio)} ${spec.ratio} ${spec.assetType}, ${familyOf("image").render}`, BUDGET.format),
    cap(`Subject: ${subject}`, BUDGET.imagery),
    cap(`Concept: ${spec.concept} Signature: ${spec.signature}`, BUDGET.concept),
    spec.composition ? cap(`Composition: ${spec.composition}`, BUDGET.composition) : "",
    cap(`Medium and light: ${detail(spec, "imagery")}`, BUDGET.imagery),
    // Colour blocks are written for layouts ("cream type"); an image uses the scene's own palette.
    cap(`Colour and light: ${spec.palette ?? detail(spec, "color")}`, BUDGET.color),
    spec.copy.length ? copySlot(spec) : "No text, letters or watermarks anywhere in the image.",
    cap(
      "Finish: real, tactile textures and materials, true light and shadow, fine natural detail",
      BUDGET.finish,
    ),
    avoidSlot([...standingBans(spec), ...spec.avoid]),
  ]
    .filter(Boolean)
    .join("\n");
}

/** An in-place edit: the source image goes to the image model with this. */
export function compileEditPrompt(spec: DesignSpec) {
  return [
    `Edit this design. Change: ${spec.edit ?? "apply the requested change"}.`,
    "Keep everything else identical: layout, typography, colours, imagery, and all other text.",
    spec.copy.length ? copySlot(spec) : "",
    avoidSlot(standingBans(spec)),
  ]
    .filter(Boolean)
    .join("\n");
}

/** The next asset in a series: the previous one is passed as a style reference. */
export function compileSeriesPrompt(spec: DesignSpec) {
  return [
    "Create a NEW design in the same visual system as the reference image: match its typography, colours, graphic language and finish, but use a new composition suited to this content. Do not copy its layout or text.",
    compilePrompt(spec),
  ].join("\n");
}
