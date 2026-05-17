# AI Resume Advisor — v2 (work in progress)

This is a fork of [ATS-resume-advisor](https://github.com/fullREFIT/ATS-resume-advisor) where the company-targeting (proactive cold-outreach) feature is being built and iterated on.

The v1 production app at https://ats-resume-advisor.vercel.app continues to run untouched. This v2 codebase is for experimental work that may or may not be merged back.

## What's different (planned)

- A mode toggle on the intake screen: "I have a job description" (existing flow) vs. "I want to target a company that isn't actively hiring" (new flow)
- Server-side fetch of a company website URL when the user picks the target-a-company mode
- A "Company fit analysis" downstream (replacing the match score in target mode) that names what the company appears to value, the roles they likely hire for, and where the candidate's background maps
- A draft cold-outreach angle in the result (2-3 sentences positioning the candidate for the company)
- Fact-check pass extended to cover company-content claims, not just resume bullets

## Status

Foundation only. Identical to v1 at clone time. Feature work tracked in `NOTES.md`.

## Local dev

```bash
npm install
npm run dev
```

Same env vars as v1 — see `.env.local.example`.
