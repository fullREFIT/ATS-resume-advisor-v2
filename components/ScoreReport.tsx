"use client";

import { useEffect, useRef, useState } from "react";
import type { Diagnosis } from "@/lib/types";

const W = 1200;
const H = 630;

function scoreColor(score: number): string {
  if (score >= 70) return "#4ade80";
  if (score >= 50) return "#fbbf24";
  return "#f87171";
}

function scoreBarBg(score: number): string {
  if (score >= 70) return "#14532d";
  if (score >= 50) return "#713f12";
  return "#7f1d1d";
}

function verdictColors(verdict: string): { bg: string; color: string; label: string } {
  switch (verdict) {
    case "GO":
      return { bg: "#14532d", color: "#4ade80", label: "GO" };
    case "FIX_FIRST":
      return { bg: "#713f12", color: "#fbbf24", label: "FIX FIRST" };
    case "PASS":
      return { bg: "#7f1d1d", color: "#f87171", label: "PASS" };
    default:
      return { bg: "#1e3a5f", color: "#93c5fd", label: verdict };
  }
}

async function drawReport(canvas: HTMLCanvasElement, diagnosis: Diagnosis) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Load fonts
  try {
    await document.fonts.load("700 14px 'DM Sans'");
    await document.fonts.load("400 14px 'DM Mono'");
  } catch {
    // fallback to system fonts
  }

  const bg = "#0a0a0a";
  const light = "#e8e4de";
  const muted = "#a8a29e";
  const dim = "#78716c";
  const border = "#2a2a2a";
  const cardBg = "#1a1a1a";

  // Background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle grain overlay
  ctx.fillStyle = "rgba(255,255,255,0.015)";
  for (let i = 0; i < W; i += 4) {
    for (let j = 0; j < H; j += 4) {
      if (Math.random() > 0.5) ctx.fillRect(i, j, 2, 2);
    }
  }

  const PAD = 56;
  let y = PAD;

  // Brand name
  ctx.font = `400 28px 'Instrument Serif', 'Georgia', serif`;
  ctx.fillStyle = light;
  ctx.fillText("Resume Verdict", PAD, y + 28);

  // URL
  ctx.font = `400 14px 'DM Mono', monospace`;
  ctx.fillStyle = dim;
  ctx.fillText("resumeverdict.app", W - PAD - ctx.measureText("resumeverdict.app").width, y + 28);

  y += 60;

  // Divider
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();
  y += 32;

  // Verdict badge + score
  const vc = verdictColors(diagnosis.verdict);
  const BADGE_W = 180;
  const BADGE_H = 46;
  ctx.fillStyle = vc.bg;
  ctx.beginPath();
  ctx.roundRect(PAD, y, BADGE_W, BADGE_H, 8);
  ctx.fill();

  ctx.font = `700 20px 'DM Mono', monospace`;
  ctx.fillStyle = vc.color;
  const badgeLabelW = ctx.measureText(vc.label).width;
  ctx.fillText(vc.label, PAD + (BADGE_W - badgeLabelW) / 2, y + BADGE_H / 2 + 7);

  // Match score
  ctx.font = `700 52px 'DM Sans', sans-serif`;
  ctx.fillStyle = light;
  ctx.fillText(`${diagnosis.matchScore}`, PAD + BADGE_W + 24, y + BADGE_H - 2);

  ctx.font = `400 20px 'DM Sans', sans-serif`;
  ctx.fillStyle = muted;
  ctx.fillText("/ 100 match score", PAD + BADGE_W + 24 + ctx.measureText(`${diagnosis.matchScore}`).width + 8, y + BADGE_H - 2);

  y += BADGE_H + 36;

  // Score breakdown bars
  const components = [
    { label: "Keyword Match", score: diagnosis.scoreBreakdown.keywordMatch.score },
    { label: "Experience Relevance", score: diagnosis.scoreBreakdown.experienceRelevance.score },
    { label: "Trajectory Fit", score: diagnosis.scoreBreakdown.trajectoryFit.score },
    { label: "ATS Parsing", score: diagnosis.scoreBreakdown.atsParsing.score },
  ];

  const BAR_H = 20;
  const BAR_TRACK = 320;
  const LABEL_W = 200;
  const SCORE_W = 40;

  for (const comp of components) {
    // Label
    ctx.font = `400 13px 'DM Sans', sans-serif`;
    ctx.fillStyle = muted;
    ctx.fillText(comp.label, PAD, y + BAR_H - 3);

    // Track bg
    const trackX = PAD + LABEL_W;
    ctx.fillStyle = scoreBarBg(comp.score);
    ctx.beginPath();
    ctx.roundRect(trackX, y, BAR_TRACK, BAR_H, 4);
    ctx.fill();

    // Fill
    const fillW = Math.round((comp.score / 100) * BAR_TRACK);
    ctx.fillStyle = scoreColor(comp.score);
    ctx.beginPath();
    ctx.roundRect(trackX, y, fillW, BAR_H, 4);
    ctx.fill();

    // Score label
    ctx.font = `700 13px 'DM Mono', monospace`;
    ctx.fillStyle = light;
    ctx.fillText(`${comp.score}`, trackX + BAR_TRACK + 12, y + BAR_H - 3);

    y += BAR_H + 12;
  }

  y += 12;

  // Divider
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();
  y += 24;

  // Top matches and critical gaps — two columns
  const COL_W = (W - PAD * 2 - 40) / 2;

  // Top matches
  ctx.font = `700 12px 'DM Mono', monospace`;
  ctx.fillStyle = "#4ade80";
  ctx.fillText("TOP MATCHES", PAD, y + 14);

  ctx.font = `700 12px 'DM Mono', monospace`;
  ctx.fillStyle = "#f87171";
  ctx.fillText("CRITICAL GAPS", PAD + COL_W + 40, y + 14);

  y += 24;
  const matches = (diagnosis.topMatches ?? []).slice(0, 3);
  const gaps = (diagnosis.criticalGaps ?? []).slice(0, 3);

  for (let i = 0; i < Math.max(matches.length, gaps.length); i++) {
    if (matches[i]) {
      const txt = `• ${matches[i]}`;
      const maxW = COL_W - 8;
      ctx.font = `400 13px 'DM Sans', sans-serif`;
      ctx.fillStyle = light;
      const truncated = txt.length > 55 ? txt.slice(0, 52) + "..." : txt;
      ctx.fillText(truncated, PAD, y + 16);
    }
    if (gaps[i]) {
      const txt = `• ${gaps[i]}`;
      ctx.font = `400 13px 'DM Sans', sans-serif`;
      ctx.fillStyle = muted;
      const truncated = txt.length > 55 ? txt.slice(0, 52) + "..." : txt;
      ctx.fillText(truncated, PAD + COL_W + 40, y + 16);
    }
    y += 22;
  }

  y += 12;

  // Bottom footer
  const footerY = H - 32;
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, footerY - 16);
  ctx.lineTo(W - PAD, footerY - 16);
  ctx.stroke();

  ctx.font = `400 12px 'DM Mono', monospace`;
  ctx.fillStyle = dim;
  ctx.fillText("Free AI Resume Tool — No account required — resumeverdict.app", PAD, footerY);
}

