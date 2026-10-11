#!/bin/sh
# Undo cutover.sh: put back layerd's previous compose + Caddyfile, recreate its
# Caddy, and start neet's own Caddy again. Usage: sh rollback.sh [STAMP]
# (STAMP defaults to the newest *.pre-edge-* backup in /opt/layerd).
set -eu
LAYERD=/opt/layerd
STAMP=${1:-$(ls -1 "$LAYERD"/docker-compose.yml.pre-edge-* 2>/dev/null | sed 's/.*pre-edge-//' | sort | tail -1)}
[ -n "$STAMP" ] && [ -f "$LAYERD/docker-compose.yml.pre-edge-$STAMP" ] || { echo "rollback: no backup found" >&2; exit 1; }
cp -p "$LAYERD/docker-compose.yml.pre-edge-$STAMP" "$LAYERD/docker-compose.yml"
cp -p "$LAYERD/Caddyfile.pre-edge-$STAMP" "$LAYERD/Caddyfile"
(cd "$LAYERD" && docker compose up -d --no-deps caddy)
docker start neet-caddy-1 >/dev/null 2>&1 || echo "rollback: neet-caddy-1 not found; redeploy neet's previous compose" >&2
echo "rollback: restored the pre-edge setup from $STAMP"
