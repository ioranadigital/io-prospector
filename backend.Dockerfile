FROM node:20-alpine

WORKDIR /app

# Copiar solo package.json primero
COPY backend/package*.json ./

# Instalar dependencias de producción
RUN npm ci --omit=dev

# Copiar resto del backend
COPY backend/ .

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["npm", "start"]
