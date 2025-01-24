FROM madnificent/ember:4.12.1-node_18 as builder

LABEL maintainer="info@redpencil.io"

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches/
RUN pnpm i --frozen-lockfile
COPY . .
RUN ember build -prod

FROM semtech/static-file-service:0.2.0
COPY --from=builder /app/dist /data
