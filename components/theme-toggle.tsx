"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";

import { THEME_KEY } from "@/components/theme-script";

export type Theme = "light" | "dark";

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

const chosen = (): Theme | null => {
  const theme = document.documentElement.dataset.theme;
  return theme === "dark" || theme === "light" ? theme : null;
};

function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Private mode or blocked storage: the choice lasts for this visit only.
  }
  listeners.forEach((listener) => listener());
}

/**
 * Switches the whole site between light and dark (D79). `fallback` is how
 * this area looks before anyone has chosen; `className` styles it for its bar.
 */
export function ThemeToggle({ fallback, className = "" }: { fallback: Theme; className?: string }) {
  const theme = useSyncExternalStore(subscribe, () => chosen() ?? fallback, () => fallback);
  const dark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark theme"
      title={dark ? "Switch to light" : "Switch to dark"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={`flex shrink-0 items-center justify-center transition-colors ${className}`}
    >
      {dark ? <SunIcon size={18} aria-hidden /> : <MoonIcon size={18} aria-hidden />}
    </button>
  );
}
