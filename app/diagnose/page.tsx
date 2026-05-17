import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProgressBar } from "@/components/ProgressBar";
import { DiagnosePageClient } from "./DiagnosePageClient";

export default function DiagnosePage() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
        <ProgressBar step={2} />
        <DiagnosePageClient />
      </main>
      <Footer />
    </>
  );
}
