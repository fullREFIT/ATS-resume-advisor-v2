# CLAUDE-TASKS — Self-contained executable prompts

Operate from worktree root: `/Users/paul/dev-5/projects/resume-verdict/.claude/worktrees/groq-swap-053126`

---

## Task 1.1 — Implement budget-guard enforcement

**File to edit:** `lib/ratelimit.ts`

**Add to the file:**

1. Two new exports: `consumeBudget(estimatedCostUsd: number): Promise<{ allowed: boolean; mtdSpend: number; budget: number }>` and `getBudgetState(): Promise<{ mtdSpend: number; budget: number }>`.
2. Read budget from `process.env.LLM_MONTHLY_BUDGET_USD` (default `40`).
3. Track month-to-date spend in KV under key `ai-resume-advisor:budget:{YYYY-MM}` as a float counter. Use the same Upstash/KV credentials already wired (`UPSTASH_REDIS_REST_URL`/`TOKEN` or `KV_REST_API_URL`/`TOKEN`).
4. `consumeBudget(estimatedCostUsd)`:
   - If no KV creds → return `{ allowed: true, mtdSpend: 0, budget }` (graceful no-op — match existing `getLimiter()` pattern)
   - Otherwise: increment the monthly key by `estimatedCostUsd`, read the new value, compare to budget. Return `allowed: newValue <= budget`.
   - Set TTL on the key to 40 days so old months self-clean.
5. Add helper `estimateRequestCost(task: TaskKind): number` — for OpenRouter/DeepInfra Llama 3.3 70B, assume ~3000 input tokens + 1500 output tokens per call → `(3000/1e6 * 0.13) + (1500/1e6 * 0.39) = ~$0.00098`. Multiplier per task: `output` → 2x (longer), `fabrication_guard` → 1x, others → 0.7x. Inline this estimation as a simple function; document the assumptions in a comment.

**Acceptance:**
- `lib/ratelimit.ts` exports the two new functions
- `LLM_MONTHLY_BUDGET_USD` env var is the SOLE source of budget (no `ANTHROPIC_MONTHLY_BUDGET_USD` references remain)
- `npm run build` passes
- Manually inspect: when `LLM_MONTHLY_BUDGET_USD` is unset, default budget is `40`

---

## Task 1.2 — Wire budget check into the 10 demo routes + grep for old env var

**Files to edit:** all 10 routes under `app/api/demo/*/route.ts` already updated in prior swap.

**For each route:**
1. After `const quota = await consumeQuota(req)` and the `if (!quota.allowed)` block, add:
   ```ts
   const budget = await consumeBudget(estimateRequestCost("<task-name>"));
   if (!budget.allowed) {
     return NextResponse.json(
       { error: "This month's free-tier budget is exhausted. Try again next month, bring your own API key, or unlock with a one-time payment." },
       { status: 503 },
     );
   }
   ```
   where `<task-name>` matches the route (e.g. `"output"` for `/api/demo/output`, `"diagnosis"` for `/api/demo/diagnose`, etc.).
2. Add `consumeBudget, estimateRequestCost` to the existing `@/lib/ratelimit` import.
3. Map of routes → task:
   - `output/route.ts` → `output`
   - `diagnose/route.ts` → `diagnosis`
   - `questions/route.ts` → `questions`
   - `cover-letter/route.ts` → `output`
   - `company-output/route.ts` → `output`
   - `company-diagnose/route.ts` → `diagnosis`
   - `company-questions/route.ts` → `questions`
   - `target-persons/route.ts` → `fabrication_guard` (light)
   - `recruiter-scan/route.ts` → `fabrication_guard` (light)
   - `gap-closer/route.ts` → `output`

**Also:** `grep -rn "ANTHROPIC_MONTHLY_BUDGET_USD" .` across the worktree. Replace all hits with `LLM_MONTHLY_BUDGET_USD`. Expected hits: 0 in code (it was env-only) but check `.env.local.example` and any docs.

**Acceptance:**
- `grep -rn "ANTHROPIC_MONTHLY_BUDGET_USD" .` returns 0 lines
- All 10 demo routes call `consumeBudget` after `consumeQuota` and before the body parse
- `npm run build` passes

---

## Task 1.3 — Vercel env: lower DEMO_DAILY_LIMIT, add LLM_MONTHLY_BUDGET_USD, deprecate old name

**Owner:** Claude executes via `vercel` CLI (already authenticated)

