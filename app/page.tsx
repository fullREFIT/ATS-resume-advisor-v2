import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProgressBar } from "@/components/ProgressBar";
import { IntakeForm } from "@/components/IntakeForm";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
        <ProgressBar step={1} />
        <div className="card-layer-1 flex flex-col gap-2">
          <p className="section-label">Step 1 — Paste</p>
          <h1 className="text-2xl font-semibold tracking-tight text-carbon-core sm:text-3xl">
            Diagnose your resume against any job description.
          </h1>
          <p className="text-base text-carbon-core">
            Honest verdict, ATS parsing flags, real gaps. Then we tailor — without
            inventing experience you didn&apos;t claim.
          </p>
        </div>
        <IntakeForm />
      </main>
      <Footer />
    </>
  );
}
