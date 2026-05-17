# Claude Code Build Brief — AI Resume Advisor (Vercel)

**Project location:** `/Users/paul/dev-4/ai-resume-advisor/`
**Stack:** Next.js 15 App Router · TypeScript · Tailwind · shadcn/ui · Anthropic SDK
**Deploy target:** Vercel (public, free tool)
**Brand:** Carbon Forge — **light mode**, mobile-first, canonical palette
**Positioning:** Free utility + portfolio piece + soft lead magnet for full/REFIT

---

## Build context for Claude Code

Treat this as a self-contained scope. Do not expand scope without surfacing the trade-off. If you hit ambiguity, default to the smallest shipping cut and flag it.

The product is an **AI Resume Advisor** — resume tailoring plus strategic job-search advisor. The core differentiator is the **advisor spine**: honest gap diagnosis, Socratic intake to extract real STAR stories, ATS-optimized output without fabrication, and interview prep tied to the specific gap between resume and JD.

A working React prototype with live Claude API calls is at `/Users/paul/dev-4/ai-resume-advisor/_reference/prototype.jsx` (copy from the artifact in chat). Use it as the UX reference — same four-stage flow, same Carbon Forge styling, same system prompts.

---

## Acceptance criteria

A fresh user (assumed non-technical, possibly on a phone) can:

