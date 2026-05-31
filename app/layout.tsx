import type { Metadata, Viewport } from "next";
import { Instrument_Serif, DM_Sans, DM_Mono } from "next/font/google";
import { BugReporter } from "@/components/BugReporter";
import { BypassCapture } from "@/components/BypassCapture";
import { UnlockClaimer } from "@/components/UnlockClaimer";
import "./globals.css";

const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--ls-serif",
  display: "swap",
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--ls-sans",
  display: "swap",
});

const mono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--ls-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Resume Verdict — Honest Diagnosis, ATS-Optimized Output",
  description:
    "Diagnose your resume against any job description. Honest verdict, no fabrication, ATS-safe tailoring. Free.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-[#0a0a0a] text-[#e8e4de]">
        <BypassCapture />
        <UnlockClaimer />
        {children}
        <BugReporter />
      </body>
    </html>
  );
}
