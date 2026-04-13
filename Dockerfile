# syntax=docker/dockerfile:1
FROM oven/bun:1-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

FROM base AS release
COPY --from=deps /app/node_modules ./node_modules
COPY src/ ./src/
COPY package.json ./

ENV TELEGRAM_MODE=auto
ENTRYPOINT ["bun", "run", "src/index.ts"]
