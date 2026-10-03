"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { type KindId } from "@/components/editor/generate-options";

export {
  COUNTS,
  KIND_IDS,
  KIND_LABELS,
  RATIOS,
  type KindId,
} from "@/components/editor/generate-options";

type GenerateContextValue = {
  ratio: string;
  setRatio: (value: string) => void;
  kind: KindId;
  setKind: (value: KindId) => void;
  count: string;
  setCount: (value: string) => void;
};

const GenerateContext = createContext<GenerateContextValue | null>(null);

/**
 * The generate settings live here because they are shown in two places — the
 * inspector on desktop, and inside the chat panel on mobile. Local state would
 * give each copy its own selection.
 */
export function GenerateProvider({
  children,
  initial,
  onChange,
}: {
  children: ReactNode;
  /** Settings saved with the design being opened. */
  initial?: { ratio: string; kind: KindId; count: string };
  /** Fires after a user change — not for the initial values. */
  onChange?: (settings: { ratio: string; kind: KindId; count: string }) => void;
}) {
  const [ratio, setRatio] = useState<string>(initial?.ratio ?? "16:9");
  const [kind, setKind] = useState<KindId>(initial?.kind ?? "website");
  const [count, setCount] = useState<string>(initial?.count ?? "1");

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Compare against the last reported values rather than skipping the first
  // run: Strict Mode re-runs mount effects, and a spurious report would bump
  // the design's "last edited" time just for opening it.
  const reported = useRef(`${ratio}|${kind}|${count}`);
  useEffect(() => {
    const key = `${ratio}|${kind}|${count}`;
    if (key === reported.current) return;
    reported.current = key;
    onChangeRef.current?.({ ratio, kind, count });
  }, [ratio, kind, count]);

  const value = useMemo(
    () => ({ ratio, setRatio, kind, setKind, count, setCount }),
    [ratio, kind, count],
  );

  return (
    <GenerateContext.Provider value={value}>{children}</GenerateContext.Provider>
  );
}

export function useGenerate() {
  const context = useContext(GenerateContext);
  if (!context) {
    throw new Error("useGenerate must be used inside <GenerateProvider>");
  }
  return context;
}
