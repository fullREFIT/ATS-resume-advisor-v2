# resume-verdict — Emergency Cost-Stop + 3-Tier Monetization

**Created:** 2026-05-31
**Worktree:** `/Users/paul/dev-5/projects/resume-verdict/.claude/worktrees/groq-swap-053126`
**Branch:** `worktree-groq-swap-053126`

## Why this matters

Live Vercel app burning 30.9M Anthropic tokens/week (+6101%) — estimated $1.6K–3.2K/month at current rate. Owner has zero income. The app is genuinely helping real people in his network with their job search; killing it isn't an option. This spec gets the app to sustainable cost (<$50/month) and revenue-positive within one afternoon.

## Success criteria

- Anthropic weekly burn drops from 30.9M tokens to near-zero (BYOK users excepted, who pay their own way)
- Free tier limited to 2 verdicts/day per IP (was 5)
- Hard budget kill-switch active: app returns 503 when month-to-date LLM spend exceeds `LLM_MONTHLY_BUDGET_USD`
- BYOK tier live: users with Anthropic API keys get unlimited verdicts, owner pays $0 for their usage
- Stripe Checkout tier live: $9 one-time → 10-verdict unlock token bypasses rate limit
- Live deployment never breaks during rollout — each piece deployable independently

## Scope phases (ordered by risk/impact, lowest-risk-highest-impact first)

| # | Piece | Code time | Owner-manual time | Ship priority |
|---|---|---|---|---|
| 1 | Emergency cost-stop (DEMO_DAILY_LIMIT=2 + budget guard code) | ~45 min | ~5 min (Vercel env) | MUST |
| 2 | OpenRouter → DeepInfra provider swap | ~45 min | ~10 min (OpenRouter signup + 1Password + Vercel env) | MUST |
| 3 | BYOK (Anthropic-only) restoration from git history | ~90 min | ~5 min (Vercel env smoke test) | MUST |
| 4 | Stripe Checkout paywall + token unlock | ~3 hours | ~15 min (Stripe account + 1Password + webhook URL) | STRETCH |

**Total code time:** ~5.5 hours. Stripe paywall is the realistic stretch — pieces 1–3 are the floor.

## Architecture constraints

- Operating in the existing worktree on branch `worktree-groq-swap-053126`. Do not create new branches.
- All env-var changes go through 1Password vault → `/update-pw` sync → Vercel CLI. No manual plaintext in repo.
- BYOK requests bypass server-side rate limit AND budget guard (user pays their own way, isolated from app's metering).
- Stripe-unlocked requests bypass rate limit but DO count against the app's budget (owner is paying for LLM, user paid owner). Budget guard still applies.
- Each piece must be independently deployable (revert one without affecting others).

## How to run

See [`00-PROJECT-INDEX.md`](00-PROJECT-INDEX.md) for live status. See [`CLAUDE-TASKS.md`](CLAUDE-TASKS.md) for executable task prompts.

## Related artifacts

- Original audit: `/Users/paul/api-key-audit_053026.md`
- Groq swap deliverable (superseded by OpenRouter swap in this spec): `/Users/paul/groq-swap_053026/`
- Live deployment: `https://ats-resume-advisor-v2-hv6oew8v6-fullrefit.vercel.app`
- Vercel project: `fullrefit/ats-resume-advisor-v2` (prj_e49KxnFtmJVB7C3FdRODkQyN11mg)
