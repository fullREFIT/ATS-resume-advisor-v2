"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-[100] px-6 py-4 transition-all duration-300 ${
        scrolled
          ? "border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.92)] backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[960px] items-center justify-between">
        <Link
          href="/"
          className="text-[22px] tracking-[-0.02em] text-[#e8e4de]"
          style={{ fontFamily: "var(--ls-serif), serif" }}
        >
          Resume Verdict
        </Link>
        <Link
          href="/start"
          className="inline-flex items-center rounded-md bg-white px-[22px] py-[10px] text-sm font-bold text-[#0a0a0a] transition-colors hover:bg-[#e8e4de]"
          style={{ fontFamily: "var(--ls-sans), sans-serif" }}
        >
          Try it free →
        </Link>
      </div>
    </nav>
  );
}
