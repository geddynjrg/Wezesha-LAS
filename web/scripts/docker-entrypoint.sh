#!/bin/sh
set -e
cd /app/web
echo "Waiting for database..."
MAX_RETRIES=30
RETRY_COUNT=0
until npx prisma db execute --schema=./prisma/schema.prisma --stdin <<'EOF' || [ $RETRY_COUNT -eq $MAX_RETRIES ]
SELECT 1;
EOF
do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "Database not ready ($RETRY_COUNT/$MAX_RETRIES)..."
  sleep 2
done
if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "Database connection failed"
  exit 1
fi
echo "Running migrations..."
MIGRATE_OUTPUT=$(mktemp)
if ! prisma migrate deploy --schema=./prisma/schema.prisma >"$MIGRATE_OUTPUT" 2>&1; then
  cat "$MIGRATE_OUTPUT"
  if grep -q 'P3005' "$MIGRATE_OUTPUT"; then
    echo "Baselining existing schema..."
    for migration in prisma/migrations/*/; do
      [ -f "$migration/migration.sql" ] || continue
      name=$(basename "$migration")
      prisma migrate resolve --applied "$name" --schema=./prisma/schema.prisma 2>/dev/null || true
    done
    prisma migrate deploy --schema=./prisma/schema.prisma
  else
    rm -f "$MIGRATE_OUTPUT"
    exit 1
  fi
fi
rm -f "$MIGRATE_OUTPUT"
echo "Starting portal..."
cd /app
exec node web/server.js
