"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretDownIcon, ListIcon, XIcon } from "@phosphor-icons/react";

import { PenUnderline } from "@/components/brand/pen-underline";
import { ThemeToggle } from "@/components/theme-toggle";

/** Pages drawn for both themes (`data-themed`); the toggle shows only there (D79). */
const THEMED_PATHS = ["/", "/about"];

const NAV_LINKS = [
  { label: "Mockups", href: "/showcase", hasMenu: false },
  { label: "How it works", href: "/#how-it-works", hasMenu: false },
  { label: "About", href: "/about", hasMenu: false },
  { label: "FAQ", href: "/#faq", hasMenu: false },
] as const;

/** Just long enough for the bubble to register and for the first paint to land,
 *  so the browser has a start value to transition from. Not a wait. */
const REVEAL_DELAY_MS = 180;

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const readMotionPreference = () => window.matchMedia(MOTION_QUERY).matches;

/** The server cannot know the preference; assume motion is fine and correct on hydration. */
const serverMotionPreference = () => false;

export function Navbar() {
  // Read as an external store rather than setting state from an effect: the
  // preference is something we subscribe to, not something we compute once.
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    readMotionPreference,
    serverMotionPreference,
  );
  const [revealed, setRevealed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  // Close the mobile menu whenever the route changes. Comparing during render
  // (not in an effect) avoids a frame with the menu still open on the new page.
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const timer = window.setTimeout(() => setRevealed(true), REVEAL_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion]);

  // Anyone who asked for reduced motion gets the finished bar with no reveal.
  const open = prefersReducedMotion || revealed;

  // Contents use `invisible`, not just opacity: hidden visibility keeps the links
  // out of the tab order while the bar is still a bubble, so a keyboard user
  // cannot focus something they cannot see.
  //
  // Each group scales up from the edge nearest the centre, so the contents read
  // as emerging with the stretch instead of fading in on top of it.
  const contents =
    "transition-[opacity,transform,visibility,filter] duration-[820ms] " +
    "ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none";

  // The animated values are inline, not class-driven. A stylesheet applies only
  // once it has loaded; until then `max-width` would be unset and the bar would
  // lay out full width for a frame before snapping to the bubble. Inline styles
  // ship inside the HTML, so the collapsed state is correct from first paint.
  const contentsStyle = {
    opacity: open ? 1 : 0,
    visibility: open ? ("visible" as const) : ("hidden" as const),
    transform: open ? "scale(1)" : "scale(0.94)",
    filter: open ? "blur(0px)" : "blur(3px)",
    transitionDelay: open ? "240ms" : "0ms",
  };

  return (
    // Floating glass bar: lifted off the top edge and pinned above the page so
    // the hero image scrolls underneath it and shows through the blur.
    // The header box is transparent but tall on phones (it holds the menu
    // panel, which keeps its layout space while hidden), so it must not catch
    // taps itself — otherwise it silently blocks the top ~340px of the page.
    // Only the bar and the open menu take pointer events.
    <header
      ref={headerRef}
      // Always the opposite of the page: black on light, white on the dark homepage (D79).
      data-invert
      className="pointer-events-none fixed inset-x-0 top-4 z-50 px-4"
    >
      <nav
        className={`pointer-events-auto relative mx-auto flex h-14 items-center justify-between overflow-hidden
                    rounded-2xl border border-line px-5
                    bg-surface/97 supports-[backdrop-filter]:bg-surface/94
                    backdrop-blur-xl backdrop-saturate-150
                    shadow-[0_1px_2px_rgba(20,15,10,0.05),0_10px_28px_-8px_rgba(20,15,10,0.20)]
                    transition-[max-width] duration-[1150ms]
                    ease-[cubic-bezier(0.16,1,0.3,1)]
                    will-change-[max-width] motion-reduce:transition-none`}
        style={{ maxWidth: open ? "1120px" : "56px" }}
      >
        {/* Brand */}
        <div
          className={`flex min-w-0 origin-left items-center ${contents}`}
          style={contentsStyle}
        >
          <Link
            href="/"
            className="relative shrink-0 text-[22px] font-extrabold leading-none tracking-[-0.045em] text-ink-900"
          >
            snapdesign
            <PenUnderline className="absolute -bottom-[10px] left-[-2px] h-[11px] w-[calc(100%+6px)]" />
          </Link>

        </div>

        {/* Primary navigation — centred in the bar, independent of how
            wide the brand and the actions are. */}
        <ul
          className={`absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-7 md:flex ${contents}`}
          style={contentsStyle}
        >
          {NAV_LINKS.map(({ label, href, hasMenu }) => (
            <li key={label}>
              <Link
                href={href}
                className="flex items-center gap-1.5 text-[15px] text-ink-500 transition-colors hover:text-ink-900"
              >
                {label}
                {hasMenu ? (
                  <CaretDownIcon size={11} weight="bold" aria-hidden />
                ) : null}
              </Link>
            </li>
          ))}
        </ul>

        {/* Account + conversion actions */}
        <div
          className={`flex shrink-0 origin-right items-center gap-3 ${contents}`}
          style={contentsStyle}
        >
          {THEMED_PATHS.includes(pathname) ? <ThemeToggle fallback="light" className="-mx-1 h-9 w-9 rounded-[10px] text-ink-500 hover:bg-surface-muted hover:text-ink-900" /> : null}
          <Link
            href="/login"
            className="hidden text-[15px] text-ink-500 transition-colors hover:text-ink-900 sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-ink-700 px-3.5 py-2 text-[14px] font-medium text-surface transition-opacity hover:opacity-90"
          >
            Design
          </Link>

          {/* Below `md` the links live in a menu. */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((value) => !value)}
            className="-mr-1.5 flex h-9 w-9 items-center justify-center rounded-[10px] text-ink-900 transition-colors hover:bg-surface-muted md:hidden"
          >
            {menuOpen ? (
              <XIcon size={20} weight="bold" aria-hidden />
            ) : (
              <ListIcon size={20} weight="bold" aria-hidden />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu — a second glass card under the bar, same material. */}
      <div
        id="mobile-menu"
        className={`mx-auto mt-2 max-w-[1120px] origin-top overflow-hidden rounded-2xl border border-line
                    bg-surface/97 supports-[backdrop-filter]:bg-surface/94 backdrop-blur-xl backdrop-saturate-150
                    shadow-[0_1px_2px_rgba(20,15,10,0.05),0_16px_36px_-10px_rgba(20,15,10,0.25)]
                    transition-[opacity,transform,visibility] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                    motion-reduce:transition-none md:hidden ${
                      menuOpen
                        ? "pointer-events-auto visible translate-y-0 scale-100 opacity-100"
                        : "invisible -translate-y-2 scale-[0.98] opacity-0"
                    }`}
      >
        <ul className="p-2">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <Link
                href={href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center rounded-[12px] px-3.5 py-3 text-[16px] text-ink-900 transition-colors hover:bg-surface-muted"
              >
                {label}
              </Link>
            </li>
          ))}
          {/* Sign in is in the bar from `sm` up; below that it lives here. */}
          <li className="mt-1 border-t border-line pt-1 sm:hidden">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center rounded-[12px] px-3.5 py-3 text-[16px] text-ink-500 transition-colors hover:bg-surface-muted hover:text-ink-900"
            >
              Sign in
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
