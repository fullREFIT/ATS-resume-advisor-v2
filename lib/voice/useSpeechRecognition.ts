"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const finalRef = useRef("");
  // True while user intends to be recording — used by onend to decide
  // whether to auto-restart (engine auto-ended) or stop naturally (user tapped Stop).
  const intendedRef = useRef(false);
  // Accumulated finals from prior sessions, preserved across auto-restarts.
  // Chrome Android auto-ends after ~7s of silence even with continuous=true;
  // this preserves transcript across restarts so the seam is invisible.
  const preservedRef = useRef("");

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) { setIsSupported(false); return; }
    setIsSupported(true);

    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      // Prefix-dedupe: Samsung Internet emits a new final for every growth point
      // of the same utterance ("the" → "the plumber" → "the plumber will").
      // Without dedupe, naive concat = "the the plumber the plumber will".
      const finals: string[] = [];
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        const text = (r[0]?.transcript ?? "").trim();
        if (!text) continue;
        if (r.isFinal) {
          const last = finals[finals.length - 1];
          if (last && (text.startsWith(last) || last.startsWith(text))) {
            finals[finals.length - 1] = text.length > last.length ? text : last;
          } else {
            finals.push(text);
          }
        } else {
          interim = text;
        }
      }
      const sessionFinal = finals.join(" ").replace(/\s+/g, " ").trim();
      const combined = preservedRef.current
        ? `${preservedRef.current} ${sessionFinal}`.replace(/\s+/g, " ").trim()
        : sessionFinal;
      finalRef.current = combined;
      setFinalTranscript(combined);
      setInterimTranscript(interim.replace(/\s+/g, " ").trim());
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      intendedRef.current = false;
      setError(e.error || "Speech recognition error");
    };

    rec.onend = () => {
      if (intendedRef.current && recognitionRef.current) {
        preservedRef.current = finalRef.current;
        try {
          (recognitionRef.current as { start: () => void }).start();
          return;
        } catch {
          setTimeout(() => {
            if (intendedRef.current && recognitionRef.current) {
              try { (recognitionRef.current as { start: () => void }).start(); return; }
              catch { setIsListening(false); }
            } else { setIsListening(false); }
          }, 120);
          return;
        }
      }
      setIsListening(false);
    };

    rec.onstart = () => setIsListening(true);
    recognitionRef.current = rec;

    return () => {
      try {
        rec.onresult = null; rec.onerror = null; rec.onend = null; rec.onstart = null;
        rec.abort();
      } catch { /* ignore */ }
      recognitionRef.current = null;
    };
  }, []);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    finalRef.current = ""; preservedRef.current = "";
    intendedRef.current = true;
    setFinalTranscript(""); setInterimTranscript("");
    try { recognitionRef.current.start(); }
    catch (err) {
      intendedRef.current = false;
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    intendedRef.current = false; // set BEFORE stop() to defeat auto-restart
    try { recognitionRef.current.stop(); } catch { /* ignore */ }
  }, []);

  const reset = useCallback(() => {
    finalRef.current = ""; preservedRef.current = "";
    intendedRef.current = false;
    setFinalTranscript(""); setInterimTranscript("");
    setError(null);
  }, []);

  return { isSupported, isListening, finalTranscript, interimTranscript, error, start, stop, reset };
}
