import "server-only";

import type { Playbook } from "@/lib/ai/playbooks/types";
import { WEB_EXAMPLES } from "@/lib/ai/playbooks/web/examples";
import {
  BUSINESS_TYPES,
  completeBrief,
  designSettings,
  DEVICES,
  imageSize,
  missingRequired,
  MODES,
  PAGE_BLOCKS,
  parseBrief,
  SECTIONS,
  VIBES,
  type WebBrief,
} from "@/lib/ai/playbooks/web/parts";
import { applyAnswers, buildQuestions } from "@/lib/ai/playbooks/web/questions";
import { WEB_ANALYZE_RULES, WEB_RULES } from "@/lib/ai/playbooks/web/rules";

const nullable = (values: readonly string[]) => ({
  type: ["string", "null"],
  enum: [...values, null],
});
const optionalText = { type: ["string", "null"] };

/** The web_section playbook: websites, full pages and single sections. */
export const webPlaybook: Playbook<WebBrief> = {
  analyzeRules: WEB_ANALYZE_RULES,
  // Strict Structured Outputs: every key required, absence expressed as null.
  analysisSchema: {
    type: "object",
    additionalProperties: false,
    required: [
      "mode",
      "section",
      "sections",
      "industry",
      "businessType",
      "vibe",
      "businessName",
      "audience",
      "colors",
      "keyContent",
      "device",
      "ask",
    ],
    properties: {
      mode: nullable(MODES),
      section: nullable(SECTIONS),
      sections: { type: ["array", "null"], items: { type: "string", enum: [...PAGE_BLOCKS] } },
      industry: optionalText,
      businessType: nullable(BUSINESS_TYPES),
      vibe: nullable(VIBES.filter((vibe) => vibe !== "surprise")),
      businessName: optionalText,
      audience: optionalText,
      colors: optionalText,
      keyContent: optionalText,
      device: nullable(DEVICES),
      ask: { type: "array", items: { type: "string", enum: ["businessType", "vibe"] } },
    },
  },
  readAnalysis: (output) => {
    const { ask, ...fields } =
      output && typeof output === "object" ? (output as Record<string, unknown>) : {};
    const brief = parseBrief(fields, false);
    if (brief.mode !== "section") delete brief.section;
    if (brief.mode === "section") delete brief.sections;
    const picked = Array.isArray(ask)
      ? ask.filter((id): id is string => typeof id === "string")
      : [];
    return { brief, questions: buildQuestions(brief, missingRequired(brief), picked) };
  },
  parseBrief: (value) => parseBrief(value, true),
  applyAnswers,
  complete: completeBrief,
  rules: WEB_RULES,
  examples: WEB_EXAMPLES,
  imageSize,
  designSettings,
};
