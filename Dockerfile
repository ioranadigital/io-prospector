FROM node:20-alpine

WORKDIR /app

# Copiar package.json primero
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Copiar código ANTES de instalar/build
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Instalar dependencias backend
RUN cd backend && npm ci --omit=dev && cd ..

# Instalar dependencias frontend y build
RUN cd frontend && npm ci --omit=dev && npm run build && cd ..

EXPOSE 3000 4000

# Script para levantar ambos servicios
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'cd /app/backend && npm start &' >> /start.sh && \
    echo 'cd /app/frontend && npm start' >> /start.sh && \
    chmod +x /start.sh

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["/start.sh"]
