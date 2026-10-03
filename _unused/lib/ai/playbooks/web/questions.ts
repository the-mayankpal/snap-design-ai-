import "server-only";

import { HttpError } from "@/lib/api";
import type { Question } from "@/lib/ai/playbooks/types";
import type { WebBrief } from "@/lib/ai/playbooks/web/parts";

/**
 * The only questions the web playbook can ask. The model chooses which ids to
 * ask; it never writes question text or options. Every question ends with
 * "Surprise me", and a skipped or surprise answer gets a default later.
 */

export const QUESTION_IDS = ["mode", "section", "industry", "businessType", "vibe"] as const;
export type QuestionId = (typeof QUESTION_IDS)[number];

export const SURPRISE = "surprise";
export const MAX_QUESTIONS = 3;

type Entry = {
  question: (brief: Partial<WebBrief>) => string;
  /** 3–5 options; "Surprise me" is appended automatically. */
  options: { label: string; value: string; apply: Partial<WebBrief> }[];
};

const BANK: Record<QuestionId, Entry> = {
  mode: {
    question: () => "A full page, or one section?",
    options: [
      { label: "Full landing page", value: "full_page", apply: { mode: "full_page" } },
      { label: "Hero section", value: "hero", apply: { mode: "section", section: "hero" } },
      { label: "Features section", value: "features", apply: { mode: "section", section: "features" } },
      { label: "Pricing section", value: "pricing", apply: { mode: "section", section: "pricing" } },
    ],
  },
  section: {
    question: () => "Which section should we design?",
    options: [
      { label: "Hero", value: "hero", apply: { section: "hero" } },
      { label: "Features", value: "features", apply: { section: "features" } },
      { label: "Pricing", value: "pricing", apply: { section: "pricing" } },
      { label: "Testimonials", value: "testimonials", apply: { section: "testimonials" } },
      { label: "Call to action", value: "cta", apply: { section: "cta" } },
    ],
  },
  industry: {
    question: () => "What's the business?",
    options: [
      { label: "Local trade or service", value: "local_service", apply: { industry: "local home-services trade" } },
      { label: "Restaurant or café", value: "restaurant", apply: { industry: "independent restaurant" } },
      { label: "Software startup", value: "software", apply: { industry: "B2B software startup" } },
      { label: "Health & wellness", value: "wellness", apply: { industry: "health and wellness studio" } },
      { label: "Creative studio", value: "creative", apply: { industry: "independent creative studio" } },
    ],
  },
  businessType: {
    question: (brief) =>
      brief.industry ? `What kind of ${brief.industry} business?` : "What kind of business is it?",
    options: [
      { label: "Local family-run", value: "local", apply: { businessType: "local" } },
      { label: "Growing regional", value: "regional", apply: { businessType: "regional" } },
      { label: "Premium", value: "premium", apply: { businessType: "premium" } },
      { label: "Startup", value: "startup", apply: { businessType: "startup" } },
    ],
  },
  vibe: {
    question: () => "What feel should it have?",
    options: [
      { label: "Bold & trustworthy", value: "bold_trustworthy", apply: { vibe: "bold_trustworthy" } },
      { label: "Clean & modern", value: "clean_modern", apply: { vibe: "clean_modern" } },
      { label: "Premium editorial", value: "premium_editorial", apply: { vibe: "premium_editorial" } },
      { label: "Playful", value: "playful", apply: { vibe: "playful" } },
      { label: "Minimal", value: "minimal", apply: { vibe: "minimal" } },
    ],
  },
};

const isQuestionId = (value: string): value is QuestionId =>
  (QUESTION_IDS as readonly string[]).includes(value);

/**
 * Required gaps first, then the model's picks for optional parts, at most
 * three, and only questions whose part is still unknown.
 */
export function buildQuestions(
  brief: Partial<WebBrief>,
  required: QuestionId[],
  picked: string[],
): Question[] {
  const ids: QuestionId[] = [];
  for (const id of [...required, ...picked]) {
    if (!isQuestionId(id) || ids.includes(id)) continue;
    if (id === "section" && brief.mode !== "section") continue;
    if (brief[id] !== undefined && !required.includes(id)) continue;
    ids.push(id);
  }
  return ids.slice(0, MAX_QUESTIONS).map((id) => ({
    id,
    question: BANK[id].question(brief),
    options: [
      ...BANK[id].options.map(({ label, value }) => ({ label, value })),
      { label: "Surprise me", value: SURPRISE },
    ],
  }));
}

/**
 * Applies clarify answers. Clarify is stateless, so any bank question may be
 * answered; each value must be one of that question's options or "surprise".
 */
export function applyAnswers(brief: Partial<WebBrief>, answers: unknown): Partial<WebBrief> {
  if (answers === undefined || answers === null) return brief;
  if (typeof answers !== "object" || Array.isArray(answers)) {
    throw new HttpError(400, "answers must be an object.");
  }
  const entries = Object.entries(answers as Record<string, unknown>);
  const next: Partial<WebBrief> = { ...brief };
  // Mode first, so a "section" answer lands on a section brief.
  entries.sort(([a], [b]) => Number(b === "mode") - Number(a === "mode"));
  for (const [id, value] of entries) {
    if (!isQuestionId(id)) throw new HttpError(400, `Unknown question: ${id.slice(0, 40)}.`);
    if (typeof value !== "string") throw new HttpError(400, `Invalid answer for ${id}.`);
    if (value === SURPRISE) {
      if (id === "vibe") next.vibe = "surprise";
      else delete next[id];
      continue;
    }
    const option = BANK[id].options.find((candidate) => candidate.value === value);
    if (!option) throw new HttpError(400, `Invalid answer for ${id}.`);
    Object.assign(next, option.apply);
  }
  return next;
}
