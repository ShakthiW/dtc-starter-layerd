# Next.js storefront as a standalone server. Build from the repo root:
#   docker buildx build --platform linux/amd64 -f apps/storefront/Dockerfile \
#     --build-arg NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_... -t layerd-storefront .
# NEXT_PUBLIC_* values are baked into the client bundle at build time.
FROM node:22-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@10.11.1 --activate
WORKDIR /repo

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/storefront/package.json apps/storefront/
RUN pnpm install --frozen-lockfile --filter "@dtc/storefront..."
COPY apps/storefront apps/storefront
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.layerd.lk
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_BASE_URL=https://layerd.lk
ARG NEXT_PUBLIC_DEFAULT_REGION=lk
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL \
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
    NEXT_PUBLIC_DEFAULT_REGION=$NEXT_PUBLIC_DEFAULT_REGION \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /repo/apps/storefront
RUN pnpm exec next build

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8000 \
    HOSTNAME=0.0.0.0
WORKDIR /app
# Owned by the runtime user so Next can write its cache under .next/cache
COPY --from=build --chown=node:node /repo/apps/storefront/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/storefront/.next/static ./apps/storefront/.next/static
COPY --from=build --chown=node:node /repo/apps/storefront/public ./apps/storefront/public
USER node
EXPOSE 8000
CMD ["node", "apps/storefront/server.js"]
