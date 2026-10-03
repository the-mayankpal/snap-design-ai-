import Link from "next/link";
import {
  InstagramLogoIcon,
  XLogoIcon,
  TiktokLogoIcon,
  CaretDownIcon,
  CurrencyDollarIcon,
} from "@phosphor-icons/react/ssr";

import { FOOTER_COLUMNS, SOCIAL_LINKS } from "@/components/footer-data";
import { FooterAccordion } from "@/components/footer-accordion";
import { NewsletterForm } from "@/components/newsletter-form";

const SOCIAL_ICONS = {
  instagram: InstagramLogoIcon,
  x: XLogoIcon,
  tiktok: TiktokLogoIcon,
} as const;

const NEWSLETTER_COPY =
  "The best designs made with snapdesign, in your inbox.";

/** Circular brand mark. Placeholder art — swap for the real logo when it exists. */
function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`flex h-12 w-12 items-center justify-center rounded-full border border-white/70 text-[19px] font-semibold text-white ${className}`}
    >
      s
    </span>
  );
}

/**
 * Oversized wordmark that spans the full footer width.
 * Drawn as SVG text with `textLength` so it fits the container exactly at any
 * viewport, which CSS font-size alone cannot guarantee.
 */
function Wordmark() {
  return (
    <svg
      viewBox="0 0 1000 215"
      className="block w-full text-white"
      role="img"
      aria-label="snapdesign"
    >
      <text
        x="0"
        y="165"
        textLength="1000"
        lengthAdjust="spacingAndGlyphs"
        fontSize="190"
        fontWeight="500"
        fill="currentColor"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        snapdesign
      </text>
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-footer-bg">
      <div className="mx-auto w-full max-w-[1680px] px-6 pt-16 md:px-10 md:pt-24">
        {/* ---------- Mobile ---------- */}
        <div className="md:hidden">
          <FooterAccordion columns={FOOTER_COLUMNS} />

          {SOCIAL_LINKS.length > 0 && (
            <div className="pt-8">
              <h3 className="text-[17px] font-medium text-white">Follow</h3>
              <ul className="mt-4 flex items-center gap-5">
                {SOCIAL_LINKS.map(({ label, href, icon }) => {
                  const Icon = SOCIAL_ICONS[icon];
                  return (
                    <li key={label}>
                      <Link
                        href={href}
                        aria-label={label}
                        className="block text-footer-link transition-colors hover:text-white"
                      >
                        <Icon size={26} aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="pt-8">
            {/* A label, not a heading: it introduces a control, not a section. */}
            <p className="text-[17px] font-medium text-white">Currency</p>
            {/* Presentational only — no multi-currency support is built yet. */}
            <button
              type="button"
              aria-label="Currency: US dollars"
              className="mt-4 flex items-center gap-1.5 text-white"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-footer-field">
                <CurrencyDollarIcon size={20} aria-hidden />
              </span>
              <CaretDownIcon size={14} aria-hidden />
            </button>
          </div>

          <div className="pt-10">
            <p className="text-[19px] leading-snug text-white">
              {NEWSLETTER_COPY}
            </p>
            <div className="mt-5">
              <NewsletterForm />
            </div>
          </div>
        </div>

        {/* ---------- Desktop ---------- */}
        <div className="hidden md:grid md:grid-cols-6 md:gap-8">
          <BrandMark />

          {FOOTER_COLUMNS.map(({ heading, links }) => (
            // A link group, not a section of the page: a labelled nav, not a heading.
            <nav key={heading} aria-label={heading}>
              <p className="text-[17px] font-medium text-white">{heading}</p>
              <ul className="mt-4 space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[16px] text-footer-link transition-colors hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {SOCIAL_LINKS.length > 0 && (
            <div>
              <h3 className="text-[17px] font-medium text-white">Follow</h3>
              <ul className="mt-4 space-y-2.5">
                {SOCIAL_LINKS.map(({ label, href, icon }) => {
                  const Icon = SOCIAL_ICONS[icon];
                  return (
                    <li key={label}>
                      <Link
                        href={href}
                        className="flex items-center gap-2.5 text-[16px] text-footer-link transition-colors hover:text-white"
                      >
                        <Icon size={20} aria-hidden />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Stays in the last column whether or not the Follow column is shown. */}
          <div className="col-start-6">
            <p className="text-[17px] leading-snug text-white">
              {NEWSLETTER_COPY}
            </p>
            <div className="mt-5">
              <NewsletterForm />
            </div>
          </div>
        </div>

        {/* ---------- Oversized wordmark ---------- */}
        <div className="pb-6 pt-16 md:pt-24">
          <Wordmark />
        </div>
      </div>
    </footer>
  );
}
