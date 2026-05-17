# v2 work-in-progress notes

## Why this exists

Forked from v1 on 2026-05-16 so we can add a proactive cold-outreach mode (target a specific company by URL) without risking the working production app. v1 is live at https://ats-resume-advisor.vercel.app and keeps running. v2 deploys separately.

## Feature plan (company-targeting mode)

### 1. Intake mode toggle
Two radio options on the intake page:
- "I'm applying to a specific role" (current flow, default)
- "I want to target a company that isn't actively hiring" (new)

Mode persisted in localStorage alongside resume/JD/answers so refresh doesn't lose it.

### 2. Company-mode inputs
Replace the JD textarea with two fields when in target-company mode:
- Company website URL (required)
- Optional: "What role would you ideally want there?" text input (anchors the tailoring; inferred from background if blank)

### 3. Server-side URL fetch
- New route: `app/api/fetch-company/route.ts`
- Fetches the URL, strips HTML, caps content at ~15-20KB
- Cache the fetched content for 1 hour (in-memory or short-TTL Redis if available)
- Fallback: if fetch fails (JS-rendered, bot-blocked, paywall), prompt the user to paste About-page text manually
- LinkedIn URLs are explicitly rejected with a "use the company's own website instead" message

### 4. Company-Fit diagnosis (replaces match score in target mode)
New schema and prompt for target mode:
- What this company appears to value (3-4 bullets)
- Roles they likely hire for (best guess from the site)
- Where your background maps (3 bullets)
- Gaps that would matter for cold outreach (2-3 bullets)
- Confidence note: "Information about [topic] wasn't present in the X characters we read"

No match score, no GO/FIX_FIRST/PASS verdict in target mode. Replace the verdict UI with a Company-Fit card.

### 5. Intake questions for target mode
Five questions, but rebalanced:
- Why this specific company (their answer becomes the cold-outreach hook)
- Which of their experiences they'd care about most
- Any direct or adjacent connection to the company's industry, customers, or values
- A STAR story that maps to one of the company's stated priorities
- One question targeting a gap the model identified

### 6. Output for target mode
Same `experience[]` structured output (preserve roles, dates, bullets — proven in v1) PLUS:
- A **cold-outreach angle** field (2-3 sentences positioning the candidate for the company; stays grounded — no marketing-speak)
- Optional: a draft message (3-4 sentences) the candidate can paste into a LinkedIn DM or cold email. TBD whether to enable by default or behind a toggle.

### 7. Extended fact-check
The fabrication guard already runs against the candidate's bullets vs. the resume + intake. Add a second guard pass for the **company claims** in the diagnosis: anything the model said about the company has to be supported by the scraped content. Flag and remove anything not grounded.

## Build order

1. Mode toggle on intake screen
2. New `IntakeForm` branch for target mode
3. Server-side URL fetch route
4. New `COMPANY_FIT_SYSTEM` prompt + types
5. Adjusted questions prompt for company mode
6. Adjusted output prompt with cold-outreach angle
7. New result panel for target mode (Company Fit + cold-outreach hook + tailored resume)
8. Extended fact-check for company claims
9. Mobile QA on the new flow
10. Deploy and dogfood

## Open design questions

- Cold-outreach draft message: result-page-only, or downloadable too?
- Should the .docx export include the cold-outreach angle as a brief at the top? Probably not — keeps the doc ATS-pure.
- LinkedIn URL detection: regex-block or just warn?
- What's the right number for URL content cap? 15KB or higher? Some company sites have rich About pages.

## Constraints (carried from v1)

- No fabrication. Fact-check pass on everything.
- Mobile-first. 44px touch targets, 48px primary CTAs, 16px+ input fonts.
- Same Carbon Forge palette.
- Same Anthropic model routing (Haiku for diagnose/questions/fact-check, Sonnet for output).
- Vercel hobby plan 60-second function limit still applies — keep retry budgets tight.
