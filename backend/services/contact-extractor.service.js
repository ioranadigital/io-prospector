// backend/services/contact-extractor.service.js
// v2: mailto/tel links, búsqueda en páginas /contacto, stealth mode, regex mejorada

import { chromium } from 'playwright';
import { logger } from '../utils/logger.js';

const TIMEOUT = 20000;
const CONTACT_PAGE_TIMEOUT = 8000;

const EMAIL_REGEX = /\b([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})\b/gi;
const PHONE_REGEX_ES = /(?:(?:\+34|0034|34)[\s.\-]?)?(?:[6789]\d{2}[\s.\-]?\d{3}[\s.\-]?\d{3}|\d{3}[\s.\-]?\d{2}[\s.\-]?\d{2}[\s.\-]?\d{2})/g;

const SPAM_EMAIL_PATTERNS = [
  '@example', '@test.', '@sentry.', 'noreply@', 'no-reply@', 'donotreply@',
  'privacy@', '@domain.', '@email.', 'user@', 'webmaster@', 'info@example',
  'email@email', '.png', '.jpg', '.gif', '.css', '.js', '.svg',
];

// Páginas de contacto a rastrear si no se encuentra en la raíz
const CONTACT_PATHS = [
  '/contacto', '/contact', '/contactanos', '/contacte',
  '/sobre-nosotros', '/about', '/about-us', '/quienes-somos',
  '/aviso-legal', '/donde-estamos', '/informacion',
];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
];

function pickUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function filterEmails(emails) {
  return [...new Set(emails)].filter(e => {
    const lower = e.toLowerCase();
    if (SPAM_EMAIL_PATTERNS.some(p => lower.includes(p))) return false;
    if (e.length > 80 || !e.includes('.')) return false;
    if (/\.(png|jpg|gif|css|js|svg|ico|woff)$/i.test(e)) return false;
    return true;
  });
}

function cleanPhone(raw) {
  if (!raw) return null;
  const digits = raw.replace(/[\s.\-()]/g, '');
  if (digits.length < 9) return null;
  if (digits.startsWith('0034')) return '+34' + digits.slice(4);
  if (/^34[6789]\d{8}$/.test(digits)) return '+' + digits;
  return digits;
}

function filterPhones(phones) {
  return [...new Set(phones)]
    .map(cleanPhone)
    .filter(p => p && p.replace(/\D/g, '').length >= 9);
}

async function extractContactFromPage(page) {
  const data = { emails: [], phones: [] };

  // 1. Atributos href mailto:/tel: — la fuente más fiable
  const mailtoLinks = await page.$$eval(
    'a[href^="mailto:"]',
    els => els.map(el => el.getAttribute('href').replace(/^mailto:/i, '').split('?')[0].trim())
  ).catch(() => []);
  data.emails.push(...mailtoLinks);

  const telLinks = await page.$$eval(
    'a[href^="tel:"]',
    els => els.map(el => el.getAttribute('href').replace(/^tel:/i, '').trim())
  ).catch(() => []);
  data.phones.push(...telLinks);

  // 2. HTML completo (emails/teléfonos en atributos, texto oculto, etc.)
  const html = await page.content().catch(() => '');
  data.emails.push(...(html.match(EMAIL_REGEX) || []));
  data.phones.push(...(html.match(PHONE_REGEX_ES) || []));

  // 3. Texto visible renderizado (para webs que cargan contacto con JS)
  const jsData = await page.evaluate(() => {
    const text = document.body?.innerText || '';
    const emailRx = /\b([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})\b/gi;
    const phoneRx = /(?:(?:\+34|0034|34)[\s.\-]?)?(?:[6789]\d{2}[\s.\-]?\d{3}[\s.\-]?\d{3}|\d{3}[\s.\-]?\d{2}[\s.\-]?\d{2}[\s.\-]?\d{2})/g;
    return {
      emails: [...(text.match(emailRx) || [])],
      phones: [...(text.match(phoneRx) || [])],
    };
  }).catch(() => ({ emails: [], phones: [] }));

  data.emails.push(...jsData.emails);
  data.phones.push(...jsData.phones);

  return {
    emails: filterEmails(data.emails),
    phones: filterPhones(data.phones),
  };
}

