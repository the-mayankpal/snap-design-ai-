import { HttpError, readStrictJson, respond } from "@/lib/api";
import { saveOrder } from "@/lib/db/designs";
import { isUuid } from "@/lib/ids";
import { requireUser } from "@/lib/supabase/auth";

const MAX_IDS = 1000;

/** The dashboard order the user arranged by dragging (D82): `{ ids: [...] }`, first to last. */
export async function PUT(request: Request) {
  return respond(async () => {
    const body = await readStrictJson(request, ["ids"]);
    const ids = body.ids;
    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      ids.length > MAX_IDS ||
      !ids.every((id) => typeof id === "string" && isUuid(id)) ||
      new Set(ids).size !== ids.length
    ) {
      throw new HttpError(400, "Send the designs' ids in their new order.");
    }
    await saveOrder(await requireUser(), ids as string[]);
  });
}
