# Wezesha Majuu Applicant Portal (Next.js)

Unified Next.js TypeScript portal for **group** and **individual** Wezesha Majuu loan applications.

Replaces the legacy Laravel applicant portal (`majuu-portal` service) and the separate React apps in `group/` and `individual/`.

## Structure (matches loans.uwezo.go.ke patterns)

| Path | Purpose |
|------|---------|
| `web/app/apply/group/[id]/*` | 9-step group application wizard |
| `web/app/apply/individual/[memberId]/*` | 9-step individual member wizard |
| `web/app/api/*` | Health, upload, and application APIs |
| `web/lib/data/` | Prisma data access |
| `web/prisma/` | MySQL schema & migrations |
| `packages/ui/` | Shared Uwezo UI (Tailwind 4 + shadcn/Radix) |
| `../storage/uploads/` | Applicant file storage |

## Quick start (local)

```bash
cd portal
pnpm install
cp web/.env.example web/.env
# Start DB: docker compose up -d majuu-portal-db
pnpm --filter majuu-portal-web db:push
pnpm dev
```

Portal: http://localhost:8085

## Docker

```bash
docker compose up -d --build majuu-portal-db majuu-applicant-portal
```

## Flow

1. Group chair starts at `/apply/create` and completes 9 group steps.
2. On submission, members use `/apply/individual` with their national ID.
3. Track status at `/status`.
