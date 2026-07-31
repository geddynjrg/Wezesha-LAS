# PS Tripartite Agreement Refactor

**Date:** 2026-07-31  
**Commit:** `c564473`  
**Repository:** Wezesha-LAS (`portal/`)

## Summary

Refactored the PS portal tripartite agreement experience so unsigned agreements mirror the applicant view, list all migrant applicants with signatures, and enforce sequential PS signing (MSME first, then Labour).

## Files changed

| File | Change |
|------|--------|
| `web/components/tripartite/tripartite-agreement-document.tsx` | Added `TripartiteApplicant` type and multi-applicant list + per-applicant signature rendering for PS view |
| `web/lib/data/tripartite-applicants.ts` | **New** – applicant list loader, signing status helpers |
| `web/lib/tripartite/ps-signing-workflow.ts` | **New** – sequential signing eligibility (`canPsSignTripartite`, `hasPsSigned`) |
| `web/lib/data/ps-applications.ts` | Labour pending filter now requires MSME signature first |
| `web/app/ps/(portal)/applications/[id]/tripartite/ps-tripartite-form.tsx` | Applicant list, workflow banners, conditional sign canvas |
| `web/app/ps/(portal)/applications/[id]/tripartite/page.tsx` | Loads applicants for agreement view |
| `web/app/ps/(portal)/applications/[id]/tripartite/ps-sign-action.ts` | Blocks Labour PS signing until MSME has signed |
| `web/app/ps/(portal)/dashboard/page.tsx` | Pending cards show workflow status, ID/passport preview, role-specific copy |
| `docs/PS_TRIPARTITE_REFACTOR.md` | This document |

## Workflow: before vs after

### Before

```
Migrant submits → MSME PS pending (parallel) ↔ Labour PS pending (parallel)
Either PS could sign independently; dashboard showed apps missing their own signature only.
Single migrant row in section 3; no applicant list on PS view.
```

### After

```
Migrant submits & accepts tripartite
        ↓
MSME PS dashboard: pending (can sign)
Labour PS dashboard: not listed as pending yet (can open per-application link read-only)
        ↓
MSME PS signs → agreement "forwarded" to Labour PS
        ↓
Labour PS dashboard: pending (can sign)
        ↓
Labour PS signs → fully signed (both PS roles see in Signed tab)
```

**PS tripartite page (`/ps/applications/{id}/tripartite`):**

- Renders full agreement via shared `TripartiteAgreementDocument` (read-only), matching applicant content
- Section 3 lists all group applicants (name, ID, passport) with signatures where recorded
- MSME PS: signature pad when MSME slot is empty
- Labour PS: warning if MSME not signed; signature pad only after MSME signed
- Individual application links remain available to both PS roles from dashboard cards

## Revert instructions

1. Identify the refactor commit on `master`:
   ```bash
   cd portal
   git log --oneline -5
   ```
2. Revert the commit (replace `<commit-hash>` with the hash from step 1):
   ```bash
   git revert c564473 --no-edit
   ```
3. Rebuild and restart the portal container:
   ```bash
   cd /home/administrator/majuu_backend
   docker compose build majuu-applicant-portal
   docker compose up -d majuu-applicant-portal
   ```
4. Verify `/ps/dashboard` and `/ps/applications/{id}/tripartite` for both PS roles.

If multiple commits were used, revert in reverse chronological order:
```bash
git revert <newest-hash> <older-hash> --no-edit
```

## Manual test checklist

- [ ] `/ps/dashboard` – MSME role: pending tab loads (no 500)
- [ ] `/ps/dashboard` – Labour role: pending tab loads (no 500)
- [ ] `/ps/applications/{id}/tripartite` – MSME can sign when MSME slot empty
- [ ] `/ps/applications/{id}/tripartite` – Labour sees message before MSME signs
- [ ] `/ps/applications/{id}/tripartite` – Labour can sign after MSME signed
- [ ] Applicant list shows name, ID, passport, signature per migrant
- [ ] Per-application dashboard links work for both PS roles
