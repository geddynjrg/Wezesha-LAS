# Wezesha Majuu — PesaFlow integration

**Surfaces:** applicant portal (`majuu.uwezo.go.ke`) · LMS reminders (`majuu.uwezo.go.ke/lms`)  
**Pattern source:** Core loans portal (`loans.uwezo.go.ke` / `Loan_Application/web/lib/payments/*`)  
**Secrets:** never commit live values — use env var **names** only.

---

## Core loans reference (env names only)

| Variable | Purpose |
|----------|---------|
| `PESAFLOW_CHECKOUT_URL` | Iframe / invoice POST endpoint |
| `PESAFLOW_STATUS_URL` | Payment status query fallback |
| `PESAFLOW_API_CLIENT_ID` | Merchant client id |
| `PESAFLOW_SERVICE_ID` | Service / account id |
| `PESAFLOW_HMAC_KEY` (alias `PESAFLOW_API_KEY`) | HMAC key |
| `PESAFLOW_HMAC_SECRET` | HMAC secret |
| `PESAFLOW_BILL_DESC` | Bill description |
| `PESAFLOW_SEND_STK` | Optional STK push (`true`/`false`) |
| `PESAFLOW_CALLBACK_SECRET` | Optional IPN Bearer / `x-api-key` |
| `PESAFLOW_VERIFY_IPN_HASH` | Verify IPN `token_hash` (default on) |
| `NEXT_PUBLIC_APP_URL` | Public base for success + notification URLs |

**Core UI:** logged-in applicant dashboard → **Repay loan** modal → create `payment_transactions` row → request invoice (`format=json`) → embed checkout iframe → IPN `POST /api/payments/pesaflow/callback`.

---

## Majuu behaviour

| Item | Detail |
|------|--------|
| **Journey** | Individual applicant dashboard (`/apply/individual/[memberId]/dashboard`) |
| **Button** | **Pay with PesaFlow** / **Generate invoice** (`PesaflowPayPanel`) |
| **Eligibility** | Application submitted + loan amount approved + `awardAmount` (or member amount) &gt; 0 |
| **Amount** | Defaults to `awardAmount ?? member.amount` |
| **Persistence** | Portal table `payment_transactions` (Prisma) |
| **IPN** | `POST /api/payments/pesaflow/callback` (+ optional `PESAFLOW_CALLBACK_SECRET`) |
| **Health** | `GET /api/payments/pesaflow/health` |
| **Success** | `/payment-success` (status poll fallback) |

Bill refs use prefix `WM-` (Wezesha Majuu) vs Core `WF-`.

---

## Merchant credentials

Core and Majuu are both **Uwezo Fund** products. Ops may reuse the **same** Core `PESAFLOW_*` merchant for Majuu **if** Treasury confirms one Uwezo merchant account.

If Majuu must be a separate merchant, Treasury / PesaFlow must issue Majuu-specific credentials. Leave vars empty until then — UI shows a clear “not configured” state; APIs return a structured error.

**Do not commit secrets.** Wire values via compose / host env / gitignored `portal/web/.env`.

---

## Monthly reminder rule (LMS)

**Rule:** On the **1st of each month at 08:00 Africa/Nairobi**, for each portal `payment_transactions` row where:

- `status = PENDING`
- invoice `createdAt` is at least **7 days** old
- `lastReminderAt` is null **or** older than **28 days**

…send **SMS** (Ebis) and **email** (Laravel mail) to the **individual applicant** (member mobile + email). Then set `lastReminderAt = now()`.

Dry-run: `php artisan majuu:pesaflow-reminders --dry-run`

---

## Files

| Area | Paths |
|------|--------|
| Portal client | `web/lib/payments/*`, `web/components/pesaflow-*.tsx` |
| Routes | `web/app/api/payments/pesaflow/*`, `web/app/payment-success` |
| Schema | `web/prisma/migrations/20260817140000_payment_transactions` |
| LMS | `app/Console/Commands/SendPesaflowPaymentReminders.php`, `routes/console.php` |
