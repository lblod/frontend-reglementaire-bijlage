FROM node:22-slim AS builder

LABEL maintainer="info@redpencil.io"

RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches/
RUN pnpm i --frozen-lockfile
COPY . .
RUN pnpm run build

FROM semtech/static-file-service:0.2.0
COPY --from=builder /app/dist /data
FROM node:22-slim AS builder

LABEL maintainer="info@redpencil.io"

RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches/
RUN pnpm i --frozen-lockfile
COPY . .
RUN pnpm run build

FROM semtech/static-file-service:0.2.0
COPY --from=builder /app/dist /data