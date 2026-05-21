"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSpeechRecognition } from "@/lib/voice/useSpeechRecognition";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg: "#0a0a0a",
  card: "#111111",
  cardBorder: "#2a2a2a",
  cardDone: "#0d1f0d",
  cardDoneBorder: "#1a3a1a",
  green: "#4ade80",
  greenDim: "#14532d",
  textLight: "#e8e4de",
  textMuted: "#a8a29e",
  textDim: "#78716c",
  orange: "#fb923c",
  orangeDim: "#431407",
  red: "#f87171",
  serif: "var(--ls-serif, 'Instrument Serif', serif)",
  sans: "var(--ls-sans, 'DM Sans', sans-serif)",
  mono: "var(--ls-mono, 'DM Mono', monospace)",
};

const TEST_ID = "rv-test-1";
const STORAGE_KEY = "rv-test-1-submitted";

// ─── Step definitions ─────────────────────────────────────────────────────────
interface Step {
  id: string;
  title: string;
  what: string;
  prompts?: string[];
  goTo?: { href: string; label: string };
  tip?: string;
}

const STEPS: Step[] = [
  {
    id: "step-01-landing",
    title: "First impression — the landing page",
    what: "Open resumeverdict.app fresh (or scroll to the top now). Before clicking anything — what does this page communicate in the first 5 seconds? Is it immediately clear what the tool does? Is the headline believable?",
  },
  {
    id: "step-02-upload",
    title: "Upload your resume",
    what: "Click 'Get my free verdict →' and paste or upload your current resume. How smooth is the upload or paste? Does the text preview look like your actual resume, or is something garbled?",
    goTo: { href: "/start", label: "Go to /start" },
  },
  {
    id: "step-03-role-jd",
    title: "Role mode — paste a job description",
    what: "In role-targeting mode, paste a real job description for a role you'd actually apply to. Does the mode feel self-explanatory without needing instructions? Is anything confusing before you hit submit?",
    prompts: ["Find a real JD from LinkedIn or Indeed — something you'd actually apply to. Don't use a made-up one, the tool is smarter with a real target."],
  },
  {
    id: "step-04-diagnosis",
    title: "Diagnosis — score and verdict",
    what: "Review your diagnosis card. Does the match score feel accurate? Do the critical gaps reflect what you'd expect? Is anything flagged that seems wrong? Does the GO / FIX FIRST / PASS verdict land correctly?",
  },
  {
    id: "step-05-score-report",
    title: "Score report download",
    what: "Click 'Download Score Report' on the diagnosis page. Open the downloaded PNG. Does it look sharp? Is the information legible? Is this something you'd share with a recruiter, post on LinkedIn, or keep for your own tracking?",
  },
  {
    id: "step-06-gap-closer",
    title: "Gap Closer — 30/60/90-day plan (FIX FIRST or PASS only)",
    what: "If your verdict was FIX FIRST or PASS, review the 30/60/90-day action plan below your diagnosis. Are the recommendations specific and realistic? Does any action feel generic or invented? Skip this step entirely if your verdict was GO.",
    tip: "Skip if your verdict was GO — the Gap Closer only shows for FIX FIRST and PASS.",
  },
  {
    id: "step-07-intake",
    title: "Intake questions",
    what: "Answer the intake questions. Were all questions easy to understand? Did any feel redundant, confusing, or like they were asking the wrong thing? Were there questions you wish it had asked but didn't?",
  },
  {
    id: "step-08-tailored-resume",
    title: "Tailored resume output",
    what: "Read your tailored resume. Does it sound like you, or like generic AI filler? Are the bullets specific and evidence-based, or vague? Click 'Download as .docx' — does the file open cleanly in Word or Pages?",
  },
  {
    id: "step-09-recruiter-scan",
    title: "6-second recruiter scan",
    what: "Click 'Run 6-Second Recruiter Scan' on the result page. Does the ADVANCE / REJECT / MAYBE verdict feel right for where your resume is right now? Is the 'one thing to change' actually useful, or obvious?",
  },
  {
    id: "step-10-cover-letter",
    title: "Cover letter",
    what: "Click 'Generate Cover Letter'. Read the first sentence — does it avoid the typical 'I am writing to express my interest' opener? Does the letter sound like something you'd actually send? Try the copy button.",
  },
  {
    id: "step-11-company-mode",
    title: "Company targeting mode — full flow",
    what: "Start a new run and switch to company targeting mode. Paste your resume + a URL for a company you're interested in. Does the company analysis feel accurate? Does the cold outreach draft sound like you, or like a bot?",
    goTo: { href: "/start", label: "Start new run" },
    prompts: ["Try a real company you'd actually want to work at — their careers page or homepage works fine."],
  },
  {
    id: "step-12-history",
    title: "Session history",
    what: "Go back to the start page after at least 2 runs. Does the history section appear? Is the information useful for tracking your progress across applications? Anything you wish it showed that it doesn't?",
    goTo: { href: "/start", label: "Back to start page" },
  },
  {
    id: "step-13-mobile",
    title: "Mobile experience",
    what: "If you're on desktop right now, try the full role-mode flow on your phone. What felt awkward on mobile? Any buttons too small to tap, text hard to read, layout broken, or inputs that triggered the zoom?",
    tip: "If you're already on mobile, describe how the experience feels overall — is it a phone-first tool or does it feel like a desktop app crammed into mobile?",
  },
  {
    id: "step-14-overall",
    title: "Overall — the one thing you'd change",
    what: "If you had exactly one change to make to this tool before you'd hand the URL to a friend who's job searching right now, what would it be? And what surprised you most — good or bad?",
  },
];

