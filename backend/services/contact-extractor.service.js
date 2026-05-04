// backend/services/contact-extractor.service.js
// Extrae email, teléfono y datos técnicos de un website

import { chromium } from 'playwright';
import { logger } from '../utils/logger.js';

const TIMEOUT = 10000;
const EMAIL_REGEX = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
const PHONE_REGEX = /(?:\+34|0034|34)?[\s.-]?[6-9]\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}|^\+[1-9]\d{1,14}$/gm;

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
      browser = await chromium.launch({ headless: true, timeout: TIMEOUT });
      const page = await browser.newPage();

      const startTime = Date.now();
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT })
        .catch(e => logger.warn(`Navigate failed for ${url}: ${e.message}`));
      result.load_time_ms = Date.now() - startTime;

      const html = await page.content();
      result.html_length = html.length;

      // Detectar mobile responsiveness (viewport meta tag)
      result.is_mobile_responsive = html.includes('viewport') &&
        (html.includes('width=device-width') || html.includes('width=screen-width'));

      // Detectar Schema/JSON-LD
      result.has_schema = html.includes('application/ld+json') ||
        html.includes('itemscope') ||
        html.includes('itemtype');

      // Verificar enlaces rotos (HEAD requests a href principales)
      const links = await page.locator('a[href]').all();
      let brokenCount = 0;
      const linkChecks = [];

      for (let i = 0; i < Math.min(5, links.length); i++) {
        const href = await links[i].getAttribute('href').catch(() => null);
        if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
          linkChecks.push(
            fetch(href, { method: 'HEAD', timeout: 5000 })
              .then(res => ({ status: res.status, ok: res.ok }))
              .catch(() => ({ status: 0, ok: false }))
          );
        }
      }

      const checks = await Promise.all(linkChecks);
      brokenCount = checks.filter(c => !c.ok || c.status === 404 || c.status >= 500).length;
      result.broken_links_count = brokenCount;

      // Extraer email
      const emails = html.match(EMAIL_REGEX) || [];
      const validEmails = new Set(
        emails.filter(e => !e.includes('@example') && !e.includes('@test'))
      );
      result.email = validEmails.size > 0 ? Array.from(validEmails)[0] : null;

      // Extraer teléfono (España)
      const phones = html.match(PHONE_REGEX) || [];
      if (phones.length > 0) {
        result.phone = phones[0].replace(/[\s.-]/g, '');
      }

      // Buscar en atributos comunes
      if (!result.email || !result.phone) {
        const contacts = await page.evaluate(() => {
          const text = document.body.innerText;
          const emails = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi) || [];
          const phones = text.match(/(?:\+34|0034|34)?[\s.-]?[6-9]\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}/g) || [];
          return { emails: [...new Set(emails)], phones: [...new Set(phones)] };
        });

        if (!result.email && contacts.emails.length > 0) {
          result.email = contacts.emails[0];
        }
        if (!result.phone && contacts.phones.length > 0) {
          result.phone = contacts.phones[0];
        }
      }

      await page.close();
    } catch (error) {
      logger.warn(`Extraction error for ${url}: ${error.message}`);
    } finally {
      if (browser) await browser.close();
    }

    return result;
  },
};

export default contactExtractorService;
