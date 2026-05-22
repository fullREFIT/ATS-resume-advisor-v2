import Link from "next/link";
import { Instrument_Serif, DM_Sans, DM_Mono } from "next/font/google";
import { LandingNav } from "@/components/landing/LandingNav";

const serif = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--ls-serif" });
const sans = DM_Sans({ subsets: ["latin"], variable: "--ls-sans" });
const mono = DM_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--ls-mono" });

export const metadata = {
  title: "Features — Resume Verdict",
  description:
    "Everything Resume Verdict does: honest diagnosis, tailored resume output, cover letter generation, company targeting mode, recruiter scan, and more.",
};

function ls(s: string) {
  return { fontFamily: `var(--ls-${s})` };
}

const T = {
  light: "#e8e4de",
  muted: "#a8a29e",
  dim: "#78716c",
  faint: "#57534e",
  bg: "#0a0a0a",
  bgAlt: "#0f0f0f",
  card: "#1a1a1a",
  border: "#2a2a2a",
  green: "#4ade80",
  greenDim: "rgba(74,222,128,0.08)",
  greenBorder: "rgba(74,222,128,0.18)",
  amber: "#fbbf24",
  red: "#f87171",
} as const;

type Feature = {
  tag: string;
  title: string;
  body: string;
  detail?: string;
  badge?: { label: string; color: string };
  mode?: "role" | "company" | "both";
  isNew?: boolean;
};

const RECENT_FEATURES: Feature[] = [
  {
    tag: "Just shipped",
    title: "See exactly what changed",
    body: "A toggle above your tailored resume shows you what's different from your original — word by word. Words added are in green. Words removed are in red strikethrough. Unchanged words are dimmed. You see for yourself that nothing was invented — every change traces to evidence you provided.",
    detail: "Builds trust by making the AI's work visible.",
    isNew: true,
  },
  {
    tag: "Just shipped",
    title: "Paste a job link instead of typing",
    body: "Don't want to copy and paste a long job description? Paste a link from LinkedIn, Indeed, Glassdoor, Greenhouse, Lever, Workday, or most company career pages. The app pulls the job description for you. Cuts the start of a diagnosis from about a minute down to about fifteen seconds.",
    detail: "Works on most career pages. LinkedIn often blocks scrapers — in that case it tells you to paste the text directly.",
    isNew: true,
  },
  {
    tag: "Just shipped",
    title: "Everything-you-need ZIP download",
    body: "When you're ready to apply, click one button and download a single ZIP file with everything: your tailored resume, your cover letter, an interview prep guide, and a one-page cheat sheet that shows your match score, top matches, gaps to address, keywords to use, likely interview questions, and STAR stories to prepare.",
    detail: "One click. Four files. Ready to send.",
    isNew: true,
  },
];

const RECENT_IMPROVEMENTS: { title: string; body: string }[] = [
  {
    title: "Gap Closer plan now works every time",
    body: "The 30/60/90-day plan that appears when your verdict is FIX FIRST or PASS was failing on every run. It's fixed now — you'll always get a real plan with specific certifications, projects, and time estimates.",
  },
  {
    title: "Verdict badge fits on small phones",
    body: "On iPhone SE and similar narrow phones, the verdict label was running off the side of the page. It now wraps cleanly to two lines on small screens — desktop view is unchanged.",
  },
  {
    title: "\"Who to send this to\" suggestions are more reliable",
    body: "In company mode, the panel that suggests specific people to reach out to was sometimes returning empty or broken results. Now it consistently surfaces three to five real role archetypes you can search for on LinkedIn.",
  },
  {
    title: "Resume diff toggle fits on small phones",
    body: "The \"Tailored Resume / View Changes\" buttons above your resume were spilling off the side of small screens. They now wrap to a second line when there's not enough room.",
  },
  {
    title: "\"How it works\" link goes to the right place",
    body: "Clicking \"How it works\" in the top navigation used to send you to a separate page. It now scrolls you straight to the explanation on the home page, where you'd expect.",
  },
  {
    title: "Only three intake questions required (not five)",
    body: "Before generating your tailored resume, you used to have to answer all five intake questions. Now only three are required — questions four and five are clearly labeled as optional. A small status line tells you how many you've answered.",
  },
  {
    title: "Helpful hint when your job description is too short",
    body: "If you paste a job description that's under 50 characters, the form now tells you to add more — the same hint the resume field already shows. Before, the button was just disabled silently.",
  },
  {
    title: "\"Confidence\" label added to company analysis",
    body: "In company mode, the short note about how confident the analysis is now has a clear \"Confidence:\" label, so you know what you're reading.",
  },
  {
    title: "Smarter job posting detection",
    body: "When you paste a job URL, the app now does a better job of detecting the role title and company name. It looks at the page title and headline tags as a backup when the posting doesn't include all the structured data it would prefer.",
  },
  {
    title: "Clearer error messages",
    body: "If something goes wrong on our end — for example the AI taking too long to respond — you now get a plain-English message explaining what to do, instead of a cryptic error code.",
  },
  {
    title: "More time for long, detailed answers",
    body: "The app now allows up to five minutes for the AI to finish writing your tailored resume or cover letter when you've provided long, detailed intake answers. Long answers no longer cause silent timeouts.",
  },
];

