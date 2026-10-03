import { respond } from "@/lib/api";
import { createDesign, listDesigns } from "@/lib/db/designs";
import { requireUser } from "@/lib/supabase/auth";

/** The signed-in user's designs, newest-edited first. */
export async function GET() {
  return respond(async () => listDesigns(await requireUser()));
}

export async function POST() {
  return respond(async () => createDesign(await requireUser()), 201);
}
