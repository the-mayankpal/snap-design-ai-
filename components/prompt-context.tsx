"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { supabaseBrowser } from "@/lib/supabase/browser";
import { openPendingPrompt, savePendingPrompt } from "@/components/prompt-handoff";
import { useDictation } from "@/components/use-dictation";

export const PROMPT_PLACEHOLDER =
  "A bold landing page for a family-run roofing company in Austin";

/** Anchor the docked bar watches to know when the hero prompt has scrolled away. */
export const HERO_PROMPT_ANCHOR_ID = "hero-prompt-anchor";

/**
 * The homepage prompt hands off to the editor rather than generating: signed
 * out, it goes to sign-up first; signed in, it opens a new design and the
 * prompt is sent there. See prompt-handoff.ts.
 */
export type Studio =
  | { step: "idle" }
  | { step: "opening" }
  | { step: "error"; message: string };

type PromptContextValue = {
  prompt: string;
  setPrompt: (value: string) => void;
  studio: Studio;
  busy: boolean;
  submit: () => void;
  dismiss: () => void;
  /** Speech-to-text into the prompt, shared by both bars. */
  dictation: { supported: boolean; listening: boolean; error: string | null; toggle: () => void };
};

const PromptContext = createContext<PromptContextValue | null>(null);

const OPEN_FAILED_COPY = "We couldn't open the editor just now. Please try again.";

/**
 * Shares one prompt value and one Studio state between the hero box and the
 * docked bar, so text typed in either survives the handover as the page
 * scrolls.
 */
export function PromptProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [studio, setStudio] = useState<Studio>({ step: "idle" });

  const busy = studio.step === "opening";
  const speech = useDictation(setPrompt);

  const submit = useCallback(async () => {
    const text = prompt.trim();
    if (!text || busy) return;
    if (speech.listening) speech.stop();
    savePendingPrompt(text);
    // Optimistic: the session in this browser. The editor's routes check it for real.
    const { data } = await supabaseBrowser().auth.getSession();
    if (!data.session) {
      router.push("/signup");
      return;
    }
    setStudio({ step: "opening" });
    try {
      // Stays "opening" while the editor loads.
      router.push(await openPendingPrompt());
    } catch {
      setStudio({ step: "error", message: OPEN_FAILED_COPY });
    }
  }, [prompt, busy, router, speech]);

  const dismiss = useCallback(() => setStudio({ step: "idle" }), []);

  const { supported, listening, error, start, stop } = speech;
  const value = useMemo(
    () => ({
      prompt,
      setPrompt,
      studio,
      busy,
      submit: () => void submit(),
      dismiss,
      dictation: {
        supported,
        listening,
        error,
        toggle: () => (listening ? stop() : start(prompt)),
      },
    }),
    [prompt, studio, busy, submit, dismiss, supported, listening, error, start, stop],
  );

  return (
    <PromptContext.Provider value={value}>{children}</PromptContext.Provider>
  );
}

export function usePrompt() {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error("usePrompt must be used inside <PromptProvider>");
  }
  return context;
}