export const contactExtractorService = {
  async extract(url) {
    const result = {
      email: null,
      phone: null,
      isHTTPS: url.startsWith('https://'),
      html_length: 0,
      load_time_ms: 0,
      is_mobile_responsive: false,
      has_schema: false,
      broken_links_count: 0,
      extracted_at: new Date().toISOString(),
    };

    if (!url) return result;

    let browser;
    try {
      browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
        ],
      });

      const context = await browser.newContext({
        userAgent: pickUserAgent(),
        viewport: { width: 1366, height: 768 },
        locale: 'es-ES',
        extraHTTPHeaders: { 'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8' },
        // Ocultar webdriver flag
        javaScriptEnabled: true,
      });

      // Bloquear recursos que no aportan contacto (acelera la carga ~3x)
      await context.route('**/*.{png,jpg,jpeg,gif,svg,ico,webp,woff,woff2,ttf,mp4,mp3}', r => r.abort());
      await context.route('**/{gtm,analytics,hotjar,clarity,fbevents,cookiebot}*', r => r.abort());
      await context.route('**/facebook.com/**', r => r.abort());
      await context.route('**/doubleclick.net/**', r => r.abort());

      const page = await context.newPage();
      page.setDefaultTimeout(TIMEOUT);

      const startTime = Date.now();
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
        // Breve espera para JS que renderiza el contacto (modales de cookies, lazy load)
        await page.waitForTimeout(1500);
      } catch (e) {
        logger.warn(`Navigate failed for ${url}: ${e.message}`);
      }

      result.load_time_ms = Date.now() - startTime;

      const html = await page.content().catch(() => '');
      result.html_length = html.length;
      result.is_mobile_responsive = html.includes('viewport') &&
        (html.includes('width=device-width') || html.includes('width=screen-width'));
      result.has_schema = html.includes('application/ld+json') ||
        html.includes('itemscope') || html.includes('itemtype');

      // Verificar enlaces rotos (solo 3 links para no tardar)
      const links = await page.$$eval('a[href^="http"]', els =>
        els.slice(0, 3).map(el => el.href)
      ).catch(() => []);

      const checks = await Promise.all(
        links.map(href =>
          fetch(href, { method: 'HEAD', signal: AbortSignal.timeout(4000) })
            .then(r => r.ok)
            .catch(() => false)
        )
      );
      result.broken_links_count = checks.filter(ok => !ok).length;

      // Extracción en la página principal
      let { emails, phones } = await extractContactFromPage(page);

      // Si faltan datos, rastrear páginas de contacto
      if (!emails.length || !phones.length) {
        let baseUrl;
        try { baseUrl = new URL(url).origin; } catch { baseUrl = null; }

        if (baseUrl) {
          for (const contactPath of CONTACT_PATHS) {
            if (emails.length && phones.length) break;
            try {
              await page.goto(baseUrl + contactPath, {
                waitUntil: 'domcontentloaded',
                timeout: CONTACT_PAGE_TIMEOUT,
              });
              await page.waitForTimeout(600);

              const subData = await extractContactFromPage(page);
              if (!emails.length && subData.emails.length) {
                emails = subData.emails;
                logger.debug(`   📬 Email encontrado en ${contactPath}`);
              }
              if (!phones.length && subData.phones.length) {
                phones = subData.phones;
                logger.debug(`   📞 Teléfono encontrado en ${contactPath}`);
              }
            } catch (_) {
              // ruta no existe o timeout, continuar con la siguiente
            }
          }
        }
      }

      result.email = emails[0] || null;
      result.phone = phones[0] || null;

      await context.close();
    } catch (error) {
      logger.warn(`Extraction error for ${url}: ${error.message}`);
    } finally {
      if (browser) await browser.close().catch(() => null);
    }

    return result;
  },
};

export default contactExtractorService;
