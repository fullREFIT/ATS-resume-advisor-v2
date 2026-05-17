# PROMPT CHANGELOG — AI Resume Advisor v2

This changelog covers the v1 → v2 revision of the Resume Advisor build, after a second pass through ATS research, brand audit, and audience reframe.

---

## 1. Revised prompt (for reuse)

```
Goal: Ship a public Vercel-deployed web app called "AI Resume Advisor" that takes a
user's resume + a target job description and produces an ATS-optimized tailored
resume + strategic interview prep, acting as a job-search advisor rather than a
keyword stuffer. Audience is non-technical job seekers, often on mobile.

Surface to build on: Claude Code, at /Users/paul/dev-4/ai-resume-advisor/.
Surface to plan + prototype on: Claude.ai (this chat).

Deliverables from this chat:
1. Routing decision (one sentence)
2. Strategic position (max 4 bullets)
3. Working React prototype as an artifact, using the artifact's Anthropic API
   capability, demonstrating the full four-stage advisor flow (Intake → Diagnosis
   → Strategic Intake → Tailored Output + Interview Prep). Light-mode Carbon
   Forge styled (canonical palette: Carbon Core #121010, Forge Red #D43B2A,
   Ash White #F2F0EE, Pure White #FFFFFF, Echo #878E88, Soft Gray #E5E3E0, Forge
   Gold #FFB400 used sparingly and NEVER as text on light backgrounds). Mobile-
   first responsive. localStorage persistence.
4. Claude Code build brief (.md) for a fresh Claude Code session, with: stack
   decisions, file tree, environment variables, build order, acceptance criteria,
   anti-fabrication architecture, .docx export rules, halt protocol, self-
   verification gates including mobile QA, and the first command.
5. This changelog.

Non-negotiable product principles:
- Refuse to fabricate experience the user didn't claim (3-layer guard: system
  prompt, Socratic intake, final fact-check pass).
- Honest verdict — recommend NOT applying when gap is too wide.
- ATS rules baked into .docx export: single column, standard headings, no tables/
  images, plain text, Calibri/Arial/Garamond/Georgia/Times New Roman/Helvetica/
  Tahoma/Verdana 11pt body, 14pt section headings.
- Server-side Claude default with smart model routing (Haiku for diagnosis +
  questions + fabrication guard; Sonnet for tailored output). Upstash Redis rate
  limit (5 flows per IP per day). Optional BYOK for unlimited power users.
- localStorage for client-side persistence. No Supabase. No PII on server.
- Mobile-first responsive. 16px minimum input font (no iOS zoom). 44px minimum
  touch targets. 48px minimum primary CTA height. No horizontal scroll.

Customer-facing brand rules (ABSOLUTE):
- Brand name is "full/REFIT" — NEVER "Full Refit." Exception: "fullREFIT" when
  the slash character is prohibited.
- NEVER use internal targeting language ("$1M-$10M B2B companies", ICA
  descriptors, "Marcus" buyer language) in any customer-facing output — footers,
  about pages, CTAs.

Out of scope for v1: user accounts, magic-link email login, saved history across
devices, cover letters, LinkedIn rewrite, salary negotiation, multi-language,
email capture / Kit integration.

Model: claude-sonnet-4-6 for OUTPUT in production; claude-haiku-4-5 for diagnosis
+ questions + fabrication guard; claude-sonnet-4-20250514 in the artifact
prototype (artifact-API constraint).

Constraints to honor:
- No emojis unless I use them first.
- No preambles, no padding, no sycophancy.
- Surface blind spots and trade-offs unprompted.
- End with a specific next action.
```

---

## 2. What changed from v1 → v2 (and why)

### C1. Tool name: "Resume Advisor" → "AI Resume Advisor"
**Why:** "Resume Advisor" alone reads ambiguous on first glance — could be a human service, a guide, a template library. "AI Resume Advisor" makes the mechanism clear in two words. Critical when the tool gets forwarded to people who land on it cold and decide whether to engage in under five seconds.

### C2. Audience reframe — job seekers ARE adjacent to the full/REFIT ICA
**Why:** v1 dismissed job seekers as wrong-audience. That was wrong. Operators get laid off. They know other operators who got laid off. Especially right now with AI-driven displacement. The specific anchor: a former Director of Sales at Tracker Products was fired the same week this build was scoped, and he had never heard of ATS. He is exactly the kind of person full/REFIT wants in its orbit, and he needed the tool. The free utility now functions as a portfolio piece AND a soft lead magnet, with the about page as the funnel.

