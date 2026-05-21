import Link from "next/link";
import { Instrument_Serif, DM_Sans, DM_Mono } from "next/font/google";
import { LandingNav } from "@/components/landing/LandingNav";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { RevealObserver } from "@/components/landing/RevealObserver";

const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--ls-serif",
});
const sans = DM_Sans({ subsets: ["latin"], variable: "--ls-sans" });
const mono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--ls-mono",
});

export const metadata = {
  title: "Resume Verdict — Honest Diagnosis, ATS-Optimized Output | Free",
  description:
    "Diagnose your resume against any job description. Get an honest score, understand exactly why you're ranked low, and download an ATS-safe tailored resume. No account. No fabrication. Free.",
  openGraph: {
    title: "Resume Verdict — Know Before You Apply",
    description:
      "Honest verdict. Real tailoring. No fabrication. Paste your resume and a job description — or a company URL for cold outreach. Free.",
    type: "website",
    url: "https://resumeverdict.app",
  },
};

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

const T = {
  light: "#e8e4de",
  muted: "#a8a29e",
  dim: "#78716c",
  faint: "#57534e",
  darkBody: "#44403c",
  darkSub: "#57534e",
  dark: "#1a1a1a",
  bgDark: "#0a0a0a",
  bgDarkAlt: "#0f0f0f",
  bgLight: "#f5f2ed",
  bgLightAlt: "#faf9f6",
  bgLightCard: "#e8e5df",
  borderDark: "#1f1f1f",
  borderLight: "#d6d3cd",
  green: "#4ade80",
  greenDim: "rgba(74,222,128,0.08)",
  greenBorder: "rgba(74,222,128,0.15)",
  greenDark: "#166534",
  red: "#991b1b",
  redLight: "#f87171",
  yellow: "#fbbf24",
} as const;

function ls(s: string) {
  return { fontFamily: `var(--ls-${s})` };
}

