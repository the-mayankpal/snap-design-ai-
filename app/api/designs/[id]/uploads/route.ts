import { MAX_IMAGES } from "@/components/designs/design-model";
import { HttpError, readJson, respond } from "@/lib/api";
import { assertOwned } from "@/lib/db/designs";
import { requireUser } from "@/lib/supabase/auth";
import { createUploadSlots } from "@/lib/storage/images";

type Context = { params: Promise<{ id: string }> };

/**
 * Issues signed upload URLs for chat attachments: `{ files: [{ type, size }] }`
 * in, `[{ path, url }]` out. The browser PUTs each file to its `url`, then
 * saves the message with the `path`.
 */
export async function POST(request: Request, { params }: Context) {
  return respond(async () => {
    const body = (await readJson(request)) as { files?: unknown } | null;
    const files = body?.files;
    if (
      !Array.isArray(files) ||
      files.length === 0 ||
      files.length > MAX_IMAGES ||
      !files.every((file) => typeof file?.type === "string" && typeof file?.size === "number")
    ) {
      throw new HttpError(400, `Send 1–${MAX_IMAGES} files as { type, size }.`);
    }

    const owner = await requireUser();
    const { id } = await params;
    await assertOwned(owner, id);
    return createUploadSlots(id, files);
  });
}
