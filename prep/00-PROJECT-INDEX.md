# Project Index — Status Tracker

Updated live as tasks complete. Status: PENDING | IN_PROGRESS | DONE | BLOCKED | DEFERRED.

## Phase 1 — Emergency cost-stop (MUST SHIP)

| ID | Task | Owner | Status | Output |
|---|---|---|---|---|
| 1.1 | Add budget-guard enforcement to `lib/ratelimit.ts` | Claude | PENDING | `lib/ratelimit.ts` with `enforceBudget()` |
| 1.2 | Rename `ANTHROPIC_MONTHLY_BUDGET_USD` → `LLM_MONTHLY_BUDGET_USD` in code | Claude | PENDING | env var refs updated |
| 1.3 | Lower `DEMO_DAILY_LIMIT` to `2` in Vercel prod env | Paul (or Claude via CLI) | PENDING | Vercel env updated |
| 1.4 | Rename Vercel env `ANTHROPIC_MONTHLY_BUDGET_USD` → `LLM_MONTHLY_BUDGET_USD` (also set to `40`) | Paul (or Claude via CLI) | PENDING | Vercel env updated |

## Phase 2 — OpenRouter → DeepInfra provider swap (MUST SHIP)

| ID | Task | Owner | Status | Output |
|---|---|---|---|---|
| 2.1 | Extend `lib/claude.ts` with `openrouter` provider + `callOpenRouter()` | Claude | PENDING | `lib/claude.ts` updated |
| 2.2 | Create OpenRouter account, generate API key | Paul | PENDING | `gsk_...` key in 1Password |
| 2.3 | Add `OPEN_ROUTER_RESUME_VERDICT_API` to 1Password vault + `/update-pw` | Paul | PENDING | env var resolvable locally |
| 2.4 | Set Vercel prod env: `MODEL_PROVIDER=openrouter`, `OPEN_ROUTER_RESUME_VERDICT_API=<key>` | Paul (or Claude via CLI) | PENDING | Vercel env updated |
| 2.5 | Smoke-test one production verdict via curl, confirm OpenRouter dashboard shows traffic | Paul | PENDING | screenshot or curl output |

## Phase 3 — BYOK restoration (MUST SHIP)

| ID | Task | Owner | Status | Output |
|---|---|---|---|---|
| 3.1 | Inspect commit `9cdca0b` to extract original BYOK UI + route changes | Claude | PENDING | diff saved to `prep/byok-original-diff.patch` |
| 3.2 | Extend `CallClaudeOptions` with `providerOverride` param + plumbing through `callClaude` | Claude | PENDING | `lib/claude.ts` updated |
| 3.3 | Restore BYOK dialog component | Claude | PENDING | `components/byok-dialog.tsx` |
| 3.4 | Restore frontend localStorage handling + header injection in API fetches | Claude | PENDING | `lib/byok-client.ts` + fetch wrappers |
| 3.5 | Update all 10 demo route handlers to read `x-user-api-key`, bypass rate limit + budget when present | Claude | PENDING | 10 route files updated |
| 3.6 | Smoke-test BYOK end-to-end against live deploy | Paul | PENDING | working verdict using own Anthropic key |

## Phase 4 — Stripe Checkout paywall (STRETCH)

| ID | Task | Owner | Status | Output |
|---|---|---|---|---|
| 4.1 | `npm install stripe` | Claude | PENDING | `package.json` + lock |
| 4.2 | Create Stripe account + restricted API key + webhook signing secret | Paul | PENDING | keys in 1Password |
| 4.3 | Add Stripe env vars to 1Password vault + `/update-pw` | Paul | PENDING | env vars resolvable locally |
| 4.4 | Build `/api/stripe/create-checkout-session` route | Claude | PENDING | route file |
| 4.5 | Build `/api/stripe/webhook` route + token issuance to KV | Claude | PENDING | route file + KV schema |
| 4.6 | Extend `lib/ratelimit.ts` to validate unlock tokens (extends existing `BYPASS_TOKEN` pattern) | Claude | PENDING | `lib/ratelimit.ts` updated |
| 4.7 | Build pricing display component (3 tiers: free 2/day, BYOK, $9 unlock) | Claude | PENDING | `components/pricing.tsx` |
| 4.8 | Add unlock-token persistence to client + automatic header injection | Claude | PENDING | `lib/unlock-client.ts` + fetch wrapper |
| 4.9 | Set Vercel prod env: `STRIPE_RESUME_VERDICT_SECRET`, `STRIPE_RESUME_VERDICT_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Paul | PENDING | Vercel env updated |
| 4.10 | Configure Stripe webhook endpoint URL in Stripe dashboard | Paul | PENDING | webhook live |
| 4.11 | End-to-end test: pay $9 → receive unlock token → verdict bypasses rate limit | Paul | PENDING | working flow |

## Deploy/PR sequence

1. After Phase 1 complete: commit → push branch → open PR titled "feat: emergency cost-stop + budget guard"
2. After Phase 2 complete: commit → push (same PR) → merge → Vercel auto-deploys → smoke test → flip `MODEL_PROVIDER=openrouter`
3. After Phase 3 complete: commit → push → merge → smoke test BYOK on live
4. After Phase 4 complete (if reached): commit → push → merge → configure Stripe webhook → smoke test
