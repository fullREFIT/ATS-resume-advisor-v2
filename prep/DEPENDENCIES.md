# DEPENDENCIES

## External services

| Service | Purpose | Auth | Setup status |
|---|---|---|---|
| Vercel (fullrefit team) | Production hosting | `vercel` CLI signed in as Paul | LIVE |
| Upstash Redis / Vercel KV | Rate limit + budget + unlock tokens | Env vars (already set in Vercel prod 10d ago) | LIVE |
| OpenRouter | LLM routing → DeepInfra/Together/Fireworks/Cerebras | `OPENROUTER_RESUME_VERDICT_API` env var | PENDING (Task 2.2) |
| Stripe | Checkout + webhook | `STRIPE_RESUME_VERDICT_SECRET` + webhook secret | PENDING (Task 4.2) |
| Anthropic | BYOK + rollback fallback | User-provided keys (BYOK) + `ANTHROPIC_API_KEY` in Vercel env (kept as safety net) | LIVE (rollback path) |
| 1Password "Dev Credentials" vault | Source of truth for env vars | Paul's biometric | LIVE |

## Credentials Paul must obtain this afternoon

1. **OpenRouter API key** (Task 2.2 — ~5 min)
2. **Stripe TEST secret + publishable + webhook secret** (Task 4.2 — ~10 min)

## npm packages to install

1. `openai` — OpenAI-compatible SDK for OpenRouter (Task 2.1)
2. `stripe` — Stripe server SDK (Task 4.1)
3. `@stripe/stripe-js` — Stripe client-side helper (Task 4.1)

## Existing code dependencies (already installed, no action needed)

- `@anthropic-ai/sdk` — Anthropic SDK, used for BYOK and rollback
- `groq-sdk` — Groq SDK from prior swap (kept for local dev, not used in prod after Phase 2)
- `@upstash/ratelimit`, `@upstash/redis` — KV / rate limiting
- `next 16.2.6`, `react 19.2.4` — framework

## Vercel env var inventory (after all 4 phases)

| Var | Source | Required for |
|---|---|---|
| `MODEL_PROVIDER` | Paul sets to `openrouter` | All non-BYOK traffic |
| `OPENROUTER_RESUME_VERDICT_API` | 1Password / Paul | All non-BYOK traffic |
| `ANTHROPIC_API_KEY` | Existing (kept as rollback) | Reverting if OpenRouter fails |
| `DEMO_DAILY_LIMIT` | Update to `2` | Free tier rate limit |
| `LLM_MONTHLY_BUDGET_USD` | Set to `40` | Budget kill-switch |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Existing | KV |
| `KV_REST_API_URL` / `_TOKEN` (Vercel KV) | Existing | KV (alias) |
| `BYPASS_TOKEN` | Existing (Paul's personal bypass) | Owner bypass |
| `STRIPE_RESUME_VERDICT_SECRET` | 1Password / Paul | Checkout + webhook |
| `STRIPE_RESUME_VERDICT_WEBHOOK_SECRET` | 1Password / Paul | Webhook verify |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 1Password / Paul | Frontend Stripe |

## Vercel env vars to REMOVE

| Var | Why |
|---|---|
| `ANTHROPIC_MONTHLY_BUDGET_USD` | Renamed to `LLM_MONTHLY_BUDGET_USD` |

## Blockers / risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| OpenRouter outage during cutover | Low | Auto-failover within OpenRouter (4 providers); manual rollback to `MODEL_PROVIDER=anthropic` in <60s |
| Llama 3.3 70B JSON quality regression vs Sonnet | Medium | Fabrication-guard pattern already in place; monitor parse failure rate first 24h |
| Stripe webhook misses checkout completion | Medium | Frontend retries `claim-token` 2x with backoff; KV has 7-day claim window |
| Owner doesn't finish Stripe today | Medium-High | Phases 1–3 ship without Phase 4; revenue tier can land Sunday or Monday |
| BYOK keys leak via logs | Low | Code review: ensure `x-user-api-key` header is never logged; only used for the single SDK call |

## MCP / tool dependencies

- `vercel` CLI (already authenticated as Paul)
- `git` (worktree already initialized)
- `1Password` desktop app + CLI (Paul's biometric)
- `op` CLI (for `/update-pw` flow)
- No MCP servers required for execution (everything is direct CLI / SDK)
