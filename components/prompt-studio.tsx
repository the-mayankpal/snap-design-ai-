"use client";

import { CircleNotchIcon, WarningCircleIcon, XIcon } from "@phosphor-icons/react";

import { usePrompt } from "@/components/prompt-context";

/**
 * What happens after a prompt is sent, shown under the hero box and above the
 * docked bar: "Opening the editor…" or an error. Renders nothing while idle.
 */
export function PromptStudio({ compact = false }: { compact?: boolean }) {
  const { studio, dismiss } = usePrompt();

  if (studio.step === "idle") return null;

  const frame = `w-full rounded-[14px] border border-line bg-surface text-left ${
    compact
      ? "max-h-[55vh] overflow-y-auto p-4 shadow-[0_2px_6px_rgba(20,15,10,0.06),0_16px_40px_-12px_rgba(20,15,10,0.28)]"
      : "mt-3 p-5 shadow-[0_1px_2px_rgba(20,15,10,0.06)]"
  }`;

  if (studio.step === "opening") {
    return (
      <div className={frame} role="status" aria-live="polite">
        <p className="flex items-center gap-2.5 text-[14px] text-ink-900">
          <CircleNotchIcon
            size={16}
            weight="bold"
            className="shrink-0 animate-spin text-accent motion-reduce:animate-none"
            aria-hidden
          />
          Opening the editor…
        </p>
      </div>
    );
  }

  return (
    <div className={frame} role="alert">
      <div className="flex items-start gap-2.5">
        <WarningCircleIcon size={17} className="mt-px shrink-0 text-accent" aria-hidden />
        <p className="flex-1 text-[14px] leading-relaxed text-ink-900">{studio.message}</p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="-m-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] text-ink-300 transition-colors hover:bg-surface-muted hover:text-ink-900"
        >
          <XIcon size={14} aria-hidden />
        </button>
      </div>
    </div>
  );
}
