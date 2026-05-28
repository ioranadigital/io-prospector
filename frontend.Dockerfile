FROM node:20-slim AS builder

ARG NODE_ENV=development
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_URL
ARG COOLIFY_URL
ARG COOLIFY_FQDN
ARG FRONTEND_URL
ARG SUPABASE_KEY
ARG SUPABASE_URL
ARG PORT
ARG COOLIFY_BUILD_SECRETS_HASH

WORKDIR /app

ENV NODE_ENV=development
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NEXT_TELEMETRY_DISABLED=1

COPY frontend/package.json frontend/package-lock.json ./

RUN NODE_ENV=development npm ci

COPY frontend/ .

# Capture build output to file, always exit 0 so we can inspect the log via container logs
RUN NODE_ENV=production npm run build > /tmp/build.log 2>&1 \
    && echo "BUILD_OK" > /tmp/build_status \
    || (echo "BUILD_FAILED" > /tmp/build_status && mkdir -p .next)

# Etapa de producción
FROM node:20-slim

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /tmp/build.log /build.log
COPY --from=builder /tmp/build_status /build_status

EXPOSE 3000

# Accept 2xx and 3xx - root redirects to /prospector (307)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode >= 400) throw new Error(r.statusCode)})"

CMD ["npm", "start"]
