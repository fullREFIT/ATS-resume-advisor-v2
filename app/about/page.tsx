import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "How it works — AI Resume Advisor",
  description:
    "Honest diagnosis. Real tailoring. No fabrication. How modern ATS actually works and how this tool addresses it.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10">
        <div className="card-layer-1 flex flex-col gap-2">
          <p className="section-label">Methodology</p>
          <h1 className="text-2xl font-semibold tracking-tight text-carbon-core sm:text-3xl">
            Honest diagnosis. Real tailoring. No fabrication.
          </h1>
        </div>

        <section className="flex flex-col gap-3">
          <p className="section-label">How it works</p>
          <p className="text-base leading-relaxed text-carbon-core">
            Most resume tools stuff keywords or tell you everything is fine.
            This one diagnoses the gap first, asks targeted questions to
            surface evidence you actually have, then tailors using only what
            you told it. The bullets you get back are checked twice for
            fabrication before you see them.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <p className="section-label">
            How applicant tracking systems actually work
          </p>
          <p className="text-base leading-relaxed text-carbon-core">
            The 75% auto-rejection number is a myth — about 92% of ATS
            configurations don&apos;t auto-reject resumes based on content. The
            real problem is being ranked so low that no recruiter ever sees
            you.
          </p>
          <p className="text-base leading-relaxed text-carbon-core">
            Parsing failure causes roughly 30% of low rankings — the single
            biggest cause. Multi-column layouts, tables, text boxes, graphics,
            headers/footers, and image-based PDFs (Canva and Figma exports are
            common offenders) destroy parse accuracy. The downloaded output
            from this tool is deliberately plain — single column, standard
            section headings, no tables, no graphics, Calibri 11pt — because
            plain is what every ATS reads cleanly.
          </p>
          <p className="text-base leading-relaxed text-carbon-core">
            Modern systems like Workday, Greenhouse, and Lever also use
            semantic scoring and skill taxonomies on top of keyword matching,
            so vocabulary depth matters. Workday and some iCIMS configs
            cross-reference your resume against your LinkedIn profile. Before
            you submit, make the titles and dates match.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <p className="section-label">The no-fabrication promise</p>
          <p className="text-base leading-relaxed text-carbon-core">
            Three layers stop the AI from inventing experience you don&apos;t
            have. The system prompts forbid it. The Socratic intake forces
            real evidence into the input before tailoring runs. And a final
            fact-check pass rejects any bullet asserting tools, metrics,
            roles, or outcomes that aren&apos;t in your resume or intake
            answers.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <p className="section-label">Disclaimer</p>
          <p className="text-sm leading-relaxed text-echo">
            This tool gives suggestions based on the inputs you provide. It is
            not legal advice, career-counseling advice, or a substitute for
            professional review. You are responsible for the accuracy of the
            resume you submit.
          </p>
        </section>

        <section className="overflow-hidden rounded-xl bg-forge-dark p-6 text-ash-white sm:p-8">
          <p className="section-label mb-3 !text-forge-gold">
            Built by full/REFIT
          </p>
          <p className="text-lg leading-relaxed text-ash-white">
            This tool is built by full/REFIT — we build operational AI systems
            and equip teams to use them. If a free tool can solve a problem
            this specific, imagine what a custom system inside your company
            could do.
          </p>
          <a
            href="https://fullrefit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-lg bg-forge-red px-5 font-semibold text-pure-white hover:bg-forge-red-hover"
          >
            See what we build →
          </a>
        </section>

        <div>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-forge-red hover:text-forge-red-hover"
          >
            ← Back to the tool
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
