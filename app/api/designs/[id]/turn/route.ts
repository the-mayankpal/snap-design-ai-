import { KIND_IDS, type KindId } from "@/components/editor/generate-options";
import { HttpError, readStrictJson, respond } from "@/lib/api";
import { generationEnabled } from "@/lib/ai/pipeline";
import {
  compileEditPrompt,
  compilePrompt,
  compileSeriesPrompt,
  sizeFor,
} from "@/lib/ai/studio/compiler";
import { KNOWLEDGE_VERSION } from "@/lib/ai/studio/constitution";
import { direct, type Turn } from "@/lib/ai/studio/director";
import { RATIO_IDS, RENDERING, type DesignSpec } from "@/lib/ai/studio/spec";
import { insertPlanned, loadStudio, type Asset } from "@/lib/db/generations";
import { isUuid } from "@/lib/ids";
import { allowTurn, freeAccount } from "@/lib/quota";
import { requireAccount } from "@/lib/supabase/auth";
import { signPaths } from "@/lib/storage/images";

type Context = { params: Promise<{ id: string }> };

export const maxDuration = 60;

const MAX_TURNS = 20;
const MAX_TEXT = 4000;

/**
 * One chat turn in the editor (D71): the art director reads the turn and the
 * canvas and returns a plan. A plan that makes an image is compiled and saved
 * as a pending generation; the browser shows the reply at once and then asks
 * `/api/generations/[id]/render` for the image. `targetId` is the image
 * selected on the canvas: edits default to it. The browser saves the chat
 * messages itself, as before.
 */
export async function POST(request: Request, { params }: Context) {
  return respond(async () => {
    if (!generationEnabled()) throw new HttpError(403, "Generation is turned off on this server.");
    const { id } = await params;
    const body = await readStrictJson(request, ["messages", "settings", "targetId"]);
    const messages = parseTurns(body.messages);

    const user = await requireAccount();
    const owner = user.id;
    // Free tier (D83): refused here, before any model call, once the allowance is used.
    await allowTurn(await freeAccount(user));
    const targetId = typeof body.targetId === "string" && isUuid(body.targetId) ? body.targetId : null;
    const studio = await loadStudio(owner, id, targetId);
    const selected = parseSelected(body.settings, studio.settings);

    const viewed = studio.selected ?? studio.assets.at(-1) ?? null;
    const viewUrl = viewed ? (await signPaths([viewed.imagePath])).get(viewed.imagePath) : undefined;

    const { plan, ms } = await direct({
      messages,
      selected,
      style: studio.style,
      assets: studio.assets.map(({ handle, spec, note }) => ({ handle, spec, note })),
      focus: studio.selected?.handle ?? null,
      view: viewed && viewUrl ? { handle: viewed.handle, url: viewUrl } : null,
    });

    const answer = {
      reply: plan.reply,
      suggestions: plan.suggestions,
      clarify: plan.clarify,
    };
    if (!RENDERING.includes(plan.action) || !plan.design) return { ...answer, pending: null };

    // Edits, variations and series need something to build on; without it this is a new design.
    const target =
      plan.action === "new"
        ? null
        : (studio.assets.find((asset) => asset.handle === plan.target) ??
          studio.selected ??
          studio.assets.at(-1) ??
          null);
    const action = target ? plan.action : "new";
    const spec = settle(plan.design, action, target, studio.style);

    const size = sizeFor(spec.ratio);
    const finalPrompt =
      action === "edit"
        ? compileEditPrompt(spec)
        : action === "series_next"
          ? compileSeriesPrompt(spec)
          : compilePrompt(spec);

    const generationId = await insertPlanned({
      designId: id,
      parentId: target?.id ?? null,
      action,
      rawPrompt: messages.at(-1)!.text,
      spec,
      finalPrompt,
      ...size,
      knowledgeVersion: KNOWLEDGE_VERSION,
      planMs: ms,
    });
    return { ...answer, pending: { id: generationId, ...size } };
  });
}

/**
 * Code has the last word on what must not drift: an edit keeps its asset's
 * shape, and the next in a series keeps the project's look whatever the model
 * chose.
 */
function settle(
  spec: DesignSpec,
  action: string,
  target: Asset | null,
  style: Awaited<ReturnType<typeof loadStudio>>["style"],
): DesignSpec {
  if (action === "edit" && target) return { ...spec, ratio: target.spec.ratio };
  if (action === "series_next" && style) {
    const { palette, custom, ...direction } = style;
    return {
      ...spec,
      direction: { ...spec.direction, ...direction },
      custom: { ...spec.custom, ...custom },
      palette: spec.palette ?? palette,
    };
  }
  return spec;
}

function parseTurns(value: unknown): Turn[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_TURNS) {
    throw new HttpError(400, `Send 1–${MAX_TURNS} messages.`);
  }
  const turns = value.map((raw) => {
    const turn = raw as Partial<Turn> | null;
    const valid =
      (turn?.role === "user" || turn?.role === "assistant") &&
      typeof turn.text === "string" &&
      turn.text.trim().length > 0 &&
      turn.text.length <= MAX_TEXT;
    if (!valid) throw new HttpError(400, "Malformed message.");
    return { role: turn.role!, text: turn.text! };
  });
  if (turns.at(-1)!.role !== "user") {
    throw new HttpError(400, "The last message must be from the user.");
  }
  return turns;
}

/** The editor's current ratio and type; the saved settings fill anything missing or invalid. */
function parseSelected(value: unknown, saved: { ratio: string; kind: KindId }) {
  const raw = (value ?? {}) as { ratio?: unknown; kind?: unknown };
  return {
    ratio: typeof raw.ratio === "string" && RATIO_IDS.includes(raw.ratio) ? raw.ratio : saved.ratio,
    kind: KIND_IDS.includes(raw.kind as KindId) ? (raw.kind as KindId) : saved.kind,
  };
}
