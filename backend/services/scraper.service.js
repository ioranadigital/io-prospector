// backend/services/scraper.service.js
import { chromium } from 'playwright';
import { logger } from '../utils/logger.js';

export const scraperService = {
  async scrape(url) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
      viewport:  { width: 1280, height: 720 },
    });
    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

      const data = await page.evaluate(() => {
        const bodyText  = document.body?.innerText || '';
        const emailRx   = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
        const phoneRx   = /(\+34|0034)?[\s\-.]?(6|7|8|9)\d{8}/g;
        const mailtoLinks = [...document.querySelectorAll('a[href^="mailto:"]')]
          .map(a => a.href.replace('mailto:', '').split('?')[0]);

        const email = mailtoLinks[0] || (bodyText.match(emailRx) || [])[0] || null;
        const phone = ((bodyText.match(phoneRx) || [])[0] || '').trim() || null;

        // TIER 1: Contact & Trust
        const hasEmail = !!email || bodyText.includes('@') && bodyText.includes('.');
        const hasPhone = !!phone || /(\d{3}[\s\-.]?\d{3}[\s\-.]?\d{3,4})/g.test(bodyText);
        const hasContactForm = !!(document.querySelector('form') && (
          document.querySelector('input[type="email"]') ||
          document.querySelector('textarea') ||
          bodyText.toLowerCase().includes('contacto') ||
          bodyText.toLowerCase().includes('contact')
        ));
        const hasGMB = bodyText.includes('Google My Business') ||
                      bodyText.includes('Google Maps') ||
                      !!document.querySelector('a[href*="maps.google"]');
        const hasAddress = !!document.querySelector('[itemprop="address"]') ||
                          /\d{1,5}\s+[a-záéíóú\w\s]+,?\s*\d{5}/i.test(bodyText);
        const hasPrivacyPolicy = bodyText.toLowerCase().includes('privacy') ||
                                bodyText.toLowerCase().includes('política de privacidad') ||
                                !!document.querySelector('a[href*="privacy"]');
        const hasTrustBadges = /SSL|TrustPilot|Secure|Certificado|Badge|Verified/i.test(bodyText);

        return {
          email,
          phone,
          address: document.querySelector('[itemprop="address"]')?.innerText?.trim() || null,
          seo: {
            // TIER 1: Críticos
            hasPhone,
            hasEmail,
            hasContactForm,
            hasGMB,
            hasAddress,
            hasPrivacyPolicy,
            hasTrustBadges,
            isHTTPS:        location.protocol === 'https:',

            // TIER 2: Conversión
            hasH1:          document.querySelectorAll('h1').length > 0,
            h1Count:        document.querySelectorAll('h1').length,
            hasMetaDesc:    !!document.querySelector('meta[name="description"]')?.content,
            metaDescLength: document.querySelector('meta[name="description"]')?.content?.length || 0,
            hasViewport:    !!document.querySelector('meta[name="viewport"]'),
            hasCTAs:        document.querySelectorAll('button, a.btn, a.button, [class*="cta"]').length > 0,
            ctaCount:       document.querySelectorAll('button, a.btn, a.button, [class*="cta"]').length,
            wordCount:      bodyText.split(/\s+/).filter(Boolean).length,
            hasSchema:      !!document.querySelector('script[type="application/ld+json"]'),
            hasAnalytics:   !!(window.gtag || window.ga || window._gaq || window.dataLayer),
            hasFavicon:     !!document.querySelector('link[rel*="icon"]'),
            hasOG:          !!document.querySelector('meta[property^="og:"]'),

            // TIER 3: Credibilidad & Presencia
            hasGallery:     document.querySelectorAll('img').length > 5,
            imageCount:     document.querySelectorAll('img').length,
            hasSocialLinks: !!(document.querySelector('a[href*="facebook.com"]') ||
                              document.querySelector('a[href*="instagram.com"]') ||
                              document.querySelector('a[href*="twitter.com"]') ||
                              document.querySelector('a[href*="linkedin.com"]')),
            hasBlog:        !!document.querySelector('a[href*="/blog"]') || !!document.querySelector('a[href*="/articulos"]'),
            hasCertifications: /Certificado|Acreditado|ISO|Garantía|Award|Premiado/i.test(bodyText),

            // TIER 4: Rendimiento & Técnico
            hasMapIntegrated: !!document.querySelector('iframe[src*="maps"]') || !!document.querySelector('[class*="map"]'),
            hasCompressedImages: document.querySelectorAll('img[loading="lazy"]').length > 0,

            // TIER 5: Engagement & Social
            hasShareButtons: !!document.querySelector('[class*="share"]') || !!document.querySelector('[class*="social"]'),
            hasNewsletter:  /newsletter|suscrib|subscribe|email marketing/i.test(bodyText),
            hasWhatsApp:    !!document.querySelector('a[href*="whatsapp"]') || !!document.querySelector('a[href*="wa.me"]'),
            hasMultipleForms: document.querySelectorAll('form').length > 1,
          }
        };
      });

      logger.debug(`Scraped ${url}: score-ready`);
      return data;
    } catch (err) {
      logger.error(`Scraping error en ${url}: ${err.message}`);
      return { email: null, phone: null, address: null, seo: {} };
    } finally {
      await browser.close();
    }
  }
};