**Commands:**
```bash
cd /Users/paul/dev-5/projects/resume-verdict/.claude/worktrees/groq-swap-053126
# Remove old (will prompt confirmation):
vercel env rm DEMO_DAILY_LIMIT production
vercel env rm ANTHROPIC_MONTHLY_BUDGET_USD production
# Set new values (stdin):
echo "2" | vercel env add DEMO_DAILY_LIMIT production
echo "40" | vercel env add LLM_MONTHLY_BUDGET_USD production
# Verify:
vercel env ls production | grep -E "DEMO_DAILY_LIMIT|BUDGET"
```

**Acceptance:**
- `vercel env ls production` shows `DEMO_DAILY_LIMIT` and `LLM_MONTHLY_BUDGET_USD`
- Does NOT show `ANTHROPIC_MONTHLY_BUDGET_USD`

---

## Task 2.1 — Extend lib/claude.ts with OpenRouter provider

**File to edit:** `lib/claude.ts`

1. Change `ModelProvider` type from `"anthropic" | "groq"` to `"anthropic" | "groq" | "openrouter"`.
2. Update `PROVIDER` selector to recognize `"openrouter"` value.
3. Add to `MODELS` map:
   ```ts
   openrouter: {
     diagnosis: "meta-llama/llama-3.3-70b-instruct",
     questions: "meta-llama/llama-3.3-70b-instruct",
     output: "meta-llama/llama-3.3-70b-instruct",
     fabrication_guard: "meta-llama/llama-3.3-70b-instruct",
   },
   ```
4. Update `getProviderApiKey()` to add `case "openrouter": return process.env.OPEN_ROUTER_RESUME_VERDICT_API`.
5. Add `callOpenRouter()` function. Use the official `openai` npm package (which is OpenAI-compatible and works with OpenRouter's `https://openrouter.ai/api/v1` endpoint). Pass `provider: { order: ["DeepInfra", "Together", "Fireworks", "Cerebras"] }` in `extra_body` for auto-failover. Also set headers `HTTP-Referer: https://ats-resume-advisor-v2.vercel.app` and `X-Title: Resume Verdict` (OpenRouter's attribution convention).
6. Update the `if (PROVIDER === "groq")` dispatch to add `else if (PROVIDER === "openrouter") return callOpenRouter(...)`.
7. Update `classifyError()` to recognize OpenRouter errors (same shape as OpenAI SDK errors — `instanceof OpenAI.APIError`).
8. Update the "No API key configured" error message to include all three provider env vars.

**Install:** `npm install openai`

**Acceptance:**
- `npm run build` passes
- `MODEL_PROVIDER=openrouter` + `OPEN_ROUTER_RESUME_VERDICT_API=test` produces a request to `https://openrouter.ai/api/v1` (verify by reading the code — actual network test happens at smoke-test step)
- `MODEL_PROVIDER=anthropic` still routes to Anthropic (no regression)

---

## Task 2.2 — OpenRouter account creation (MANUAL — Paul)

**Owner:** Paul

1. Go to https://openrouter.ai → Sign in (Google/GitHub OK)
2. Top-right avatar → **Keys** → **Create Key**
3. Name: `RESUME_VERDICT_PROD`
4. Optional: set a spend limit on this specific key (recommend $50/month — cheap insurance)
5. Copy the `sk-or-v1-...` key — shown once
6. Top-right avatar → **Credits** → Add $10 (minimum to enable paid usage; covers ~3 months at current burn rate via DeepInfra)

**Acceptance:**
- `sk-or-v1-...` key copied
- OpenRouter dashboard shows >$0 credit balance

---

## Task 2.3 — Store OpenRouter key in 1Password (MANUAL — Paul)

**Owner:** Paul

1. 1Password app → **Dev Credentials** vault → New Item → API Credential
2. Title: `OPEN_ROUTER_RESUME_VERDICT_API` (exact)
3. Password field: paste the `sk-or-v1-...` key
4. Save
5. Terminal: `/update-pw`
6. Verify: `echo "OPEN_ROUTER_RESUME_VERDICT_API=${OPEN_ROUTER_RESUME_VERDICT_API:+SET}"`

**Acceptance:**
- Echo prints `OPEN_ROUTER_RESUME_VERDICT_API=SET`

---

## Task 2.4 — Vercel prod env for OpenRouter

**Owner:** Claude executes via `vercel` CLI once Paul provides the key value