### C3. BYOK default → server-side Claude default with smart routing
**Why:** BYOK assumed users could navigate Anthropic's console and produce an API key. Most non-developers can't, even ones who have technically done it once for ChatGPT. The friction wall killed adoption before users even saw the tool. New default: server-side Claude with Haiku 4.5 for diagnosis + questions + fabrication guard (~$0.002 per call) and Sonnet 4.6 for tailored output (~$0.025). Upstash Redis caps at 5 flows per IP per day; total monthly spend bounded by a hard $150 Anthropic billing alert. BYOK remains as an optional power-user mode for users who want unlimited flows.

**Cost math:** ~$0.03 per full flow with prompt caching at 70% hit rate. At 100 unique users × 5 flows/day = $15/day = ~$450/month uncapped. Rate limit + billing alert keep it under control.

### C4. No-Supabase persistence — localStorage with disclaimer
**Why:** Magic-link email login + cloud storage requires Supabase or equivalent, real cost, real complexity, real PII liability. localStorage gives 90% of the benefit (work survives browser refresh) at 0% of the cost. The intake page carries a clear disclaimer: *"Your work is saved in this browser only. Clearing browser data or switching devices will erase it."* Magic link is doable later without Supabase (Vercel + Resend + JWT cookies); defer until usage warrants it.

### C5. Light-mode Carbon Forge (was dark-mode)
**Why:** Resume work is read-heavy, low-emotion, professional-context. Light mode is the right register. Carbon Forge brand guidelines explicitly designate web applications as light-mode primary (43% Pure White cards, 22% Ash canvas). Dark mode is for cinematic punctuation (presentations, video thumbnails) — wrong choice for a utility.

### C6. Canonical palette correction
**Why:** v1 prototype used off-canonical hex values. Fixed in v2:

| Color | v1 (wrong) | v2 (canonical) |
|---|---|---|
| Red | `#E63946` | Forge Red `#D43B2A` |
| Gold | `#F4C430` | Forge Gold `#FFB400` |
| Core | `#0A0A0A` | Carbon Core `#121010` |
| Ash | `#F5F5F0` | Ash White `#F2F0EE` |

Plus added: Forge Dark `#333130`, Pure White `#FFFFFF`, Echo `#878E88`, Soft Gray `#E5E3E0` — all of which were missing.

### C7. Mobile-first explicit
**Why:** v1 implied responsive but didn't specify mobile-first as a requirement. Most users land on this tool from a LinkedIn share or a forwarded link — meaning they're on a phone. Mobile-first is now a hard acceptance criterion: 16px minimum input font (no iOS auto-zoom), 44px touch targets, 48px primary CTA height, single column always, no horizontal scroll, tested on iPhone SE (375px) and Galaxy (360px) widths before declaring done.

### C8. ATS deep-dive deltas integrated
**Why:** v1 system prompts treated keyword matching as the primary game. The deep-dive document established that this is outdated. Specific integrations:

- **Parsing failure is the #1 cause of low rankings (~30%).** The diagnosis system prompt now identifies and surfaces ATS parsing flags as a separate output field, weighted ABOVE keyword gaps. The about page busts the "75% auto-rejection" myth and explains what's actually happening.
- **Modern ATS uses semantic scoring + skill taxonomies (Workday, Greenhouse, Lever).** Exact match still wins, but vocabulary depth matters.
- **Career trajectory signals.** Modern ATS parses for upward progression via an AI co-pilot layer. The diagnosis output includes a `trajectoryNote` field.
- **LinkedIn consistency.** Workday and some iCIMS configs cross-reference resume titles/dates against LinkedIn. The result page surfaces a reminder to verify LinkedIn alignment before applying to Workday/iCIMS companies.
- **Claimed-vs-demonstrated skills check.** Modern ATS scores claimed skills against demonstrated experience. The questions prompt explicitly surfaces evidence for skills the resume claims but doesn't prove.
- **Two pages is fine for 10+ years.** Output generation no longer compresses aggressively to one page.
- **Updated ATS-safe font list.** Calibri, Arial, Garamond, Georgia, Times New Roman, Helvetica, Tahoma, Verdana (v1 only listed Calibri and Arial).
- **Vendor-aware diagnosis (optional).** Optional intake dropdown for the ATS the target company uses. Adjusts diagnosis weighting downstream (Workday → weight title matching more heavily; iCIMS → DOCX over PDF reminder; Taleo → strict-parse warning). When unknown, default weighting applies.

