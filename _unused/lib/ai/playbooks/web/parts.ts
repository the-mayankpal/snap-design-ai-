import "server-only";

import type { DesignSettings } from "@/components/designs/design-model";
import { HttpError } from "@/lib/api";

/**
 * The web brief: the parts of a website design we extract from a prompt, ask
 * about, or default. `parseBrief` is the only way in — for the client's brief
 * and for the model's analysis alike.
 */

export const MODES = ["full_page", "section"] as const;
export const SECTIONS = [
  "hero",
  "features",
  "pricing",
  "testimonials",
  "cta",
  "footer",
  "about",
  "contact",
] as const;
/** Blocks a full page is built from: the single sections plus page staples. */
export const PAGE_BLOCKS = [
  "navbar",
  ...SECTIONS,
  "services",
  "gallery",
  "faq",
  "team",
  "stats",
] as const;
export const BUSINESS_TYPES = ["local", "startup", "regional", "premium", "enterprise"] as const;
export const VIBES = [
  "bold_trustworthy",
  "clean_modern",
  "premium_editorial",
  "playful",
  "minimal",
  "surprise",
] as const;
export const DEVICES = ["desktop", "mobile"] as const;

export type Mode = (typeof MODES)[number];
export type Section = (typeof SECTIONS)[number];
export type PageBlock = (typeof PAGE_BLOCKS)[number];
export type BusinessType = (typeof BUSINESS_TYPES)[number];
export type Vibe = (typeof VIBES)[number];
export type Device = (typeof DEVICES)[number];

export type WebBrief = {
  mode: Mode;
  /** Set when mode is `section`. */
  section: Section | null;
  /** Page order for `full_page`; `[section]` for a section. */
  sections: PageBlock[];
  industry: string;
  businessType: BusinessType;
  vibe: Vibe;
  businessName: string | null;
  audience: string | null;
  colors: string | null;
  keyContent: string | null;
  device: Device;
};

const TEXT_LIMITS = {
  industry: 80,
  businessName: 80,
  audience: 160,
  colors: 160,
  keyContent: 400,
} as const;

type TextKey = keyof typeof TEXT_LIMITS;
const BRIEF_KEYS = [
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
] as const satisfies readonly (keyof WebBrief)[];

const isOneOf = <T extends string>(list: readonly T[], value: unknown): value is T =>
  typeof value === "string" && (list as readonly string[]).includes(value);

/**
 * Validates a brief of unknown shape. `strict` (the client's brief) rejects
 * anything invalid with a 400; lenient (the model's output) drops invalid
 * fields and trims long text instead. Null means "not given".
 */
export function parseBrief(value: unknown, strict: boolean): Partial<WebBrief> {
  const invalid = (field: string) => {
    if (strict) throw new HttpError(400, `Invalid brief field: ${field}.`);
  };
  if (value === undefined || value === null) return {};
  if (typeof value !== "object" || Array.isArray(value)) {
    if (strict) throw new HttpError(400, "brief must be an object.");
    return {};
  }
  const raw = value as Record<string, unknown>;
  for (const key of Object.keys(raw)) {
    if (!isOneOf(BRIEF_KEYS, key)) invalid(key.slice(0, 40));
  }

  const brief: Partial<WebBrief> = {};
  const pick = <K extends keyof WebBrief>(
    key: K,
    list: readonly string[],
  ) => {
    const field = raw[key];
    if (field === undefined || field === null) return;
    if (isOneOf(list, field)) brief[key] = field as WebBrief[K];
    else invalid(key);
  };
  pick("mode", MODES);
  pick("section", SECTIONS);
  pick("businessType", BUSINESS_TYPES);
  pick("vibe", VIBES);
  pick("device", DEVICES);

  if (raw.sections !== undefined && raw.sections !== null) {
    const list = raw.sections;
    if (Array.isArray(list) && list.length <= 12 && list.every((item) => isOneOf(PAGE_BLOCKS, item))) {
      brief.sections = list;
    } else {
      invalid("sections");
    }
  }

  for (const key of Object.keys(TEXT_LIMITS) as TextKey[]) {
    const field = raw[key];
    if (field === undefined || field === null) continue;
    if (typeof field !== "string") {
      invalid(key);
      continue;
    }
    // Control characters out, whitespace collapsed: this text is quoted into prompts.
    const text = field.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
    if (!text) continue;
    if (text.length > TEXT_LIMITS[key]) {
      if (strict) invalid(key);
      else brief[key] = text.slice(0, TEXT_LIMITS[key]).trimEnd();
      continue;
    }
    brief[key] = text;
  }
  return brief;
}

