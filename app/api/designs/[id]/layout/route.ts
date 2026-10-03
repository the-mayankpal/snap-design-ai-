import { isFrame, MAX_FRAMES } from "@/components/designs/design-model";
import { HttpError, readStrictJson, respond } from "@/lib/api";
import { saveLayout } from "@/lib/db/designs";
import { isUuid } from "@/lib/ids";
import { requireUser } from "@/lib/supabase/auth";

type Context = { params: Promise<{ id: string }> };

/** Where this design's images sit on the canvas: `{ frames: [{ id, x, y, w }] }`. */
export async function PUT(request: Request, { params }: Context) {
  return respond(async () => {
    const body = await readStrictJson(request, ["frames"]);
    if (!Array.isArray(body.frames) || body.frames.length > MAX_FRAMES) {
      throw new HttpError(400, `Send up to ${MAX_FRAMES} frames.`);
    }
    const frames = body.frames.map((raw) => {
      const item = raw as { id?: unknown; x?: unknown; y?: unknown; w?: unknown } | null;
      const frame = { x: item?.x, y: item?.y, w: item?.w };
      if (typeof item?.id !== "string" || !isUuid(item.id) || !isFrame(frame)) {
        throw new HttpError(400, "Malformed frame.");
      }
      return { id: item.id, frame };
    });
    await saveLayout(await requireUser(), (await params).id, frames);
  });
}
