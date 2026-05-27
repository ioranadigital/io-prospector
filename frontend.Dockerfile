FROM node:20-alpine AS builder

WORKDIR /app

# IMPORTANTE: Usar development para BUILD aunque Coolify pase production
# DevDependencies (typescript, webpack, etc.) son REQUERIDAS para compilar Next.js
ENV NODE_ENV=development

# Copiar SOLO package.json y package-lock.json
COPY frontend/package.json frontend/package-lock.json ./

# Instalar todas las dependencias (incluyendo dev)
# Force development mode to ensure devDependencies are installed
RUN NODE_ENV=development npm ci

# Copiar código fuente (sin sobrescribir node_modules)
COPY frontend/ .

# Build (force development NODE_ENV to ensure all tools are available)
RUN npm run build

# Etapa de producción
FROM node:20-alpine

WORKDIR /app

# Copiar package.json para producción
COPY frontend/package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar los built files de la etapa anterior
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["npm", "start"]
