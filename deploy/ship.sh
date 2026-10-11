#!/usr/bin/env bash
# Deploy LAYERD without building on the droplet (the stopgap until GitHub
# Actions builds the images, see .github/workflows/images.yml):
#
#   1. build the images on this computer for linux/amd64
#   2. stream them to the droplet: docker save | ssh docker load (no registry)
#   3. restart backend/storefront in /opt/layerd (the shared Caddy is not restarted)
#
#   deploy/ship.sh                  build and ship backend + storefront
#   deploy/ship.sh storefront       just one app
#   deploy/ship.sh --files-only     sync docker-compose.yml + Caddyfile (validated) and reload Caddy
#   NO_BUILD=1 deploy/ship.sh       ship images you already built
#
# Storefront builds need NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY in deploy/build.env
# (git-ignored; same value as STOREFRONT_PUBLISHABLE_KEY in /opt/layerd/.env).
# The previous image stays on the droplet as :previous for a quick rollback.
set -euo pipefail
cd "$(dirname "$0")/.."

HOST="${DEPLOY_HOST:-root@168.144.116.90}"
DIR="${DEPLOY_DIR:-/opt/layerd}"
REGISTRY="${IMAGE_REGISTRY:-ghcr.io/shakthiw}"
image() { echo "$REGISTRY/layerd-$1:latest"; }

APPS=()
FILES_ONLY=0
for arg in "$@"; do
  case "$arg" in
    backend | storefront) APPS+=("$arg") ;;
    --files-only) FILES_ONLY=1 ;;
    *) echo "usage: deploy/ship.sh [backend] [storefront] [--files-only]" >&2; exit 1 ;;
  esac
done
[ ${#APPS[@]} -eq 0 ] && APPS=(backend storefront)

if [ "$FILES_ONLY" = 1 ]; then
  # The Caddyfile is the shared proxy's root config: validate before it goes live,
  # and write it in place (it's bind-mounted as a single file).
  scp -q deploy/docker-compose.yml "$HOST:$DIR/docker-compose.yml"
  scp -q deploy/Caddyfile "$HOST:$DIR/Caddyfile.new"
  scp -q deploy/edge/caddy-site "$HOST:/usr/local/bin/caddy-site"
  ssh "$HOST" "DIR='$DIR' sh -s" <<'REMOTE'
set -eu
cd "$DIR"
docker run --rm -v "$DIR/Caddyfile.new:/etc/caddy/Caddyfile:ro" -v /opt/caddy-sites:/etc/caddy/sites:ro \
  -v /opt/caddy-certs:/certs:ro -v layerd_caddy_config:/config:ro \
  caddy:2-alpine caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
cat Caddyfile.new > Caddyfile && rm Caddyfile.new
chmod 755 /usr/local/bin/caddy-site
caddy-site reload
REMOTE
  exit 0
fi

# ---- 1. build on this computer -----------------------------------------------------
if [ -z "${NO_BUILD:-}" ]; then
  for app in "${APPS[@]}"; do
    args=()
    if [ "$app" = storefront ]; then
      [ -f deploy/build.env ] || { echo "Missing deploy/build.env with NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY" >&2; exit 1; }
      set -a; . deploy/build.env; set +a
      [ -n "${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY:-}" ] || { echo "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is empty in deploy/build.env" >&2; exit 1; }
      args+=(--build-arg "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY")
    fi
    echo "Building $app for linux/amd64"
    docker buildx build --platform linux/amd64 -f "apps/$app/Dockerfile" -t "$(image "$app")" ${args[@]+"${args[@]}"} --load .
  done
fi

# ---- 2. ship: keep the running image as :previous, then load the new one -----------
IMAGES=()
for app in "${APPS[@]}"; do
  IMAGES+=("$(image "$app")")
  ssh "$HOST" "docker image inspect '$(image "$app")' >/dev/null 2>&1 && docker tag '$(image "$app")' '$REGISTRY/layerd-$app:previous' || true"
done
echo "Copying ${IMAGES[*]} to the droplet"
docker save "${IMAGES[@]}" | gzip -1 | ssh "$HOST" 'gunzip | docker load'

# ---- 3. restart the apps only (--no-deps keeps the shared Caddy running) -----------
scp -q deploy/docker-compose.yml "$HOST:$DIR/docker-compose.yml"
ssh "$HOST" "cd '$DIR' && docker compose up -d --no-deps ${APPS[*]} && docker image prune -f >/dev/null"
echo "Done. Check: ssh $HOST 'cd $DIR && docker compose ps'"
