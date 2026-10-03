import { MAX_IMAGES, type SaveMessage } from "@/components/designs/design-model";
import { HttpError, readJson, respond } from "@/lib/api";
import { appendMessages } from "@/lib/db/designs";
import { isUuid } from "@/lib/ids";
import { requireUser } from "@/lib/supabase/auth";
import { isUploadPath } from "@/lib/storage/images";

type Context = { params: Promise<{ id: string }> };

const MAX_MESSAGES = 10;
const MAX_TEXT = 8000;

/**
 * Appends chat messages. Attachments must already be in Storage, uploaded
 * through slots from `./uploads`, so only their paths arrive here.
 */
export async function POST(request: Request, { params }: Context) {
  return respond(async () => {
    const { id } = await params;
    const body = (await readJson(request)) as { messages?: unknown; title?: unknown } | null;
    const messages = parseMessages(id, body?.messages);
    const title = body?.title;
    if (title !== undefined && (typeof title !== "string" || title.length > 80)) {
      throw new HttpError(400, "Title must be at most 80 characters.");
    }

    const owner = await requireUser();
    await appendMessages(owner, id, messages, title as string | undefined);
  });
}

function parseMessages(designId: string, value: unknown): SaveMessage[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) {
    throw new HttpError(400, `Send 1–${MAX_MESSAGES} messages.`);
  }
  return value.map((raw) => {
    const message = raw as Partial<SaveMessage> | null;
    const images = message?.images ?? [];
    const valid =
      Number.isInteger(message?.id) &&
      message!.id! >= 0 &&
      (message?.role === "user" || message?.role === "assistant") &&
      typeof message.text === "string" &&
      message.text.length <= MAX_TEXT &&
      Array.isArray(images) &&
      images.length <= MAX_IMAGES &&
      (message.generationId === undefined ||
        (typeof message.generationId === "string" && isUuid(message.generationId))) &&
      images.every(
        (image) =>
          Number.isInteger(image?.id) &&
          typeof image.name === "string" &&
          image.name.length <= 200 &&
          typeof image.path === "string" &&
          isUploadPath(designId, image.path),
      );
    if (!valid) throw new HttpError(400, "Malformed message.");
    return {
      id: message.id!,
      role: message.role!,
      text: message.text!,
      images: images.map(({ id, name, path }) => ({ id, name, path })),
      ...(message.generationId && { generationId: message.generationId }),
    };
  });
}