**Commands** (Paul provides `<KEY>`):
```bash
cd /Users/paul/dev-5/projects/resume-verdict/.claude/worktrees/groq-swap-053126
echo "<KEY>" | vercel env add OPEN_ROUTER_RESUME_VERDICT_API production
echo "openrouter" | vercel env add MODEL_PROVIDER production
vercel env ls production | grep -E "OPENROUTER|MODEL_PROVIDER"
```

**Acceptance:**
- `vercel env ls production` shows both `OPEN_ROUTER_RESUME_VERDICT_API` and `MODEL_PROVIDER`

---

## Task 2.5 — Smoke-test OpenRouter routing on prod

**Owner:** Paul (manual visit) or Claude (curl)

**Curl test:**
```bash
curl -X POST https://ats-resume-advisor-v2-hv6oew8v6-fullrefit.vercel.app/api/demo/diagnose \
  -H "Content-Type: application/json" \
  -d '{
    "resume": "<paste ~200 chars of a real resume>",
    "jd": "<paste ~200 chars of a real JD>"
  }' | jq .
```

Expected: 200 status, JSON body with `matchScore`, `verdict`, `verdictReasoning`. Check OpenRouter dashboard → Activity — should show 1+ request in the last minute.

**Acceptance:**
- Curl returns 200 + valid JSON verdict
- OpenRouter dashboard shows the request

---

## Task 3.1 — Extract original BYOK implementation from commit 9cdca0b

**Commands:**
```bash
cd /Users/paul/dev-5/projects/resume-verdict/.claude/worktrees/groq-swap-053126
git show --stat 9cdca0b
git show 9cdca0b > prep/byok-original-9cdca0b.patch
git show 9cdca0b --name-only --pretty=format:""
```

Read the patch and identify:
- BYOK dialog UI component path
- Frontend localStorage / fetch-wrapper paths
- Route handler changes (which routes read `x-user-api-key`)

**Acceptance:**
- `prep/byok-original-9cdca0b.patch` exists
- File list extracted into this task's notes section below

---

## Task 3.2 — Extend CallClaudeOptions with providerOverride

**File to edit:** `lib/claude.ts`

