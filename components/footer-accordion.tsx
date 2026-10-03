"use client";

import { useState } from "react";
import Link from "next/link";
import { CaretDownIcon } from "@phosphor-icons/react";
import type { FooterColumn } from "@/components/footer-data";

/** Mobile-only: each footer column collapses behind its heading. */
export function FooterAccordion({ columns }: { columns: FooterColumn[] }) {
  const [openHeading, setOpenHeading] = useState<string | null>(null);

  return (
    <div className="border-t border-footer-line">
      {columns.map(({ heading, links }) => {
        const isOpen = openHeading === heading;
        const panelId = `footer-panel-${heading.toLowerCase()}`;

        return (
          <div key={heading} className="border-b border-footer-line">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenHeading(isOpen ? null : heading)}
              className="flex w-full items-center justify-between py-5 text-left text-[17px] font-medium text-white"
            >
              {heading}
              <CaretDownIcon
                size={20}
                className={`text-white transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </button>

            {/* Grid-rows trick animates to the panel's natural height without
                measuring it in JS. */}
            <div
              id={panelId}
              className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <ul className="overflow-hidden">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      tabIndex={isOpen ? undefined : -1}
                      className="block py-2.5 text-[16px] text-footer-link transition-colors hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
                <li aria-hidden className="h-3" />
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
