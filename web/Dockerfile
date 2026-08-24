ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine AS base
RUN apk add --no-cache libc6-compat wget
RUN npm install -g pnpm@10
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/ ./packages/
COPY web/package.json ./web/
RUN pnpm install --frozen-lockfile

FROM base AS builder
ARG NEXT_PUBLIC_APP_URL=https://majuu.uwezo.go.ke
COPY --from=deps /app ./
COPY web/ ./web/
RUN cd web && pnpm exec prisma generate --schema=./prisma/schema.prisma
ENV NODE_ENV=production
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
RUN cd web && pnpm build

FROM base AS production
RUN apk add --no-cache su-exec
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
RUN npm install -g prisma@6.11.1
COPY --from=builder --chown=nextjs:nodejs /app/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/web/.next/static ./web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/web/public ./web/public
COPY --from=builder --chown=nextjs:nodejs /app/web/prisma ./web/prisma
COPY --from=builder --chown=nextjs:nodejs /app/web/scripts/docker-entrypoint.sh ./web/scripts/docker-entrypoint.sh
RUN chmod +x ./web/scripts/docker-entrypoint.sh
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health | grep -q UP || exit 1
ENTRYPOINT ["/app/web/scripts/docker-entrypoint.sh"]