1. Land on `/`, read a short ATS context blurb, understand what the tool does in under 10 seconds
2. Paste or upload (PDF/DOCX) a resume, paste a JD — no signup, no API key required
3. See a Diagnosis screen with match score (0-100), GO/FIX_FIRST/PASS verdict, top matches, critical gaps, **ATS parsing flags** (the #1 cause of low rankings), career trajectory note
4. If GO or FIX_FIRST: continue to a Strategic Intake screen with 5 model-generated questions tied to the gaps
5. Answer questions, then see a Result screen with tailored bullets (original-vs-rewritten diff), keywords integrated, and an interview prep brief
6. Download the tailored resume as a .docx file (ATS-safe: single column, standard headings, no tables/images)
7. Get an honest "don't apply, fix yourself first" recommendation when the gap is too wide (PASS verdict)
8. Have their work persist across browser refreshes via localStorage; see a clear disclaimer that work is browser-local
9. Use the tool on a phone with no horizontal scrolling, no text-input zoom, no broken layouts

The app must:

- Be **mobile-first**. Phone is the primary device the user is on when they get the JD link.
- Never write to a database (stateless server; localStorage on the client)
- Never store user resumes/JDs/API keys server-side
- Refuse to fabricate experience the user didn't claim (3-layer guard: system prompt, Socratic intake, final fact-check pass)
- Default to a server-side rate-limited Claude flow (free for the user); offer optional BYOK for power users who want unlimited
- Deploy cleanly to Vercel with `vercel deploy --prod` after `vercel link`

---

## Stack decisions (pre-resolved — do not re-litigate)

| Concern | Decision | Why |
|---|---|---|
| Framework | Next.js 15 App Router | First-class Vercel, route handlers for the API proxy |
| Language | TypeScript strict | Catch shape errors on structured Claude outputs |
| Styling | Tailwind + shadcn/ui | Fast component reach; theme via CSS vars |
| State (client) | React `useState` + `localStorage` (no Supabase) | Free persistence, no PII on server |
| State (server) | Stateless API routes only | No DB needed |
| LLM model — orchestration | `claude-sonnet-4-6` for tailored OUTPUT generation | Best cost/quality for narrative resume work |
| LLM model — supporting | `claude-haiku-4-5` for diagnosis, questions, and fabrication guard | $1/M in, $5/M out — 80% cost reduction vs Sonnet for structured short tasks |
| Auth | None | Public utility |
| Rate limiting | Upstash Redis `@upstash/ratelimit` on demo flow (5 flows/IP/day) | Caps abuse, keeps cost bounded |
| File parsing | `pdf-parse` for PDF, `mammoth` for DOCX | Server-side in route handler |
| .docx export | `docx` npm package | Generate ATS-safe Word file client-side |
| Anthropic SDK | `@anthropic-ai/sdk` latest | Standard |
| Deploy | Vercel via CLI or Vercel MCP | Tracker has both wired |
| Spend ceiling | Hard Anthropic billing alert at $150/month | Brutal but bounded |

**Cost estimate per full flow** (with prompt caching at ~70% hit rate after warmup):
- Diagnosis (Haiku): ~$0.002
- Questions (Haiku): ~$0.002
- Output (Sonnet): ~$0.025
- Fabrication guard (Haiku): ~$0.002
- **Total per flow:** ~$0.03

At 5 flows/IP/day × 100 unique users/day = $15/day = ~$450/month uncapped. The Upstash rate limit + Anthropic billing alert keep this under control. Set initial alert at $150 and adjust if usage warrants.

---

## File tree to scaffold

```
ai-resume-advisor/
├── README.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.mjs
├── .env.local.example
├── .env.local                  (gitignored)
├── .gitignore
├── app/
│   ├── layout.tsx              (Outfit + JetBrains Mono fonts, Carbon Forge CSS vars)
│   ├── page.tsx                (intake screen)
│   ├── globals.css             (Carbon Forge palette as CSS vars, light mode)
│   ├── diagnose/page.tsx
│   ├── refine/page.tsx
│   ├── result/page.tsx
│   ├── about/page.tsx          (methodology + soft funnel CTA to fullREFIT.com)
│   └── api/
│       ├── demo/               (server-side key, rate-limited, default flow)
│       │   ├── diagnose/route.ts
│       │   ├── questions/route.ts
│       │   └── output/route.ts
│       └── byok/               (user's own API key, unlimited)
│           ├── diagnose/route.ts
│           ├── questions/route.ts
│           └── output/route.ts
├── lib/
│   ├── claude.ts               (Anthropic SDK wrapper, model routing, JSON parsing)
│   ├── prompts.ts              (DIAGNOSIS_SYSTEM, QUESTIONS_SYSTEM, OUTPUT_SYSTEM, FABRICATION_GUARD_SYSTEM)
│   ├── parse-resume.ts         (PDF + DOCX → plain text)
│   ├── generate-docx.ts        (tailored bullets → ATS-safe .docx)
│   ├── ratelimit.ts            (Upstash Redis helper)
│   ├── storage.ts              (localStorage wrapper with disclaimer)
│   └── types.ts                (Diagnosis, Question, TailoredOutput types)
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx              (fullREFIT.com link + Built with Claude Code badge)
│   ├── ProgressBar.tsx
│   ├── VerdictBadge.tsx
│   ├── ATSContextBlock.tsx     (the explainer at top of intake)
│   ├── LocalStorageDisclaimer.tsx
│   ├── ResumeUpload.tsx        (paste OR upload)
│   ├── JDInput.tsx
│   ├── DiagnosisCard.tsx
│   ├── QuestionForm.tsx
│   ├── TailoredBullets.tsx
│   ├── InterviewPrep.tsx
│   ├── ApiKeyDialog.tsx        (optional BYOK; stores in sessionStorage)
│   └── ui/                     (shadcn primitives)
└── _reference/
    └── prototype.jsx           (working React prototype for UX reference)
```

---

## Carbon Forge brand — light mode, canonical palette

**Use the canonical hex values exactly. No substitutions.** Earlier prototype hex values were off — these are correct.

| Name | HEX | Role |
|---|---|---|
| Carbon Core | `#121010` | Body text, headings, dark sections |
| Forge Red | `#D43B2A` | CTAs, links, section labels, accents |
| Forge Red Hover | `#B8301F` | Hover state for primary buttons |
| Forge Gold | `#FFB400` | Sparing accent only. **NEVER as text on light backgrounds** (fails accessibility at 1.8:1) |
| Forge Dark | `#333130` | Dark section backgrounds (about page proof block) |
| Ash White | `#F2F0EE` | Page canvas background |
| Pure White | `#FFFFFF` | Card surfaces on top of Ash canvas |
| Echo | `#878E88` | Secondary text, metadata |
| Soft Gray | `#E5E3E0` | Borders, dividers |

**Surface ratios (light mode):**
- ~43% Pure White card surfaces
- ~22% Ash White canvas
- ~12% Carbon Core (text + one dark section in About)
- ~10% Forge Dark
- ~8% Forge Red (CTAs, accents)
- ~5% Forge Gold (one accent only — Layer 2 label in About proof block)

**Typography:** Outfit (Google Fonts) for body and headings; JetBrains Mono for labels, metrics, badges. **No italics anywhere.** Section labels are JetBrains Mono 600, 0.6875rem, UPPERCASE, 0.12em letter-spacing, Forge Red.

**Component patterns:**
- Primary CTA: Forge Red bg, white text, 0.5rem radius, 600 weight, hover `#B8301F`
- Secondary button: transparent bg, Soft Gray border, Carbon Core text
- Cards: Pure White bg, 1px Soft Gray border, 0.75rem radius, 1.5rem padding
- Layer 1 cards (system content): 3px Forge Red top border
- About page proof block: Carbon Core bg, Ash White text, one Forge Gold accent

---

## Mobile-first responsive requirements

- Max content width: 720px, centered, ~1rem horizontal padding on mobile, more on desktop
- All input fields and buttons: minimum 44×44px touch target, minimum 48px height for primary CTAs
- Body text: 16px minimum (prevents iOS auto-zoom on input focus)
- Single column always (resume work is sequential — never side-by-side on mobile)
- Progress indicator: numbers visible on all viewports, text labels hidden under 640px
- Forms: stack vertically, full-width inputs, full-width primary buttons on mobile
- No horizontal scroll. No fixed positioning that breaks on mobile Safari.
- Test on iPhone SE width (375px) and Samsung Galaxy width (360px) before declaring done.

---

## System prompts (in `lib/prompts.ts`)

The four system prompts live in `lib/prompts.ts`. Copy them from the prototype at `_reference/prototype.jsx` — they have the 2026 ATS deep-dive deltas already integrated:

- **DIAGNOSIS_SYSTEM** — Includes: ATS rarely auto-rejects (busts the 75% myth), parsing failure causes ~30% of low rankings, modern ATS uses semantic scoring + skill taxonomies, career trajectory signals matter, Workday/iCIMS cross-reference LinkedIn. Output schema includes `atsParsingFlags` and `trajectoryNote`.
- **QUESTIONS_SYSTEM** — Targets gaps + the claimed-vs-demonstrated skills check. Modern ATS scores claimed skills against demonstrated experience — every claim needs proof.
- **OUTPUT_SYSTEM** — Keywords weighted heaviest in Summary and FIRST BULLET of each role; mirror exact JD language; include spelled-out + abbreviated forms; never invent metrics; reverse-chronological; two pages OK for 10+ years.
- **FABRICATION_GUARD_SYSTEM** — Final fact-check pass on tailored bullets. Rejects any bullet asserting experience, tools, metrics, or outcomes not in the original resume or intake answers. Output route regenerates rejected bullets with stricter constraints; cap regeneration at 2 attempts.

---

## Page-by-page specs

### `/` (Intake)

**Top of page:**
- Header: "AI Resume Advisor" wordmark + tagline "Honest diagnosis. No fabrication. ATS-optimized."
- "How it works" link to `/about`
- Progress bar (step 1 of 4)

**ATS context block** (the explainer — give users who don't know what ATS is enough to understand the value):

> 97.8% of Fortune 500 companies use applicant tracking systems (ATS). The software ranks resumes before any human sees them, and formatting alone can kill a strong candidate. This tool diagnoses where your resume stands, fixes what's broken, and tells you honestly when the gap is too wide to apply.

**localStorage disclaimer:**

> Your work is saved in this browser only. Clearing browser data or switching devices will erase it. Nothing is sent to any server beyond the AI model that analyzes your text.

**Form:**
- Resume textarea (or upload PDF/DOCX — parsed server-side)
- JD textarea
- Optional: "Which ATS does this company use?" dropdown (Workday, Greenhouse, Lever, iCIMS, Taleo, SmartRecruiters, Don't know) — adjusts diagnosis weighting downstream
- Primary CTA: "Diagnose fit"

### `/diagnose` (Diagnosis)

- Match score (big number, colored by verdict)
- Verdict badge: GO (Forge Red), FIX_FIRST (Forge Gold-coded but text dark), PASS (Echo)
- Verdict reasoning (2 sentences)
- Top matches (3)
- Critical gaps (3)
- ATS parsing flags (if any — these surface ABOVE keyword gaps because parsing failure is the #1 issue)
- Career trajectory note (1 sentence)
- Primary CTA: "Refine my resume" (only if GO or FIX_FIRST)
- Secondary: "Start over"

### `/refine` (Strategic Intake)

- 5 model-generated questions, each with category, question text, "why we're asking", and a textarea
- Validation: each answer must be > 20 chars before "Generate tailored resume" is enabled
- Back button to `/diagnose`

### `/result` (Tailored Output)

- Professional summary (with copy button)
- Tailored bullets — original-vs-rewritten with strikethrough on original (or "NEW from intake" label)
- Keywords integrated (pill list)
- Interview prep block: likely questions, STAR stories to prep, weak-spot responses
- "Download as .docx" primary CTA (ATS-safe export — see rules below)
- "LinkedIn consistency check" reminder: a checklist note that the user should verify their LinkedIn job titles/dates match the resume before applying to Workday or iCIMS companies
- "Start over with a new resume" secondary

### `/about` (Methodology + soft funnel)

Three sections:

**1. How it works** — Honest diagnosis, then real tailoring. Most resume tools stuff keywords or tell you everything is fine. This one diagnoses the gap first, asks targeted questions to surface evidence, then tailors using only what you actually told it.

**2. How applicant tracking systems actually work** — The 75% auto-rejection number is a myth (92% of ATS configs don't auto-reject based on resume content). The real problem is being ranked too low to be seen. Parsing failure is the #1 cause of low rankings (~30%). Multi-column layouts, tables, text boxes, Canva/Figma PDFs destroy parse accuracy. The downloaded output is deliberately plain because plain works.

**3. The no-fabrication promise** — Three layers: system prompt forbids inventing experience; Socratic intake forces real evidence before tailoring runs; final fact-check pass removes anything the AI made up.

**Funnel block at the bottom** (Carbon Core dark surface with Forge Gold accent label):

> This tool is built by full/REFIT — we build operational AI systems and equip teams to use them. If a free tool can solve a problem this specific, imagine what a custom system inside your company could do.
>
> [See what we build →] (link to fullrefit.com)

**No name attribution. No targeting language. No description of who full/REFIT serves.** What full/REFIT solves, not who full/REFIT targets.

### Footer (every page)

> Find this useful? Learn more at [fullREFIT.com](https://fullrefit.com)
>
> BUILT WITH CLAUDE CODE

(Footer is light. "fullREFIT.com" is the Forge Red hyperlink. "BUILT WITH CLAUDE CODE" is JetBrains Mono, uppercase, Echo color, small.)

---

## Environment variables

`.env.local.example`:

```
# Server-side demo key (default flow)
ANTHROPIC_API_KEY=

# Upstash Redis for demo-route rate limiting (required)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Demo rate limit (5 flows per day per IP)
DEMO_DAILY_LIMIT=5

# Anthropic billing safety net (informational; set hard cap in Anthropic console)
ANTHROPIC_MONTHLY_BUDGET_USD=150
```

In Vercel: mark `ANTHROPIC_API_KEY` as a secret. Configure Upstash via the Vercel Upstash integration for one-click provisioning. Set a hard $150/month spend alert in the Anthropic console.

---

## Model routing in `lib/claude.ts`

```typescript
// Route by task type
const MODELS = {
  diagnosis: "claude-haiku-4-5",       // Short structured JSON, fast, cheap
  questions: "claude-haiku-4-5",       // Short structured JSON
  output: "claude-sonnet-4-6",         // The expensive call — needs quality
  fabrication_guard: "claude-haiku-4-5", // Pattern matching, fast
};
```

Use Anthropic's prompt caching on the system prompts (all four). Cache hit rate should warm to 70%+ after the first dozen flows, cutting effective cost ~80%.

---

## Build order (sequential — each step ships)

1. **Scaffold + brand** — `npx create-next-app@latest`, install Tailwind + shadcn, configure Carbon Forge CSS vars in `globals.css`, set Outfit + JetBrains Mono fonts in `layout.tsx`. Smoke test: blank page renders with Ash White background and Carbon Core text. **Verify on mobile viewport in Chrome DevTools (375px width).**
2. **Lib layer** — `lib/claude.ts` with model routing, `lib/prompts.ts`, `lib/types.ts`, `lib/storage.ts`. Unit-test the JSON parser with a sample malformed response.
3. **Demo API routes** — `/api/demo/diagnose`, `/api/demo/questions`, `/api/demo/output`. Upstash rate limit on all three. Test with curl + the server-side key.
4. **Intake screen** — `app/page.tsx` with ATS context block, localStorage disclaimer, paste-only flow (no upload yet). Wire to `/api/demo/diagnose`. Ship.
5. **Diagnosis + question screens** — `app/diagnose/page.tsx`, `app/refine/page.tsx`. State persisted via `localStorage`. Ship.
6. **Result screen + fabrication guard** — `app/result/page.tsx`, integrate guard into `/api/demo/output`. Ship.
7. **File upload** — `lib/parse-resume.ts`, hook PDF/DOCX upload into `ResumeUpload`. Fallback: if parsed text < 500 chars, prompt user to paste plain text. Ship.
8. **.docx export** — `lib/generate-docx.ts`, "Download tailored resume" button on result screen. Ship.
9. **BYOK routes + dialog** — `/api/byok/*` mirror of demo routes; `ApiKeyDialog.tsx` for optional power-user mode. Ship.
10. **About page** — `app/about/page.tsx` with methodology, ATS myth bust, no-fabrication promise, funnel block. Ship.
11. **Mobile QA pass** — Test full flow on iPhone Safari (real device or BrowserStack), Android Chrome, iPad. Fix any layout breaks.
12. **Deploy** — `vercel link` + `vercel deploy --prod`. Confirm env vars set in Vercel dashboard. Smoke test public URL with a real resume + JD on phone and desktop.

After every step that ends with "Ship": commit + push to GitHub. Don't batch commits across steps.

---

## ATS rules — bake into the .docx export

The downloaded .docx must:

- Single column, no tables, no text boxes, no headers/footers with critical info
- Standard section headings: `PROFESSIONAL SUMMARY`, `WORK EXPERIENCE`, `EDUCATION`, `SKILLS`, `CERTIFICATIONS` (no clever names)
- Reverse-chronological order within each section
- **ATS-safe fonts (any of):** Calibri, Arial, Garamond, Georgia, Times New Roman, Helvetica, Tahoma, Verdana. Default: Calibri 11pt body, 14pt headings.
- No graphics, icons, special characters beyond standard punctuation
- Contact info at top in document body (NOT in a Word header — most parsers extract body text only): name (single line), email, phone, LinkedIn URL, city/state
- File name: `{FirstName}_{LastName}_Resume.docx`
- Each bullet starts with a strong action verb, past tense for past roles
- No "References available upon request", no objective statement, no photo
- Two pages is acceptable for 10+ years of experience — do NOT compress aggressively to one page

---

## What to skip on v1 (explicit non-goals)

- User accounts, saved history across devices (localStorage is the v1 answer)
- Magic-link email login (defer; doable later without Supabase via Vercel + Resend + JWT cookies)
- Job board scraping or autosearch
- Cover letter generation (next iteration if metrics warrant)
- LinkedIn profile rewrite (next iteration — for now, we surface a consistency-check reminder only)
- Salary negotiation prep
- Multi-language support (English only)
- A/B testing infrastructure
- Analytics beyond Vercel's defaults
- Email capture / Kit integration (deliberately omitted — wrong audience for the full/REFIT list)

If a request appears for any of the above mid-build, surface it and proceed without it.

---

## Halt protocol

Halt and ask only if:

- A required env var is missing AND the tool can't proceed without it
- A library install fails AND retry with alternative versions also fails
- An acceptance criterion is genuinely ambiguous (give your best read + the alternative)

Do NOT halt for: design choices, copy decisions, library substitutions where the spec named one (use the named library), or scope expansion temptations.

---

## Self-verification before "done"

Before declaring complete, run this sequence:

1. `npm run build` succeeds with zero errors
2. `npm run lint` passes
3. Paste a real resume + a real JD into the deployed URL → full flow completes on desktop
4. **Repeat on iPhone Safari (real device or BrowserStack iPhone SE)** → full flow completes with no horizontal scroll, no zoom, no broken layouts
5. Download the .docx → open in Word and Google Docs → verify single column, standard headings, Calibri 11pt, no broken formatting, no clever section names
6. Test with a deliberately bad fit (e.g., chef resume + senior engineer JD) → verify PASS verdict triggers
7. Test demo route rate limit: 6 flows from the same IP → 6th flow returns 429 with friendly message
8. Test BYOK with an obviously wrong key → verify clean error message, no API key leakage in logs
9. Test localStorage persistence: complete diagnosis, refresh browser, verify state restored
10. Verify the .docx contact info appears in document body (not header) by re-parsing the exported file
11. Verify About page funnel block: full/REFIT mentioned, fullrefit.com link works, no name attribution, no targeting language

Report each gate as pass/fail. If any fail, fix before declaring done.

---

## First command

```bash
cd /Users/paul/dev-4 && npx create-next-app@latest ai-resume-advisor --typescript --tailwind --app --no-src-dir --import-alias "@/*" && cd ai-resume-advisor && git init && gh repo create ai-resume-advisor --public --source=. --remote=origin
```

Then begin Step 1 of the build order.