const ROLE_FEATURES: Feature[] = [
  {
    tag: "Step 2",
    title: "Honest Match Diagnosis",
    body: "A 0–100 match score broken into four real dimensions: keyword match, experience relevance, trajectory fit, and ATS parsing quality. Then a single verdict — GO, FIX FIRST, or PASS — with a plain-English explanation of what drove it.",
    detail: "This is the only tool that will tell you not to apply.",
    badge: { label: "GO / FIX FIRST / PASS", color: T.green },
  },
  {
    tag: "Step 2",
    title: "Gap Closer Action Plan",
    body: "When your verdict is FIX FIRST or PASS, a 30/60/90-day timeline appears automatically. Each column has specific, actionable items — certifications to earn, projects to build, experience gaps to close — so you know exactly what would flip the verdict.",
    detail: "Only available in role mode. Includes structural gaps flagged separately below the timeline.",
    badge: { label: "Auto-loads on FIX FIRST + PASS", color: T.amber },
  },
  {
    tag: "Step 4",
    title: "Tailored Resume",
    body: "Your experience rewritten using exact language from the job description — pulled from your actual intake answers, never invented. Every role is preserved with original dates, company names, and titles. Nothing flattened.",
  },
  {
    tag: "Step 4",
    title: "ATS-Safe .docx Export",
    body: "One-click download of a Word document in the format every ATS parses cleanly: single column, Calibri 11pt, left-aligned, standard section headings, no tables, no graphics, 1-inch margins.",
    detail: "The format most resume tools won't bother enforcing.",
  },
  {
    tag: "Step 4",
    title: "JD Keywords — Integrated and Missed",
    body: "Exact phrases from the job description that made it into your resume are listed as green tags. Keywords that couldn't be supported by your evidence are listed separately in amber — with an explanation of why stuffing them anyway would hurt you.",
  },
  {
    tag: "Step 4",
    title: "Cover Letter Generator",
    body: "A 250–350 word cover letter grounded in your resume and intake answers. Uses Claude Sonnet for generation and a separate Haiku call for fabrication checking. No banned openers. Downloads as a separate .docx.",
    badge: { label: "Fact-checked, 1 retry max", color: T.muted },
  },
  {
    tag: "Step 4",
    title: "6-Second Recruiter Scan",
    body: "A fast, honest simulation of what a recruiter sees in the first six seconds. Returns ADVANCE, REJECT, or MAYBE with a brief explanation. Runs on demand after your resume is generated.",
    badge: { label: "ADVANCE / REJECT / MAYBE", color: T.green },
  },
  {
    tag: "Step 4",
    title: "Interview Prep",
    body: "Likely interview questions based on your resume and the role. Per-question STAR story guidance, including which gaps you should prepare to address. Generated from the same evidence base as your tailored resume.",
  },
  {
    tag: "Step 4",
    title: "Shareable Score Report",
    body: "Download a 1200×630 PNG image of your verdict, match score, and component score bars. Also copies to clipboard for sharing. Built with Canvas 2D — no external library.",
    badge: { label: "PNG + clipboard", color: T.muted },
  },
];

const COMPANY_FEATURES: Feature[] = [
  {
    tag: "Step 2",
    title: "Company Fit Diagnosis",
    body: "Paste a company URL. Resume Verdict reads the site, maps your background against what they do and value, and tells you where you're strong, where you're weak, and what a realistic pitch looks like.",
    detail: "No job posting required. Grounded in what they actually said about themselves.",
  },
  {
    tag: "Step 4",
    title: "Cold Outreach Kit",
    body: "A tailored resume positioned for cold outreach, plus a specific positioning angle and a draft message ready to send. Every company-specific claim in the message references something from their site.",
  },
  {
    tag: "Step 4",
    title: "Target Persons Panel",
    body: "Three archetype cards describing who at this company you should actually reach out to — titles, what motivates them, what problems they're likely solving. Helps you target the right person instead of sending to a generic inbox.",
    badge: { label: "On demand", color: T.muted },
  },
];