/** Required parts still missing, in the order they should be asked. */
export function missingRequired(brief: Partial<WebBrief>) {
  const missing: ("mode" | "section" | "industry")[] = [];
  if (!brief.mode) missing.push("mode");
  if (brief.mode === "section" && !brief.section) missing.push("section");
  if (!brief.industry) missing.push("industry");
  return missing;
}

const random = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];

/** Used when the industry is skipped or "Surprise me" — specific, never "a business". */
const SURPRISE_INDUSTRIES = [
  "independent coffee roaster",
  "family-run roofing company",
  "boutique yoga studio",
  "neighbourhood bakery",
  "architecture studio",
  "craft brewery",
  "veterinary clinic",
  "landscape design firm",
];

const DEFAULT_PAGES: Record<BusinessType, PageBlock[]> = {
  local: ["navbar", "hero", "services", "about", "testimonials", "contact", "footer"],
  regional: ["navbar", "hero", "services", "stats", "testimonials", "cta", "footer"],
  startup: ["navbar", "hero", "features", "stats", "pricing", "faq", "cta", "footer"],
  premium: ["navbar", "hero", "about", "gallery", "testimonials", "contact", "footer"],
  enterprise: ["navbar", "hero", "features", "stats", "testimonials", "cta", "footer"],
};

/** A skipped vibe follows the business; "Surprise me" picks any strong one. */
const DEFAULT_VIBE: Record<BusinessType, Exclude<Vibe, "surprise">> = {
  local: "bold_trustworthy",
  regional: "bold_trustworthy",
  startup: "clean_modern",
  premium: "premium_editorial",
  enterprise: "clean_modern",
};

/** Fills every gap with a strong default. Optional free-text parts stay null for the composer to invent. */
export function completeBrief(brief: Partial<WebBrief>): WebBrief {
  const mode = brief.mode ?? "full_page";
  const businessType = brief.businessType ?? "local";
  const section = mode === "section" ? (brief.section ?? "hero") : null;
  const vibe =
    brief.vibe === "surprise"
      ? random(VIBES.filter((option) => option !== "surprise"))
      : (brief.vibe ?? DEFAULT_VIBE[businessType]);
  return {
    mode,
    section,
    sections: section
      ? [section]
      : brief.sections?.length
        ? brief.sections
        : DEFAULT_PAGES[businessType],
    industry: brief.industry ?? random(SURPRISE_INDUSTRIES),
    businessType,
    vibe,
    businessName: brief.businessName ?? null,
    audience: brief.audience ?? null,
    colors: brief.colors ?? null,
    keyContent: brief.keyContent ?? null,
    device: brief.device ?? "desktop",
  };
}

/**
 * Output size. The GPT image models take any WxH divisible by 16 with an
 * aspect between 1:3 and 3:1; a full page is drawn tall, like a page capture.
 */
export function imageSize(brief: WebBrief) {
  if (brief.device === "mobile") {
    return brief.mode === "full_page" ? { width: 720, height: 2160 } : { width: 864, height: 1536 };
  }
  return brief.mode === "full_page" ? { width: 1024, height: 2560 } : { width: 1536, height: 864 };
}

export function designSettings(brief: WebBrief): DesignSettings {
  return { ratio: brief.device === "mobile" ? "9:16" : "16:9", kind: "website", count: "1" };
}
