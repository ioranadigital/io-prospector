FROM node:20-alpine

WORKDIR /app

# Skip browser downloads from playwright and whatsapp-web.js (puppeteer)
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Copiar solo package.json primero
COPY backend/package*.json ./

# Instalar dependencias de producción
RUN npm install --omit=dev

# Copiar resto del backend
COPY backend/ .

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["npm", "start"]
