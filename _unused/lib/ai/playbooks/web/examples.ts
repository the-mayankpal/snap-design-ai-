import "server-only";

import type { WebBrief } from "@/lib/ai/playbooks/web/parts";

/**
 * Few-shot pairs for the compose step. They teach structure and voice, not
 * content — the system prompt forbids copying their colours, names or layouts.
 */
export const WEB_EXAMPLES: { brief: WebBrief; prompt: string }[] = [
  // SAMPLE — replace with owner's prompts
  {
    brief: {
      mode: "full_page",
      section: null,
      sections: ["navbar", "hero", "services", "about", "testimonials", "contact", "footer"],
      industry: "plumbing",
      businessType: "local",
      vibe: "bold_trustworthy",
      businessName: null,
      audience: "homeowners",
      colors: null,
      keyContent: null,
      device: "desktop",
    },
    prompt:
      "A complete desktop landing page for Harlow & Sons Plumbing, a family-run plumber in Leeds, shown as a flat full-width page capture. Off-white canvas with deep navy blocks and a single signal-yellow accent reserved for buttons and the phone number. Headlines in a heavy condensed grotesk, body in a plain humanist sans. Navbar: bold wordmark left; links Services, Areas, About, Reviews; a yellow button reading \"Call 0113 496 0182\". Hero split 7/5: left, the headline \"Leaks fixed today. Not next week.\" over a line about 24/7 call-outs across Leeds, a yellow \"Book a plumber\" button and a quiet text link \"See our prices\"; right, an authentic photo of a plumber in a navy work shirt fitting a boiler, a small card overlapping it showing 4.9 stars from 612 reviews. Services: three equal cards on white — Emergency repairs, Boiler servicing, Bathroom fitting — each with a thin line icon, two sentences and a starting price. About: navy band, photo of three generations of the family outside a van left, short story and \"Gas Safe registered since 1987\" right. Testimonials: three quotes with first names and neighbourhoods. Contact: form on the left, map and opening hours on the right. Footer: navy, three link columns, address and a small legal line. Consistent 8px radius buttons, 96px spacing between sections, 12-column grid.",
  },
  // SAMPLE — replace with owner's prompts
  {
    brief: {
      mode: "section",
      section: "pricing",
      sections: ["pricing"],
      industry: "project management software",
      businessType: "startup",
      vibe: "clean_modern",
      businessName: null,
      audience: "small agencies",
      colors: null,
      keyContent: null,
      device: "desktop",
    },
    prompt:
      "A single pricing section for Tallyboard, project management software for small agencies, filling the frame as it would sit on the live site. Warm grey background, near-black text, one clear emerald brand colour. Centred eyebrow \"Pricing\" above the headline \"Pay for the team you have\" in a tight geometric sans, with a one-line subhead and a monthly/yearly toggle showing \"2 months free\" on yearly. Three plan cards in a row, equal height, 24px gaps: Solo at $0, Studio at $12 per seat highlighted with an emerald border and a small \"Most popular\" tag, Agency at $29 per seat. Each card: plan name, price with \"/seat/month\", one-sentence summary, a full-width button (filled emerald on Studio, outlined elsewhere) and six checkmarked features in plain language. Below the cards, one quiet line: \"Every plan includes unlimited projects and client guests.\" Crisp flat UI rendering, 16px card radius, generous padding, precise alignment.",
  },
];
