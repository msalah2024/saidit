#!/bin/sh
# One-shot: apply the Saidit app schema + seed storage, after the Supabase
# stack (db, auth, kong, storage) is healthy. Safe to re-run (idempotent).
set -e

export PGPASSWORD="$POSTGRES_PASSWORD"
PSQL="psql -h db -U postgres -d postgres -v ON_ERROR_STOP=1"

echo "[migrate] checking whether app schema is already applied..."
if $PSQL -tAc "select to_regclass('public.posts')" | grep -q '^public.posts$\|^posts$'; then
  echo "[migrate] app schema already present — skipping schema apply."
else
  echo "[migrate] ensuring 'supabase_realtime' publication exists..."
  $PSQL -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime') THEN CREATE PUBLICATION supabase_realtime; END IF; END \$\$;"

  echo "[migrate] applying migrations..."
  for f in $(ls /migrations/*.sql | sort); do
    echo "[migrate]   -> $f"
    $PSQL -f "$f"
  done
fi

echo "[migrate] ensuring storage buckets (saidit, saidit-defaults)..."
for b in saidit saidit-defaults; do
  curl -s -o /dev/null -X POST http://kong:8000/storage/v1/bucket \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
    -H "apikey: $SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"id\":\"$b\",\"name\":\"$b\",\"public\":true}" || true
done

echo "[migrate] uploading default avatar assets..."
upload() {
  curl -s -o /dev/null -w "[migrate]   %{http_code} $1\n" -X POST \
    "http://kong:8000/storage/v1/object/saidit-defaults/default-avatars/$1" \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
    -H "apikey: $SERVICE_ROLE_KEY" \
    -H "x-upsert: true" \
    -H "Content-Type: $2" \
    --data-binary "@/seed/saidit-defaults/default-avatars/$1"
}
upload saidit-male-avatar-new.png image/png
upload saidit-female-avatar-new.png image/png
upload saidit-logo.jpg image/jpeg

echo "[migrate] done."
