import "server-only";

import type { Playbook } from "@/lib/ai/playbooks/types";
import { webPlaybook } from "@/lib/ai/playbooks/web/playbook";

export type { Playbook, Question } from "@/lib/ai/playbooks/types";

/**
 * Every category the router can recognise. Only categories with a playbook
 * in PLAYBOOKS are enabled; the rest are routed correctly and answered with
 * "coming soon" rather than being forced into another category.
 */
export const CATEGORY_IDS = [
  "web_section",
  "slide_deck",
  "social_post",
  "menu",
  "business_card",
  "greeting_card",
  "packaging",
  "sticker",
  "invoice",
] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

type CategoryInfo = {
  /** Chip label. */
  label: string;
  /** For "… are coming soon". */
  plural: string;
  /** Shown to the router so it can tell categories apart. */
  examples: string;
  /** Produces a set of images (slides, posts, menu pages) rather than one. */
  multiOutput: boolean;
  /** Build phase that enables it. */
  phase: number;
};

export const CATEGORIES: Record<CategoryId, CategoryInfo> = {
  web_section: {
    label: "Website",
    plural: "Websites",
    examples: "landing page, homepage, hero, features, pricing, testimonials, CTA, footer section",
    multiOutput: false,
    phase: 1,
  },
  slide_deck: {
    label: "Slide deck",
    plural: "Slide decks",
    examples: "pitch deck, presentation, slides",
    multiOutput: true,
    phase: 4,
  },
  social_post: {
    label: "Social post",
    plural: "Social posts",
    examples: "Instagram post or story, LinkedIn post, ad creative, banner ad",
    multiOutput: true,
    phase: 4,
  },
  menu: {
    label: "Menu",
    plural: "Menus",
    examples: "restaurant, café or bar menu",
    multiOutput: true,
    phase: 4,
  },
  business_card: {
    label: "Business card",
    plural: "Business cards",
    examples: "business card, front and back",
    multiOutput: false,
    phase: 5,
  },
  greeting_card: {
    label: "Greeting card",
    plural: "Greeting cards",
    examples: "birthday, wedding, thank-you, festival or holiday card, invitation",
    multiOutput: false,
    phase: 5,
  },
  packaging: {
    label: "Packaging",
    plural: "Packaging designs",
    examples: "box, label, pouch, bottle or can design",
    multiOutput: false,
    phase: 5,
  },
  sticker: {
    label: "Sticker",
    plural: "Stickers",
    examples: "die-cut sticker, sticker sheet",
    multiOutput: false,
    phase: 5,
  },
  invoice: {
    label: "Invoice",
    plural: "Invoices",
    examples: "branded invoice, receipt or quote layout",
    multiOutput: false,
    phase: 5,
  },
};

/** Category → playbook. A category is enabled exactly when it has one here. */
const PLAYBOOKS: Partial<Record<CategoryId, Playbook<unknown>>> = {
  web_section: webPlaybook,
};

export const isCategoryId = (value: unknown): value is CategoryId =>
  typeof value === "string" && (CATEGORY_IDS as readonly string[]).includes(value);

export const isEnabled = (category: CategoryId) => PLAYBOOKS[category] !== undefined;

export function playbookFor(category: CategoryId) {
  return PLAYBOOKS[category] ?? null;
}

/** Chips for "What are you making?" — enabled categories first. */
export function categoryOptions() {
  return [...CATEGORY_IDS]
    .sort((a, b) => Number(isEnabled(b)) - Number(isEnabled(a)))
    .map((id) => ({ label: CATEGORIES[id].label, value: id, available: isEnabled(id) }));
}

export function comingSoonMessage(category: CategoryId) {
  return `${CATEGORIES[category].plural} are coming soon. Right now snapdesign designs websites — try a landing page or a single section.`;
}
