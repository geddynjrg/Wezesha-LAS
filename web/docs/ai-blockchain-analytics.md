# AI / Blockchain / Analytics — Wezesha Majuu Applicant Portal

## Document completeness
- Group flow uses `validateGroupDocumentsReady` before submit (`documents-action.ts`).
- UI surfaces missing docs via `DocumentCompletenessBanner`.
- Individual required categories: National ID, passport photo, KRA PIN (`document-completeness.ts`).

## Assistive AI (rule-based, no LLM by default)
- **Step guidance**: `lib/application-guidance.ts` + `components/application-guidance.tsx` on group/individual apply layouts (`ApplicationGuidance` i18n keys).
- **Soft duplicates**: `lib/soft-duplicate-check.ts` + `POST /api/soft-duplicates` returns only `{ phoneDuplicate, nationalIdDuplicate, message }`. Banner with acknowledgment on member-details and individual-information. Hard within-form National ID duplicates remain blocking.
- **Field tips**: `lib/field-guidance.ts` + `components/field-guidance.tsx` on focus (phone, National ID, bank, MSEA registration, KRA PIN).
- **Tripartite readiness**: checklist on individual tripartite page before sign/submit.
- **Data consent (Kenya DPA)**: `components/data-consent-notice.tsx` + `lib/data-consent.ts`. Modal gates `/apply/*` until consent. Persists to cookie `majuu_data_consent_v1`, localStorage keyed by user id, and `POST /api/data-consent` → `data_consents` table (created on first write).
- **Chatbot**: floating `AssistiveChatbot` (FAQ + optional `CHATBOT_LLM_API_URL` / `CHATBOT_LLM_API_KEY`). WhatsApp deep-link via `NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER`.
- **Prescriptive pathway tips**: `PrescriptiveGuidance` on apply layouts using destination cost heuristics (assistive only).

## Configuration
- SMS: existing `SMS_*` / `EBISCLOUD_SMS_*`
- WhatsApp support link: `NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER`
- Optional LLM chat: `CHATBOT_LLM_API_URL`, `CHATBOT_LLM_API_KEY`

## Limits
OCR lives in Majuu LMS staff preview, not the applicant portal. Consent DB write is best-effort; cookie/localStorage remains the gate if DB is unavailable.
