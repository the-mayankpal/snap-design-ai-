import type { ReactNode } from "react";
import Link from "next/link";
import { CaretDownIcon, InfoIcon } from "@phosphor-icons/react/ssr";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { LEGAL } from "@/components/legal/legal-data";
import { LegalToc } from "@/components/legal/legal-toc";
import { PenUnderline } from "@/components/brand/pen-underline";

export type LegalSection = {
  id: string;
  heading: string;
  /** A 16px Phosphor icon for the table of contents. */
  icon: ReactNode;
  body: ReactNode;
};

/**
 * Shared layout for /terms and /privacy: a notebook-paper banner with the title, then a
 * sticky table of contents beside a single reading column. The intro becomes
 * the first entry, "Introduction", so the contents always start at the top.
 */
export function LegalPage({
  title,
  subtitle,
  introHeading,
  intro,
  sections,
  sibling,
}: {
  title: string;
  subtitle: string;
  introHeading: string;
  intro: ReactNode;
  sections: LegalSection[];
  /** The other legal document, linked at the foot. */
  sibling: { label: string; href: string };
}) {
  const all: LegalSection[] = [
    { id: "introduction", heading: "Introduction", icon: <InfoIcon size={16} />, body: intro },
    ...sections,
  ];
  const tocItems = all.map(({ id, heading, icon }) => ({ id, label: heading, icon }));

  return (
    <main className="flex-1">
      <Navbar />

      {/* Banner — notebook paper, as on About, with the brand's pen stroke
          under the title. The document itself stays plain and structured. */}
      <header className="lined-paper border-b border-line px-6 pb-14 pt-36 text-center sm:pb-16 sm:pt-40">
        <h1 className="relative mx-auto w-fit font-serif text-[clamp(2.4rem,6vw,4.25rem)] font-bold leading-none tracking-[-0.03em] text-ink-900">
          {title}
          <PenUnderline className="absolute -bottom-[0.22em] left-[-2%] h-[0.2em] w-[104%]" />
        </h1>
        <p className="mx-auto mt-7 max-w-[520px] text-balance text-[15px] text-ink-500 sm:text-[16px]">
          {subtitle}
        </p>
        <p className="mt-6 inline-flex items-center gap-1.5 rounded-[6px] border border-black/[0.1] bg-surface px-2 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink-500">
          Last updated <span className="text-accent">{LEGAL.updated}</span>
        </p>
      </header>

      <div className="mx-auto grid w-full max-w-[1080px] gap-10 px-6 pb-24 pt-14 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16 lg:pt-20">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          {/* Phones: folded away, so the text is not pushed below a long list. */}
          <details className="group rounded-[18px] bg-surface-muted lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-[14px] font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
              Table of contents
              <CaretDownIcon
                size={14}
                weight="bold"
                className="text-ink-300 transition-transform duration-200 group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <div className="px-3 pb-3">
              <LegalToc items={tocItems} showTitle={false} />
            </div>
          </details>
          {/* Desktop: always open, following the reader down the page. */}
          <div className="hidden lg:block">
            <LegalToc items={tocItems} />
          </div>
        </aside>

        <article className="max-w-[680px]">
          {all.map(({ id, heading, body }, index) => (
            <section
              key={id}
              id={id}
              className={`scroll-mt-28 ${index === 0 ? "" : "mt-14 border-t border-line pt-12"}`}
            >
              <h2 className="text-[clamp(1.5rem,3vw,1.9rem)] font-semibold tracking-[-0.02em] text-ink-900">
                {index === 0 ? introHeading : heading}
              </h2>
              <div className="mt-5 space-y-4 text-[15px] leading-[1.8] text-ink-500 [&_a]:text-ink-900 [&_a]:underline [&_a]:decoration-ink-900/25 [&_a]:underline-offset-2 hover:[&_a]:decoration-ink-900/60 [&_li]:pl-1 [&_li]:marker:text-ink-300 [&_strong]:font-semibold [&_strong]:text-ink-900 [&_ul]:list-disc [&_ul]:space-y-3 [&_ul]:pl-5">
                {body}
              </div>
            </section>
          ))}

          <p className="mt-16 rounded-[18px] bg-surface-muted px-6 py-5 text-[14px] leading-relaxed text-ink-500">
            Questions? Write to{" "}
            <a
              href={`mailto:${LEGAL.email}`}
              className="text-ink-900 underline decoration-ink-900/25 underline-offset-2"
            >
              {LEGAL.email}
            </a>
            . See also our{" "}
            <Link
              href={sibling.href}
              className="text-ink-900 underline decoration-ink-900/25 underline-offset-2"
            >
              {sibling.label}
            </Link>
            .
          </p>
        </article>
      </div>

      <Footer />
    </main>
  );
}
