import { MAX_NOTE } from "@/components/designs/design-model";
import { HttpError, readStrictJson, respond } from "@/lib/api";
import { saveNote } from "@/lib/db/generations";
import { requireUser } from "@/lib/supabase/auth";

type Context = { params: Promise<{ id: string; generationId: string }> };

/** Sets or clears the note under an image: `{ note: "final v1" | null }`. */
export async function PATCH(request: Request, { params }: Context) {
  return respond(async () => {
    const body = await readStrictJson(request, ["note"]);
    if (body.note !== null && typeof body.note !== "string") {
      throw new HttpError(400, "note must be text or null.");
    }
    const note = typeof body.note === "string" ? body.note.replace(/\s+/g, " ").trim() : "";
    if (note.length > MAX_NOTE) throw new HttpError(400, `Notes are up to ${MAX_NOTE} characters.`);
    const { id, generationId } = await params;
    await saveNote(await requireUser(), id, generationId, note || null);
  });
}
