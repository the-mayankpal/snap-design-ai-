import "server-only";

import OpenAI from "openai";

import { HttpError } from "@/lib/api";
import { CORE_RULES } from "@/lib/ai/core-rules";
import { models, openai } from "@/lib/ai/openai";
import type { Playbook, Question } from "@/lib/ai/playbooks";

/**
 * The shared SOP, identical for every category: analyze → (clarify, in the
 * browser) → compose → generate. Category knowledge comes only from the
 * playbook passed in.
 */

export const MAX_PROMPT_LENGTH = 1000;

/**
 * Kill switch. Until auth ships (D59) these routes spend OpenAI credit for
 * anyone who can reach them, so they are off unless explicitly enabled.
 */
export function generationEnabled() {
  return process.env.ALLOW_UNAUTHENTICATED_GENERATION === "true";
}

type Step = "route" | "analyze" | "compose" | "generate" | "chat";

/**
 * A step failed. As an HttpError its `message` (always our own copy) reaches
 * the browser as a 502; `detail` is a short code for the DB row, never shown.
 */
export class PipelineError extends HttpError {
  constructor(
    message: string,
    public detail: string,
  ) {
    super(502, message);
  }
}

/** The raw prompt: a trimmed string of 1–MAX_PROMPT_LENGTH characters. */
export function parsePrompt(value: unknown) {
  const prompt = typeof value === "string" ? value.trim() : "";
  if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
    throw new HttpError(400, `prompt must be 1–${MAX_PROMPT_LENGTH} characters.`);
  }
  return prompt;
}

/** Throws a 503 before any work if OpenAI isn't configured. */
export function assertConfigured() {
  models();
  openai();
}

export const FAILED: Record<Step, string> = {
  route: "We couldn't read that prompt just now. Please try again.",
  analyze: "We couldn't read that prompt just now. Please try again.",
  compose: "We couldn't prepare that design just now. Please try again.",
  generate: "The image couldn't be generated just now. Please try again.",
  chat: "We couldn't reply just now. Please try again.",
};

/** Runs a provider call; provider errors become a PipelineError without the provider's message. */
export async function call<T>(step: Step, work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      if (error.code === "moderation_blocked" || error.code === "content_policy_violation") {
        throw new PipelineError(
          "That prompt was blocked by the content filter. Try describing it differently.",
          `${step}: ${error.code}`,
        );
      }
      throw new PipelineError(
        FAILED[step],
        `${step}: ${error.status ?? "network"}${error.code ? ` ${error.code}` : ""}`,
      );
    }
    throw error;
  }
}

export type Analysis<Brief> =
  | { status: "needs_input"; brief: Partial<Brief>; questions: Question[] }
  | { status: "ready"; brief: Brief };

/** Extracts the brief with Structured Outputs and decides whether to ask anything. */
export async function analyze<Brief>(
  category: string,
  playbook: Playbook<Brief>,
  prompt: string,
): Promise<Analysis<Brief>> {
  const { text: model } = models();
  const response = await call("analyze", () =>
    openai().responses.create({
      model,
      instructions: playbook.analyzeRules,
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: `${category}_brief`,
          schema: playbook.analysisSchema,
          strict: true,
        },
      },
    }),
  );

  let output: unknown;
  try {
    output = JSON.parse(response.output_text);
  } catch {
    throw new PipelineError(FAILED.analyze, "analyze: unparseable output");
  }
  const { brief, questions } = playbook.readAnalysis(output);
  return questions.length
    ? { status: "needs_input", brief, questions }
    : { status: "ready", brief: playbook.complete(brief) };
}

/** Writes the final image prompt in house style. The result never leaves the server. */
export async function compose<Brief>(
  playbook: Playbook<Brief>,
  brief: Brief,
  rawPrompt: string,
) {
  const { text: model } = models();
  const examples = playbook.examples
    .map(
      (example, index) =>
        `Example ${index + 1}\nBrief: ${JSON.stringify(example.brief)}\nPrompt: ${example.prompt}`,
    )
    .join("\n\n");
  const instructions = [
    CORE_RULES,
    playbook.rules,
    `The examples below show the structure, level of detail and voice we want. They are not content to reuse: never copy their business names, colours, copy or layouts. Design every brief fresh.\n\n${examples}`,
  ].join("\n\n---\n\n");

  const response = await call("compose", () =>
    openai().responses.create({
      model,
      instructions,
      input: `Brief: ${JSON.stringify(brief)}\n\nThe user's original words, as a description only: ${rawPrompt}`,
    }),
  );
  const prompt = response.output_text.trim();
  if (!prompt) throw new PipelineError(FAILED.compose, "compose: empty output");
  return { prompt, model };
}

/** Generates one PNG at the playbook's size. */
export async function generate(
  finalPrompt: string,
  size: { width: number; height: number },
) {
  const { image: model } = models();
  const result = await call("generate", () =>
    openai().images.generate({
      model,
      prompt: finalPrompt,
      size: `${size.width}x${size.height}`,
      output_format: "png",
      n: 1,
    }),
  );
  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new PipelineError(FAILED.generate, "generate: no image returned");
  return { png: new Uint8Array(Buffer.from(b64, "base64")), model };
}