const SYSTEM_FEATURES: Feature[] = [
  {
    tag: "Always on",
    title: "Three-Layer Fabrication Guard",
    body: "The system prompt forbids invention. The Socratic intake forces real evidence in before tailoring runs. A separate AI call fact-checks every rewritten bullet against your original resume and intake answers. Anything not supported gets flagged and regenerated.",
    detail: "The result is a resume you can actually stand behind.",
  },
  {
    tag: "Always on",
    title: "Resume Version History",
    body: "The last 20 runs are stored in your browser — mode, verdict, match score, and target company or job title. No account, no server storage. One-click to see where you've been.",
  },
  {
    tag: "Privacy",
    title: "No Account. No Server Storage.",
    body: "Everything stays in localStorage. Your resume text, your intake answers, your outputs — none of it touches our servers beyond the API call required to run the model. There's nothing to delete because nothing is retained.",
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div
      style={{
        background: feature.isNew
          ? "linear-gradient(180deg, rgba(74,222,128,0.06) 0%, " + T.card + " 100%)"
          : T.card,
        border: `1px solid ${feature.isNew ? T.green : T.border}`,
        borderRadius: 12,
        padding: "24px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
      }}
    >
      {feature.isNew && (
        <span
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            padding: "4px 10px",
            background: "#14532d",
            color: T.green,
            border: `1px solid ${T.green}`,
            borderRadius: 4,
            fontSize: 10,
            letterSpacing: "0.14em",
            fontWeight: 700,
            textTransform: "uppercase",
            ...ls("mono"),
          }}
        >
          New — Last 48h
        </span>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", paddingRight: feature.isNew ? 120 : 0 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: T.green,
            ...ls("mono"),
          }}
        >
          {feature.tag}
        </span>
        {feature.badge && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: feature.badge.color,
              ...ls("mono"),
              opacity: 0.8,
            }}
          >
            {feature.badge.label}
          </span>
        )}
      </div>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: T.light,
          lineHeight: 1.3,
          ...ls("sans"),
        }}
      >
        {feature.title}
      </h3>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: T.muted }}>{feature.body}</p>
      {feature.detail && (
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: T.dim,
            fontStyle: "italic",
            borderTop: `1px solid ${T.border}`,
            paddingTop: 12,
            marginTop: 4,
          }}
        >
          {feature.detail}
        </p>
      )}
    </div>
  );
}

