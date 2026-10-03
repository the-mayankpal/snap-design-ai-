"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Minimal shape of the Web Speech API. It is not in TypeScript's lib.dom, and
 * only the members used here are declared — enough to stay type-safe without
 * pulling in an ambient global declaration.
 */
type SpeechResult = { transcript: string };
type SpeechAlternatives = ArrayLike<SpeechResult> & { isFinal: boolean };

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<SpeechAlternatives> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getConstructor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// Support never changes during a session, so `subscribe` is a no-op. Reading it
// through useSyncExternalStore keeps the server snapshot `false` and avoids
// setting state from an effect just to feature-detect.
const noopSubscribe = () => () => {};

export function useDictation(onTranscript: (text: string) => void) {
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => getConstructor() !== null,
    () => false,
  );

  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognition = useRef<SpeechRecognitionLike | null>(null);
  const base = useRef("");
  const onTranscriptRef = useRef(onTranscript);

  // Keep the latest callback reachable without re-creating the recogniser.
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const stop = useCallback(() => {
    recognition.current?.stop();
  }, []);

  const start = useCallback((currentText: string) => {
    const Ctor = getConstructor();
    if (!Ctor) return;

    const instance = new Ctor();
    instance.continuous = true;
    instance.interimResults = true;
    instance.lang = navigator.language || "en-US";

    // Dictation appends to whatever was already typed, so a correction made
    // before speaking is not thrown away.
    base.current = currentText ? `${currentText.trimEnd()} ` : "";

    instance.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      onTranscriptRef.current(base.current + transcript);
    };

    instance.onerror = (event) => {
      setError(
        event.error === "not-allowed"
          ? "Microphone access was denied."
          : "Dictation stopped unexpectedly.",
      );
      setListening(false);
    };

    instance.onend = () => setListening(false);

    recognition.current = instance;
    setError(null);
    setListening(true);
    instance.start();
  }, []);

  // Never leave the microphone open if the panel unmounts mid-dictation.
  useEffect(() => () => recognition.current?.stop(), []);

  return { supported, listening, error, start, stop };
}
