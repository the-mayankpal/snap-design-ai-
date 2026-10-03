import "server-only";

import type { KindId } from "@/components/editor/generate-options";
import { models, openai } from "@/lib/ai/openai";
import { call, FAILED, PipelineError } from "@/lib/ai/pipeline";
import { DIRECTOR_INSTRUCTIONS, KNOWLEDGE_VERSION } from "@/lib/ai/studio/constitution";
import { KIND_HINTS } from "@/lib/ai/studio/families";
import { PLAN_SCHEMA, readPlan, type DesignSpec } from "@/lib/ai/studio/spec";
import type { Axis, Direction } from "@/lib/ai/studio/taste";

/**
 * The one model call before an image (D71). Static instructions first (cached
 * by the provider), then a compact per-turn context. Output is a short
 * structured plan — ids and specifics, never the image prompt — so it returns
 * in a second or two.
 */

export type Turn = { role: "user" | "assistant"; text: string };

/** A project's locked look, read from its first design (D73). Layout is always chosen per asset. */
export type StyleLock = Omit<Direction, "layout"> & {
  palette: string | null;
  /** Custom text for the locked axes; absent on projects saved before k3. */
  custom?: Partial<Record<Exclude<Axis, "layout">, string | null>>;
};

export type DirectorContext = {
  messages: Turn[];
  selected: { ratio: string; kind: KindId };
  style: StyleLock | null;
  /** Newest last; `handle` is how the model refers to an asset ("A1", "A2", …). */
  /** `note` is the user's own label on the image ("final v1"). */
  assets: { handle: string; spec: DesignSpec; note: string | null }[];
  /** Handle of the image the user clicked on the canvas, if any. */
  focus: string | null;
  /** The image a follow-up most likely refers to (selected, else newest), as a signed URL. */
  view: { handle: string; url: string } | null;
};

/** Full specs for the newest few assets; the rest as one line each, to keep input small. */
const FULL_SPECS = 2;

function describeContext(context: DirectorContext) {
  const { selected, style, assets, messages, focus } = context;
  const recent = assets
    .slice(-4)
    .map((asset) => Object.values(asset.spec.direction).join(" "))
    .join(" | ");

  const assetLines = assets.map(({ handle, spec, note }, index) => {
    const label = note ? ` [note: ${JSON.stringify(note)}]` : "";
    return index >= assets.length - FULL_SPECS || handle === focus
      ? `${handle}${label}: ${JSON.stringify(spec)}`
      : `${handle}${label}: ${spec.assetType} — ${spec.concept}`;
  });

  return [
    `SELECTED: ratio ${selected.ratio}; type "${selected.kind}" (${KIND_HINTS[selected.kind]}).`,
    `PROJECT STYLE: ${style ? JSON.stringify(style) : "none yet"}.`,
    `RECENTLY USED DIRECTIONS: ${recent || "none"}.`,
    `CANVAS (oldest first):\n${assetLines.join("\n") || "empty"}`,
    `SELECTED ON CANVAS: ${
      focus
        ? `${focus} — the user clicked it; edits, variations and "next" requests refer to it unless they name another`
        : "nothing"
    }.`,
    `ATTACHED IMAGE: ${
      context.view
        ? `${context.view.handle} as actually rendered. Judge what it looks like from the image, not its spec.`
        : "none"
    }.`,
    `CONVERSATION (oldest first; the last message is the one to act on):\n${messages
      .map((message) => `${message.role}: ${message.text}`)
      .join("\n")}`,
  ].join("\n\n");
}

export async function direct(context: DirectorContext) {
  const { text: model } = models();
  const effort = process.env.OPENAI_TEXT_REASONING_EFFORT;
  const started = Date.now();

  const response = await call("direct", () =>
    openai().responses.create({
      model,
      instructions: DIRECTOR_INSTRUCTIONS,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: describeContext(context) },
            ...(context.view
              ? [{ type: "input_image" as const, image_url: context.view.url, detail: "low" as const }]
              : []),
          ],
        },
      ],
      prompt_cache_key: `snapdesign-director-${KNOWLEDGE_VERSION}`,
      ...(effort ? { reasoning: { effort: effort as "minimal" | "low" | "medium" | "high" } } : {}),
      max_output_tokens: 4000,
      text: {
        format: { type: "json_schema", name: "turn_plan", schema: PLAN_SCHEMA, strict: true },
      },
    }),
  );

  let output: unknown;
  try {
    output = JSON.parse(response.output_text);
  } catch {
    throw new PipelineError(FAILED.direct, "direct: unparseable output");
  }
  const plan = readPlan(output);
  if (!plan) throw new PipelineError(FAILED.direct, "direct: empty plan");
  return { plan, model, ms: Date.now() - started };
}