function SectionHeader({ tag, title, body }: { tag: string; title: string; body?: string }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <span
        style={{
          display: "inline-block",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: T.muted,
          ...ls("mono"),
          marginBottom: 16,
        }}
      >
        {tag}
      </span>
      <h2
        style={{
          ...ls("serif"),
          fontSize: "clamp(28px, 4vw, 40px)",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: "#fff",
          marginBottom: body ? 16 : 0,
        }}
      >
        {title}
      </h2>
      {body && (
        <p style={{ fontSize: 16, lineHeight: 1.7, color: T.muted, maxWidth: 640 }}>{body}</p>
      )}
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
      style={{ ...ls("sans"), background: T.bg, color: T.light, overflowX: "hidden", minHeight: "100vh" }}
    >
      <LandingNav />

      {/* HERO */}
      <section style={{ padding: "120px 24px 72px", maxWidth: 960, margin: "0 auto" }}>
        <span
          style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: T.green,
            ...ls("mono"),
            marginBottom: 24,
            padding: "6px 16px",
            border: `1px solid rgba(74,222,128,0.2)`,
            borderRadius: 100,
          }}
        >
          Everything it does
        </span>
        <h1
          style={{
            ...ls("serif"),
            fontSize: "clamp(36px, 5.5vw, 60px)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "#fff",
            marginBottom: 20,
            maxWidth: 720,
          }}
        >
          Two modes. A dozen features.{" "}
          <em style={{ color: T.green, fontStyle: "italic" }}>All free.</em>
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.7, color: T.muted, maxWidth: 600, marginBottom: 36 }}>
          Resume Verdict runs top to bottom in about ten minutes. Here&apos;s exactly
          what you get — from the initial diagnosis to the file you download and submit.
        </p>
        <Link
          href="/start"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 28px",
            background: "#fff",
            color: T.bg,
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 700,
            ...ls("sans"),
            textDecoration: "none",
          }}
        >
          100% free - no signup →
        </Link>
      </section>

      {/* RECENTLY SHIPPED — last 48 hours */}
      <section style={{ padding: "72px 24px", background: T.bgAlt, borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <SectionHeader
            tag="What's new — last 48 hours"
            title="Three new features just landed."
            body="The app has grown a lot in the last two days. Here's what just shipped — plus a list of improvements further down the page."
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {RECENT_FEATURES.map((f) => (
              <FeatureCard key={f.title} feature={f} />
            ))}
          </div>
        </div>
      </section>

      {/* ROLE MODE */}
      <section style={{ padding: "72px 24px", background: T.bgAlt, borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <SectionHeader
            tag="Role mode"
            title="Applying to a specific job posting."
            body="Paste your resume and a job description. Get a diagnosis, a tailored resume, and everything you need to submit with confidence."
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {ROLE_FEATURES.map((f) => (
              <FeatureCard key={f.title} feature={f} />
            ))}
          </div>
        </div>
      </section>

      {/* COMPANY MODE */}
      <section style={{ padding: "72px 24px", background: T.bg, borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <SectionHeader
            tag="Company mode"
            title="Getting in front of a company before a role is posted."
            body="Paste a company URL instead of a job description. Resume Verdict reads their site, maps your background, and builds a cold-outreach kit grounded in what they actually said about themselves."
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {COMPANY_FEATURES.map((f) => (
              <FeatureCard key={f.title} feature={f} />
            ))}
          </div>
        </div>
      </section>

      {/* SYSTEM */}
      <section style={{ padding: "72px 24px", background: T.bgAlt, borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <SectionHeader
            tag="Under the hood"
            title="The guarantees that make the output trustworthy."
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {SYSTEM_FEATURES.map((f) => (
              <FeatureCard key={f.title} feature={f} />
            ))}
          </div>
        </div>
      </section>

      {/* RECENT IMPROVEMENTS — last 48 hours, plain English */}
      <section style={{ padding: "72px 24px", background: T.bg, borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <SectionHeader
            tag="Recent improvements"
            title="Eleven smaller changes from the last two days."
            body="A round of testing across three different browsers turned up a list of small things to polish. Each one is fixed."
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {RECENT_IMPROVEMENTS.map((item) => (
              <div
                key={item.title}
                style={{
                  background: T.card,
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  padding: "18px 22px",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: 14,
                  alignItems: "start",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: T.green,
                    marginTop: 8,
                  }}
                />
                <div>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: T.light,
                      ...ls("sans"),
                      marginBottom: 4,
                    }}
                  >
                    {item.title}
                  </p>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: T.muted }}>
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK COMPARISON */}
      <section style={{ padding: "72px 24px", background: T.bgAlt, borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <span
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: T.muted,
              ...ls("mono"),
              marginBottom: 16,
            }}
          >
            At a glance
          </span>
          <h2
            style={{
              ...ls("serif"),
              fontSize: "clamp(24px, 3.5vw, 36px)",
              lineHeight: 1.1,
              color: "#fff",
              marginBottom: 32,
            }}
          >
            Everything in one place.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              ["Resume diagnosis (match score + verdict)", T.green],
              ["Four-component score breakdown", T.green],
              ["Gap Closer 30/60/90-day action plan", T.green],
              ["Tailored resume — all roles preserved", T.green],
              ["See-what-changed diff view (NEW)", T.green],
              ["Paste a job link instead of typing (NEW)", T.green],
              ["One-click application package ZIP (NEW)", T.green],
              ["ATS-safe .docx export", T.green],
              ["JD keywords — integrated and missed", T.green],
              ["Cover letter generator + .docx export", T.green],
              ["6-second recruiter scan (ADVANCE/REJECT/MAYBE)", T.green],
              ["Interview prep with STAR story guidance", T.green],
              ["Shareable score report PNG", T.green],
              ["Company targeting mode (cold outreach kit)", T.green],
              ["Target persons panel (who to contact)", T.green],
              ["Resume version history (last 20 runs)", T.green],
              ["No account required", T.green],
              ["No server-side data storage", T.green],
            ].map(([label, color]) => (
              <div
                key={label as string}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 0",
                  borderBottom: `1px solid ${T.border}`,
                  fontSize: 15,
                  color: T.light,
                }}
              >
                <span style={{ color: color as string, ...ls("mono"), fontWeight: 700, fontSize: 14 }}>✓</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "80px 24px",
          background: T.bgAlt,
          borderTop: `1px solid ${T.border}`,
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2
            style={{
              ...ls("serif"),
              fontSize: "clamp(28px, 4.5vw, 44px)",
              letterSpacing: "-0.03em",
              color: "#fff",
              marginBottom: 16,
            }}
          >
            Takes about ten minutes.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: T.muted, marginBottom: 32 }}>
            No signup. No credit card. Your data stays in your browser.
          </p>
          <Link
            href="/start"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "16px 32px",
              background: "#fff",
              color: T.bg,
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 700,
              ...ls("sans"),
              textDecoration: "none",
            }}
          >
            Get my free verdict →
          </Link>
          <p style={{ marginTop: 20, fontSize: 13, color: T.faint, ...ls("mono") }}>
            No account · No data stored · Free
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: "#050505",
          borderTop: `1px solid ${T.border}`,
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 14, color: T.faint, lineHeight: 1.7 }}>
          Built by{" "}
          <a
            href="https://fullrefit.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: T.muted, textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            full/REFIT
          </a>
        </p>
      </footer>
    </div>
  );
}
