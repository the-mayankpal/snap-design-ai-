"use client";

import { ArrowUpIcon } from "@phosphor-icons/react";
import { PROMPT_PLACEHOLDER, usePrompt } from "@/components/prompt-context";
import { MicButton } from "@/components/mic-button";
import { PromptStudio } from "@/components/prompt-studio";

export function PromptBox() {
  const { prompt, setPrompt, submit, busy, dictation } = usePrompt();
  const canSubmit = prompt.trim().length > 0 && !busy;

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="border-chase-dark relative min-h-[112px] w-full rounded-[18px] border border-black/[0.12] bg-surface dark:border-white/[0.32] p-5 shadow-[0_1px_2px_rgba(20,15,10,0.08),0_10px_24px_-8px_rgba(20,15,10,0.18),0_28px_60px_-24px_rgba(20,15,10,0.28)] transition-[border-color,box-shadow] focus-within:border-black/25 dark:focus-within:border-white/50 focus-within:shadow-[0_1px_2px_rgba(20,15,10,0.1),0_12px_28px_-8px_rgba(20,15,10,0.22),0_32px_64px_-24px_rgba(20,15,10,0.32)]"
      >
        <label htmlFor="hero-prompt" className="sr-only">
          Describe what you want to find
        </label>
        <textarea
          id="hero-prompt"
          // Three rows so the placeholder, which wraps to three lines on a
          // phone, is never clipped. Still within the box's min height on desktop.
          rows={3}
          maxLength={1000}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={PROMPT_PLACEHOLDER}
          className="w-full resize-none bg-transparent pr-24 text-[14px] leading-relaxed text-ink-900 outline-none placeholder:text-ink-300"
        />

        {dictation.error ? (
          <p className="absolute bottom-5 left-5 text-[12px] text-ink-300">{dictation.error}</p>
        ) : null}
        <MicButton className="absolute bottom-4 right-14 h-8 w-8 rounded-[9px]" />
        <button
          type="submit"
          aria-label="Submit prompt"
          disabled={!canSubmit}
          className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-[9px] bg-ink-900 text-surface transition-opacity hover:opacity-90 disabled:cursor-not-allowed"
        >
          <ArrowUpIcon size={15} weight="bold" aria-hidden />
        </button>
      </form>
      <PromptStudio />
    </>
  );
}