// ─── Per-step feedback input ──────────────────────────────────────────────────

interface FeedbackInputProps {
  testId: string;
  stepId: string;
  stepTitle: string;
  alreadySubmitted: boolean;
  onSubmitted: () => void;
}

function FeedbackInput({ testId, stepId, stepTitle, alreadySubmitted, onSubmitted }: FeedbackInputProps) {
  const speech = useSpeechRecognition();
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [phase, setPhase] = useState<"idle" | "recording" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showFollowup, setShowFollowup] = useState(false);

  useEffect(() => {
    if (mode === "voice" && (speech.finalTranscript || speech.interimTranscript)) {
      setText((speech.finalTranscript + " " + speech.interimTranscript).trim());
    }
  }, [mode, speech.finalTranscript, speech.interimTranscript]);

  const startVoice = useCallback(() => {
    if (!speech.isSupported) {
      setErrorMsg("Voice not available in this browser — type your feedback instead.");
      setMode("text");
      return;
    }
    setErrorMsg(null);
    setText("");
    speech.reset();
    speech.start();
    setMode("voice");
    setPhase("recording");
    navigator.vibrate?.(20);
  }, [speech]);

  const stopVoice = useCallback(() => {
    speech.stop();
    setPhase("idle");
    navigator.vibrate?.([12, 60, 12]);
  }, [speech]);

  const submit = useCallback(async () => {
    const value = text.trim();
    if (!value) { setErrorMsg("Speak or type something first."); return; }
    setErrorMsg(null);
    setPhase("sending");
    try {
      const res = await fetch("/api/test-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId, stepId, stepTitle, transcript: value, mode }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setPhase("done");
      setText("");
      speech.reset();
      onSubmitted();
    } catch {
      setPhase("error");
      setErrorMsg("Couldn't send. Check your connection and try again.");
    }
  }, [text, mode, testId, stepId, stepTitle, speech, onSubmitted]);

  if (alreadySubmitted && !showFollowup && phase === "idle") {
    return (
      <div style={{ marginTop: "0.875rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", padding: "0.625rem 0.875rem", background: T.greenDim, border: `1px solid ${T.cardDoneBorder}`, borderRadius: "8px" }}>
        <span style={{ fontFamily: T.mono, fontSize: "0.6875rem", letterSpacing: "0.06em", textTransform: "uppercase", color: T.green }}>
          ✓ Feedback received
        </span>
        <button onClick={() => setShowFollowup(true)} style={{ fontFamily: T.mono, fontSize: "0.6875rem", letterSpacing: "0.06em", textTransform: "uppercase", color: T.textMuted, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          Add more
        </button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div style={{ marginTop: "0.875rem", padding: "0.625rem 0.875rem", background: T.greenDim, border: `1px solid ${T.cardDoneBorder}`, borderRadius: "8px" }}>
        <span style={{ fontFamily: T.mono, fontSize: "0.6875rem", letterSpacing: "0.06em", textTransform: "uppercase", color: T.green }}>
          ✓ Got it — thanks.
        </span>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "0.875rem" }}>
      <p style={{ fontFamily: T.mono, fontSize: "0.625rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.textDim, marginBottom: "0.5rem" }}>
        Your take
      </p>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (mode === "voice" && phase !== "recording") setMode("text");
        }}
        rows={3}
        disabled={phase === "sending"}
        placeholder="Speak below, or type what you noticed."
        style={{ width: "100%", background: "#0d0d0d", border: `1px solid ${T.cardBorder}`, borderRadius: "8px", padding: "0.625rem 0.75rem", color: T.textLight, fontFamily: T.sans, fontSize: "1rem", resize: "vertical", outline: "none", boxSizing: "border-box" }}
      />
      <div style={{ marginTop: "0.625rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        {phase === "recording" ? (
          <button
            onClick={stopVoice}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.625rem 1rem", background: T.orange, border: "none", borderRadius: "999px", color: "#000", fontFamily: T.sans, fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", minHeight: "44px", animation: "pulse 1.5s ease-in-out infinite" }}
          >
            <StopIcon /> Stop — tap when done
          </button>
        ) : (
          <button
            onClick={startVoice}
            disabled={phase === "sending"}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.625rem 1rem", background: T.orange, border: "none", borderRadius: "999px", color: "#000", fontFamily: T.sans, fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", minHeight: "44px", opacity: phase === "sending" ? 0.5 : 1 }}
          >
            <MicIcon /> Talk
          </button>
        )}
        <button
          onClick={submit}
          disabled={phase === "sending" || !text.trim()}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.625rem 1rem", background: "none", border: `1px solid ${T.cardBorder}`, borderRadius: "8px", color: T.textMuted, fontFamily: T.sans, fontSize: "0.875rem", cursor: "pointer", minHeight: "44px", opacity: phase === "sending" || !text.trim() ? 0.4 : 1 }}
        >
          {phase === "sending" ? "Sending…" : "Send"}
        </button>
      </div>
      {phase === "recording" && (
        <p style={{ marginTop: "0.375rem", fontFamily: T.mono, fontSize: "0.625rem", letterSpacing: "0.08em", textTransform: "uppercase", color: T.orange }}>
          Recording — talk as long as you want, then tap Stop.
        </p>
      )}
      {errorMsg && (
        <p style={{ marginTop: "0.375rem", fontFamily: T.sans, fontSize: "0.8125rem", color: T.red }}>{errorMsg}</p>
      )}
    </div>
  );
}

// ─── Copy prompt button ───────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      try {
        const el = document.createElement("textarea");
        el.value = text;
        el.style.position = "fixed"; el.style.opacity = "0";
        document.body.appendChild(el); el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      } catch { return; }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }
  return (
    <button onClick={copy} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", background: "none", border: `1px solid ${T.cardBorder}`, borderRadius: "999px", color: T.textDim, fontFamily: T.mono, fontSize: "0.625rem", letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", minHeight: "32px" }}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function MicIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1a2.5 2.5 0 0 0-2.5 2.5v4a2.5 2.5 0 0 0 5 0v-4A2.5 2.5 0 0 0 8 1zM4 7.5a4 4 0 0 0 3.5 3.98V13H6a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1H8.5v-1.52A4 4 0 0 0 12 7.5a.5.5 0 0 0-1 0 3 3 0 0 1-6 0 .5.5 0 0 0-1 0z" fill="currentColor" />
    </svg>
  );
}
function StopIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" rx="2" fill="currentColor" />
    </svg>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function NicTest1Page() {
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());

  // Load submitted step IDs from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSubmitted(new Set(JSON.parse(raw) as string[]));
    } catch { /* ignore */ }
  }, []);

  const markSubmitted = useCallback((stepId: string) => {
    setSubmitted((prev) => {
      const next = new Set(prev);
      next.add(stepId);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const completedCount = STEPS.filter((s) => submitted.has(s.id)).length;

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: T.sans, paddingBottom: "5rem" }}>
      {/* Header */}
      <div style={{ padding: "2.5rem 1.25rem 2rem", maxWidth: "680px", margin: "0 auto" }}>
        <Link href="/" style={{ fontFamily: T.mono, fontSize: "0.625rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.textDim, textDecoration: "none", display: "block", marginBottom: "1.5rem" }}>
          ← resumeverdict.app
        </Link>
        <p style={{ fontFamily: T.mono, fontSize: "0.6875rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.green, marginBottom: "0.625rem" }}>
          Test round 1 · {completedCount}/{STEPS.length} done
        </p>
        <h1 style={{ fontFamily: T.serif, fontSize: "clamp(1.75rem, 5vw, 2.5rem)", fontWeight: 400, color: T.textLight, margin: "0 0 0.75rem" }}>
          Kick the tires, Nic.
        </h1>
        <p style={{ fontSize: "1rem", color: T.textMuted, lineHeight: 1.6, margin: 0 }}>
          Go through each step. Leave a quick voice note or a typed line about what you saw — whatever comes to mind. The mic keeps going until you tap Stop, so talk as long as you want.
        </p>

        {/* Progress bar */}
        <div style={{ marginTop: "1.5rem", height: "3px", background: T.cardBorder, borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(completedCount / STEPS.length) * 100}%`, background: T.green, borderRadius: "2px", transition: "width 0.4s ease" }} />
        </div>
      </div>

      {/* Steps */}
      <ol style={{ listStyle: "none", padding: "0 1.25rem", margin: "0 auto", maxWidth: "680px", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {STEPS.map((step, i) => {
          const isDone = submitted.has(step.id);
          return (
            <li
              key={step.id}
              style={{
                background: isDone ? T.cardDone : T.card,
                border: `1px solid ${isDone ? T.cardDoneBorder : T.cardBorder}`,
                borderRadius: "12px",
                padding: "1.25rem",
              }}
            >
              <div style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
                {/* Step number / checkmark */}
                <div style={{ flexShrink: 0, width: "2rem", height: "2rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: isDone ? T.greenDim : "#1a1a1a", border: `1px solid ${isDone ? T.green : T.cardBorder}`, fontFamily: T.mono, fontSize: "0.75rem", fontWeight: 700, color: isDone ? T.green : T.textDim }}>
                  {isDone ? "✓" : i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontFamily: T.sans, fontSize: "1rem", fontWeight: 700, color: T.textLight, margin: "0 0 0.5rem" }}>
                    {step.title}
                  </h2>
                  <p style={{ fontSize: "0.9375rem", color: T.textMuted, lineHeight: 1.65, margin: 0 }}>
                    {step.what}
                  </p>

                  {/* Prompts with copy button */}
                  {step.prompts?.map((p, idx) => (
                    <div key={idx} style={{ marginTop: "0.75rem", display: "flex", alignItems: "flex-start", gap: "0.625rem", background: "#0d0d0d", border: `1px solid ${T.cardBorder}`, borderRadius: "8px", padding: "0.75rem" }}>
                      <p style={{ flex: 1, fontFamily: T.sans, fontSize: "0.875rem", color: T.textMuted, fontStyle: "italic", margin: 0, lineHeight: 1.55 }}>&ldquo;{p}&rdquo;</p>
                      <CopyButton text={p} />
                    </div>
                  ))}

                  {/* Deep-link button */}
                  {step.goTo && (
                    <div style={{ marginTop: "0.75rem" }}>
                      <Link
                        href={step.goTo.href}
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem", background: T.green, borderRadius: "999px", color: "#000", fontFamily: T.sans, fontSize: "0.875rem", fontWeight: 700, textDecoration: "none", minHeight: "44px" }}
                      >
                        {step.goTo.label} →
                      </Link>
                    </div>
                  )}

                  {/* Tip */}
                  {step.tip && (
                    <p style={{ marginTop: "0.75rem", fontFamily: T.mono, fontSize: "0.6875rem", letterSpacing: "0.06em", color: T.textDim }}>
                      <span style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>Tip</span> — {step.tip}
                    </p>
                  )}

                  {/* Feedback input */}
                  <FeedbackInput
                    testId={TEST_ID}
                    stepId={step.id}
                    stepTitle={step.title}
                    alreadySubmitted={isDone}
                    onSubmitted={() => markSubmitted(step.id)}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Footer */}
      {completedCount === STEPS.length && (
        <div style={{ maxWidth: "680px", margin: "2rem auto 0", padding: "0 1.25rem", textAlign: "center" }}>
          <div style={{ background: T.greenDim, border: `1px solid ${T.cardDoneBorder}`, borderRadius: "12px", padding: "1.5rem" }}>
            <p style={{ fontFamily: T.serif, fontSize: "1.5rem", fontWeight: 400, color: T.green, margin: "0 0 0.5rem" }}>All done. Thank you.</p>
            <p style={{ fontSize: "0.9375rem", color: T.textMuted, margin: 0 }}>Every note went straight to Paul in Slack. This helps more than you know.</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.75; }
        }
      `}</style>
    </div>
  );
}
