# AI Resume Advisor — Product Brief & Copy Deck

**Version:** v2 (role mode + company cold-outreach mode)  
**Live URL:** https://ats-resume-advisor-v2.vercel.app  
**Built by:** full/REFIT  
**Date:** 2026-05-18

---

## Table of Contents

1. [What This App Does](#1-what-this-app-does)
2. [Who It Helps](#2-who-it-helps)
3. [Features & Functionality](#3-features--functionality)
4. [The No-Fabrication Guarantee](#4-the-no-fabrication-guarantee)
5. [How It Compares to Other Tools](#5-how-it-compares-to-other-tools)
6. [Marketing Language & Messaging](#6-marketing-language--messaging)
7. [Landing Page Copy Deck](#7-landing-page-copy-deck)
8. [Social & Short-Form Copy](#8-social--short-form-copy)

---

## 1. What This App Does

AI Resume Advisor is a free web app that helps job seekers close the gap between the resume they have and the job they want — without inventing experience they don't have.

It operates in two distinct modes:

### Mode 1 — Role-Specific Tailoring (apply to a posted job)

You paste your resume and a job description. The tool:

1. **Diagnoses the gap** — scores your resume from 0–100 across four components (keyword match, experience relevance, trajectory fit, ATS parsing quality), returns a verdict (GO / FIX FIRST / PASS), and explains *why* in 3–5 sentences with a breakdown showing which components hurt the score and which held it up.

2. **Asks five targeted questions** — Socratic intake powered by Claude Haiku. Each question is specific to this candidate and this job, targeting the weakest bullets and surfacing STAR stories, quantified outcomes, and demonstrated evidence for skills you claimed but didn't prove. Never generic questions.

3. **Produces a tailored resume** — Claude Sonnet rewrites your experience bullets using *exact* phrases from the job description, integrates the evidence you gave in the intake, preserves every role with company name, title, dates, and location intact. Returns a list of which JD keywords it integrated and which it couldn't (because you have no supporting evidence to cite).

4. **Generates interview prep** — likely interview questions, STAR stories to prepare, and suggested responses for the weak spots the model identified.

5. **Downloads an ATS-safe Word document** — single column, Calibri 11pt, standard headings, no tables, no graphics, no text boxes. Contact info in the document body (not in a Word header, because most ATS parsers skip headers). This is the format every applicant tracking system reads cleanly.

### Mode 2 — Company-Targeting / Cold Outreach (approach a company that isn't hiring)

You paste a company's website URL and your resume. The tool:

1. **Reads the company's website** — server-side fetch, strips HTML, caps at ~18,000 characters of clean text. Blocked hosts (LinkedIn, Facebook, Twitter/X, Instagram) are rejected with a clear message to use the company's own site.

2. **Diagnoses company fit** — analyzes what the company values, what roles they likely hire, where your background maps, and what gaps would weaken a cold pitch. No invented company facts — everything is grounded in the scraped content. Flags any claim it can't support.

3. **Runs targeted intake questions** — five questions rebalanced for cold outreach: why this specific company, which of your experiences they'd care about most, any direct or adjacent connection to their industry, a STAR story aligned to their stated priorities, and a question targeting the gap the model identified.

4. **Produces a tailored resume + cold-outreach angle** — rewrites the resume to position you for this company, then generates a 2–3 sentence cold-outreach positioning angle and a 3–4 sentence draft message you can paste into a LinkedIn DM or cold email.

5. **Dual fact-check** — separate fact-check passes run for (a) resume bullets against your resume and intake answers, and (b) company claims in the outreach angle against the scraped website content. Claims that aren't grounded are rejected and regenerated.

6. **Downloads an ATS-safe Word document** — same format as role mode. The cold-outreach angle and draft message are on the result page, not in the document, keeping the .docx ATS-pure.

### What persists and what doesn't

Everything you enter persists in your browser's localStorage across refreshes. Nothing is stored on a server. No account. No email. No data leaves your browser except the text you send to the API routes for processing.

---

## 2. Who It Helps

### Primary: Active job seekers applying to specific roles

People who have a resume and a job description and want to know: "Should I apply? And if so, how do I make this resume actually competitive?"

They're frustrated that:
- Other tools just stuff keywords without telling them if the gap is real
- Paid tools tell them everything looks great (because that's what keeps subscriptions)
- They don't know why they're not getting callbacks when they think they're qualified
- They suspect their PDF formatting is destroying their ATS ranking but don't know for sure

They need:
- An honest verdict, not a cheerful one
- To understand *specifically* which components are weak
- Their bullets rewritten with the exact language the ATS is looking for
- An ATS-safe format they can submit with confidence

### Secondary: Proactive candidates targeting companies not actively hiring

People who want to approach a specific company — a dream employer, a former client, a company they've followed — before a role is posted. They have no job description to match against, and most resume tools don't work without one.

They're frustrated that:
- Cold outreach templates are generic and get ignored
- They don't know how to position themselves for a company that hasn't said what they're looking for
- They can't tailor their resume without a target

They need:
- A way to infer what this company values from their own public materials
- A positioning angle that's specific enough to get a response
- A draft message they can actually use
- Confidence that the claims they're making about the company are accurate

### Adjacent: Career coaches and HR practitioners

People who work with job seekers professionally and want a fast, repeatable diagnostic they can use with clients — without writing every tailored resume by hand.

### Adjacent: Founders and entrepreneurs demonstrating AI capability to clients

This tool was built by full/REFIT and lives at fullrefit.com as a proof-of-concept for what operationalized AI systems can do. It serves as a demonstration asset for prospective clients considering retainer engagements.

---

## 3. Features & Functionality

### Input handling

- **Resume formats accepted:** plain text paste, .pdf, .docx
- **PDF parsing:** Uses `unpdf` (ESM-native, serverless-compatible) — handles standard PDFs reliably in ~200ms
- **DOCX parsing:** Uses `mammoth` — extracts clean plain text from Word documents
- **.pages files:** Rejected with a clear message to export to PDF from Pages (Apple Pages requires macOS at parse time; Vercel runs Linux)
- **Input size caps:** Resume capped at 30,000 characters; JD capped at 30,000 characters; company content capped at 20,000 characters after fetch

### Diagnosis (role mode)

- **Match score:** 0–100 integer, weighted average of four components
- **Score components:**
  - Keyword match (35% weight): density and exactness of JD keywords in resume
  - Experience relevance (35% weight): how directly the candidate's actual experience maps to role responsibilities
  - Trajectory fit (20% weight): whether the career arc makes this role a credible next step
  - ATS parsing (10% weight): how cleanly the resume would parse through an ATS
- **Verdict:**
  - GO: score ≥ 70, no disqualifiers — apply with tailoring
  - FIX FIRST: score 50–70 — add a project, cert, or experience first
  - PASS: score < 50 or hard disqualifier — recommend not applying
- **Verdict reasoning:** 3–5 sentences explicitly naming which components drove the score, no hedging or flattery
- **ATS parsing flags:** specific formatting issues called out in plain English
- **Trajectory note:** one sentence on career progression, gaps, or lateral moves
- **Top matches and critical gaps:** surface the strongest alignment and the biggest holes

### Company-fit diagnosis (company mode)

- **Company values observed:** 3–4 bullets grounded in scraped content only
- **Roles likely hired:** best inference from site content
- **Where your background maps:** 3 bullets aligned to the candidate's resume
- **Outreach gaps:** 2–3 bullets naming what would weaken the cold pitch
- **Confidence note:** explicit disclosure when information about a topic wasn't present in the scraped content

### Intake questions

- **Role mode:** 5 questions targeting the weakest bullets and diagnosed gaps, designed to surface STAR stories and quantified outcomes the candidate has but didn't write down
- **Company mode:** 5 questions rebalanced for cold outreach — why this company, relevant experience, industry connection, a mapped STAR story, and a gap-targeted question
- **All questions:** specific to this candidate and this job/company, never generic

### Tailored output

- **Experience structure preserved:** every role rendered as its own entry with company name, title, dates, and location — never flattened to a bullet list
- **Bullets:** rewritten with exact JD phrase mirroring (role mode) or company-language alignment (company mode), grounded in resume + intake evidence only
- **Summary:** 3–4 sentence professional summary with primary keywords woven in
- **Keywords integrated:** explicit list of JD keywords successfully integrated
- **Keywords missed:** explicit list of JD keywords that couldn't be integrated, with reason (no supporting evidence in resume or intake)
- **Interview prep:** likely questions, STAR stories to prepare, weak-spot response suggestions

### Cold-outreach output (company mode only)

- **Positioning angle:** 2–3 sentences positioning the candidate for this specific company, grounded only in scraped content + resume + intake
- **Draft message:** 3–4 sentences suitable for a LinkedIn DM or cold email, ready to use or lightly personalize

### Document export

- **Format:** .docx (Microsoft Word), generated client-side using the `docx` library
- **Layout:** single column, Calibri 11pt body, 14pt headings, 18pt name
- **Contact info:** in the document body, not in a Word header — critical for ATS parsing
- **No tables, no text boxes, no graphics, no images** — the plain format every ATS reads cleanly

### Fabrication prevention

- **System prompt enforcement:** both role and company mode prompts explicitly forbid inventing experience, tools, metrics, outcomes, or company facts
- **Bullet fact-check pass:** a second Claude call compares every rewritten bullet against the original resume + intake answers; flagged bullets are rejected and regenerated
- **Company claims fact-check pass (company mode):** a third Claude call compares claims in the outreach angle and draft message against the scraped website content; unsupported claims are rejected and regenerated
- **Retry cap:** maximum 1 retry (2 total attempts) to stay within Vercel Hobby plan's 60-second function limit

### Rate limiting

- **Implementation:** Upstash Redis + `@upstash/ratelimit`, fixed window per IP per day
- **Configurable:** `DEMO_DAILY_LIMIT` env var controls the per-IP cap
- **Graceful fallback:** if Upstash credentials aren't configured, the tool allows all requests with a server-side warning (not suitable for production without credentials set)

### Session state

- **Persistence:** localStorage, keyed to `ai-resume-advisor-v3`
- **Migration:** old v1/v2 keys are silently cleared on load
- **No server storage:** no database, no user accounts, no data retention
- **Refresh-safe:** all session state survives browser refresh; users pick up where they left off

---

## 4. The No-Fabrication Guarantee

This is the core differentiator. Most AI resume tools make things up. They insert tools the candidate never used, quantify outcomes the candidate never claimed, and invent responsibilities to pad weak experience sections. When a recruiter or hiring manager spots this (and they do), it's a disqualifying red flag.

AI Resume Advisor runs three distinct guardrails:

**Layer 1 — System prompt prohibition**  
Both the output system prompt and the company output system prompt explicitly forbid inventing any experience, tool, metric, outcome, certification, employer, date, or title not present in the source materials. The instruction is specific: "NEVER fabricate."

**Layer 2 — Socratic intake**  
Before any tailoring runs, the tool asks five targeted questions to surface real evidence. The intake answers become part of the input, so the model is working with richer ground truth — not just the resume. This is why bullets reference specific experiences: the candidate provided them.

**Layer 3 — Post-generation fact-check**  
After the tailored output is generated, a separate model call reviews every rewritten bullet against the original resume + intake answers. Any bullet asserting tools, metrics, roles, or outcomes not supported by the source is flagged. The output route then regenerates those specific bullets with the list of flagged items as negative feedback, capped at one retry.

In company mode, a fourth layer runs: the cold-outreach angle and draft message are checked against the scraped company content. Any claim about the company not grounded in the actual site text is flagged and regenerated.

---

## 5. How It Compares to Other Tools

| | AI Resume Advisor | Keyword stuffers (Jobscan, etc.) | Generic AI writers (ChatGPT direct) | Paid resume services |
|---|---|---|---|---|
| Honest verdict | Yes — will tell you to not apply | No — shows you a score, optimizes regardless | No | No — you paid them |
| No fabrication | Three-layer enforcement | N/A (keyword analysis only) | No enforcement | Depends on the human |
| Preserves resume structure | Yes — every role intact | N/A | Often flattens | Depends |
| ATS-safe export | Yes — .docx, proven format | No | No | Inconsistent |
| Cold outreach mode | Yes — company-targeting flow | No | You'd have to prompt-engineer it | No |
| Intake questions | Yes — specific to your gaps | No | No | Sometimes |
| Interview prep | Yes — per-role | No | Generic | Sometimes |
| Cost | Free | Paid subscription | Requires your own API key or paid plan | $150–$500 per resume |
| Account required | No | Yes | Depends | Yes |
| Data retention | None (localStorage only) | Yes | Yes | Yes |

---

## 6. Marketing Language & Messaging

### Core positioning statement

AI Resume Advisor gives you the honest diagnosis most tools won't — then tailors your resume using only the experience you actually have. No keyword stuffing. No fabricated bullets. No cheerful score that tells you nothing.

### Taglines

- "Honest verdict. Real tailoring. No fabrication."
- "The resume tool that will tell you not to apply."
- "Stop guessing why you're not getting callbacks."
- "ATS-optimized. Evidence-only. Free."
- "Built for job seekers who want the truth."
- "Your resume, tailored to the role. Nothing invented."
- "Know before you apply."
- "Most resume tools lie to keep your subscription. This one doesn't."

### Value proposition — role mode

You paste your resume and the job description. The tool scores your fit across four dimensions — keyword match, experience relevance, trajectory fit, and ATS parsing quality — and tells you exactly which ones are working against you. If you should apply, it tailors your resume using exact language from the job description and evidence you provide in five targeted questions. The bullets you get back are fact-checked twice before you see them. You download an ATS-safe Word document ready to submit.

### Value proposition — company mode

Most people wait for a role to be posted. The candidates who actually get hired at their dream companies don't. If there's a company you want to be at — whether they're hiring or not — this tool reads their website, figures out what they value, and helps you position your specific background for a cold outreach that has a reason to exist. You walk away with a tailored resume, a positioning angle, and a draft message. All grounded in what the company actually said about themselves.

### The honest-tool angle

The most valuable thing this tool does might be telling you to pass on a role. If your match score is below 50 — or if there's a hard disqualifier the model identifies — the verdict is PASS. Not "here's how to optimize your way past a 35% match." Some roles aren't the right move right now, and knowing that before you spend two hours tailoring and submit to an ATS that ranks you at the bottom is worth a lot.

### The no-fabrication angle

Every AI resume tool can generate a resume. Almost none of them can prove they didn't make things up. AI Resume Advisor runs a second AI call that reads every rewritten bullet against your original resume and your intake answers, looking for anything asserted that you didn't provide. Flagged bullets are regenerated with stricter constraints. The result is a resume that sounds polished but is grounded in what you actually did.

### The ATS-reality angle

The "75% auto-rejection" number is a myth — about 92% of ATS configurations don't auto-reject based on content. The real problem is being ranked so low that no recruiter ever sees you. Parsing failure causes roughly 30% of low rankings. Multi-column layouts, tables, text boxes, and PDF exports from Canva or Figma destroy parse accuracy. The .docx this tool generates — single column, Calibri 11pt, no graphics — is what ATS systems actually parse cleanly.

### One-liner options

- "Diagnose your resume like a hiring manager would. Then fix it."
- "Know your odds before you apply. Tailor if they're good."
- "The AI resume tool that uses your evidence, not invented experience."
- "For job seekers who want a real answer, not a cheerful one."
- "Targeting a company that isn't hiring? This is how you get in front of them."
- "Your ATS ranking is low because of formatting, not content. Here's the fix."

---

## 7. Landing Page Copy Deck

*This section is formatted as a complete copy brief for a landing page builder. Section headers indicate the page region. Copy is ready to use or lightly edit.*

---

### META / SEO

**Page title:** AI Resume Advisor — Honest Diagnosis, ATS-Optimized Output | Free

**Meta description:** Diagnose your resume against any job description. Get an honest score, understand exactly why you're ranked low, and download an ATS-safe tailored resume. No account. No fabrication. Free.

**OG title:** AI Resume Advisor — Know Before You Apply

**OG description:** Honest verdict. Real tailoring. No fabrication. Paste your resume and a job description — or a company URL for cold outreach. Free.

---

### HERO SECTION

**Eyebrow:** Free AI Resume Tool

**Headline (primary):**  
Your resume isn't getting callbacks. Here's exactly why.

**Headline (alternative A):**  
Know before you apply.

**Headline (alternative B):**  
The resume tool that will tell you not to apply.

**Subheadline:**  
Paste your resume and a job description. Get an honest match score, understand what's working against you, and download an ATS-safe tailored resume — built from your actual experience, nothing invented.

**Primary CTA:**  
Try it free — no account needed →

**Secondary CTA:**  
How it works ↓

**Hero trust signal (below CTA):**  
No signup. No API key. Your data stays in your browser.

---

### PROBLEM SECTION

**Section label:** The real problem

**Headline:**  
Most resume tools are lying to you.

**Body:**  
They give you a keyword score and tell you to optimize. They stuff your resume with phrases. They tell you everything looks great — because that's what keeps your subscription.

Here's what they don't tell you:

- 92% of applicant tracking systems don't auto-reject based on content. The myth of the ATS rejection wall is wrong. The real problem is being ranked so low that no recruiter ever sees you.
- Parsing failure causes roughly 30% of low rankings. Multi-column resumes, tables, text boxes, and PDF exports from Canva or Figma are destroying your ATS score before a human reads a single word.
- The gap between your resume and this job might actually be disqualifying. You deserve to know that before you spend two hours tailoring and submit to a role you have a 20% chance at.

---

### FEATURES / HOW IT WORKS SECTION

**Section label:** How it works

**Headline:**  
Four steps. One honest answer.

**Step 1:**  
**Paste your resume + job description**  
Upload a PDF or .docx, or paste plain text. Paste the full job description. Takes 60 seconds.

**Step 2:**  
**Get your diagnosis**  
A match score from 0–100, broken down across four real dimensions: keyword match, experience relevance, trajectory fit, and ATS parsing quality. A verdict — GO, FIX FIRST, or PASS — with a plain-English explanation of what drove it. If the score says pass, we'll tell you why.

**Step 3:**  
**Answer five targeted questions**  
Not generic. Five questions specific to your resume and this job — designed to surface the STAR stories, quantified outcomes, and demonstrated evidence you have but didn't write down. This is where the tailoring gets real.

**Step 4:**  
**Download your tailored resume**  
Your experience rewritten using exact language from the job description — your evidence, never invented. Every role preserved with company, title, dates, and bullets. An ATS-safe Word document ready to submit.

**Bonus:** Interview prep. Likely questions, STAR stories to prepare, and suggested responses for the weak spots the model found.

---

### DIFFERENTIATOR SECTION — NO FABRICATION

**Section label:** The no-fabrication promise

**Headline:**  
Every bullet is fact-checked. Twice.

**Body:**  
Most AI writing tools generate plausible-sounding content. That's a problem when the content is your resume — because recruiters and hiring managers spot invented experience. A fabricated bullet that gets caught is worse than the original.

Three layers stop it from happening here:

**Layer 1 — The system prompt forbids it.** The model is explicitly instructed to use only what you provided. No inventing tools, metrics, outcomes, or roles.

**Layer 2 — The intake forces real evidence in.** Before tailoring runs, five targeted questions surface specific stories and outcomes from your actual background. The model rewrites from that evidence — not from inference.

**Layer 3 — A second AI call reviews every bullet.** After the resume is generated, a separate fact-check call compares every rewritten bullet against your original resume and intake answers. Anything asserting experience you didn't provide gets flagged and regenerated.

The result is a resume that's polished and targeted — and one you can actually stand behind.

---

### COMPANY MODE SECTION

**Section label:** Not just for active job seekers

**Headline:**  
Want to get in front of a company before a role is posted?

**Body:**  
Most people wait for job listings. The candidates who get hired at companies they actually want to work for don't.

If there's a specific company on your list — a former client, a dream employer, a startup you've followed — this tool can read their website and help you position your background for a cold outreach that has a real reason to exist.

**Paste a company URL. The tool:**
- Reads what the company does and what it appears to value
- Maps where your background aligns
- Names the gaps that would weaken your pitch
- Asks five intake questions specific to cold outreach
- Produces a tailored resume, a positioning angle, and a draft message

Everything grounded in what the company actually said about themselves. No invented company facts.

**CTA:** Try the company-targeting mode →

---

### SOCIAL PROOF / CREDIBILITY SECTION

**Section label:** What it produces

**Headline:**  
Real tailoring. Not a rewrite of your weakest version.

**Body:**  
We ran this tool against a real candidate — Nic, a sales leader applying for a Sales Manager role — using his current resume and the job description. Here's what changed:

| | Before | After |
|---|---|---|
| Match score | 62/100 FIX FIRST | 72/100 GO |
| Score breakdown | 2-sentence summary | 4 components with individual scores |
| Roles in output | Flat bullet list (0 roles) | 4 full role entries with company, title, dates |
| Total bullets | 7 | 17 |
| Exact JD phrases used | ~5 (paraphrased) | 13 verbatim |
| Missed keywords | Not disclosed | 1, with explicit reason |
| Contact info | Corrupted | Clean |

The .docx downloaded from AI Resume Advisor is single-column, Calibri 11pt, no tables or graphics — the format every ATS parses cleanly.

---

### COMPARISON SECTION

**Section label:** How it's different

**Headline:**  
Not another keyword score. An actual verdict.

**Body:**  
Keyword-match tools show you a percentage and tell you to optimize. They don't tell you if the gap is real. They don't tell you your format is destroying your ranking. They don't tell you to pass on a role.

This tool does.

If your score is below 50 or there's a hard disqualifier, the verdict is **PASS** — not "here's how to keyword-stuff your way into a role you're not qualified for." Some roles aren't the right move right now. Knowing that before you apply is worth more than a fake 85% match.

---

### OBJECTIONS / FAQ SECTION

**Section label:** Questions

**Q: Is this actually free?**  
A: Yes. No account, no credit card, no API key required. The tool is free to use.

**Q: Where does my resume go?**  
A: Your resume text is sent to our API routes for processing (which call Anthropic's Claude models) and then returned to your browser. Nothing is stored on a server. Your session state — resume, answers, output — lives only in your browser's localStorage.

**Q: What formats can I upload?**  
A: .pdf and .docx. You can also paste plain text directly. If you're on a Mac and your resume is in Apple Pages, export it to PDF first (File → Export To → PDF).

**Q: Can the AI tell when my resume won't parse correctly?**  
A: Yes — the ATS parsing component scores how cleanly your resume reads in plain text. Multi-column layouts, tables, text boxes, and image-based PDFs all get flagged. The downloaded .docx is deliberately plain to fix this.

**Q: What if I don't have a job description?**  
A: Use company-targeting mode. Paste the company's website URL instead. The tool reads what the company does and helps you position yourself for cold outreach — even without a specific role to match against.

**Q: What if the tool says to pass on a role I really want?**  
A: That's the most valuable output this tool produces. A PASS verdict means the gap between your resume and this role is significant enough that an honest ranking system will bury your application. Your options: close the gap first (a cert, a project, a lateral move), or apply anyway knowing you're starting at a disadvantage. Either way, you're making an informed decision.

**Q: Does it work for senior roles / executive resumes?**  
A: Yes. The tool has been tested with sales leadership, operations, and strategy roles. The output respects the candidate's level — it doesn't flatten a 15-year career into entry-level language.

---

### CLOSING CTA SECTION

**Headline:**  
Your next application should start here.

**Body:**  
Know your odds. Understand the gap. Download a resume you can submit with confidence.

**Primary CTA:**  
Try it free →

**Secondary:**  
Takes about 10 minutes end to end.

**Trust signals:**  
- No account required
- No data stored on our servers
- Built with Claude (Anthropic)

---

### FOOTER / BRAND SECTION

**Built by full/REFIT**  
We build operational AI systems and equip teams to use them. If a free tool can solve a problem this specific, imagine what a custom system inside your organization could do.

**CTA:** See what we build at fullrefit.com →

---

## 8. Social & Short-Form Copy

### LinkedIn post angles

**Angle 1 — The myth-bust:**
The "75% auto-rejection" ATS myth has been circulating for a decade. It's wrong.

About 92% of applicant tracking systems don't auto-reject based on content. The real problem is being ranked so low that no recruiter ever sees you.

Parsing failure causes roughly 30% of low rankings — the single biggest cause. Multi-column resumes, tables, text boxes, Canva exports — they destroy your parse score before a human reads a word.

We built a free tool that diagnoses this. Paste your resume and a job description. Get a score breakdown across keyword match, experience relevance, trajectory fit, and ATS parsing quality.

And if the verdict is PASS — it'll tell you that too.

[link]

**Angle 2 — The fabrication angle:**
Ask any hiring manager how fast they spot a bullet written by AI.

About 3 seconds.

The problem with AI resume tools isn't the writing quality. It's that they make things up — tools the candidate never used, outcomes they never claimed, experience they don't have.

We built a fact-check layer into our free resume tool: after generation, a second AI call reads every bullet against the original resume and flags anything not supported. Rejected bullets get regenerated with stricter constraints.

The result is a resume that sounds polished but is grounded in what you actually did.

[link]

**Angle 3 — The cold outreach angle:**
Most people wait for a job to be posted.

The candidates who get hired at companies they actually want to work for don't.

We just shipped a company-targeting mode in our free AI resume tool. Paste a company's website URL. The tool reads what they do, maps where your background fits, and helps you write a cold outreach that has a specific reason to exist.

No job description required. No invented company facts — everything grounded in what the company said about themselves.

[link]

**Angle 4 — The honest tool:**
Most resume tools are optimizing for you to stay subscribed.

That means they tell you everything looks great. It means they show you a 78% match on a role you have no realistic shot at. It means they suggest keywords without telling you whether the underlying gap is fixable.

We built a tool that will tell you to pass on a role.

If your match score is below 50 or there's a hard disqualifier, the verdict is PASS. Some roles aren't the right move right now. Knowing that before you apply — and understanding specifically why — is worth more than a fake confidence boost.

Free. No account. [link]

### Short-form / Twitter-style copy

- Most resume tools optimize your confidence. This one optimizes your odds.
- The ATS isn't rejecting you. It's just ranking you at the bottom. There's a difference.
- "Your resume looks great" is the most expensive lie in job searching.
- Cold outreach that works needs a specific reason to exist. We help you find it.
- Every bullet checked twice for fabrication. Because invented experience gets you disqualified, not hired.
- Know before you apply. [link]

### Call-to-action phrases (for ads, email, etc.)

- Try it free — no account needed
- Get your honest score
- Start with a diagnosis
- Know your odds
- Download your tailored resume
- Target companies that aren't hiring
- See the verdict

---

*Product brief and copy deck compiled 2026-05-18 for AI Resume Advisor v2.*  
*Built by full/REFIT — fullrefit.com*
