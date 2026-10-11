#!/bin/sh
# One-time switch of the droplet to ONE shared Caddy (EDGE.md). Run on the droplet
# as root after pulling the updated layerd and neet repos:
#
#   cd /opt/layerd/app && git pull
#   cd /opt/dtc-starter-neet && git pull
#   sh /opt/layerd/app/deploy/edge/cutover.sh
#
# What happens:
#   1. creates the edge-neet and edge-hydrokra networks and /opt/caddy-sites, /opt/caddy-certs
#   2. validates the complete new config in a throwaway container: nothing live is
#      touched unless it validates
#   3. connects the running neet containers to edge-neet (no restart)
#   4. stops neet's own Caddy, recreates layerd-caddy-1 with the new config
#      (layerd and the standord ingress blip for a few seconds; neet moves to the
#      shared Caddy on the same port 8443)
#   5. checks every site; if a check fails it rolls back automatically
#
# Nothing in holaa, openwa or standord-bridge is changed. Safe to re-run.
set -eu

# ON HOLD: this recreates layerd-caddy-1 and replaces its Caddyfile, but the live config
# is standord-bridge's mirror (see EDGE.md, "standord-bridge owns the live config").
# Run it only after standord's owner agreed: STANDORD_OK=1 sh cutover.sh
[ "${STANDORD_OK:-}" = 1 ] || { echo "cutover: on hold, read the note at the top of this file" >&2; exit 1; }

LAYERD=/opt/layerd
SRC=$LAYERD/app/deploy
NEET=/opt/dtc-starter-neet/deploy
STANDORD_INCLUDE=/var/lib/docker/volumes/layerd_caddy_config/_data/standord-ingress/bridge-api.caddy
STAMP=$(date +%Y%m%d-%H%M%S)
REG=ghcr.io/shakthiw

say() { printf '\n== %s\n' "$*"; }
die() { printf 'cutover: %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" = 0 ] || die "run as root"
[ -f "$SRC/edge/caddy-site" ] || die "pull the updated layerd repo into $LAYERD/app first"
[ -f "$NEET/caddy/neet.caddy" ] || die "pull the updated neet repo into /opt/dtc-starter-neet first"
[ -f "$NEET/certs/origin.pem" ] && [ -f "$NEET/certs/origin.key" ] || die "neet's origin certificate isn't in $NEET/certs"
[ -f "$NEET/.env" ] || die "$NEET/.env missing"
[ -f "$STANDORD_INCLUDE" ] || die "standord include missing at $STANDORD_INCLUDE; stop and check standord-bridge"

say "1. Networks, folders and the caddy-site helper"
for n in edge-neet edge-hydrokra; do docker network inspect "$n" >/dev/null 2>&1 || docker network create "$n"; done
install -d -m 755 /opt/caddy-sites
install -d -m 700 /opt/caddy-certs /opt/caddy-certs/neet
install -m 644 "$NEET/certs/origin.pem" /opt/caddy-certs/neet/origin.pem
install -m 600 "$NEET/certs/origin.key" /opt/caddy-certs/neet/origin.key
install -m 755 "$SRC/edge/caddy-site" /usr/local/bin/caddy-site

say "2. neet's site file, rendered from $NEET/.env"
STORE_DOMAIN=$(grep '^STORE_DOMAIN=' "$NEET/.env" | cut -d= -f2-)
API_DOMAIN=$(grep '^API_DOMAIN=' "$NEET/.env" | cut -d= -f2-)
[ -n "$STORE_DOMAIN" ] && [ -n "$API_DOMAIN" ] || die "STORE_DOMAIN / API_DOMAIN not set in $NEET/.env"
sed -e "s/{{STORE_DOMAIN}}/$STORE_DOMAIN/g" -e "s/{{API_DOMAIN}}/$API_DOMAIN/g" "$NEET/caddy/neet.caddy" > /opt/caddy-sites/neet.caddy
chmod 644 /opt/caddy-sites/neet.caddy

say "3. Validate the complete new config (throwaway container, nothing live touched)"
docker run --rm \
  -v "$SRC/Caddyfile:/etc/caddy/Caddyfile:ro" \
  -v /opt/caddy-sites:/etc/caddy/sites:ro \
  -v /opt/caddy-certs:/certs:ro \
  -v layerd_caddy_config:/config:ro \
  caddy:2-alpine caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile \
  || die "the new config doesn't validate; nothing was changed"

say "4. Images keep running as they are: give them their registry names (no rebuild)"
for app in backend storefront; do
  docker image inspect "$REG/layerd-$app:latest" >/dev/null 2>&1 || docker tag "layerd-$app:latest" "$REG/layerd-$app:latest"
  docker image inspect "$REG/neet-$app:latest" >/dev/null 2>&1 || docker tag "neet-$app:latest" "$REG/neet-$app:latest"
done

say "5. Connect the running neet containers to edge-neet (no restart)"
for c in neet-backend-1 neet-storefront-1; do
  docker inspect -f '{{json .NetworkSettings.Networks}}' "$c" | grep -q '"edge-neet"' || docker network connect edge-neet "$c"
done

say "6. Switch: new layerd compose + Caddyfile, stop neet's Caddy, recreate the shared one"
cp -p "$LAYERD/docker-compose.yml" "$LAYERD/docker-compose.yml.pre-edge-$STAMP"
cp -p "$LAYERD/Caddyfile" "$LAYERD/Caddyfile.pre-edge-$STAMP"
cp "$SRC/docker-compose.yml" "$LAYERD/docker-compose.yml"
cp "$SRC/Caddyfile" "$LAYERD/Caddyfile"
docker stop neet-caddy-1 >/dev/null 2>&1 || true
(cd "$LAYERD" && docker compose up -d --no-deps caddy)
sleep 5

say "7. Checks (from the droplet, straight to Caddy)"
fail=0
check() { # name url expected-pattern [extra curl args]
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 $4 "$2" || echo 000)
  if echo "$code" | grep -Eq "$3"; then echo "  ok    $1 ($code)"; else echo "  FAIL  $1 ($code)"; fail=1; fi
}
check "layerd shop"     "https://layerd.lk/"                  '^(2|3)'  "--resolve layerd.lk:443:127.0.0.1"
check "layerd api"      "https://api.layerd.lk/health"        '^200$'   "--resolve api.layerd.lk:443:127.0.0.1"
check "neet shop"       "https://$STORE_DOMAIN:8443/"         '^(2|3)'  "-k --resolve $STORE_DOMAIN:8443:127.0.0.1"
check "neet api"        "https://$API_DOMAIN:8443/health"     '^200$'   "-k --resolve $API_DOMAIN:8443:127.0.0.1"
if docker exec layerd-caddy-1 caddy adapt --config /etc/caddy/Caddyfile --adapter caddyfile 2>/dev/null | grep -q 'bridge-api'; then
  echo "  ok    standord ingress route loaded"
else
  echo "  FAIL  standord ingress route not loaded"; fail=1
fi

if [ "$fail" = 1 ]; then
  say "A check failed: rolling back"
  sh "$SRC/edge/rollback.sh" "$STAMP"
  exit 1
fi

say "Done. The shared Caddy serves layerd, neet and the standord ingress."
echo "Backups: $LAYERD/*.pre-edge-$STAMP. neet's old Caddy is stopped (not removed) until neet's next deploy."
