# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Copiar código
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Copiar .env para build time (NEXT_PUBLIC_ variables)
COPY frontend/.env ./frontend/.env

# Instalar TODAS las dependencias (incluyendo dev para el build)
RUN cd backend && npm ci && cd ..
RUN cd frontend && npm ci && npm run build && cd ..

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copiar package.json
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Instalar solo dependencias de producción del backend
RUN cd backend && npm ci --omit=dev && cd ..

# Instalar solo dependencias de producción del frontend
RUN cd frontend && npm ci --omit=dev && cd ..

# Copiar código compilado del builder
COPY --from=builder /app/backend/ ./backend/
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public
COPY frontend/app ./frontend/app
COPY frontend/next.config.js ./frontend/

EXPOSE 3000 4000

# Script para levantar ambos servicios
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'cd /app/backend && npm start &' >> /start.sh && \
    echo 'cd /app/frontend && npm start' >> /start.sh && \
    chmod +x /start.sh

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["/start.sh"]
