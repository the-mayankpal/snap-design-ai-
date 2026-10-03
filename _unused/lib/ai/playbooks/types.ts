import "server-only";

import type { DesignSettings } from "@/components/designs/design-model";

export type Question = {
  id: string;
  question: string;
  options: { label: string; value: string }[];
};

/**
 * Everything the pipeline needs to know about one category. The pipeline
 * (pipeline.ts) is the same for every category; a new category is a new
 * folder with a playbook, registered in playbooks/index.ts.
 *
 * Method syntax on purpose: it lets a `Playbook<WebBrief>` sit in the
 * registry as a `Playbook<unknown>`, so the pipeline stays brief-agnostic.
 */
export type Playbook<Brief> = {
  /** Analyze step: system prompt and the Structured Outputs schema. */
  analyzeRules: string;
  analysisSchema: Record<string, unknown>;
  /** Turns the model's parsed output into a trusted brief and the questions to ask. */
  readAnalysis(output: unknown): { brief: Partial<Brief>; questions: Question[] };
  /** Validates a brief sent by the client; throws a 400 on anything invalid. */
  parseBrief(value: unknown): Partial<Brief>;
  /** Validates and merges clarify answers; throws a 400 on anything invalid. */
  applyAnswers(brief: Partial<Brief>, answers: unknown): Partial<Brief>;
  /** Fills every gap with a strong default. */
  complete(brief: Partial<Brief>): Brief;
  /** Compose step: category rules and few-shot pairs, after CORE_RULES. */
  rules: string;
  examples: { brief: Brief; prompt: string }[];
  imageSize(brief: Brief): { width: number; height: number };
  designSettings(brief: Brief): DesignSettings;
};
