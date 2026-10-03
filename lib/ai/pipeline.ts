import "server-only";

import OpenAI from "openai";

import { HttpError } from "@/lib/api";

/**
 * Shared plumbing for the design pipeline (D71): one art-director call, a
 * code compiler, then the image model. See lib/ai/studio/.
 */

/**
 * Kill switch for OpenAI spend. The routes also require a signed-in user and
 * the free tier (D83); this turns generation off for everyone at once. Off
 * unless explicitly "true" — so it must be set on Vercel too. (The name
 * predates sign-in; kept so existing env settings keep working.)
 */
export function generationEnabled() {
  return process.env.ALLOW_UNAUTHENTICATED_GENERATION === "true";
}

type Step = "direct" | "render";

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

export const FAILED: Record<Step, string> = {
  direct: "We couldn't read that just now. Please try again.",
  render: "The image couldn't be generated just now. Please try again.",
};

/** Runs a provider call; provider errors become a PipelineError without the provider's message. */
export async function call<T>(step: Step, work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      if (error.code === "moderation_blocked" || error.code === "content_policy_violation") {
        throw new PipelineError(
          "That request was blocked by the content filter. Try describing it differently.",
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
