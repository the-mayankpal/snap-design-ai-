import { HttpError, readStrictJson, respond } from "@/lib/api";
import { chatReply, type ChatTurn } from "@/lib/ai/chat";
import { generationEnabled } from "@/lib/ai/pipeline";

export const maxDuration = 60;

const MAX_TURNS = 20;
const MAX_TEXT = 4000;

/**
 * Editor chat, text only: recent turns in, one assistant reply out.
 * Stateless — the editor saves both messages through `/api/designs/[id]/messages`.
 */
export async function POST(request: Request) {
  return respond(async () => {
    if (!generationEnabled()) throw new HttpError(403, "Generation is turned off on this server.");
    const body = await readStrictJson(request, ["messages"]);
    const history = parseTurns(body.messages);
    return { reply: await chatReply(history) };
  });
}

function parseTurns(value: unknown): ChatTurn[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_TURNS) {
    throw new HttpError(400, `Send 1–${MAX_TURNS} messages.`);
  }
  const turns = value.map((raw) => {
    const turn = raw as Partial<ChatTurn> | null;
    const valid =
      (turn?.role === "user" || turn?.role === "assistant") &&
      typeof turn.text === "string" &&
      turn.text.trim().length > 0 &&
      turn.text.length <= MAX_TEXT;
    if (!valid) throw new HttpError(400, "Malformed message.");
    return { role: turn.role!, text: turn.text! };
  });
  if (turns[turns.length - 1].role !== "user") {
    throw new HttpError(400, "The last message must be from the user.");
  }
  return turns;
}
