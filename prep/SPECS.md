# SPECS — Per-deliverable detailed requirements

## Budget guard (Phase 1)

### Behavior

- Every demo route increments a monthly KV counter by an estimated USD cost BEFORE making the LLM call.
- If incrementing would push month-to-date spend over `LLM_MONTHLY_BUDGET_USD`, the request returns HTTP 503 with a user-friendly error message naming the three escape valves (try again next month / bring your own key / pay $9 for an unlock).
- BYOK users (header `x-user-api-key` present) skip the budget consume — they pay their own way.
- Paid-unlock users (header `x-unlock-token` present and valid) skip the budget consume — they paid $9 for 10 verdicts; that revenue covers the API cost.

### Cost model (per request)

DeepInfra Llama 3.3 70B via OpenRouter at $0.13 input / $0.39 output per 1M tokens. Per-call assumptions:

| Task | Input tokens | Output tokens | Est. USD |
|---|---|---|---|
| diagnosis | ~3000 | ~1500 | $0.00098 |
| questions | ~2000 | ~800 | $0.00057 |
| output | ~5000 | ~5000 | $0.00260 |
| fabrication_guard | ~2000 | ~500 | $0.00046 |

Multiplied by ~10 calls per full "verdict" session: ~$0.005–0.015 per session. At a $40/month budget cap, that's ~3000–8000 free verdicts per month. Plenty of headroom; the cap is a kill-switch, not the steady-state limit.

### KV schema

```
ai-resume-advisor:budget:2026-05   → "0.32"  (float USD, TTL 40 days)
ai-resume-advisor:demo:<ip>        → existing rate-limit counter (untouched)
ai-resume-advisor:unlock:<token>   → {"remaining": 10, "sessionId": "...", "createdAt": ...} (TTL 90 days)
ai-resume-advisor:unlock-session:<stripe-session-id> → <token> (TTL 7 days, deleted on claim)
```

## OpenRouter provider (Phase 2)

### API surface

OpenRouter is OpenAI-compatible. Use the `openai` npm SDK with:
- `baseURL: "https://openrouter.ai/api/v1"`
- `apiKey: process.env.OPENROUTER_RESUME_VERDICT_API`
- Default headers: `HTTP-Referer: https://ats-resume-advisor-v2.vercel.app`, `X-Title: Resume Verdict`
- Per-request `extra_body: { provider: { order: ["DeepInfra", "Together", "Fireworks", "Cerebras"] } }`

### Why this order

DeepInfra is cheapest. Together is reliable second. Fireworks is fast third. Cerebras is fast but capacity-constrained — last in line. OpenRouter auto-fails-forward through this list when a provider 429s or 5xxs.

### Model string

`meta-llama/llama-3.3-70b-instruct` — OpenRouter's canonical name for Llama 3.3 70B Instruct. Same model across all providers in the failover order.

## BYOK (Phase 3)

### Trust model

- BYOK key is stored ONLY in user's `localStorage`. Never sent to the database. Never logged.
- Backend receives it via `x-user-api-key` request header. Server uses it for the single LLM call only — does not persist.
- Validation: `/^sk-ant-[a-zA-Z0-9_\-]{50,}$/` — frontend validates format before save; backend trusts format (Anthropic will reject invalid keys anyway).
- BYOK users skip both per-IP rate limit AND monthly budget — they pay their provider directly.

### Provider routing

When BYOK key present, `callClaude({ providerOverride: "anthropic", apiKey: userKey, ... })` forces the Anthropic SDK path regardless of `process.env.MODEL_PROVIDER`. This is the ONLY way the app routes traffic to Anthropic post-swap.

## Stripe paywall (Phase 4)

### Product structure

Single product: "10 Verdict Unlock" — $9 USD one-time payment. No recurring subscription (deferred to v2).

### Token lifecycle

1. User clicks "Unlock for $9" → POST `/api/stripe/create-checkout-session` → receives Stripe Checkout URL → redirected to Stripe.
2. User completes payment with TEST card (or real card in LIVE mode).
3. Stripe Checkout redirects to `${origin}/?unlock_session=cs_test_...`.
4. Frontend `claimUnlockTokenFromUrl()` calls POST `/api/stripe/claim-token` with the session ID.
5. Backend looks up `ai-resume-advisor:unlock-session:<session_id>` in KV — that was populated by the webhook handler when `checkout.session.completed` fired.
6. If found, returns the `ulk_...` token and deletes the session→token mapping (one-time claim).
7. Frontend stores token in `localStorage["unlock_token"]`.
8. Subsequent API fetches send `x-unlock-token` header.
9. Backend's `consumeQuota` short-circuits to allow + decrement when token has `remaining > 0`.

### Race condition

Webhook may fire after the redirect. If frontend's `claim-token` POST returns 404, retry with exponential backoff (2 attempts: 2s, 5s). If still 404, show user a "Check your email — we'll send your unlock link if the payment confirms" message and... actually no, in MVP we don't email. Just show "Payment processing — refresh in 30 seconds to claim your unlock." Acceptable for MVP.

### Webhook security

Stripe webhook signature verification is non-optional. Reject any request without a valid `stripe-signature` header that matches `STRIPE_RESUME_VERDICT_WEBHOOK_SECRET`. Use `stripe.webhooks.constructEvent()` from the official SDK.

### Refund policy (UI copy)

In the Stripe Checkout description: "10 full Resume Verdicts. Non-refundable digital service." (Adjust later — for MVP, just ship.)

## Pricing UI (Phase 4)

### Tier display order (left to right)

1. **Free** — current users see this first; emphasizes "try it, no signup"
2. **BYOK** — power user / dev tier; pitched as "control your own cost"
3. **Unlock $9** — paid tier; pitched as "skip signup, pay once"

### When to show

- Always visible on landing page (above fold or in nav)
- Modal triggered when free tier exhausted: "You've used your 2 free verdicts for today. Options: come back tomorrow, bring your own Anthropic key, or unlock 10 verdicts for $9."

### Visual hierarchy

- Free: muted/neutral styling — implies "this is the default"
- BYOK: outlined card — implies "for devs"
- Unlock: filled accent card with subtle "Most Popular" or "Recommended" badge — implies "this is what most people pick"

## Cross-tier interaction

| User state | x-user-api-key | x-unlock-token | Routes to | Rate limit | Budget check |
|---|---|---|---|---|---|
| Anonymous (free tier) | - | - | OpenRouter→DeepInfra | 2/day per IP | Yes |
| BYOK | sk-ant-... | - | Anthropic (with their key) | Skipped | Skipped |
| Paid unlock | - | ulk_... | OpenRouter→DeepInfra | Skipped while token has remaining | Skipped (they paid) |
| Both BYOK + unlock | sk-ant-... | ulk_... | Anthropic (BYOK wins) | Skipped | Skipped |
