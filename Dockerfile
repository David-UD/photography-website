# Base image: Bun runtime (used for deps + dev). Production also uses Bun.
FROM oven/bun:1 AS base
WORKDIR /app

# ---- Install dependencies (cached by layer) ----
# Copy lockfile first so dependency install only reruns when they change.
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install

# ---- Development stage ----
# Runs `next dev` with Fast Refresh. Source is bind-mounted from the host,
# node_modules and .next live in named volumes so they are NOT overwritten.
FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "dev"]

# ---- Build stage (production pre-built image) ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Build args allow passing env vars at build time for SSG
ARG DATABASE_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_S3_PUBLIC_URL
RUN bun run build

# ---- Production runner (optimized standalone output) ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copy standalone server + static assets from build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["bun", "server.js"]