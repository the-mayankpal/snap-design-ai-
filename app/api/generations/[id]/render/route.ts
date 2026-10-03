import { HttpError, respond } from "@/lib/api";
import { generationEnabled, PipelineError } from "@/lib/ai/pipeline";
import { render } from "@/lib/ai/studio/render";
import { claimPending, imagePathOf, markFailed, markSucceeded, saveStyle } from "@/lib/db/generations";
import { freeAccount, freeSummary, OUT_OF_FREE, refundImage, takeImage } from "@/lib/quota";
import { requireAccount } from "@/lib/supabase/auth";
import { downloadPath, signPaths, uploadGeneration } from "@/lib/storage/images";

type Context = { params: Promise<{ id: string }> };

/** Image generation can take well over a minute. */
export const maxDuration = 300;

/**
 * Renders a generation planned by `/api/designs/[id]/turn`. An edit sends the
 * image being changed; the next in a series sends its anchor as a style
 * reference; anything else is a fresh generation.
 */
export async function POST(_request: Request, { params }: Context) {
  return respond(async () => {
    if (!generationEnabled()) throw new HttpError(403, "Generation is turned off on this server.");
    const { id } = await params;
    const user = await requireAccount();
    const job = await claimPending(user.id, id);

    // Free tier (D83): one image is taken atomically across email, network and
    // browser before OpenAI is called, and handed back only if the render fails.
    const free = await freeAccount(user);
    if (free && !(await takeImage(free))) {
      await markFailed(job.id, "quota: free images used").catch(() => {});
      throw new HttpError(402, free.blocked ?? OUT_OF_FREE);
    }

    // Once the image is stored it counts, even if a later step fails.
    let stored = false;
    try {
      const usesSource = job.action === "edit" || job.action === "series_next";
      const sourcePath = usesSource && job.parentId ? await imagePathOf(job.designId, job.parentId) : null;
      const source = sourcePath ? await downloadPath(sourcePath) : null;

      const { image, type, model, ms } = await render(
        job.finalPrompt,
        { width: job.width, height: job.height },
        source,
      );
      const imagePath = await uploadGeneration(job.id, image, type);
      stored = true;
      await markSucceeded(job.id, job.designId, { model, imagePath, renderMs: ms });
      await saveStyle(job.designId, job.spec, job.action === "new");

      const urls = await signPaths([imagePath]);
      return {
        id: job.id,
        url: urls.get(imagePath) ?? "",
        width: job.width,
        height: job.height,
        prompt: job.rawPrompt,
        free: await freeSummary(free).catch(() => undefined),
      };
    } catch (error) {
      const reason =
        error instanceof PipelineError
          ? error.detail
          : `server: ${error instanceof Error ? error.name : "unknown"}`;
      // Recording the failure must not mask the original error.
      await markFailed(job.id, reason).catch(() => {});
      if (free && !stored) await refundImage(free).catch((refund) => console.error("refund failed", refund));
      throw error;
    }
  });
}
