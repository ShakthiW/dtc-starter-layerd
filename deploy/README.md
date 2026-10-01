# Deploying LAYERD to the droplet

Production runs on the DigitalOcean droplet as one Docker Compose stack in
`/opt/layerd`: Postgres, Redis, the Medusa backend (API + admin at
`https://api.layerd.lk/app`), the Next.js storefront (`https://layerd.lk`)
and Caddy for HTTPS. Only Caddy is published; the database and Redis are
private to the stack.

Images are built on a laptop for `linux/amd64` and copied over, so the
droplet (shared with other apps, no swap) never has to run a build.

## First deploy

```sh
# 1. Backend image
docker buildx build --platform linux/amd64 -f apps/backend/Dockerfile -t layerd-backend:latest --load .
docker save layerd-backend:latest | gzip | ssh root@168.144.116.90 'gunzip | docker load'

# 2. Stack files and secrets on the droplet
ssh root@168.144.116.90 'mkdir -p /opt/layerd'
scp deploy/docker-compose.yml deploy/Caddyfile deploy/setup.sh root@168.144.116.90:/opt/layerd/
ssh root@168.144.116.90 'sh /opt/layerd/setup.sh'

# 3. Database and backend (migrations seed the store on first start)
ssh root@168.144.116.90 'cd /opt/layerd && docker compose up -d postgres redis backend'

# 4. The storefront needs the production publishable key, created by the seed
ssh root@168.144.116.90 "cd /opt/layerd && docker compose exec -T postgres psql -U layerd -d layerd -tAc \"select token from api_key where type='publishable' and revoked_at is null limit 1\""
docker buildx build --platform linux/amd64 -f apps/storefront/Dockerfile \
  --build-arg NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<that key> -t layerd-storefront:latest --load .
docker save layerd-storefront:latest | gzip | ssh root@168.144.116.90 'gunzip | docker load'
ssh root@168.144.116.90 'cd /opt/layerd && docker compose up -d storefront'

# 5. After DNS points layerd.lk, www.layerd.lk and api.layerd.lk at the droplet
ssh root@168.144.116.90 'cd /opt/layerd && docker compose up -d caddy'

# 6. An admin user (run it yourself so the password stays with you)
ssh root@168.144.116.90 'cd /opt/layerd && docker compose exec backend medusa user -e you@example.com -p <password>'
```

## Updating

Rebuild the image that changed, `docker save | ssh docker load` it, then
`docker compose up -d <service>`. Backend restarts run migrations first.

## Backups

The database lives in the `layerd_pgdata` volume and uploads in
`layerd_uploads`. A nightly `pg_dump` is not set up yet.
