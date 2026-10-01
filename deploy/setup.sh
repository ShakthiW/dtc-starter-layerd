#!/bin/sh
# Run once on the droplet from /opt/layerd. Creates the `layerd` role and
# database in the existing Postgres (holaa-postgres-1) and writes backend.env
# with generated secrets. Nothing secret is printed; existing files are kept.
set -eu
cd "$(dirname "$0")"

PG=holaa-postgres-1

if [ ! -f backend.env ]; then
  DB_PASSWORD=$(openssl rand -hex 24)
  docker exec -i "$PG" sh -c 'psql -v ON_ERROR_STOP=1 -q -U "$POSTGRES_USER" -d postgres' <<SQL
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'layerd') THEN
    CREATE ROLE layerd LOGIN PASSWORD '${DB_PASSWORD}';
  ELSE
    ALTER ROLE layerd LOGIN PASSWORD '${DB_PASSWORD}';
  END IF;
END \$\$;
SQL
  docker exec "$PG" sh -c 'psql -U "$POSTGRES_USER" -d postgres -tAc "select 1 from pg_database where datname = '"'"'layerd'"'"'"' | grep -q 1 ||
    docker exec "$PG" sh -c 'psql -q -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE layerd OWNER layerd"'

  # sslmode=disable: the database is only reachable on the private Docker
  # network, and Medusa otherwise requires SSL for any non-localhost host.
  cat > backend.env <<EOF
NODE_ENV=production
DATABASE_URL=postgres://layerd:${DB_PASSWORD}@${PG}:5432/layerd?sslmode=disable
REDIS_URL=redis://redis:6379
JWT_SECRET=$(openssl rand -hex 32)
COOKIE_SECRET=$(openssl rand -hex 32)
MEDUSA_BACKEND_URL=https://api.layerd.lk
STORE_CORS=https://layerd.lk,https://www.layerd.lk
ADMIN_CORS=https://api.layerd.lk
AUTH_CORS=https://layerd.lk,https://www.layerd.lk,https://api.layerd.lk
EOF
  chmod 600 backend.env
  echo "created the layerd database and wrote backend.env"
fi
