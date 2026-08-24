# AI / Blockchain / Analytics — Wezesha Majuu Applicant Portal

## Document completeness
- Group flow uses `validateGroupDocumentsReady` before submit (`documents-action.ts`).
- UI surfaces missing docs via `DocumentCompletenessBanner`.
- Individual required categories: National ID, passport photo, KRA PIN (`document-completeness.ts`).

## Assistive AI (rule-based, no LLM)
- **Step guidance**: `lib/application-guidance.ts` + `components/application-guidance.tsx` on group/individual apply layouts (`ApplicationGuidance` i18n keys).
- **Soft duplicates**: `lib/soft-duplicate-check.ts` + `POST /api/soft-duplicates` returns only `{ phoneDuplicate, nationalIdDuplicate, message }`. Banner with acknowledgment on member-details and individual-information. Hard within-form National ID duplicates remain blocking.
- **Field tips**: `lib/field-guidance.ts` + `components/field-guidance.tsx` on focus (phone, National ID, bank, MSEA registration, KRA PIN).
- **Tripartite readiness**: checklist on individual tripartite page before sign/submit.

## Configuration
No new secrets. Completeness and assistive checks are rule-based and client/server validated.

## Limits
OCR lives in Majuu LMS staff preview, not the applicant portal.