1. Add to `CallClaudeOptions`: `providerOverride?: ModelProvider`
2. At the top of `callClaude()`, compute `const activeProvider = opts.providerOverride ?? PROVIDER;`
3. Replace every other `PROVIDER` reference inside `callClaude()` with `activeProvider`
4. When `providerOverride === "anthropic"` and `opts.apiKey` is provided, use that key directly (don't fall back to env var)

**Acceptance:**
- `npm run build` passes
- A call with `{ providerOverride: "anthropic", apiKey: "sk-ant-...", ... }` dispatches to `callAnthropic` regardless of `process.env.MODEL_PROVIDER`

---

## Task 3.3 — Restore BYOK dialog component

Based on `prep/byok-original-9cdca0b.patch`, restore the dialog component file. If the original is too tightly coupled to old prompts/UI, adapt minimally:

- Title: "Bring Your Own Anthropic Key — Unlimited Verdicts"
- Body explains: user pastes `sk-ant-...` key, stored only in their browser, never sent to server logs. Get a key for free at https://console.anthropic.com (signup includes $5 free credit, ~30 verdicts on this app).
- Single text input (password-masked)
- "Save Key" button — validates format `^sk-ant-[a-zA-Z0-9_\-]{50,}$`, stores in `localStorage["byok_anthropic_key"]`, closes dialog
- "Clear Key" button — removes from localStorage
- Shows "Currently using your own key" indicator if set

Save to: `components/byok-dialog.tsx`

**Acceptance:**
- Component compiles and renders without errors
- Format validation works (empty, invalid prefix, too short all rejected with inline error)

---

## Task 3.4 — Frontend BYOK plumbing

Create `lib/byok-client.ts`:

```ts
const KEY = "byok_anthropic_key";

export function getByokKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function setByokKey(key: string): void {
  localStorage.setItem(KEY, key);
}

export function clearByokKey(): void {
  localStorage.removeItem(KEY);
}

export function byokHeaders(): Record<string, string> {
  const k = getByokKey();
  return k ? { "x-user-api-key": k } : {};
}
```

Find every `fetch("/api/demo/*", ...)` call in the frontend. Inject `byokHeaders()` into the `headers` object of each fetch. Search command:
```bash
grep -rn "fetch(\"/api/demo" app components lib --include="*.ts" --include="*.tsx"
```

**Acceptance:**
- `lib/byok-client.ts` created
- Every demo API fetch includes `byokHeaders()` spread

---

## Task 3.5 — Update demo routes to honor x-user-api-key

For each of the 10 demo routes:

1. Near the top of `POST(req)`, after reading `apiKey = getProviderApiKey()`:
   ```ts
   const userKey = req.headers.get("x-user-api-key");
   const usingByok = userKey && userKey.startsWith("sk-ant-");
   ```
2. If `usingByok`, SKIP both `consumeQuota` AND `consumeBudget` checks (BYOK users pay their own way).
3. When calling `callClaude(...)` or `runOutputFlow(...)`, pass `{ providerOverride: usingByok ? "anthropic" : undefined, apiKey: usingByok ? userKey : apiKey, ... }`.
4. For routes that use `runOutputFlow` / `runCompanyOutputFlow` (`output`, `company-output`, `cover-letter`, `gap-closer`), thread the override + key through those flow files too — update `lib/output-flow.ts` and `lib/company-output-flow.ts` to accept and pass through `providerOverride`.

**Acceptance:**
- `grep "x-user-api-key" app/api/demo` returns 10 matches (one per route)
- `npm run build` passes
- A request with `x-user-api-key: sk-ant-...` does NOT increment the budget KV counter (verify by reading KV before/after via Upstash dashboard)

---

## Task 3.6 — Smoke test BYOK on live prod (MANUAL — Paul)

After merge + deploy:
1. Visit live URL
2. Open BYOK dialog, paste own Anthropic key
3. Run a verdict — should succeed
4. Check OpenRouter dashboard — should NOT show the request (it went to Anthropic)
5. Check Anthropic console → API key usage — should show the request under Paul's BYOK-pasted key (NOT under `ANTHROPIC_FULLREFIT_API_KEY`)

**Acceptance:**
- Verdict succeeds with BYOK key
- OpenRouter dashboard does not register the request
- Anthropic console shows usage under the BYOK key

---

## Task 4.1 — Install Stripe SDK

```bash
cd /Users/paul/dev-5/projects/resume-verdict/.claude/worktrees/groq-swap-053126
npm install stripe @stripe/stripe-js
```

**Acceptance:**
- `package.json` lists both
- `npm run build` passes

---

## Task 4.2 — Stripe account + restricted key + webhook secret (MANUAL — Paul)

1. https://dashboard.stripe.com → sign in (or sign up — needs business info for full activation, but TEST mode works immediately)
2. **Decision point:** Start in TEST mode for today's launch. Flip to LIVE mode after first verified end-to-end test. Use TEST card `4242 4242 4242 4242`, any future expiry, any CVC.
3. Developers → API Keys → "Reveal test key" → copy the `sk_test_...` Secret key
4. Developers → API Keys → copy the `pk_test_...` Publishable key
5. Developers → Webhooks → "+ Add endpoint":
   - URL: `https://ats-resume-advisor-v2-hv6oew8v6-fullrefit.vercel.app/api/stripe/webhook` (use actual prod URL; update after first deploy if Vercel assigns new alias)
   - Events to send: `checkout.session.completed`
   - Save → copy the `whsec_...` signing secret

**Acceptance:**
- 3 values captured: `sk_test_...`, `pk_test_...`, `whsec_...`

---

## Task 4.3 — Store Stripe keys in 1Password (MANUAL — Paul)

Three new 1Password items (Dev Credentials vault):

| Title | Field | Value |
|---|---|---|
| `STRIPE_RESUME_VERDICT_SECRET` | Password | `sk_test_...` |
| `STRIPE_RESUME_VERDICT_PUBLISHABLE` | Password | `pk_test_...` |
| `STRIPE_RESUME_VERDICT_WEBHOOK_SECRET` | Password | `whsec_...` |

Then: `/update-pw`

**Acceptance:**
- All three echo `=SET` when checked via `echo "$VAR=${VAR:+SET}"`

---

## Task 4.4 — Stripe Checkout session route

Create `app/api/stripe/create-checkout-session/route.ts`:

```ts
import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_RESUME_VERDICT_SECRET;
  if (!secret) return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });

  const stripe = new Stripe(secret);
  const origin = req.headers.get("origin") ?? "https://ats-resume-advisor-v2.vercel.app";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: {
          name: "Resume Verdict — 10 Verdict Unlock",
          description: "Unlocks 10 full resume verdicts (output, cover letter, gap closer, etc.) on this device.",
        },
        unit_amount: 900, // $9.00
      },
      quantity: 1,
    }],
    success_url: `${origin}/?unlock_session={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?unlock_cancelled=1`,
  });

  return NextResponse.json({ url: session.url });
}
```

**Acceptance:**
- Route compiles
- `curl -X POST <prod>/api/stripe/create-checkout-session` returns `{ "url": "https://checkout.stripe.com/..." }`

---

## Task 4.5 — Stripe webhook + token issuance

Create `app/api/stripe/webhook/route.ts`:

```ts
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const redis = (() => {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
})();

function randomToken(): string {
  return "ulk_" + crypto.randomUUID().replace(/-/g, "");
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_RESUME_VERDICT_SECRET;
  const whSecret = process.env.STRIPE_RESUME_VERDICT_WEBHOOK_SECRET;
  if (!secret || !whSecret) return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });
  if (!redis) return NextResponse.json({ error: "KV not configured." }, { status: 500 });

  const stripe = new Stripe(secret);
  const sig = req.headers.get("stripe-signature") ?? "";
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, whSecret);
  } catch (e) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const token = randomToken();
    // Store: token → { remaining: 10, issuedFor: session.id, createdAt }
    await redis.set(
      `ai-resume-advisor:unlock:${token}`,
      JSON.stringify({ remaining: 10, sessionId: session.id, createdAt: Date.now() }),
      { ex: 60 * 60 * 24 * 90 }, // 90 day TTL
    );
    // Map session.id → token so the success page can claim it
    await redis.set(
      `ai-resume-advisor:unlock-session:${session.id}`,
      token,
      { ex: 60 * 60 * 24 * 7 }, // 7 day claim window
    );
  }

  return NextResponse.json({ received: true });
}
```

Also create `app/api/stripe/claim-token/route.ts`:

```ts
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const tokenEnv = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !tokenEnv) return NextResponse.json({ error: "KV not configured." }, { status: 500 });
  const redis = new Redis({ url, token: tokenEnv });

  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ error: "Missing sessionId." }, { status: 400 });

  const token = await redis.get<string>(`ai-resume-advisor:unlock-session:${sessionId}`);
  if (!token) return NextResponse.json({ error: "No token for this session yet — webhook may not have fired." }, { status: 404 });

  // Consume the session→token mapping so it can only be claimed once
  await redis.del(`ai-resume-advisor:unlock-session:${sessionId}`);

  return NextResponse.json({ token });
}
```

**Acceptance:**
- Both routes compile
- Stripe webhook signature verification works (verify with `stripe listen --forward-to localhost:3000/api/stripe/webhook` locally)

---

## Task 4.6 — Token validation in lib/ratelimit.ts

Add to `lib/ratelimit.ts`:

```ts
export async function consumeUnlockToken(token: string): Promise<{ valid: boolean; remaining: number }> {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const t = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !t) return { valid: false, remaining: 0 };
  const redis = new Redis({ url, token: t });

  const key = `ai-resume-advisor:unlock:${token}`;
  const raw = await redis.get<string>(key);
  if (!raw) return { valid: false, remaining: 0 };

  let data: { remaining: number };
  try { data = typeof raw === "string" ? JSON.parse(raw) : (raw as any); }
  catch { return { valid: false, remaining: 0 }; }

  if (data.remaining <= 0) return { valid: false, remaining: 0 };

  data.remaining -= 1;
  await redis.set(key, JSON.stringify(data));
  return { valid: true, remaining: data.remaining };
}
```

Then update `consumeQuota` to short-circuit when a valid unlock token is present:

```ts
export async function consumeQuota(req: Request): Promise<RateLimitResult> {
  // ... existing BYPASS_TOKEN check ...

  const unlockToken = req.headers.get("x-unlock-token");
  if (unlockToken) {
    const r = await consumeUnlockToken(unlockToken);
    if (r.valid) {
      return { allowed: true, remaining: r.remaining, reset: 0, limit: 10, enforced: true };
    }
    // Fall through to IP rate limit if token invalid/exhausted
  }

  // ... existing per-IP limit check ...
}
```

Then update all 10 demo routes to also bypass `consumeBudget` when the unlock token is valid (the user already paid for these verdicts, so they shouldn't deplete the monthly free-tier budget either; the $9 they paid covers the API cost). Simplest: check the unlock-token header at the top of each route and set a `paidUnlock` flag; skip both budget AND rate-limit consumption when set. (Slight refactor of Task 3.5's plumbing — same pattern as BYOK.)

**Acceptance:**
- A request with valid `x-unlock-token` succeeds even when daily IP limit is exhausted
- Same request decrements the token's `remaining` counter
- 11th request with same token (after 10 successful) returns 429 + falls through to IP limit

---

## Task 4.7 — Pricing UI component

Create `components/pricing.tsx` — 3-card display:

| Card | Headline | Detail | CTA |
|---|---|---|---|
| Free | "2 verdicts per day" | "Try it free. No signup. See your match score and verdict." | (Implicit — current default flow) |
| BYOK | "Bring your own Anthropic key" | "Unlimited verdicts. Your key, your cost. Free $5 credit on Anthropic signup covers ~30 verdicts." | "Add your key" → opens BYOK dialog |
| Unlock | "$9 — 10 full verdicts" | "Skip the signup. Pay once, get 10 full reports including cover letters and gap closers." | "Unlock for $9" → POSTs to `/api/stripe/create-checkout-session`, redirects to returned URL |

Embed somewhere visible — likely above-the-fold on landing or as a modal triggered when free tier exhausted. Owner can move/restyle later.

**Acceptance:**
- Component renders 3 cards with correct CTAs
- BYOK CTA opens existing dialog from Task 3.3
- Unlock CTA initiates Stripe Checkout redirect

---

## Task 4.8 — Unlock token persistence client

Create `lib/unlock-client.ts`:

```ts
const KEY = "unlock_token";

export function getUnlockToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function setUnlockToken(t: string): void {
  localStorage.setItem(KEY, t);
}

export function clearUnlockToken(): void {
  localStorage.removeItem(KEY);
}

export function unlockHeaders(): Record<string, string> {
  const t = getUnlockToken();
  return t ? { "x-unlock-token": t } : {};
}

// Call on landing page mount — claims token if redirected from Stripe success.
export async function claimUnlockTokenFromUrl(): Promise<void> {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("unlock_session");
  if (!sessionId) return;
  try {
    const r = await fetch("/api/stripe/claim-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    if (!r.ok) return;
    const { token } = await r.json();
    if (token) setUnlockToken(token);
  } finally {
    // Remove the query param so refresh doesn't re-claim
    const url = new URL(window.location.href);
    url.searchParams.delete("unlock_session");
    window.history.replaceState({}, "", url.toString());
  }
}
```

Wire `claimUnlockTokenFromUrl()` into the root layout or landing page's `useEffect`.

Update every demo API fetch (same files touched in Task 3.4) to spread `unlockHeaders()` alongside `byokHeaders()`.

**Acceptance:**
- After Stripe success redirect with `?unlock_session=cs_test_...`, localStorage gets the unlock token
- URL query param is cleared after claim
- Subsequent API fetches include `x-unlock-token` header

---

## Task 4.9 — Vercel env for Stripe

Once Paul's keys are in env:

```bash
cd /Users/paul/dev-5/projects/resume-verdict/.claude/worktrees/groq-swap-053126
echo "$STRIPE_RESUME_VERDICT_SECRET" | vercel env add STRIPE_RESUME_VERDICT_SECRET production
echo "$STRIPE_RESUME_VERDICT_WEBHOOK_SECRET" | vercel env add STRIPE_RESUME_VERDICT_WEBHOOK_SECRET production
echo "$STRIPE_RESUME_VERDICT_PUBLISHABLE" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
```

**Acceptance:**
- All three in `vercel env ls production`

---

## Task 4.10 — Configure Stripe webhook URL (MANUAL — Paul)

After deploy, copy the new prod URL (Vercel-assigned for the latest deploy). Update the webhook endpoint in Stripe dashboard to point to `<prod-url>/api/stripe/webhook`.

**Acceptance:**
- Stripe dashboard shows webhook endpoint live
- Click "Send test webhook" → 200 OK from your endpoint

---

## Task 4.11 — End-to-end paywall test (MANUAL — Paul)

1. Visit live URL in incognito
2. Run 2 verdicts (exhaust free tier)
3. Click "Unlock for $9" → redirected to Stripe Checkout
4. Use TEST card `4242 4242 4242 4242`, any future expiry, any CVC
5. Redirected back to app → localStorage has unlock token
6. Run a 3rd verdict — succeeds (would have failed without token)
7. Check Stripe dashboard → 1 successful test payment
8. Check Upstash KV → see the `ai-resume-advisor:unlock:ulk_...` key with `remaining: 9`

**Acceptance:**
- 3rd verdict succeeds despite IP rate limit exhausted
- Token remaining counter decremented