### C9. "Built with Claude Code" badge
**Why:** Strategic capability signaling in two directions. (1) Operators who Google the builder land on full/REFIT and see a Claude-built system as the demonstration. (2) Developers exploring Claude Code see a real-world tool built on the platform, which Anthropic's team has historically amplified for community projects. Small, present, not loud — JetBrains Mono uppercase in Echo color in the footer.

### C10. Footer copy
**Why:** v1 draft contained internal targeting language ("$1M-$10M B2B companies") — direct policy violation. v2 is clean: *"Find this useful? Learn more at [fullREFIT.com]"* — short, hyperlinked, no name attribution, no description of who full/REFIT serves. The About page handles the funnel pitch.

### C11. About page funnel rebuilt
**Why:** v1 about page concept included "for operations teams at $1M-$10M B2B companies" framing. v2 corrects to: *"This tool is built by full/REFIT — we build operational AI systems and equip teams to use them. If a free tool can solve a problem this specific, imagine what a custom system inside your company could do."* What full/REFIT solves, not who full/REFIT targets.

### C12. Brand stylization rule absolute
**Why:** Customer-facing output is always "full/REFIT" (or "fullREFIT" when the slash is platform-prohibited). NEVER "Full Refit." Added to permanent memory as an absolute rule across all contexts.

---

## 3. Flags — problems a rewrite alone can't solve

### F1 (CARRIED FROM v1 — STILL ACTIVE). .docx parsing edge cases.
The `docx` library is solid but PDF/DOCX uploads come in wildly varying formats. Some user resumes will parse badly, especially heavily designed PDFs. **Action:** Build with this assumption — if parsing produces <500 chars of text, prompt the user to paste plain text instead. Don't try to handle every weird template.

### F2 (CARRIED FROM v1 — STILL ACTIVE). Fabrication guard adds latency.
A final fact-check pass means 4 API calls per full flow instead of 3. Acceptable trade for the no-fabrication guarantee, but the result screen needs a visible "verifying claims" loading state so users don't think it's broken.

### F3 (CARRIED FROM v1 — STILL ACTIVE). No legal review.
This app gives career advice and produces resumes. Some jurisdictions have weird rules around career counseling. Probably fine since you're not charging, but: include a disclaimer on the about page ("not legal or career-counseling advice; you are responsible for the accuracy of your resume") before deploying publicly.

### F4 (NEW). The "75% auto-rejection" myth is already lodged in users' heads.
The about page corrects it, but users may have absorbed the myth from elsewhere and not trust the correction. Soft flag — the diagnosis output's `atsParsingFlags` field carries the corrective weight. The tool teaches by doing (showing parse issues as the #1 problem) more than by telling.

### F5 (NEW). Vendor-aware diagnosis is optional input.
Most users won't know which ATS the company uses. Fine — when unknown, default weighting applies. The dropdown exists primarily for users who do know (engineers applying to Big Tech who know Workday, for example) and want the diagnosis tuned. Low-effort feature, modest upside.

### F6 (NEW). Portfolio value depends on "Built with Claude Code" visibility.
If Anthropic changes how they amplify community work, or if the Claude Code project becomes less newsworthy, the strategic upside drops. The badge is cheap to include either way — but the portfolio-piece logic for this build depends on it being a current talking point.

### F7 (NEW). Server-side cost ceiling assumes rate limiting holds.
The Upstash rate limit caps abuse but doesn't cap a viral spike from legitimate users. If a LinkedIn post about this tool gets 50K views in 24 hours, even 5 flows/IP/day × 1000 users = $150/day = $4500/month at the demo cost. **Action:** Set a hard Anthropic billing cap at $150/month. If hit, demo route returns "at capacity today, try tomorrow or bring your own API key." Brutal but bounded.

### F8 (NEW). localStorage has device-switching friction.
If a user starts on phone and switches to laptop to download the .docx, they lose their work. The intake disclaimer warns about this, but it's still friction. Magic-link login is the future fix when usage warrants — not in v1 scope.

---

## 4. Strategic position (4 bullets)

- **Honest verdict.** The only resume tool that will tell you NOT to apply when the gap is too wide. This is the trust hook.
- **Three-layer no-fabrication architecture.** System prompt + Socratic intake + final fact-check pass. Other tools invent experience; this one cannot.
- **Parse-first, keyword-second diagnosis.** Reflects 2026 ATS reality (parsing failure causes ~30% of low rankings) instead of the obsolete 2018 "stuff in keywords" playbook.
- **Free, no signup, no API key required.** Server-side Claude with rate limiting means a job seeker can use it on their phone in the parking lot before the interview without needing to create an account or copy keys.
