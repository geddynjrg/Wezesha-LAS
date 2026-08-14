# AI / Blockchain / Analytics — Wezesha Majuu Applicant Portal

## Document completeness
- Group flow uses `validateGroupDocumentsReady` before submit (`documents-action.ts`).
- UI surfaces missing docs via `DocumentCompletenessBanner`.
- Individual required categories: National ID, passport photo, KRA PIN (`document-completeness.ts`).

## Configuration
No new secrets. Completeness is rule-based and client/server validated.

## Limits
OCR lives in Majuu LMS staff preview, not the applicant portal.
