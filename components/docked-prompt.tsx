"use client";

import { useEffect, useState } from "react";
import { ArrowUpIcon } from "@phosphor-icons/react";

import {
  HERO_PROMPT_ANCHOR_ID,
  PROMPT_PLACEHOLDER,
  usePrompt,
} from "@/components/prompt-context";
import { PromptStudio } from "@/components/prompt-studio";
import { MicButton } from "@/components/mic-button";

/**
 * A compact copy of the hero prompt that rises from the bottom of the viewport
 * once the hero one has scrolled out of sight, and follows the reader down the
 * page. It shares its value with the hero box through PromptProvider.
 */
export function DockedPrompt() {
  const { prompt, setPrompt, submit, busy } = usePrompt();
  const [docked, setDocked] = useState(false);
  const canSubmit = prompt.trim().length > 0 && !busy;

  useEffect(() => {
    const anchor = document.getElementById(HERO_PROMPT_ANCHOR_ID);
    if (!anchor) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      // Dock once the hero prompt has left upward; above the hero the real
      // box is visible. Once docked the bar stays for the rest of the page.
      setDocked(anchor.getBoundingClientRect().bottom < 0);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };

    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-center gap-2 px-4 pb-5 transition-[transform,opacity,visibility] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
        docked
          ? "visible translate-y-0 opacity-100"
          : "invisible translate-y-[130%] opacity-0"
      }`}
    >
      {/* Questions and progress sit above the bar, at its width. */}
      {docked ? (
        <div className="pointer-events-auto w-full max-w-[680px]">
          <PromptStudio compact />
        </div>
      ) : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        // The wrapper ignores taps (it spans the full width); only the bar takes them.
        className="pointer-events-auto border-chase flex w-full max-w-[680px] items-center gap-3 rounded-2xl border border-line bg-surface py-2.5 pl-5 pr-2.5 shadow-[0_2px_6px_rgba(20,15,10,0.06),0_16px_40px_-12px_rgba(20,15,10,0.28)]"
      >
        <label htmlFor="docked-prompt" className="sr-only">
          Describe what you want to find
        </label>
        <input
          id="docked-prompt"
          type="text"
          maxLength={1000}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={PROMPT_PLACEHOLDER}
          // Never focusable while hidden, even mid-transition.
          tabIndex={docked ? undefined : -1}
          className="min-w-0 flex-1 truncate bg-transparent text-[14px] text-ink-900 outline-none placeholder:text-ink-300"
        />
        <MicButton className="-mr-1 h-9 w-9 rounded-[10px]" tabIndex={docked ? undefined : -1} />
        <button
          type="submit"
          aria-label="Submit prompt"
          disabled={!canSubmit}
          tabIndex={docked ? undefined : -1}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-ink-900 text-surface transition-opacity hover:opacity-90 disabled:cursor-not-allowed"
        >
          <ArrowUpIcon size={15} weight="bold" aria-hidden />
        </button>
      </form>
    </div>
  );
}
