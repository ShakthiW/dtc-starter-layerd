# Medusa backend and admin. Build from the repo root:
#   docker buildx build --platform linux/amd64 -f apps/backend/Dockerfile -t layerd-backend .
FROM node:22-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@10.11.1 --activate
WORKDIR /repo

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/
RUN pnpm install --frozen-lockfile --filter "@dtc/backend..."
COPY apps/backend apps/backend
WORKDIR /repo/apps/backend
RUN pnpm exec medusa build

# The built server runs from .medusa/server and resolves its packages from the
# workspace install above, so the versions match the lockfile exactly.
FROM build AS runtime
ENV NODE_ENV=production \
    PATH=/repo/apps/backend/node_modules/.bin:$PATH
WORKDIR /repo/apps/backend/.medusa/server
EXPOSE 9000
# Migrations are idempotent; on a fresh database they also seed the store
CMD ["sh", "-c", "medusa db:migrate && medusa start"]