export function ScoreReport({ diagnosis }: { diagnosis: Diagnosis }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "unsupported">("idle");

  useEffect(() => {
    if (canvasRef.current) {
      void drawReport(canvasRef.current, diagnosis);
    }
  }, [diagnosis]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume-verdict-score.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  async function copyToClipboard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!navigator.clipboard?.write) {
      setCopyStatus("unsupported");
      setTimeout(() => setCopyStatus("idle"), 3000);
      return;
    }
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopyStatus("copied");
        setTimeout(() => setCopyStatus("idle"), 2000);
      } catch {
        setCopyStatus("unsupported");
        setTimeout(() => setCopyStatus("idle"), 3000);
      }
    }, "image/png");
  }

  return (
    <section className="flex flex-col gap-3">
      <p className="section-label">Score Report</p>
      <div className="overflow-x-auto">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ width: "100%", maxWidth: W, borderRadius: 8, border: "1px solid #2a2a2a" }}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={download}
          style={{ minHeight: 44 }}
          className="inline-flex items-center gap-2 rounded-lg border border-soft-gray bg-pure-white px-5 py-3 text-sm font-semibold text-carbon-core transition hover:bg-ash-white"
        >
          Download Score Report
        </button>
        <button
          onClick={copyToClipboard}
          style={{ minHeight: 44 }}
          className="inline-flex items-center gap-2 rounded-lg border border-soft-gray bg-pure-white px-5 py-3 text-sm font-semibold text-carbon-core transition hover:bg-ash-white"
        >
          {copyStatus === "idle" && "Copy to Clipboard"}
          {copyStatus === "copied" && "Copied!"}
          {copyStatus === "unsupported" && "Copy not supported in this browser"}
        </button>
      </div>
    </section>
  );
}
