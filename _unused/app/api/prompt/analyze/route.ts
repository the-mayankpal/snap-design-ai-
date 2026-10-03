import { HttpError, readStrictJson, respond } from "@/lib/api";
import { analyze, generationEnabled, parsePrompt } from "@/lib/ai/pipeline";
import {
  categoryOptions,
  comingSoonMessage,
  isCategoryId,
  playbookFor,
  type CategoryId,
} from "@/lib/ai/playbooks";
import { routePrompt } from "@/lib/ai/router";

export const maxDuration = 60;

/**
 * Route + analyze. Raw prompt → one of:
 * - needs_category: the router wasn't sure; ask "What are you making?"
 * - unsupported_category: recognised, not enabled yet — coming soon
 * - needs_input: up to three questions from the playbook's bank, one round
 * - ready: a complete brief
 * `category` is sent back only after the user picks a category chip.
 * Stateless: nothing is stored.
 */
export async function POST(request: Request) {
  return respond(async () => {
    if (!generationEnabled()) throw new HttpError(403, "Generation is turned off on this server.");
    const body = await readStrictJson(request, ["prompt", "category"]);
    const prompt = parsePrompt(body.prompt);

    let category: CategoryId;
    if (body.category !== undefined) {
      if (!isCategoryId(body.category)) throw new HttpError(400, "Unknown category.");
      category = body.category;
    } else {
      const routed = await routePrompt(prompt);
      if (routed.confidence === "low") {
        return { status: "needs_category", question: "What are you making?", options: categoryOptions() };
      }
      category = routed.category;
    }

    const playbook = playbookFor(category);
    if (!playbook) {
      return { status: "unsupported_category", category, message: comingSoonMessage(category) };
    }
    const result = await analyze(category, playbook, prompt);
    return { ...result, category };
  });
}
