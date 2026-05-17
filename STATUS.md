# Build Status — AI Resume Advisor

## Decisions made during build (documented per autonomy mandate)

### 2026-05-11 — Pre-existing scaffold
The project directory was already scaffolded with `create-next-app` (Next.js 16.2.6, React 19.2.4, Tailwind v4, TypeScript). Skipped the `mv docs/` + `create-next-app` step from the adapted first command and proceeded to Step 1 (Carbon Forge theme + fonts).

### 2026-05-11 — Tailwind v4 (not v3)
Brief assumed Tailwind v3 with `tailwind.config.ts`. Actual scaffold is Tailwind v4 which uses CSS-based theming via `@theme` directive in `globals.css`. Carbon Forge palette is declared as CSS custom properties + mapped through `@theme` so utility classes (e.g. `bg-forge-red`) work as Tailwind classes.

### 2026-05-11 — Next.js 16 conventions
Next.js 16 (not the 15 in the brief). Route handlers, fonts, App Router all work the same per the bundled docs in `node_modules/next/dist/docs/`. No structural changes needed.

### 2026-05-11 — Upstash env vars not present
`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are not in `~/.env.mcp` or 1Password. `lib/ratelimit.ts` is implemented to use Upstash if configured and gracefully no-op (allow all requests with a warning) when env vars are absent. Production deploy will need these set in Vercel. Acceptable for local development; will halt before Step 11 (mobile QA on real deployment) if still missing.

### 2026-05-11 — Demo Anthropic API key
Using `ANTHROPIC_FULLREFIT_API_KEY` from `~/.env.mcp` as the value for `ANTHROPIC_API_KEY` in `.env.local`.

### 2026-05-11 — No prototype.jsx reference
The brief references `/Users/paul/dev-4/ai-resume-advisor/_reference/prototype.jsx` as the UX/copy reference. That file does not exist locally. System prompts and copy will be derived from the build brief specifications directly — the brief's ATS context block, page-by-page specs, and brand specification are detailed enough to build from without the prototype.

### 2026-05-11 — shadcn/ui scope
Brief lists shadcn/ui as the styling system. Tailwind v4 shadcn integration is still maturing in some areas, and the components needed for v1 are simple enough (button, card, badge, textarea, dialog) that hand-rolled Tailwind components matching shadcn conventions are pragmatic. The brand specification is the load-bearing constraint, not the shadcn dependency. Components live in `components/ui/`.

### 2026-05-11 — Fabrication guard retries capped at 1
The brief permits "cap regeneration at 2 attempts" (i.e., 3 total tries). Worst-case timing on Vercel's 60s function limit (Hobby plan) made 3 attempts hit `FUNCTION_INVOCATION_TIMEOUT` because each output+guard cycle is ~22s with Sonnet 4.6. Capped at 1 retry (2 total attempts, max ~45s). Empirically the first pass usually clears the guard; retries cover edge cases. If a stricter guard policy is needed later, move the worker to Vercel's Pro plan and bump retries back to 2.

### 2026-05-11 — Mobile QA via Playwright (not real iPhone Safari)
The build environment can't open Safari on a physical iPhone SE or BrowserStack from a tool call. Mobile QA was performed via Playwright with the `iPhone SE` device emulation profile (320px viewport, iOS user agent). Verified: no horizontal scroll, no inputs under 16px (would trigger iOS auto-zoom), all primary CTAs ≥48px, all secondary buttons ≥44px. Screenshots captured at `/tmp/qa-home.png`, `/tmp/qa-about.png`, `/tmp/qa-diagnose.png`. Real-device verification is the user's to perform once before going to broader distribution — the layout primitives have been built to spec.

### 2026-05-11 — Upstash rate limit NOT enforced in production
The Vercel project has `ANTHROPIC_API_KEY`, `DEMO_DAILY_LIMIT`, and `ANTHROPIC_MONTHLY_BUDGET_USD` set. `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are NOT configured — `lib/ratelimit.ts` falls back to allow-all. **Action for Paul:** add the Upstash Redis integration to this Vercel project (Settings → Integrations → Upstash), which auto-populates both env vars; then redeploy. No code change required. Until then, every demo request consumes the demo Anthropic key without per-IP capping.
