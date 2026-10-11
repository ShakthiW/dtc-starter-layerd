# Deploying LAYERD to the droplet

The droplet (168.144.116.90) runs LAYERD as one Docker Compose stack in
`/opt/layerd`. A clone of this repo at `/opt/layerd/app` supplies the deploy
files and the shared-Caddy scripts:

- **backend**: Medusa API and admin, `https://api.layerd.lk` (admin at `/app`)
- **storefront**: Next.js, `https://layerd.lk`
- **redis**: private to the stack
- **caddy**: the droplet's **shared** edge proxy (80/443, and 8443 for neet.),
  automatic HTTPS. It serves every project on the droplet; see [EDGE.md](EDGE.md)
- **database**: a `layerd` database and role inside the droplet's existing
  Postgres (`holaa-postgres-1`); the backend joins the `holaa_default` network

Images are built off the droplet, by `deploy/ship.sh` on your computer for now
and by GitHub Actions later ([EDGE.md](EDGE.md#images-built-off-the-droplet)).
The droplet only loads or pulls `ghcr.io/shakthiw/layerd-{backend,storefront}`.

## First deploy

This is how the stack was first set up, before images were built off the
droplet. It's kept for reference.

```sh
ssh root@168.144.116.90
mkdir -p /opt/layerd && cd /opt/layerd
git clone https://github.com/ShakthiW/dtc-starter-layerd.git app
cp app/deploy/docker-compose.yml app/deploy/Caddyfile app/deploy/setup.sh .
sh setup.sh                                   # database, role and backend.env
```

Then, from your computer, `./deploy/ship.sh backend`; migrations seed the store
on the first start. Put the publishable key the seed created into
`deploy/build.env` and run `./deploy/ship.sh storefront`:

```sh
ssh root@168.144.116.90 "docker exec holaa-postgres-1 psql -U layerd -d layerd -tAc \
  \"select token from api_key where type='publishable' and revoked_at is null order by created_at limit 1\""
```

Then create your admin user (keeps the password with you):

```sh
docker compose exec backend medusa user -e you@example.com -p '<password>'
```

## Updating

From your computer, after committing:

```sh
./deploy/ship.sh                 # build both apps here, copy them over, restart them
./deploy/ship.sh storefront      # one app
./deploy/ship.sh --files-only    # docker-compose.yml or Caddyfile changed (validated first)
```

Backend restarts run migrations first. Restarting the apps never restarts the
shared Caddy. The image being replaced stays on the droplet as `:previous`:

```sh
cd /opt/layerd
docker tag ghcr.io/shakthiw/layerd-storefront:previous ghcr.io/shakthiw/layerd-storefront:latest
docker compose up -d --no-deps storefront
```

Once GitHub Actions is set up ([EDGE.md](EDGE.md#images-built-off-the-droplet)),
a push to `main` builds the images, and deploys them too if that's turned on.

## DNS (Cloudflare)

`layerd.lk` is on Cloudflare. Point `@`, `www` and `api` A records at
168.144.116.90. Either set them to **DNS only** (grey cloud) so Caddy serves
the certificate directly, or keep the proxy on with SSL/TLS mode **Full
(strict)**.

## Backups

`pg_dump` the `layerd` database from `holaa-postgres-1`, and keep the
`layerd_uploads` volume (admin-uploaded product photos). Neither is
scheduled yet.
