# The droplet's shared Caddy

One Caddy (`layerd-caddy-1`, the `caddy` service in this repo's
`deploy/docker-compose.yml`) is the only thing on 168.144.116.90 that listens on
80, 443 and 8443. It serves every project:

```
                      ┌─ layerd.lk, api.layerd.lk ─────────▶ layerd-storefront-1 / layerd-backend-1   (default network)
:80 / :443  ──▶ Caddy ├─ HYDROKRA store, api, media ──────▶ hydrokra-storefront-1 / -backend-1 / -garage-1   (edge-hydrokra)
                      └─ bridge-api.…sslip.io ────────────▶ standord-bridge unix socket   (layerd_caddy_config volume)
:8443 (Cloudflare) ──▶ Caddy ── new.neet.lk, api.neet.lk ──▶ neet-storefront-1 / neet-backend-1   (edge-neet)
```

- **Root config**: `/opt/layerd/Caddyfile` (from `deploy/Caddyfile` here): global
  settings, the layerd sites, `import /etc/caddy/sites/*.caddy`, and the
  standord-bridge include.
- **Other projects**: one file each in `/opt/caddy-sites/` (`neet.caddy`,
  `hydrokra.caddy`), installed by that project's `deploy/ship.sh` through
  `caddy-site`. Each project keeps its own site file in its own repo.
- **Certificates**: automatic HTTPS for everything except neet., which uses its
  Cloudflare Origin Certificate from `/opt/caddy-certs/neet/`.
- **Networks**: each project has its own `edge-<project>` network, and only its
  public containers join it. Caddy joins all of them and addresses upstreams by
  container name (`neet-backend-1`), because every project calls its services
  `backend` and `storefront`. Projects can't reach each other.

### Don't touch

- **standord-bridge** runs as systemd units on the host and is wired to this
  container by name (`layerd-caddy-1`) and to the `layerd_caddy_config` volume
  (its socket and `bridge-api.caddy` live there). Keep the compose project name
  `layerd`, the service name `caddy`, the `caddy_*` volumes and the
  `import /config/standord-ingress/bridge-api.caddy` line.
- **holaa / openwa** (`/root/hotel-chatbot`) are separate. layerd's backend only
  joins `holaa_default` to reach its Postgres.

## standord-bridge owns the live config

What `layerd-caddy-1` serves is **standord-bridge's mirror**,
`/config/standord-ingress/Caddyfile` (volume `layerd_caddy_config`). The container's
`/etc/caddy/Caddyfile` is a stale bind mount: **never reload from it**, or the
standord route disappears (this happened once, for 2.5 minutes). Any change to the
live config means: confirm the live config equals the mirror, edit the mirror (and
keep `/opt/layerd/Caddyfile` identical), validate, reload from the mirror.

Until standord's owner agrees to a new layout, the `cutover.sh` / `caddy-site` flow
below is **on hold** (`cutover.sh` refuses to run without `STANDORD_OK=1`). In the
meantime HYDROKRA is added with `deploy/edge/hydrokra-site`, which follows the rule
above, makes one change (an `import /config/hydrokra/*.caddy` line, plus joining the
`edge-hydrokra` network) and can take it out again:

```sh
sh /opt/layerd/app/deploy/edge/hydrokra-site check     # read-only
sh /opt/layerd/app/deploy/edge/hydrokra-site add
sh /opt/layerd/app/deploy/edge/hydrokra-site refresh   # after HYDROKRA's ship.sh --files-only
sh /opt/layerd/app/deploy/edge/hydrokra-site remove    # then: docker compose down -v in /opt/hydrokra
```

## caddy-site

`/usr/local/bin/caddy-site` (from `deploy/edge/caddy-site`) manages the site files.
Every change is validated against the whole config first; an invalid file is
rolled back and the live config stays as it was.

```sh
caddy-site list
caddy-site install hydrokra /opt/hydrokra/caddy/hydrokra.rendered.caddy
caddy-site remove hydrokra
caddy-site reload           # after editing /opt/layerd/Caddyfile
docker logs -f layerd-caddy-1
```

Adding a project: give it an external `edge-<name>` network in its compose file,
attach its public services, add the network to the `caddy` service here, create it
(`docker network create edge-<name>`), then `docker compose up -d --no-deps caddy`
and `caddy-site install <name> <file>`.

## One-time cutover (from per-project Caddies)

Before this change, layerd and neet each ran their own Caddy. `deploy/edge/cutover.sh`
switches the droplet over without rebuilding anything:

```sh
ssh root@168.144.116.90
cd /opt/layerd/app && git pull
cd /opt/dtc-starter-neet && git pull
sh /opt/layerd/app/deploy/edge/cutover.sh
```

It validates the complete new config in a throwaway container before changing
anything live, re-tags the running images with their registry names, connects
the running neet containers to `edge-neet`, stops `neet-caddy-1`, and recreates
`layerd-caddy-1`. layerd and the standord ingress blip for a few seconds. It
then checks layerd, neet (on 8443) and the standord route, and rolls back by
itself if any check fails.

Manual rollback: `sh /opt/layerd/app/deploy/edge/rollback.sh` restores the
`*.pre-edge-<stamp>` copies in `/opt/layerd` and starts neet's old Caddy again.
That works until neet's next deploy, which removes `neet-caddy-1`.

## Images: built off the droplet

Nothing is built on the droplet any more. Every project's compose file names its
images `ghcr.io/shakthiw/<project>-{backend,storefront}:latest` with
`pull_policy: missing`, so the droplet uses whatever image is loaded or pulled.

**Now (stopgap):** `deploy/ship.sh` in each repo builds for `linux/amd64` on
your computer and streams the images over SSH (`docker save | docker load`). It
needs no registry. The image it replaces is kept as `:previous`.

**Later (GitHub Actions):** `.github/workflows/images.yml` in each repo builds on
pushes to `main` and pushes to GHCR. Set it up once per repo:

1. Settings > Secrets and variables > Actions > **Variables**: the build values
   listed at the top of that repo's workflow file.
2. On the droplet, log in to GHCR once with a classic personal access token that
   has only `read:packages`:
   `echo <token> | docker login ghcr.io -u ShakthiW --password-stdin`
3. To let Actions deploy too: add the **secrets** `DROPLET_SSH_KEY` (a new key
   pair just for this; its public half in `/root/.ssh/authorized_keys`) and
   `DROPLET_KNOWN_HOSTS` (`ssh-keyscan 168.144.116.90`), and the variables
   `DROPLET_HOST=168.144.116.90` and `DEPLOY_ENABLED=true`.

Until step 3, Actions only builds. Deploy by hand on the droplet:
`docker compose pull backend storefront && docker compose up -d backend storefront`.

Rollback after a bad deploy (any project):

```sh
docker tag ghcr.io/shakthiw/<project>-storefront:previous ghcr.io/shakthiw/<project>-storefront:latest
docker compose up -d storefront
```
