import { isSettings } from "@/components/designs/design-model";
import { HttpError, readJson, respond } from "@/lib/api";
import { deleteDesign, getDesign, pinDesign, updateDesign } from "@/lib/db/designs";
import { isUuid } from "@/lib/ids";
import { requireUser } from "@/lib/supabase/auth";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  return respond(async () => {
    const design = await getDesign(await requireUser(), (await params).id);
    if (!design) throw new HttpError(404, "Design not found.");
    return design;
  });
}

/** Rename, change settings, pick the cover, or pin. Any subset. */
export async function PATCH(request: Request, { params }: Context) {
  return respond(async () => {
    const body = (await readJson(request)) as Record<string, unknown> | null;
    const patch: Parameters<typeof updateDesign>[2] = {};

    if (body?.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim() || body.title.length > 80) {
        throw new HttpError(400, "Title must be 1–80 characters.");
      }
      patch.title = body.title.trim();
    }
    if (body?.settings !== undefined) {
      if (!isSettings(body.settings)) throw new HttpError(400, "Unknown settings.");
      patch.settings = body.settings;
    }
    if (body?.coverId !== undefined) {
      if (body.coverId !== null && !(typeof body.coverId === "string" && isUuid(body.coverId))) {
        throw new HttpError(400, "coverId must be an image id or null.");
      }
      patch.coverId = body.coverId;
    }

    if (body?.pinned !== undefined && typeof body.pinned !== "boolean") {
      throw new HttpError(400, "pinned must be true or false.");
    }

    const owner = await requireUser();
    const { id } = await params;
    if (Object.keys(patch).length) await updateDesign(owner, id, patch);
    if (typeof body?.pinned === "boolean") await pinDesign(owner, id, body.pinned);
  });
}

export async function DELETE(_request: Request, { params }: Context) {
  return respond(async () => {
    await deleteDesign(await requireUser(), (await params).id);
  });
}
