"use client";

import { useEffect, useState, type ReactNode } from "react";

export type TocItem = { id: string; label: string; icon: ReactNode };

/**
 * The legal pages' table of contents. The section currently being read is
 * filled in; "current" is whichever heading most recently crossed a line a
 * third of the way down the viewport.
 */
export function LegalToc({
  items,
  showTitle = true,
}: {
  items: TocItem[];
  showTitle?: boolean;
}) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const sections = items
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // A thin band a third of the way down: a section is "current" while
      // its content passes through it.
      { rootMargin: "-30% 0px -65% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="Table of contents">
      {showTitle ? (
        <p className="mb-3 text-[14px] font-semibold text-ink-900">Table of contents</p>
      ) : null}
      <ol className="space-y-0.5">
        {items.map(({ id, label, icon }) => {
          const isActive = id === active;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={isActive ? "location" : undefined}
                className={`flex items-center gap-2.5 rounded-[9px] px-2.5 py-[7px] text-[13px] transition-colors ${
                  isActive
                    ? "bg-ink-900 text-surface"
                    : "text-ink-500 hover:bg-surface-muted hover:text-ink-900"
                }`}
              >
                <span
                  aria-hidden
                  className={`flex shrink-0 ${isActive ? "text-surface" : "text-ink-300"}`}
                >
                  {icon}
                </span>
                {label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
