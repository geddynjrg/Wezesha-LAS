# PS Signing Dashboard

Separate Principal Secretary dashboard for tripartite agreement signing with MSME-first sequential workflow and group migrant section 3 layout.

## Purpose

The existing `/ps/dashboard` route remains unchanged (both PS roles see all pending agreements independently and may sign from `/ps/applications/[id]/tripartite`). This feature adds a **new** signing workflow at `/ps/signing` where:

1. **MSME PS signs first** on the signing dashboard pending list — one signature at the bottom of the list forwards **all** pending agreements to Labour PS.
2. After MSME signs, agreements appear in the **Labour PS pending queue**.
3. Labour PS **cannot sign** until MSME has signed; Labour signs per agreement on the tripartite detail page (canvas at bottom).

## UI parity with `/ps/dashboard`

The signing dashboard list and tripartite page follow the same visual patterns as the original dashboard:

- **List page** (`/ps/signing`): same title (“Tripartite agreements”), Pending/Signed tabs with count badges, card layout, typography, and empty states as `/ps/dashboard`. MSME PS pending tab adds a **batch signature canvas at the bottom of the list** (after all application cards).
- **Tripartite page** (`/ps/signing/applications/[id]`): same header, “Agreement document” card, and PS group section 3 layout. MSME PS reviews agreements here (read-only); signing is on the dashboard list. Labour PS signs at bottom of this page when eligible.

## Routes

| Route | Description |
|-------|-------------|
| `/ps/signing` | Signing dashboard (pending / signed tabs). MSME batch-signs at bottom of pending list. |
| `/ps/signing/applications/[id]` | Tripartite agreement view — MSME read-only review; Labour signs at bottom when MSME has signed |
| `/ps/dashboard` | **Unchanged** — original dashboard |
| `/ps/applications/[id]/tripartite` | **Unchanged** — original per-application tripartite page |

## Workflow

```
Migrant submits → MSME PS pending (/ps/signing list)
                → MSME PS reviews list, signs once at bottom of list
                → All pending agreements forwarded to Labour PS queue
                → Labour PS pending (/ps/signing)
                → Labour PS signs each agreement (canvas at bottom of detail view)
                → Fully signed
```

**MSME PS:** sees pending queue on `/ps/signing`; opens individual agreements for read-only review (section 3 migrant list). Returns to dashboard, signs once at the bottom of the pending list; signature is applied to every pending agreement and they move to Labour’s queue.

**Labour PS:** pending queue only lists agreements after MSME has signed. Opens tripartite detail view and signs at bottom. If Labour opens an agreement before MSME signing (e.g. direct URL), the document is read-only and shows “Awaiting MSME PS signature”.

Enforced in:
- `web/lib/data/ps-signing-applications.ts` — Labour pending filter requires `msmePsSignature IS NOT NULL`
- `web/lib/tripartite/ps-signing-workflow.ts` — `canPsSignTripartite()` blocks Labour until MSME signed
- `web/app/ps/(portal)/signing/ps-signing-batch-action.ts` — MSME batch sign + forward all pending to Labour
- `web/app/ps/(portal)/signing/applications/[id]/ps-signing-action.ts` — Labour per-application sign (server action uses workflow checks)

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
web/app/ps/(portal)/signing/ps-signing-batch-form.tsx
web/app/ps/(portal)/signing/ps-signing-batch-action.ts
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

## Commits

- Introduced in: `e6aae10`
- UI aligned to old dashboard + MSME-first bottom signing: `4229652`
- MSME batch sign at bottom of pending list: `c029625`
