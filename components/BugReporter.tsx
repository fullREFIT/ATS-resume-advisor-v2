"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Phase = "idle" | "open" | "recording" | "submitting" | "done" | "error";

// SpeechRecognition is not in the default TypeScript lib for browsers.
type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (e: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void;
  onend: () => void;
  onerror: () => void;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

export function BugReporter() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [description, setDescription] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setVoiceSupported(!!getSpeechRecognition());
  }, []);

  function openReporter() {
    setPhase("open");
    setDescription("");
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function closeReporter() {
    stopRecording();
    setPhase("idle");
    setDescription("");
  }

  function startRecording() {
    const SR = getSpeechRecognition();
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    rec.onend = () => {
      setPhase("open");
      recognitionRef.current = null;
    };
    rec.onerror = () => {
      setPhase("open");
      recognitionRef.current = null;
    };
    rec.start();
    recognitionRef.current = rec;
    setPhase("recording");
    navigator.vibrate?.(20);
  }

  function stopRecording() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      navigator.vibrate?.([12, 60, 12]);
    }
    setPhase("open");
  }

  async function submit() {
    const trimmed = description.trim();
    if (trimmed.length < 5) return;
    setPhase("submitting");
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: trimmed,
          page: pathname,
          browserInfo: navigator.userAgent.split(" ").slice(-2).join(" "),
          viewport: `${window.innerWidth}×${window.innerHeight}`,
        }),
      });
      setPhase("done");
      setTimeout(closeReporter, 2500);
    } catch {
      setPhase("error");
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={openReporter}
        aria-label="Report a problem"
        className="fixed bottom-5 right-5 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-soft-gray bg-pure-white shadow-sm hover:border-forge-red hover:text-forge-red transition-colors"
        style={{ display: phase !== "idle" ? "none" : undefined }}
      >
        <BugIcon />
      </button>

      {/* Overlay */}
      {phase !== "idle" && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-carbon-core/40 sm:items-center"
          onClick={(e) => e.target === e.currentTarget && closeReporter()}
        >
          <div className="w-full max-w-md rounded-t-2xl bg-pure-white p-6 shadow-xl sm:rounded-2xl">

            {/* Header */}
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="section-label mb-0.5">Feedback</p>
                <p className="text-base font-semibold text-carbon-core">
                  Report a problem
                </p>
              </div>
              <button
                onClick={closeReporter}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-echo hover:text-carbon-core"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Done state */}
            {phase === "done" && (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <span className="text-3xl">✓</span>
                <p className="text-sm font-semibold text-carbon-core">Got it — thanks.</p>
                <p className="text-sm text-echo">We&apos;ll look into it.</p>
              </div>
            )}

            {/* Error state */}
            {phase === "error" && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-carbon-core">
                  Something went wrong sending your report. Try again?
                </p>
                <button
                  onClick={() => setPhase("open")}
                  className="inline-flex min-h-10 items-center justify-center rounded-lg bg-forge-red px-4 text-sm font-semibold text-pure-white hover:bg-forge-red-hover"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Input state (open, recording, submitting) */}
            {(phase === "open" || phase === "recording" || phase === "submitting") && (
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what happened…"
                    rows={4}
                    className="w-full resize-none rounded-lg border border-soft-gray bg-ash-white p-3 text-sm text-carbon-core placeholder:text-echo focus:border-forge-red focus:outline-none"
                    disabled={phase === "submitting"}
                  />
                  {phase === "recording" && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-pure-white/80">
                      <span className="flex items-center gap-2 text-sm font-semibold text-forge-red">
                        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-forge-red" />
                        Listening…
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Voice button (if supported) */}
                  {voiceSupported && (
                    <button
                      onClick={phase === "recording" ? stopRecording : startRecording}
                      aria-label={phase === "recording" ? "Stop recording" : "Speak your issue"}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        phase === "recording"
                          ? "border-forge-red bg-forge-red text-pure-white"
                          : "border-soft-gray bg-pure-white text-echo hover:border-forge-red hover:text-forge-red"
                      }`}
                    >
                      <MicIcon />
                    </button>
                  )}

                  {/* Submit */}
                  <button
                    onClick={submit}
                    disabled={description.trim().length < 5 || phase === "submitting" || phase === "recording"}
                    className="flex-1 inline-flex min-h-10 items-center justify-center rounded-lg bg-forge-red px-4 text-sm font-semibold text-pure-white hover:bg-forge-red-hover disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {phase === "submitting" ? "Sending…" : "Send report"}
                  </button>
                </div>

                <p className="text-[0.6875rem] text-echo">
                  Sends the page you&apos;re on and your browser info along with your description.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function BugIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2a2 2 0 0 0-2 2v.5H4.5a.5.5 0 0 0 0 1H6v.5a4 4 0 0 0-4 4v.5H.5a.5.5 0 0 0 0 1H2v.5a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-.5h1.5a.5.5 0 0 0 0-1H14v-.5a4 4 0 0 0-4-4V5.5h1.5a.5.5 0 0 0 0-1H10V4a2 2 0 0 0-2-2zm1 3.5V4a1 1 0 0 0-2 0v1.5h2zm-3 1h4a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-3a3 3 0 0 1 3-3z"
        fill="currentColor"
      />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1a2.5 2.5 0 0 0-2.5 2.5v4a2.5 2.5 0 0 0 5 0v-4A2.5 2.5 0 0 0 8 1zM4 7.5a4 4 0 0 0 3.5 3.98V13H6a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1H8.5v-1.52A4 4 0 0 0 12 7.5a.5.5 0 0 0-1 0 3 3 0 0 1-6 0 .5.5 0 0 0-1 0z"
        fill="currentColor"
      />
    </svg>
  );
}
