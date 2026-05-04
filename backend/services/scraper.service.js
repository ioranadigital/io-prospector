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

        return {
          email:   mailtoLinks[0] || (bodyText.match(emailRx) || [])[0] || null,
          phone:   ((bodyText.match(phoneRx) || [])[0] || '').trim() || null,
          address: document.querySelector('[itemprop="address"]')?.innerText?.trim() || null,
          seo: {
            hasH1:          document.querySelectorAll('h1').length > 0,
            h1Count:        document.querySelectorAll('h1').length,
            hasMetaDesc:    !!document.querySelector('meta[name="description"]')?.content,
            metaDescLength: document.querySelector('meta[name="description"]')?.content?.length || 0,
            hasViewport:    !!document.querySelector('meta[name="viewport"]'),
            hasCTAs:        document.querySelectorAll('button, a.btn, a.button, [class*="cta"]').length > 0,
            ctaCount:       document.querySelectorAll('button, a.btn, a.button, [class*="cta"]').length,
            wordCount:      bodyText.split(/\s+/).filter(Boolean).length,
            isHTTPS:        location.protocol === 'https:',
            hasSchema:      !!document.querySelector('script[type="application/ld+json"]'),
            hasAnalytics:   !!(window.gtag || window.ga || window._gaq || window.dataLayer),
            hasFavicon:     !!document.querySelector('link[rel*="icon"]'),
            hasOG:          !!document.querySelector('meta[property^="og:"]'),
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
