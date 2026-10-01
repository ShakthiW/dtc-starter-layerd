#!/bin/sh
# Run once on the droplet, from /opt/layerd. Writes postgres.env and
# backend.env with freshly generated secrets (never echoed) and leaves
# existing files untouched on later runs.
set -eu
cd "$(dirname "$0")"

if [ ! -f postgres.env ]; then
  printf 'POSTGRES_USER=layerd\nPOSTGRES_PASSWORD=%s\nPOSTGRES_DB=layerd\n' "$(openssl rand -hex 24)" > postgres.env
  chmod 600 postgres.env
  echo "wrote postgres.env"
fi

if [ ! -f backend.env ]; then
  DB_PASSWORD=$(sed -n 's/^POSTGRES_PASSWORD=//p' postgres.env)
  cat > backend.env <<EOF
NODE_ENV=production
DATABASE_URL=postgres://layerd:${DB_PASSWORD}@postgres:5432/layerd
REDIS_URL=redis://redis:6379
JWT_SECRET=$(openssl rand -hex 32)
COOKIE_SECRET=$(openssl rand -hex 32)
MEDUSA_BACKEND_URL=https://api.layerd.lk
STORE_CORS=https://layerd.lk,https://www.layerd.lk
ADMIN_CORS=https://api.layerd.lk
AUTH_CORS=https://layerd.lk,https://www.layerd.lk,https://api.layerd.lk
EOF
  chmod 600 backend.env
  echo "wrote backend.env"
fi
