FROM node:20-slim

WORKDIR /app

# whatsapp-web.js (puppeteer) ya no se usa activamente — el envío de WhatsApp
# va vía n8n/Twilio. Evita descargar un Chromium redundante para esa librería.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Copiar solo package.json primero
COPY backend/package*.json ./

# Instalar dependencias de producción
RUN npm install --omit=dev

# Chromium de Playwright (contact-extractor.service.js, performance-audit
# usan chromium.launch() sin executablePath) + dependencias del sistema.
# Requiere una base Debian/glibc — los binarios de Playwright no funcionan
# sobre Alpine/musl (por eso antes se saltaba la descarga y todo fallaba).
RUN npx playwright install --with-deps chromium

# Copiar resto del backend
COPY backend/ .

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["npm", "start"]
