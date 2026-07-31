# PS Signing Dashboard

Separate Principal Secretary dashboard for tripartite agreement signing with MSME-first sequential workflow and group migrant section 3 layout.

## Purpose

The existing `/ps/dashboard` route remains unchanged (both PS roles see all pending agreements independently). This feature adds a **new** signing workflow at `/ps/signing` where:

1. **MSME PS signs first** on pending agreements.
2. After MSME signs, agreements appear in the **Labour PS pending queue**.
3. Labour PS **cannot sign** until MSME has signed.

## Routes

| Route | Description |
|-------|-------------|
| `/ps/signing` | New signing dashboard (pending / signed tabs) |
| `/ps/signing/applications/[id]` | Tripartite agreement view + canvas signature for the signing workflow |
| `/ps/dashboard` | **Unchanged** — original dashboard |
| `/ps/applications/[id]/tripartite` | **Unchanged** — original per-application tripartite page |

## Workflow

```
Migrant submits → MSME PS pending (/ps/signing)
                → MSME PS signs (canvas)
                → Labour PS pending (/ps/signing)
                → Labour PS signs (canvas)
                → Fully signed
```

Enforced in:
- `web/lib/data/ps-signing-applications.ts` — Labour pending filter requires `msmePsSignature IS NOT NULL`
- `web/lib/tripartite/ps-signing-workflow.ts` — `canPsSignTripartite()` blocks Labour until MSME signed
- `web/app/ps/(portal)/signing/applications/[id]/ps-signing-action.ts` — server action uses workflow checks

## Section 3 layout (LABOUR MIGRANTS)

When viewing from the signing dashboard, section 3 uses the PS group layout (`psGroupSection3` prop on `TripartiteAgreementDocument`):

- **First migrant** in the group: full “I [name] ID No … Passport no. … is responsible for;” block, responsibilities list, then Sign / Date / Name.
- **Additional migrants**: header “OTHER NAMES WHOM THE PS HAS NOT SIGNED”, then each gets Sign / Date / Name of the Migrant Worker with applicant signatures where present.

Group members are loaded via `getTripartiteApplicantsForApplication()` from all submitted individual applications in the same group.

## Files added

```
web/lib/tripartite/ps-signing-workflow.ts
web/lib/data/tripartite-applicants.ts
web/lib/data/ps-signing-applications.ts
web/app/ps/(portal)/signing/page.tsx
web/app/ps/(portal)/signing/applications/[id]/page.tsx
web/app/ps/(portal)/signing/applications/[id]/ps-signing-tripartite-form.tsx
web/app/ps/(portal)/signing/applications/[id]/ps-signing-action.ts
docs/PS_SIGNING_DASHBOARD.md
```

## Files modified

```
web/components/tripartite/tripartite-agreement-document.tsx  — psGroupSection3 + applicants props (backward compatible)
web/components/ps/ps-nav-menu.tsx                            — “Tripartite signing” menu item
web/middleware.ts                                            — protect /ps/signing
```

## Files intentionally unchanged

```
web/app/ps/(portal)/dashboard/page.tsx
web/app/ps/(portal)/applications/[id]/tripartite/*
web/lib/data/ps-applications.ts
```

## Revert

To remove this feature and restore prior behaviour only:

```bash
cd portal
git revert <commit-hash>   # commit that introduced PS signing dashboard
docker compose -f ../docker-compose.yml build majuu-applicant-portal
docker compose -f ../docker-compose.yml up -d majuu-applicant-portal
```

Or manually delete the added files, revert the three modified files, and rebuild the portal container.

## Test application

Example: `cms4wq2zb009mk701j38xt47j`  
URL: `/ps/signing/applications/cms4wq2zb009mk701j38xt47j`

## Commit

Introduced in commit: _(filled in after push)_
