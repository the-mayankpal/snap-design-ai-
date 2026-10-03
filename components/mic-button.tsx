"use client";

import { MicrophoneIcon, StopIcon } from "@phosphor-icons/react";

import { usePrompt } from "@/components/prompt-context";

/** Dictate into the homepage prompt. Hidden where the browser has no speech recognition. */
export function MicButton({ className = "", tabIndex }: { className?: string; tabIndex?: number }) {
  const { dictation } = usePrompt();
  if (!dictation.supported) return null;
  const { listening, toggle } = dictation;

  return (
    <button
      type="button"
      aria-label={listening ? "Stop dictation" : "Dictate your prompt"}
      aria-pressed={listening}
      title={listening ? "Stop" : "Dictate"}
      tabIndex={tabIndex}
      onClick={toggle}
      className={`flex shrink-0 items-center justify-center transition-colors ${
        listening ? "bg-accent text-white" : "text-ink-500 hover:bg-surface-muted hover:text-ink-900"
      } ${className}`}
    >
      {listening ? <StopIcon size={13} weight="fill" aria-hidden /> : <MicrophoneIcon size={17} aria-hidden />}
    </button>
  );
}
