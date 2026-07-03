// backend/services/gmb-scraper.service.js
// Intenta extraer datos de Google Maps (GMB rating, reviews, claimed status)
// Best-effort: si falla, retorna nulls

import { chromium } from 'playwright';
import { logger } from '../utils/logger.js';

const TIMEOUT = 15000;

export const gmbScraperService = {
  async scrapeGoogleMaps(businessName, city) {
    const result = {
      gmb_rating: null,
      review_count: null,
      gmb_claimed: null,
      gmb_url: null,
      photo_count: 0,
      description: null,
      has_hours: false,
      hours_updated_recently: false,
      error: null,
    };

    if (!businessName || !city) return result;

    let browser;
    try {
      browser = await chromium.launch({ headless: true, timeout: TIMEOUT });
      const page = await browser.newPage();
      page.setDefaultTimeout(TIMEOUT);

      // Buscar en Google Maps
      const query = `${businessName} ${city} google maps`;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

      await page.goto(searchUrl, { waitUntil: 'domcontentloaded' })
        .catch(e => {
          result.error = 'Navigation failed';
          return;
        });

      // Intentar encontrar el panel de Google Maps
      const mapsLinks = await page.locator('a[href*="maps.google.com"]').all();

      if (mapsLinks.length > 0) {
        const mapsUrl = await mapsLinks[0].getAttribute('href');
        result.gmb_url = mapsUrl;

        // Ir al perfil de Google Maps
        await page.goto(mapsUrl, { waitUntil: 'domcontentloaded' })
          .catch(() => null);

        // Esperar a que cargue el contenido
        await page.waitForTimeout(2000);

        // Extraer rating y reviews
        const ratingText = await page.locator('[aria-label*="stars"]').first().textContent()
          .catch(() => null);

        if (ratingText) {
          const match = ratingText.match(/([\d.]+)/);
          if (match) result.gmb_rating = parseFloat(match[1]);
        }

        // Extraer número de reseñas
        const reviewsText = await page.locator('button[aria-label*="review"], span[aria-label*="review"]').first().textContent()
          .catch(() => null);

        if (reviewsText) {
          const match = reviewsText.match(/(\d+)/);
          if (match) result.review_count = parseInt(match[1]);
        }

        // Verificar si está reclamado (presencia de botón "Editar")
        const editButton = await page.locator('button:has-text("Editar")').count();
        if (editButton > 0) {
          result.gmb_claimed = true;
        }

        // Contar fotos
        const photos = await page.locator('button[aria-label*="foto"], button[aria-label*="image"]').all();
        result.photo_count = photos.length;

        // Extraer descripción
        const descriptionElement = await page.locator('[data-attrid*="description"], div[class*="description"]').first()
          .textContent()
          .catch(() => null);
        if (descriptionElement) {
          result.description = descriptionElement.trim().substring(0, 500);
        }

        // Verificar horarios
        const hoursElement = await page.locator('[aria-label*="Horario"], [aria-label*="hours"], div:has-text("Abre")').first()
          .textContent()
          .catch(() => null);
        result.has_hours = !!hoursElement;

        // Verificar si horarios fueron actualizados recientemente (aproximado)
        // En GMB, si están completos y visibles probablemente estén actualizados
        if (result.has_hours && hoursElement) {
          result.hours_updated_recently = hoursElement.length > 20;
        }
      }

      await page.close();
    } catch (error) {
      logger.warn(`GMB scrape failed for ${businessName}: ${error.message}`);
      result.error = error.message;
    } finally {
      if (browser) await browser.close().catch(() => null);
    }

    return result;
  },
};

export default gmbScraperService;
