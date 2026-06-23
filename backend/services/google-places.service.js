// backend/services/google-places.service.js
// Reemplaza el GMB scraper con Google Places API oficial
// Coste: ~$0.034 por negocio (Find + Details) — $200 crédito = ~5.800 búsquedas/mes gratis

import { logger } from '../utils/logger.js';

const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

export const googlePlacesService = {
  /**
   * Busca un negocio por nombre + ciudad y devuelve sus datos GMB
   */
  async getBusinessData(businessName, city) {
    const result = {
      gmb_rating: null,
      review_count: null,
      gmb_claimed: null,
      gmb_url: null,
      photo_count: 0,
      description: null,
      has_hours: false,
      hours_updated_recently: false,
      phone_gmb: null,
      website_gmb: null,
      business_status: null,
      error: null,
    };

    // Acepta GOOGLE_PLACES_API_KEY o GOOGLE_MAPS_API_KEY (misma clave, distintos nombres según proyecto)
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      result.error = 'GOOGLE_PLACES_API_KEY no configurada';
      logger.warn('⚠️  Google Places API: falta GOOGLE_PLACES_API_KEY o GOOGLE_MAPS_API_KEY en .env');
      return result;
    }

    if (!businessName || !city) return result;

    try {
      // PASO 1: Find Place — obtener place_id
      const placeId = await this._findPlaceId(businessName, city, apiKey);
      if (!placeId) {
        result.error = 'Negocio no encontrado en Google Places';
        return result;
      }

      // PASO 2: Place Details — obtener datos completos
      const details = await this._getPlaceDetails(placeId, apiKey);
      if (!details) {
        result.error = 'No se pudieron obtener detalles del negocio';
        return result;
      }

      // Mapear respuesta
      result.gmb_rating = details.rating || null;
      result.review_count = details.user_ratings_total || null;
      result.phone_gmb = details.formatted_phone_number || null;
      result.website_gmb = details.website || null;
      result.business_status = details.business_status || null;
      result.gmb_url = `https://www.google.com/maps/place/?q=place_id:${placeId}`;

      // Horarios
      if (details.opening_hours) {
        result.has_hours = true;
        const periods = details.opening_hours.periods || [];
        result.hours_updated_recently = periods.length > 0;
      }

      // Fotos
      result.photo_count = details.photos ? details.photos.length : 0;

      // Un negocio reclamado tiene website/teléfono/horarios
      result.gmb_claimed = !!(details.website || details.formatted_phone_number || details.opening_hours);

      // Descripción editorial (editorial_summary si disponible)
      result.description = details.editorial_summary?.overview || null;

    } catch (error) {
      logger.warn(`Google Places error for "${businessName}": ${error.message}`);
      result.error = error.message;
    }

    return result;
  },

  async _findPlaceId(businessName, city, apiKey) {
    const input = `${businessName} ${city}`;
    const url = new URL(`${BASE_URL}/findplacefromtext/json`);
    url.searchParams.set('input', input);
    url.searchParams.set('inputtype', 'textquery');
    url.searchParams.set('fields', 'place_id,name,formatted_address');
    url.searchParams.set('locationbias', `circle:50000@${await this._getCityCoords(city)}`);
    url.searchParams.set('language', 'es');
    url.searchParams.set('key', apiKey);

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Find Place HTTP ${res.status}`);

    const data = await res.json();

    if (data.status === 'REQUEST_DENIED') {
      throw new Error(`API denegada: ${data.error_message}`);
    }

    if (data.status === 'OK' && data.candidates?.length > 0) {
      return data.candidates[0].place_id;
    }

    logger.debug(`Places: no candidato para "${input}" (status: ${data.status})`);
    return null;
  },

  async _getPlaceDetails(placeId, apiKey) {
    const url = new URL(`${BASE_URL}/details/json`);
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('fields', [
      'name',
      'rating',
      'user_ratings_total',
      'formatted_phone_number',
      'website',
      'opening_hours',
      'photos',
      'business_status',
      'editorial_summary',
    ].join(','));
    url.searchParams.set('language', 'es');
    url.searchParams.set('key', apiKey);

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Place Details HTTP ${res.status}`);

    const data = await res.json();

    if (data.status === 'REQUEST_DENIED') {
      throw new Error(`API denegada: ${data.error_message}`);
    }

    return data.status === 'OK' ? data.result : null;
  },

  // Coordenadas aproximadas de ciudades españolas para mejorar precisión
  async _getCityCoords(city) {
    const coords = {
      'madrid': '40.4168,-3.7038',
      'barcelona': '41.3851,2.1734',
      'valencia': '39.4699,-0.3763',
      'sevilla': '37.3891,-5.9845',
      'zaragoza': '41.6488,-0.8891',
      'málaga': '36.7213,-4.4214',
      'bilbao': '43.2630,-2.9350',
      'alicante': '38.3452,-0.4810',
      'córdoba': '37.8882,-4.7794',
      'valladolid': '41.6523,-4.7245',
      'murcia': '37.9922,-1.1307',
      'palma': '39.5696,2.6502',
      'las palmas': '28.1248,-15.4300',
      'granada': '37.1773,-3.5986',
      'santander': '43.4623,-3.8099',
      'burgos': '42.3440,-3.6969',
      'san sebastián': '43.3183,-1.9812',
      'albacete': '38.9942,-1.8585',
      'almería': '36.8340,-2.4637',
      'gijón': '43.5322,-5.6611',
      'a coruña': '43.3623,-8.4115',
      'salamanca': '40.9701,-5.6635',
      'huelva': '37.2614,-6.9447',
      'badajoz': '38.8794,-6.9706',
      'cádiz': '36.5271,-6.2886',
      'toledo': '39.8628,-4.0273',
      'logroño': '42.4650,-2.4456',
      'pamplona': '42.8125,-1.6458',
      'vitoria': '42.8467,-2.6726',
      'castellón': '39.9864,-0.0513',
    };

    const key = city.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    for (const [name, coord] of Object.entries(coords)) {
      const normName = name.normalize('NFD').replace(/[̀-ͯ]/g, '');
      if (key.includes(normName) || normName.includes(key)) return coord;
    }
    // Fallback: centro de España
    return '40.4168,-3.7038';
  },
};

export default googlePlacesService;