export default function LandingPage() {
  return (
    <div
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
      style={{ ...ls("sans"), background: T.bgDark, color: T.light, overflowX: "hidden" }}
    >
      <LandingNav />
      <RevealObserver />

      {/* ── HERO ── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 24px 96px",
          position: "relative",
          overflow: "hidden",
          background: T.bgDark,
        }}
      >
        {/* grain */}
        <div
          style={{
            position: "absolute",
            inset: "-50%",
            background: GRAIN_SVG,
            animation: "grain 8s steps(10) infinite",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        {/* glow */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: 600,
            height: 600,
            background: `radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            maxWidth: 760,
            textAlign: "center",
            position: "relative",
            zIndex: 2,
            animation: "fadeUp 1s cubic-bezier(.22,1,.36,1) forwards",
          }}
        >
          <span
            style={{
              display: "inline-block",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: T.green,
              ...ls("mono"),
              marginBottom: 28,
              padding: "6px 16px",
              border: `1px solid rgba(74,222,128,0.2)`,
              borderRadius: 100,
            }}
          >
            Free AI Resume Tool
          </span>

          <h1
            style={{
              ...ls("serif"),
              fontSize: "clamp(40px, 7vw, 72px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#fff",
              marginBottom: 24,
            }}
          >
            Your resume isn&apos;t getting callbacks.{" "}
            <em style={{ color: T.green, fontStyle: "italic" }}>Here&apos;s exactly why.</em>
          </h1>

          <p
            style={{
              fontSize: "clamp(16px, 2.2vw, 20px)",
              lineHeight: 1.65,
              color: T.muted,
              maxWidth: 580,
              margin: "0 auto 40px",
            }}
          >
            Paste your resume and a job description. Get an honest match score,
            understand what&apos;s working against you, and download an ATS-safe
            tailored resume — built from your actual experience, nothing invented.
          </p>

          <div
            style={{
              display: "flex",
              gap: 24,
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/start"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "16px 32px",
                background: "#fff",
                color: T.bgDark,
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 700,
                ...ls("sans"),
                textDecoration: "none",
                transition: "background 0.2s",
              }}
            >
              100% free - no signup →
            </Link>
            <Link
              href="#how-it-works"
              style={{
                display: "inline-flex",
                alignItems: "center",
                color: T.muted,
                padding: "12px 0",
                fontWeight: 500,
                fontSize: 15,
                textDecoration: "none",
              }}
            >
              How it works ↓
            </Link>
          </div>

          <p style={{ marginTop: 32, fontSize: 13, color: T.faint, ...ls("mono") }}>
            No signup · No API key · Your data stays in your browser
          </p>
        </div>
      </section>

      {/* ── VERDICT STRIP ── */}
      <section
        style={{
          background: T.bgDarkAlt,
          borderTop: `1px solid ${T.borderDark}`,
          borderBottom: `1px solid ${T.borderDark}`,
          padding: "28px 24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span style={{ color: T.dim, fontSize: 14 }}>Real verdicts:</span>
        {[
          { label: "GO", score: "72/100", bg: "#14532d", color: T.green, border: "#166534" },
          { label: "FIX FIRST", score: "58/100", bg: "#713f12", color: T.yellow, border: "#854d0e" },
          { label: "PASS", score: "34/100", bg: "#7f1d1d", color: T.redLight, border: T.red },
        ].map((v) => (
          <span
            key={v.label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.05em",
              ...ls("mono"),
              background: v.bg,
              color: v.color,
              border: `1px solid ${v.border}`,
            }}
          >
            {v.label}{" "}
            <span style={{ opacity: 0.7, fontWeight: 400 }}>{v.score}</span>
          </span>
        ))}
      </section>

      {/* ── PROBLEM ── */}
      <section style={{ padding: "96px 24px", background: T.bgDark, color: T.light }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div className="reveal">
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", ...ls("mono"), color: T.muted, marginBottom: 20 }}>
              The real problem
            </span>
            <h2 style={{ ...ls("serif"), fontSize: "clamp(32px, 5vw, 48px)", lineHeight: 1.1, letterSpacing: "-0.02em", color: "#fff", marginBottom: 32 }}>
              Most resume tools are lying to you.
            </h2>
          </div>
          <div className="reveal" style={{ transitionDelay: "0.1s" }}>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: T.muted, marginBottom: 32 }}>
              They give you a keyword score and tell you to optimize. They stuff
              your resume with phrases. They tell you everything looks great —
              because that&apos;s what keeps your subscription.
            </p>
            <p style={{ fontSize: 15, fontWeight: 600, color: T.light, marginBottom: 20, letterSpacing: "0.02em" }}>
              Here&apos;s what they don&apos;t tell you:
            </p>
          </div>
          {[
            { num: "92%", delay: "0.15s", text: "of applicant tracking systems don't auto-reject based on content. The myth of the ATS rejection wall is wrong. The real problem is being ranked so low that no recruiter ever sees you." },
            { num: "30%", delay: "0.2s", text: "of low rankings are caused by parsing failure. Multi-column resumes, tables, text boxes, and PDF exports from Canva or Figma are destroying your ATS score before a human reads a single word." },
            { num: "0", delay: "0.25s", text: "tools will tell you to pass on a role. The gap between your resume and this job might actually be disqualifying. You deserve to know that before you spend two hours tailoring." },
          ].map((s) => (
            <div
              key={s.num}
              className="reveal"
              style={{
                display: "flex",
                gap: 24,
                alignItems: "flex-start",
                padding: "24px 0",
                borderTop: `1px solid ${T.borderDark}`,
                borderBottom: `1px solid ${T.borderDark}`,
                transitionDelay: s.delay,
              }}
            >
              <span style={{ ...ls("serif"), fontSize: 48, fontWeight: 400, color: T.green, lineHeight: 1, minWidth: 80, textAlign: "right", letterSpacing: "-0.04em" }}>
                {s.num}
              </span>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: T.muted }}>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "96px 24px", background: T.bgLight, color: T.dark }} id="how-it-works">
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div className="reveal">
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", ...ls("mono"), color: T.dim, marginBottom: 20 }}>
              How it works
            </span>
            <h2 style={{ ...ls("serif"), fontSize: "clamp(32px, 5vw, 48px)", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 56 }}>
              Four steps. One honest answer.
            </h2>
          </div>
          {[
            { n: "01", delay: "0.05s", title: "Paste your resume + job description", body: "Upload a PDF or .docx, or paste plain text. Paste the full job description. Takes 60 seconds." },
            { n: "02", delay: "0.1s", title: "Get your diagnosis", body: "A match score from 0–100, broken down across four real dimensions: keyword match, experience relevance, trajectory fit, and ATS parsing quality. A verdict — GO, FIX FIRST, or PASS — with a plain-English explanation of what drove it." },
            { n: "03", delay: "0.15s", title: "Answer five targeted questions", body: "Not generic. Five questions specific to your resume and this job — designed to surface the STAR stories, quantified outcomes, and demonstrated evidence you have but didn't write down." },
            { n: "04", delay: "0.2s", title: "Download your tailored resume", body: "Your experience rewritten using exact language from the job description — your evidence, never invented. Every role preserved. An ATS-safe Word document ready to submit." },
          ].map((step) => (
            <div
              key={step.n}
              className="reveal"
              style={{ display: "flex", gap: 28, alignItems: "flex-start", padding: "32px 0", borderBottom: `1px solid ${T.borderLight}`, transitionDelay: step.delay }}
            >
              <span style={{ ...ls("mono"), fontSize: 14, fontWeight: 500, color: T.greenDark, minWidth: 32, paddingTop: 4 }}>
                {step.n}
              </span>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: T.darkSub }}>{step.body}</p>
              </div>
            </div>
          ))}
          <div className="reveal" style={{ transitionDelay: "0.25s", marginTop: 40, padding: "24px 28px", background: T.bgLightCard, borderRadius: 8, borderLeft: `3px solid ${T.greenDark}` }}>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: T.darkBody }}>
              <strong style={{ color: T.dark }}>Bonus — Interview prep.</strong>{" "}
              Likely questions, STAR stories to prepare, and suggested responses for the weak spots the model found.
            </p>
          </div>
        </div>
      </section>

      {/* ── NO FABRICATION ── */}
      <section style={{ padding: "96px 24px", background: T.bgDark, color: T.light }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div className="reveal">
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", ...ls("mono"), color: T.muted, marginBottom: 20 }}>
              The no-fabrication promise
            </span>
            <h2 style={{ ...ls("serif"), fontSize: "clamp(32px, 5vw, 48px)", lineHeight: 1.1, letterSpacing: "-0.02em", color: "#fff", marginBottom: 20 }}>
              Every bullet is fact-checked.{" "}
              <em style={{ color: T.green, fontStyle: "italic" }}>Twice.</em>
            </h2>
          </div>
          <div className="reveal" style={{ transitionDelay: "0.1s" }}>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: T.muted, marginBottom: 48 }}>
              Most AI writing tools generate plausible-sounding content. That&apos;s a
              problem when the content is your resume — because recruiters and hiring
              managers spot invented experience. A fabricated bullet that gets caught
              is worse than the original.
            </p>
          </div>
          {[
            { icon: "⛔", label: "Layer 1", delay: "0.15s", title: "The system prompt forbids it", body: "The model is explicitly instructed to use only what you provided. No inventing tools, metrics, outcomes, or roles." },
            { icon: "🎯", label: "Layer 2", delay: "0.2s", title: "The intake forces real evidence in", body: "Before tailoring runs, five targeted questions surface specific stories and outcomes from your actual background. The model rewrites from that evidence — not from inference." },
            { icon: "✓", label: "Layer 3", delay: "0.25s", title: "A second AI call reviews every bullet", body: "After the resume is generated, a separate fact-check call compares every rewritten bullet against your original resume and intake answers. Anything not supported gets flagged and regenerated." },
          ].map((layer) => (
            <div
              key={layer.label}
              className="reveal"
              style={{ display: "flex", gap: 24, alignItems: "flex-start", padding: "28px 0", borderBottom: `1px solid ${T.borderDark}`, transitionDelay: layer.delay }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 8, background: T.greenDim, border: `1px solid ${T.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                {layer.icon}
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: T.green, ...ls("mono") }}>{layer.label}</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: T.light, margin: "6px 0 8px" }}>{layer.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: T.muted }}>{layer.body}</p>
              </div>
            </div>
          ))}
          <div className="reveal" style={{ transitionDelay: "0.3s" }}>
            <p style={{ marginTop: 32, fontSize: 17, lineHeight: 1.7, color: T.light, fontWeight: 500, ...ls("serif"), fontStyle: "italic" }}>
              The result is a resume that&apos;s polished and targeted — and one you can actually stand behind.
            </p>
          </div>
        </div>
      </section>

      {/* ── COMPANY MODE ── */}
      <section style={{ padding: "96px 24px", background: T.bgLight, color: T.dark }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div className="reveal">
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", ...ls("mono"), color: T.dim, marginBottom: 20 }}>
              Not just for active job seekers
            </span>
            <h2 style={{ ...ls("serif"), fontSize: "clamp(28px, 4.5vw, 44px)", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 24 }}>
              Want to get in front of a company before a role is posted?
            </h2>
          </div>
          <div className="reveal" style={{ transitionDelay: "0.1s" }}>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: T.darkSub, marginBottom: 36 }}>
              Most people wait for job listings. The candidates who get hired at
              companies they actually want to work for don&apos;t. If there&apos;s a
              specific company on your list — a former client, a dream employer, a
              startup you&apos;ve followed — this tool can read their website and help
              you position your background for a cold outreach that has a real reason
              to exist.
            </p>
          </div>
          <div className="reveal" style={{ transitionDelay: "0.15s" }}>
            <div style={{ background: T.bgLightCard, borderRadius: 10, padding: 32, marginBottom: 36 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: T.dark, marginBottom: 16 }}>Paste a company URL. The tool:</p>
              {[
                "Reads what the company does and what it appears to value",
                "Maps where your background aligns",
                "Names the gaps that would weaken your pitch",
                "Asks five intake questions specific to cold outreach",
                "Produces a tailored resume, a positioning angle, and a draft message",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ color: T.greenDark, fontWeight: 700, fontSize: 14, ...ls("mono"), marginTop: 2 }}>→</span>
                  <span style={{ fontSize: 15, lineHeight: 1.6, color: T.darkBody }}>{item}</span>
                </div>
              ))}
              <p style={{ fontSize: 14, color: T.dim, marginTop: 16, fontStyle: "italic" }}>
                Everything grounded in what the company actually said about themselves. No invented company facts.
              </p>
            </div>
          </div>
          <div className="reveal" style={{ transitionDelay: "0.2s" }}>
            <Link
              href="/start"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 32px", background: T.dark, color: "#fff", borderRadius: 8, fontSize: 16, fontWeight: 700, ...ls("sans"), textDecoration: "none" }}
            >
              Try the company-targeting mode →
            </Link>
          </div>
        </div>
      </section>

      {/* ── BEFORE / AFTER ── */}
      <section style={{ padding: "96px 24px", background: T.bgLightAlt, color: T.dark }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div className="reveal">
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", ...ls("mono"), color: T.dim, marginBottom: 20 }}>
              What it produces
            </span>
            <h2 style={{ ...ls("serif"), fontSize: "clamp(28px, 4.5vw, 44px)", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 16 }}>
              Real tailoring. Not a rewrite of your weakest version.
            </h2>
          </div>
          <div className="reveal" style={{ transitionDelay: "0.1s" }}>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: T.darkSub, marginBottom: 8 }}>
              We ran this tool against a real candidate — a sales leader applying
              for a Sales Manager role — using their current resume and the job
              description. Here&apos;s what changed:
            </p>
            <div style={{ overflowX: "auto", margin: "32px 0 0" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", ...ls("sans"), fontSize: 14 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", ...ls("mono"), color: T.dim, borderBottom: `2px solid ${T.borderLight}` }} />
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", ...ls("mono"), color: T.dim, borderBottom: `2px solid ${T.borderLight}` }}>Before</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", ...ls("mono"), color: T.greenDark, borderBottom: `2px solid ${T.borderLight}` }}>After</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Match score", "62/100 — FIX FIRST", "72/100 — GO"],
                    ["Score breakdown", "2-sentence summary", "4 components with individual scores"],
                    ["Roles in output", "Flat bullet list (0 roles)", "4 full role entries"],
                    ["Total bullets", "7", "17"],
                    ["Exact JD phrases", "~5 (paraphrased)", "13 verbatim"],
                    ["Missed keywords", "Not disclosed", "1, with explicit reason"],
                  ].map(([label, before, after]) => (
                    <tr key={label} style={{ borderBottom: `1px solid #e7e5e0` }}>
                      <td style={{ padding: "14px 16px", fontWeight: 600, whiteSpace: "nowrap" }}>{label}</td>
                      <td style={{ padding: "14px 16px", color: T.red }}>{before}</td>
                      <td style={{ padding: "14px 16px", color: T.greenDark, fontWeight: 600 }}>{after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ marginTop: 24, fontSize: 14, lineHeight: 1.65, color: T.dim, ...ls("mono") }}>
              The .docx downloaded from Resume Verdict is single-column, Calibri 11pt, no tables or graphics — the format every ATS parses cleanly.
            </p>
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section style={{ padding: "96px 24px", background: T.bgDark, color: T.light }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div className="reveal">
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", ...ls("mono"), color: T.muted, marginBottom: 20 }}>
              How it&apos;s different
            </span>
            <h2 style={{ ...ls("serif"), fontSize: "clamp(32px, 5vw, 48px)", lineHeight: 1.1, letterSpacing: "-0.02em", color: "#fff", marginBottom: 20 }}>
              Not another keyword score.{" "}
              <em style={{ color: T.green, fontStyle: "italic" }}>An actual verdict.</em>
            </h2>
          </div>
          <div className="reveal" style={{ transitionDelay: "0.1s" }}>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: T.muted, marginBottom: 12 }}>
              Keyword-match tools show you a percentage and tell you to optimize.
              They don&apos;t tell you if the gap is real. They don&apos;t tell you
              your format is destroying your ranking. They don&apos;t tell you to pass
              on a role.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: T.light, fontWeight: 500, marginBottom: 8 }}>This tool does.</p>
            <div style={{ overflowX: "auto", marginTop: 40 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", ...ls("sans"), fontSize: 14 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", ...ls("mono"), color: T.dim, borderBottom: `2px solid #2a2a2a` }} />
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", ...ls("mono"), color: T.green, borderBottom: `2px solid #2a2a2a` }}>Resume Verdict</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", ...ls("mono"), color: T.dim, borderBottom: `2px solid #2a2a2a` }}>Other tools</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Honest verdict", "Will tell you not to apply", "Shows score, optimizes regardless"],
                    ["No fabrication", "Three-layer enforcement", "No enforcement"],
                    ["Structure preserved", "Every role intact with dates", "Often flattens to bullet list"],
                    ["ATS-safe export", ".docx, proven format", "No or inconsistent"],
                    ["Cold outreach mode", "Company-targeting flow", "Not available"],
                    ["Targeted intake", "5 questions specific to your gaps", "Generic or none"],
                    ["Interview prep", "Per-role STAR stories", "Generic or none"],
                    ["Cost", "Free", "$9–$40/mo subscription"],
                    ["Account required", "No", "Yes"],
                    ["Data retention", "None — localStorage only", "Yes — server-stored"],
                  ].map(([label, ours, theirs]) => (
                    <tr key={label} style={{ borderBottom: `1px solid ${T.borderDark}` }}>
                      <td style={{ padding: "14px 16px", fontWeight: 600, color: T.light, whiteSpace: "nowrap" }}>{label}</td>
                      <td style={{ padding: "14px 16px", color: "#d4d0c8" }}>{ours}</td>
                      <td style={{ padding: "14px 16px", color: T.dim }}>{theirs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "96px 24px", background: T.bgDarkAlt, color: T.light }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div className="reveal">
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", ...ls("mono"), color: T.muted, marginBottom: 20 }}>
              Questions
            </span>
            <h2 style={{ ...ls("serif"), fontSize: "clamp(28px, 4.5vw, 40px)", lineHeight: 1.1, letterSpacing: "-0.02em", color: "#fff", marginBottom: 8 }}>
              What you&apos;re wondering.
            </h2>
          </div>
          <div style={{ marginTop: 40 }}>
            <FaqAccordion />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: "96px 24px", background: T.bgDark, borderTop: `1px solid ${T.borderDark}`, textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, background: `radial-gradient(circle, rgba(74,222,128,0.05) 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: 600, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div className="reveal">
            <h2 style={{ ...ls("serif"), fontSize: "clamp(32px, 5.5vw, 52px)", letterSpacing: "-0.03em", color: "#fff", marginBottom: 20 }}>
              Your next application should start here.
            </h2>
          </div>
          <div className="reveal" style={{ transitionDelay: "0.1s" }}>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: T.muted, marginBottom: 36 }}>
              Know your odds. Understand the gap. Download a resume you can submit with confidence.
            </p>
          </div>
          <div className="reveal" style={{ transitionDelay: "0.15s" }}>
            <Link
              href="/start"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 32px", background: "#fff", color: T.bgDark, borderRadius: 8, fontSize: 16, fontWeight: 700, ...ls("sans"), textDecoration: "none" }}
            >
              Get my free verdict →
            </Link>
            <p style={{ marginTop: 20, fontSize: 13, color: T.faint, ...ls("mono") }}>
              Takes about 10 minutes end to end.
            </p>
          </div>
          <div className="reveal" style={{ transitionDelay: "0.2s", display: "flex", justifyContent: "center", gap: 32, marginTop: 40, flexWrap: "wrap" }}>
            {["No account required", "No data stored on our servers", "Built with Claude (Anthropic)"].map((t) => (
              <span key={t} style={{ fontSize: 12, color: T.faint, ...ls("mono"), display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: T.green }}>✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#050505", borderTop: `1px solid ${T.borderDark}`, padding: "40px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 14, color: T.faint, lineHeight: 1.7 }}>
          Built by{" "}
          <a href="https://fullrefit.com" target="_blank" rel="noopener noreferrer" style={{ color: T.muted, textDecoration: "underline", textUnderlineOffset: 3 }}>
            full/REFIT
          </a>
        </p>
        <p style={{ fontSize: 13, color: "#3f3f3f", marginTop: 8, maxWidth: 480, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
          We build operational AI systems and equip teams to use them. If a free tool can solve a problem this specific, imagine what a custom system inside your organization could do.
        </p>
        <a href="https://fullrefit.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 16, fontSize: 13, color: T.dim, ...ls("mono"), textDecoration: "none" }}>
          See what we build at fullrefit.com →
        </a>
      </footer>
    </div>
  );
}
