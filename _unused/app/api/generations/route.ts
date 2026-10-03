import { HttpError, readStrictJson, respond } from "@/lib/api";
import {
  assertConfigured,
  compose,
  generate,
  generationEnabled,
  parsePrompt,
  PipelineError,
} from "@/lib/ai/pipeline";
import { isCategoryId, playbookFor } from "@/lib/ai/playbooks";
import { assertOwned } from "@/lib/db/designs";
import {
  addGenerationMessages,
  createDesignForGeneration,
  insertPendingGeneration,
  markFailed,
  markSucceeded,
  recordFinalPrompt,
} from "@/lib/db/generations";
import { ensureDevice, isUuid } from "@/lib/device";
import { signPaths, uploadGeneration } from "@/lib/storage/images";

/** Compose + image generation can take well over a minute. */
export const maxDuration = 300;

/**
 * Brief (+ clarify answers) → compose → generate → store → record. Everything
 * the client sends is re-validated; the composed prompt stays in the DB.
 * On success the image joins `projectId` (a design this browser owns) or a
 * new design, which the client opens in the editor.
 */
export async function POST(request: Request) {
  return respond(async () => {
    if (!generationEnabled()) throw new HttpError(403, "Generation is turned off on this server.");
    const body = await readStrictJson(request, ["prompt", "category", "brief", "answers", "projectId"]);
    const prompt = parsePrompt(body.prompt);
    if (!isCategoryId(body.category)) throw new HttpError(400, "Unknown category.");
    const category = body.category;
    const playbook = playbookFor(category);
    if (!playbook) throw new HttpError(400, "That kind of design isn't available yet.");
    const projectId = body.projectId;
    if (projectId !== undefined && !(typeof projectId === "string" && isUuid(projectId))) {
      throw new HttpError(400, "projectId must be a design id.");
    }
    // applyAnswers has validated every key and value, so the cast below is sound.
    const partial = playbook.applyAnswers(playbook.parseBrief(body.brief), body.answers);
    const answers = (body.answers ?? null) as Record<string, string> | null;
    const brief = playbook.complete(partial);
    assertConfigured();

    const device = await ensureDevice();
    if (projectId) await assertOwned(device, projectId);
    const id = await insertPendingGeneration({
      category,
      rawPrompt: prompt,
      brief,
      answers,
    });

    try {
      const { prompt: finalPrompt } = await compose(playbook, brief, prompt);
      await recordFinalPrompt(id, finalPrompt, brief);

      const size = playbook.imageSize(brief);
      const { png, model } = await generate(finalPrompt, size);
      const imagePath = await uploadGeneration(id, png);
      const designId = projectId
        ? await addGenerationMessages(projectId, prompt)
        : await createDesignForGeneration(device, prompt, playbook.designSettings(brief));
      await markSucceeded(id, { designId, model, imagePath, ...size });

      const urls = await signPaths([imagePath]);
      return { id, designId, imageUrl: urls.get(imagePath) ?? "", ...size };
    } catch (error) {
      const reason =
        error instanceof PipelineError
          ? error.detail
          : `server: ${error instanceof Error ? error.name : "unknown"}`;
      // Recording the failure must not mask the original error.
      await markFailed(id, reason).catch(() => {});
      throw error;
    }
  }, 201);
}
