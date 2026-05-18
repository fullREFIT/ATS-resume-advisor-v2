"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Is this actually free?",
    a: "Yes. No account, no credit card, no API key required. The tool is free to use.",
  },
  {
    q: "Where does my resume go?",
    a: "Your resume text is sent to our API routes for processing (which call Anthropic's Claude models) and then returned to your browser. Nothing is stored on a server. Your session state lives only in your browser's localStorage.",
  },
  {
    q: "What formats can I upload?",
    a: ".pdf and .docx. You can also paste plain text directly. If you're on a Mac and your resume is in Apple Pages, export it to PDF first (File → Export To → PDF).",
  },
  {
    q: "Can the AI tell when my resume won't parse correctly?",
    a: "Yes — the ATS parsing component scores how cleanly your resume reads in plain text. Multi-column layouts, tables, text boxes, and image-based PDFs all get flagged. The downloaded .docx is deliberately plain to fix this.",
  },
  {
    q: "What if I don't have a job description?",
    a: "Use company-targeting mode. Paste the company's website URL instead. The tool reads what the company does and helps you position yourself for cold outreach — even without a specific role to match against.",
  },
  {
    q: "What if the tool says to pass on a role I really want?",
    a: "That's the most valuable output this tool produces. A PASS verdict means the gap is significant enough that an honest ranking system will bury your application. Your options: close the gap first, or apply anyway knowing you're starting at a disadvantage. Either way, you're making an informed decision.",
  },
  {
    q: "Does it work for senior roles?",
    a: "Yes. Tested with sales leadership, operations, and strategy roles. The output respects the candidate's level — it doesn't flatten a 15-year career into entry-level language.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      {FAQS.map((f, i) => (
        <div
          key={i}
          onClick={() => setOpen(open === i ? null : i)}
          className="cursor-pointer border-b border-[#2a2a2a] py-5"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="text-[17px] font-semibold text-[#e8e4de]">{f.q}</span>
            <span
              className="shrink-0 text-2xl font-light text-[#78716c] transition-transform duration-300"
              style={{ transform: open === i ? "rotate(45deg)" : "none" }}
            >
              +
            </span>
          </div>
          <div
            className="overflow-hidden transition-[max-height] duration-[400ms] ease-in-out"
            style={{ maxHeight: open === i ? "300px" : "0" }}
          >
            <p className="mt-3 text-[15px] leading-[1.7] text-[#a8a29e]">{f.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
