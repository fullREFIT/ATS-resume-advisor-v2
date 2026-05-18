import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Nic's AI Resume Advisor — Honest Diagnosis, ATS-Optimized Output",
  description:
    "Diagnose your resume against any job description. Get an honest score, understand exactly why you're ranked low, and download an ATS-safe tailored resume. No account. No fabrication. Free.",
};

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forge-red text-sm font-bold text-pure-white">
        {n}
      </div>
      <div className="flex flex-col gap-1 pt-0.5">
        <p className="text-sm font-semibold text-carbon-core">{title}</p>
        <p className="text-sm leading-relaxed text-echo">{body}</p>
      </div>
    </div>
  );
}

function Layer({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4 border-b border-soft-gray pb-4 last:border-0 last:pb-0">
      <p className="section-label w-5 shrink-0 pt-0.5">{n}</p>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-carbon-core">{title}</p>
        <p className="text-sm leading-relaxed text-echo">{body}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-4 sm:px-6">

        {/* ── HERO ── */}
        <section className="flex flex-col gap-5 py-10 sm:py-14">
          <p className="section-label">Nic&apos;s AI Resume Advisor — Free</p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-carbon-core sm:text-4xl">
            Your resume isn&apos;t getting callbacks.
            <br className="hidden sm:block" /> Here&apos;s exactly why.
          </h1>
          <p className="max-w-prose text-base leading-relaxed text-carbon-core">
            Paste your resume and a job description. Get an honest match score,
            understand what&apos;s working against you, and download an ATS-safe
            tailored resume — built from your actual experience, nothing invented.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/start"
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-forge-red px-6 text-base font-semibold text-pure-white hover:bg-forge-red-hover"
            >
              Try it free — no account needed →
            </Link>
            <Link
              href="/about"
              className="inline-flex min-h-12 items-center justify-center text-sm font-medium text-forge-red hover:text-forge-red-hover"
            >
              How it works ↓
            </Link>
          </div>
          <p className="text-xs text-echo">
            No signup. No API key. Your data stays in your browser.
          </p>
        </section>

        {/* ── PROBLEM ── */}
        <section className="flex flex-col gap-4 border-t border-soft-gray py-10">
          <p className="section-label">The real problem</p>
          <h2 className="text-xl font-semibold tracking-tight text-carbon-core sm:text-2xl">
            Most resume tools are lying to you.
          </h2>
          <p className="text-sm leading-relaxed text-carbon-core">
            They give you a keyword score and tell you to optimize. They tell
            you everything looks great — because that&apos;s what keeps your
            subscription.
          </p>
          <div className="flex flex-col gap-3">
            {[
              {
                label: "The auto-rejection myth",
                body: "92% of applicant tracking systems don't auto-reject based on content. The real problem is being ranked so low that no recruiter ever sees you.",
              },
              {
                label: "Formatting destroys your ranking",
                body: "Parsing failure causes roughly 30% of low rankings. Multi-column layouts, tables, text boxes, and PDF exports from Canva or Figma destroy parse accuracy before a human reads a word.",
              },
              {
                label: "The gap might actually be disqualifying",
                body: "You deserve to know that before you spend two hours tailoring and submit to a role you have a 20% chance at.",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="card-surface flex flex-col gap-1"
              >
                <p className="text-sm font-semibold text-carbon-core">
                  {item.label}
                </p>
                <p className="text-sm leading-relaxed text-echo">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="flex flex-col gap-6 border-t border-soft-gray py-10">
          <div className="flex flex-col gap-2">
            <p className="section-label">How it works</p>
            <h2 className="text-xl font-semibold tracking-tight text-carbon-core sm:text-2xl">
              Four steps. One honest answer.
            </h2>
          </div>
          <div className="card-surface flex flex-col gap-6">
            <Step
              n="1"
              title="Paste your resume and the job description"
              body="Upload a PDF or .docx, or paste plain text. Paste the full job description. Takes 60 seconds."
            />
            <Step
              n="2"
              title="Get your diagnosis"
              body="A match score from 0–100 across four dimensions — keyword match, experience relevance, trajectory fit, and ATS parsing quality — with a GO / FIX FIRST / PASS verdict and a plain-English explanation of what drove it."
            />
            <Step
              n="3"
              title="Answer five targeted questions"
              body="Not generic. Five questions specific to your resume and this job — designed to surface the STAR stories, quantified outcomes, and demonstrated evidence you have but didn't write down."
            />
            <Step
              n="4"
              title="Download your tailored resume"
              body="Your experience rewritten with exact language from the job description — your evidence, nothing invented. Every role preserved with company, title, and dates. ATS-safe Word document ready to submit."
            />
          </div>
        </section>

        {/* ── SOCIAL PROOF ── */}
        <section className="flex flex-col gap-6 border-t border-soft-gray py-10">
          <div className="flex flex-col gap-2">
            <p className="section-label">Real results</p>
            <h2 className="text-xl font-semibold tracking-tight text-carbon-core sm:text-2xl">
              Same resume. Same role. One session.
            </h2>
            <p className="text-sm leading-relaxed text-carbon-core">
              A sales leader ran his current resume against a Sales Manager job
              description. Here&apos;s what changed.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-soft-gray">
            {/* Column headers */}
            <div className="grid grid-cols-2 divide-x divide-soft-gray">
              <div className="bg-ash-white px-4 py-2">
                <p className="section-label !text-echo">Before</p>
              </div>
              <div className="bg-pure-white px-4 py-2">
                <p className="section-label">After</p>
              </div>
            </div>

            {/* Rows */}
            {[
              {
                label: "Match score",
                before: "62 / 100",
                after: "72 / 100",
              },
              {
                label: "Verdict",
                before: "FIX FIRST",
                after: "GO",
                highlight: true,
              },
              {
                label: "Role entries",
                before: "0 (flat bullet list)",
                after: "4 (with company, title, dates)",
              },
              {
                label: "Total bullets",
                before: "7",
                after: "17",
              },
              {
                label: "Verbatim JD phrases",
                before: "~5 (paraphrased)",
                after: "13 exact",
              },
              {
                label: "Contact info",
                before: "Corrupted",
                after: "Clean",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-2 divide-x divide-soft-gray border-t border-soft-gray"
              >
                <div className="bg-ash-white px-4 py-3">
                  <p className="mb-0.5 text-[0.6875rem] font-medium uppercase tracking-wide text-echo">
                    {row.label}
                  </p>
                  <p className="text-sm text-carbon-core">{row.before}</p>
                </div>
                <div className="bg-pure-white px-4 py-3">
                  <p className="mb-0.5 text-[0.6875rem] font-medium uppercase tracking-wide text-echo">
                    {row.label}
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      row.highlight ? "text-forge-red" : "text-carbon-core"
                    }`}
                  >
                    {row.after}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-echo">
            Real candidate. Real job description. No adjustments made for
            demonstration purposes.
          </p>
        </section>

        {/* ── NO FABRICATION ── */}
        <section className="flex flex-col gap-6 border-t border-soft-gray py-10">
          <div className="flex flex-col gap-2">
            <p className="section-label">The no-fabrication promise</p>
            <h2 className="text-xl font-semibold tracking-tight text-carbon-core sm:text-2xl">
              Every bullet is fact-checked. Twice.
            </h2>
            <p className="text-sm leading-relaxed text-carbon-core">
              A fabricated bullet that gets caught by a recruiter is worse than
              the original. Three layers prevent it.
            </p>
          </div>
          <div className="card-surface flex flex-col gap-4">
            <Layer
              n="01"
              title="The system prompt forbids it"
              body="The model is explicitly instructed to use only what you provided. No inventing tools, metrics, outcomes, or roles not present in your resume or intake answers."
            />
            <Layer
              n="02"
              title="The intake forces real evidence in"
              body="Five targeted questions surface specific stories and outcomes from your actual background. The model rewrites from that evidence — not from inference."
            />
            <Layer
              n="03"
              title="A second AI call reviews every bullet"
              body="After the resume is generated, a separate fact-check call compares every rewritten bullet against your original resume and intake answers. Flagged bullets are regenerated with stricter constraints."
            />
          </div>
        </section>

        {/* ── COMPANY MODE ── */}
        <section className="flex flex-col gap-4 overflow-hidden rounded-xl border border-soft-gray bg-forge-dark py-10 px-6 sm:px-8">
          <p className="section-label !text-forge-gold">
            Not just for active job seekers
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-ash-white sm:text-2xl">
            Want to get in front of a company before a role is posted?
          </h2>
          <p className="text-sm leading-relaxed text-ash-white/80">
            Most people wait for job listings. The candidates who get hired at
            companies they actually want to work for don&apos;t.
          </p>
          <p className="text-sm leading-relaxed text-ash-white/80">
            Paste a company website URL instead of a job description. The tool
            reads what the company does, maps where your background fits, names
            the gaps that would weaken your pitch, and produces a tailored
            resume, a positioning angle, and a draft message — all grounded in
            what the company actually said about themselves.
          </p>
          <Link
            href="/start"
            className="mt-2 inline-flex min-h-11 w-fit items-center rounded-lg bg-forge-red px-5 text-sm font-semibold text-pure-white hover:bg-forge-red-hover"
          >
            Try the company-targeting mode →
          </Link>
        </section>

        {/* ── HONEST VERDICT ── */}
        <section className="flex flex-col gap-4 border-t border-soft-gray py-10">
          <p className="section-label">The honest tool</p>
          <h2 className="text-xl font-semibold tracking-tight text-carbon-core sm:text-2xl">
            It will tell you not to apply.
          </h2>
          <p className="text-sm leading-relaxed text-carbon-core">
            Keyword-match tools show you a score and tell you to optimize. They
            don&apos;t tell you if the gap is real. They don&apos;t tell you
            your formatting is destroying your ranking. They don&apos;t tell
            you to pass on a role.
          </p>
          <p className="text-sm leading-relaxed text-carbon-core">
            If your match score is below 50 — or if there&apos;s a hard
            disqualifier the model identifies — the verdict is{" "}
            <span className="font-semibold">PASS</span>. Some roles
            aren&apos;t the right move right now. Knowing that before you apply
            is worth more than a cheerful score that tells you nothing.
          </p>
        </section>

        {/* ── CLOSING CTA ── */}
        <section className="flex flex-col gap-5 border-t border-soft-gray py-10 sm:py-14">
          <h2 className="text-2xl font-semibold tracking-tight text-carbon-core sm:text-3xl">
            Your next application should start here.
          </h2>
          <p className="text-sm leading-relaxed text-echo">
            Know your odds. Understand the gap. Download a resume you can
            submit with confidence. Takes about 10 minutes end to end.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/start"
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-forge-red px-6 text-base font-semibold text-pure-white hover:bg-forge-red-hover"
            >
              Try it free →
            </Link>
            <Link
              href="/about"
              className="inline-flex min-h-12 items-center justify-center text-sm font-medium text-forge-red hover:text-forge-red-hover"
            >
              Read the methodology
            </Link>
          </div>
          <p className="text-xs text-echo">
            No account required &nbsp;·&nbsp; No data stored on our servers
            &nbsp;·&nbsp; Built with Claude (Anthropic)
          </p>
        </section>

      </main>
      <Footer />
    </>
  );
}
