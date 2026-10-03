import { LEGAL } from "@/components/legal/legal-data";

export type FooterColumn = {
  heading: string;
  links: { label: string; href: string }[];
};

/** Shared by the desktop column grid and the mobile accordions. */
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Browse",
    links: [
      { label: "Home", href: "/" },
      { label: "Mockups", href: "/showcase" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", href: "/about" },
      // No contact page yet — straight to the inbox.
      { label: "Contact", href: `mailto:${LEGAL.email}` },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

/** Every account we plan to have. Those still pointing at "#" are not live yet. */
const ALL_SOCIAL_LINKS = [
  { label: "Instagram", href: "#", icon: "instagram" },
  { label: "Twitter", href: "#", icon: "x" },
  { label: "TikTok", href: "#", icon: "tiktok" },
] as const;

/** Only accounts that exist: a "#" link is a dead end for visitors and crawlers alike. */
export const SOCIAL_LINKS = ALL_SOCIAL_LINKS.filter((link) => link.href !== "#");
