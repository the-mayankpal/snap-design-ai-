import { respond } from "@/lib/api";
import { freeAccount, freeSummary } from "@/lib/quota";
import { requireAccount } from "@/lib/supabase/auth";

/** The editor's "N of 5 free images left" (D83): `{ free: null }` means no limit. */
export async function GET() {
  return respond(async () => ({ free: await freeSummary(await freeAccount(await requireAccount())) }));
}
