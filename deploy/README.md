# Deploying LAYERD to the droplet

The droplet (168.144.116.90) runs LAYERD as one Docker Compose stack in
`/opt/layerd`, built from a clone of this repo at `/opt/layerd/app`:

- **backend**: Medusa API and admin, `https://api.layerd.lk` (admin at `/app`)
- **storefront**: Next.js, `https://layerd.lk`
- **redis**: private to the stack
- **caddy**: the only published service (80/443), automatic HTTPS
- **database**: a `layerd` database and role inside the droplet's existing
  Postgres (`holaa-postgres-1`); the backend joins the `holaa_default` network

A 4 GB swap file (`/swapfile`) gives the builds headroom on the shared droplet.

## First deploy

```sh
ssh root@168.144.116.90
mkdir -p /opt/layerd && cd /opt/layerd
git clone https://github.com/ShakthiW/dtc-starter-layerd.git app
cp app/deploy/docker-compose.yml app/deploy/Caddyfile app/deploy/setup.sh .
sh setup.sh                                   # database, role and backend.env

docker compose build backend
docker compose up -d redis backend            # migrations seed the store on first start

# The storefront bakes in the production publishable key, created by the seed
KEY=$(docker exec holaa-postgres-1 psql -U layerd -d layerd -tAc \
  "select token from api_key where type='publishable' and revoked_at is null order by created_at limit 1")
echo "STOREFRONT_PUBLISHABLE_KEY=$KEY" > .env
docker compose build storefront
docker compose up -d storefront

# Once DNS for layerd.lk, www.layerd.lk and api.layerd.lk points here
docker compose up -d caddy
```

Then create your admin user (keeps the password with you):

```sh
docker compose exec backend medusa user -e you@example.com -p '<password>'
```

## Updating

```sh
cd /opt/layerd/app && git pull
cd /opt/layerd && docker compose build backend storefront && docker compose up -d backend storefront
```

Backend restarts run migrations first. If `deploy/` files changed, copy them
up to `/opt/layerd` again.

## DNS (Cloudflare)

`layerd.lk` is on Cloudflare. Point `@`, `www` and `api` A records at
168.144.116.90. Either set them to **DNS only** (grey cloud) so Caddy serves
the certificate directly, or keep the proxy on with SSL/TLS mode **Full
(strict)**.

## Backups

`pg_dump` the `layerd` database from `holaa-postgres-1`, and keep the
`layerd_uploads` volume (admin-uploaded product photos). Neither is
scheduled yet.
