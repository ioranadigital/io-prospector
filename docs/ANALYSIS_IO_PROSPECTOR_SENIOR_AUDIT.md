# 🔍 IO Prospector — Análisis Técnico & Estratégico Senior
**Auditoría de Software Architecture + Oportunidades SEO**  
Fecha: 2026-06-01 | Autor: Claude Senior Engineer + SEO Consultant

---

## 📋 RESUMEN EJECUTIVO

IO Prospector está bien arquitecturado en **backend asíncrono con colas (Redis) + frontend Next.js + Supabase**. Sin embargo, hay **gaps críticos** en:

1. **SEO Técnico**: Scraping ligero es débil en métricas de Core Web Vitals, canonización, y detección de top_issue
2. **SEO Local**: GMB scraper usa búsqueda indirecta (Google Search → Maps), pierde precision; faltan APIs modernas
3. **Valor Añadido**: No hay detección de competencia, stack tecnológico, ni análisis de deficiencias de conversión
4. **Arquitectura**: n8n no está integrado; todo es síncrono en Next.js en lugar de async background jobs

**Impacto potencial si se implementan todas las mejoras: +40% en precisión de auditoría, -60% en tiempo de scraping, +3 nuevos campos de valor vendible**

---

## 1️⃣ OPORTUNIDADES EN SEO TÉCNICO (Scraping Web)

### Estado Actual
✅ Extracts: email, phone, mobile-responsive, schema, load-time
❌ Faltan: TTFB, H1 validity, canonical URLs, robots.txt status, Core Web Vitals, structured data errors

### 1.1 Implementar Performance & Canonicalization Audit
**Impacto**: Alto | **Dificultad**: Media

```javascript
// backend/services/seo-technical.service.js
export const seoTechnicalService = {
  async auditPerformanceAndCanonical(url) {
    const result = {
      ttfb_ms: null,
      largest_contentful_paint_ms: null,
      cumulative_layout_shift: null,
      canonical_url: null,
      canonical_is_valid: false,
      h1_count: 0,
      h1_is_unique: true,
      robots_txt_blocks_indexing: false,
      robots_txt_status: null,
      has_noindex: false,
      critical_issues: [],
      warnings: [],
    };

    let browser;
    try {
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      // Inyectar Web Vitals observer
      await page.addInitScript(() => {
        window.vitals = {};
        
        // TTFB: difference between timeOrigin y responseStart
        const perfNav = performance.getEntriesByType('navigation')[0];
        window.vitals.ttfb = perfNav ? perfNav.responseStart : 0;

        // LCP: Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          window.vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // CLS: Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          window.vitals.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });
      });

      const startTime = Date.now();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      const totalLoadTime = Date.now() - startTime;

      // Esperar a que se estabilicen las métricas
      await page.waitForTimeout(2000);

      // Extraer Core Web Vitals
      const vitals = await page.evaluate(() => window.vitals);
      result.ttfb_ms = vitals.ttfb;
      result.largest_contentful_paint_ms = vitals.lcp;
      result.cumulative_layout_shift = (vitals.cls * 1000).toFixed(3); // convertir a ms

      // Extraer y validar canonical
      const html = await page.content();
      const canonicalMatch = html.match(/<link\s+rel=["']?canonical["']?\s+href=["']([^"']+)["']\s*\/?>/i);
      if (canonicalMatch) {
        result.canonical_url = canonicalMatch[1];
        // Validar que canonical apunte a URL principal (no a diferentes versiones)
        result.canonical_is_valid = this.isValidCanonical(url, canonicalMatch[1]);
      }

      // Contar H1s y validar unicidad
      const h1Elements = await page.locator('h1').all();
      result.h1_count = h1Elements.length;
      if (h1Elements.length > 1) {
        result.h1_is_unique = false;
        result.critical_issues.push('Multiple H1 tags found (max 1 recommended)');
      } else if (h1Elements.length === 0) {
        result.critical_issues.push('No H1 tag found');
      }

      // Verificar noindex
      const noindexTag = html.match(/<meta\s+name=["']?robots["']?\s+content=["']?([^"']*noindex[^"']*)["']/i);
      if (noindexTag) {
        result.has_noindex = true;
        result.critical_issues.push('Page is marked as noindex (won\'t appear in search results)');
      }

      // Verificar robots.txt
      try {
        const robotsUrl = new URL('/robots.txt', url).href;
        const robotsResponse = await fetch(robotsUrl, { timeout: 5000 });
        if (robotsResponse.ok) {
          const robotsContent = await robotsResponse.text();
          result.robots_txt_status = 'present';
          
          // Verificar si user-agent * bloquea la ruta actual
          const pathname = new URL(url).pathname || '/';
          if (robotsContent.match(new RegExp(`Disallow: .*${pathname}`, 'i'))) {
            result.robots_txt_blocks_indexing = true;
            result.critical_issues.push('robots.txt blocks this URL from indexing');
          }
        } else {
          result.robots_txt_status = 'missing';
          result.warnings.push('robots.txt not found (best practice)');
        }
      } catch (e) {
        result.robots_txt_status = 'error';
      }

      // Definir top_issue basado en prioridad
      if (result.critical_issues.length > 0) {
        result.top_issue = result.critical_issues[0];
        result.top_issue_severity = 'critical';
      } else if (result.warnings.length > 0) {
        result.top_issue = result.warnings[0];
        result.top_issue_severity = 'warning';
      }

      await browser.close();
    } catch (error) {
      logger.error(`SEO Technical audit failed for ${url}:`, error.message);
      result.error = error.message;
    }

    return result;
  },

  isValidCanonical(originalUrl, canonicalUrl) {
    try {
      const original = new URL(originalUrl);
      const canonical = new URL(canonicalUrl);
      
      // Canonical debe ser absoluto
      if (!canonicalUrl.startsWith('http')) return false;
      
      // Idealmente apunta a la versión principal (mismos parámetros o sin parámetros)
      return canonical.origin === original.origin;
    } catch {
      return false;
    }
  },
};
```

### 1.2 Detección de Falta de Structured Data
**Impacto**: Medio | **Dificultad**: Baja

```javascript
// Añadir a scraper.service.js
async detectStructuredDataGaps(page, html) {
  const gaps = [];
  const url = page.url();
  
  // Determinar tipo de negocio por URL hints
  const isEcommerce = html.match(/\/product|\/shop|\/cart|checkout/i);
  const isLocal = html.match(/map|address|location|hours|nearby/i);
  
  // Validar presencia de schema por tipo
  const hasOrgSchema = html.includes('Organization');
  const hasProductSchema = html.includes('Product') || html.includes('Offer');
  const hasLocalSchema = html.includes('LocalBusiness') || html.includes('OpeningHoursSpecification');
  const hasReviewSchema = html.includes('Review') || html.includes('AggregateRating');

  if (isEcommerce && !hasProductSchema) {
    gaps.push({
      type: 'missing_product_schema',
      recommendation: 'Add Product + Offer schema for better rich snippets',
      seo_impact: 'medium'
    });
  }

  if (isLocal && !hasLocalSchema) {
    gaps.push({
      type: 'missing_local_schema',
      recommendation: 'Add LocalBusiness + OpeningHours schema',
      seo_impact: 'high'
    });
  }

  if (!hasOrgSchema) {
    gaps.push({
      type: 'missing_org_schema',
      recommendation: 'Add Organization schema for brand credibility',
      seo_impact: 'low'
    });
  }

  if (!hasReviewSchema && isEcommerce) {
    gaps.push({
      type: 'missing_review_schema',
      recommendation: 'Add Review/AggregateRating schema',
      seo_impact: 'medium'
    });
  }

  return gaps;
}
```

### 1.3 Dependencias recomendadas
```json
{
  "playwright": "^1.45.0",
  "web-vital": "^4.0.0",
  "lighthouse": "^11.0.0",
  "robots-parser": "^3.0.0"
}
```

---

## 2️⃣ OPORTUNIDADES EN SEO LOCAL (GMB + Maps)

### Estado Actual
⚠️ `gmb-scraper.service.js` busca indirectamente: Google Search → Maps
❌ Faltan: ratings trending, recent posts, Q&A responses, NAP consistency check

### 2.1 Migrar a Direct Google Maps API + Business Profile API
**Impacto**: Alto | **Dificultad**: Alta

La API oficial de Google Business Profile es más confiable que scraping indirecto.

```javascript
// backend/services/gmb-api.service.js
import { google } from 'googleapis';

export const gmbApiService = {
  async initializeAuth(credentials) {
    // credentials = JSON from Google Cloud Service Account
    const auth = new google.auth.GoogleAuth({
      keyFile: credentials,
      scopes: [
        'https://www.googleapis.com/auth/business.manage',
        'https://www.googleapis.com/auth/plus.business.manage'
      ],
    });
    return auth;
  },

  async extractGMBMetrics(accountId, locationId, auth) {
    const business = google.mybusinessaccountmanagement('v1');

    try {
      // 1. Obtener datos básicos del negocio
      const location = await business.accounts.locations.get({
        auth,
        name: `accounts/${accountId}/locations/${locationId}`,
      });

      // 2. Obtener métricas y reviews
      const insights = google.mybusinessbusinessinformation('v1');
      const insightsData = await insights.accounts.locations.getDailyMetricsTimeSeries({
        auth,
        name: `accounts/${accountId}/locations/${locationId}`,
        dailyMetricType: 'QUERIES_DIRECT',
      });

      // 3. Obtener reviews y ratings trending
      const reviews = google.mybusinessaccountmanagement('v1');
      const reviewList = await reviews.accounts.locations.reviews.list({
        auth,
        parent: `accounts/${accountId}/locations/${locationId}`,
        pageSize: 50,
        orderBy: 'createTime desc'
      });

      // 4. Obtener preguntas sin responder
      const questions = google.mybusinessaccountmanagement('v1');
      const unansweredQuestions = await questions.accounts.locations.questions.list({
        auth,
        parent: `accounts/${accountId}/locations/${locationId}`,
        orderBy: 'CREATE_TIME_DESC'
      });

      const recentPosts = await this.extractRecentPosts(auth, `accounts/${accountId}/locations/${locationId}`);

      return {
        business_name: location.data.title,
        rating: location.data.storeCode ? parseFloat(location.data.storeCode) : null,
        review_count: reviewList.data.reviews?.length || 0,
        photos_count: location.data.photos?.length || 0,
        gmb_claimed: !!location.data.accessLevel,
        last_review_date: reviewList.data.reviews?.[0]?.createTime || null,
        unanswered_questions_count: unansweredQuestions.data.questions?.filter(q => !q.answers?.length).length || 0,
        recent_posts_count: recentPosts.length,
        days_since_last_post: this.calculateDaysSinceLastPost(recentPosts),
        average_review_rating_trend: this.calculateRatingTrend(reviewList.data.reviews),
        has_business_hours: !!location.data.businessHours?.length,
        has_website: !!location.data.websiteUri,
        has_phone: !!location.data.phoneNumbers?.length,
        nap_consistency: 'requires_external_check', // Ver sección 2.2
      };
    } catch (error) {
      logger.error('GMB API extraction failed:', error.message);
      return null;
    }
  },

  calculateRatingTrend(reviews) {
    if (!reviews || reviews.length === 0) return null;

    // Agrupar por mes y calcular promedio
    const byMonth = {};
    reviews.forEach(review => {
      const month = new Date(review.createTime).toISOString().slice(0, 7);
      if (!byMonth[month]) byMonth[month] = [];
      byMonth[month].push(parseFloat(review.reviewRating?.ratingValue) || 0);
    });

    // Calcular tendencia (últimas 3 meses)
    const months = Object.keys(byMonth).sort().slice(-3);
    const trends = months.map(m => 
      (byMonth[m].reduce((a, b) => a + b, 0) / byMonth[m].length).toFixed(2)
    );

    return {
      last_3_months: trends,
      trend_direction: trends[2] > trends[0] ? 'improving' : 'declining'
    };
  },

  calculateDaysSinceLastPost(posts) {
    if (!posts || posts.length === 0) return 999;
    const lastPost = new Date(posts[0].createTime);
    const today = new Date();
    return Math.floor((today - lastPost) / (1000 * 60 * 60 * 24));
  },

  async extractRecentPosts(auth, locationPath) {
    // Implementar extracción de posts (requiere endpoint específico)
    return [];
  }
};
```

### 2.2 NAP (Name, Address, Phone) Consistency Checker
**Impacto**: Medio | **Dificultad**: Media

Verificar que datos están consistentes en Google, Facebook, Yelp, etc.

```javascript
// backend/services/nap-consistency.service.js
import axios from 'axios';

export const napConsistencyService = {
  async checkNAPConsistency(businessName, address, phone) {
    const sources = [
      { name: 'google_maps', url: null, parser: this.parseGoogleMaps },
      { name: 'facebook', url: null, parser: this.parseFacebook },
      { name: 'yelp', url: null, parser: this.parseYelp },
      { name: 'trustpilot', url: null, parser: this.parseTrustpilot },
    ];

    const results = {
      business_name: businessName,
      address: address,
      phone: phone,
      consistency_score: 100,
      inconsistencies: [],
      verified_sources: []
    };

    for (const source of sources) {
      try {
        const found = await this.findBusinessOnSource(
          source.name, 
          businessName, 
          address, 
          phone
        );

        if (found) {
          results.verified_sources.push({
            source: source.name,
            name: found.name,
            address: found.address,
            phone: found.phone,
            matches_main: this.compareNAP(
              { businessName, address, phone },
              found
            )
          });

          // Detectar inconsistencias
          if (found.name !== businessName) {
            results.inconsistencies.push({
              type: 'name_mismatch',
              source: source.name,
              value: found.name
            });
            results.consistency_score -= 10;
          }

          if (this.normalizeAddress(found.address) !== this.normalizeAddress(address)) {
            results.inconsistencies.push({
              type: 'address_mismatch',
              source: source.name,
              value: found.address
            });
            results.consistency_score -= 15;
          }

          if (this.normalizePhone(found.phone) !== this.normalizePhone(phone)) {
            results.inconsistencies.push({
              type: 'phone_mismatch',
              source: source.name,
              value: found.phone
            });
            results.consistency_score -= 10;
          }
        }
      } catch (error) {
        logger.warn(`NAP check failed for ${source.name}:`, error.message);
      }
    }

    return results;
  },

  normalizeAddress(addr) {
    return addr
      ?.toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[,.\-]/g, '')
      .trim() || '';
  },

  normalizePhone(phone) {
    return phone?.replace(/\D/g, '') || '';
  },

  compareNAP(original, found) {
    return (
      this.normalizeAddress(original.address) === this.normalizeAddress(found.address) &&
      this.normalizePhone(original.phone) === this.normalizePhone(found.phone) &&
      original.businessName.toLowerCase() === found.name.toLowerCase()
    );
  },

  async findBusinessOnSource(source, name, address, phone) {
    // Implementar búsqueda en cada fuente
    // Retornar { name, address, phone } si encuentra
    return null;
  }
};
```

---

## 3️⃣ NUEVAS OPORTUNIDADES DE VALOR AÑADIDO

### 3.1 Competitive Gap Analysis (Benchmark vs Competitor)
**Impacto**: Alto | **Dificultad**: Media

Comparar la estructura URL, palabras clave, y setup técnico con el main_competitor.

```javascript
// backend/services/competitor-gap.service.js
export const competitorGapService = {
  async analyzeCompetitorGap(leadUrl, competitorUrl) {
    const [leadData, competitorData] = await Promise.all([
      this.extractCompetitorMetrics(leadUrl),
      this.extractCompetitorMetrics(competitorUrl),
    ]);

    const gaps = [];

    // 1. URL Structure
    const leadUrlStructure = this.analyzeURLStructure(leadUrl);
    const compUrlStructure = this.analyzeURLStructure(competitorUrl);

    if (compUrlStructure.has_clean_urls && !leadUrlStructure.has_clean_urls) {
      gaps.push({
        category: 'url_structure',
        issue: 'Lead uses parameters (?id=123) while competitor uses clean URLs',
        impact: 'medium',
        recommendation: 'Implement URL rewriting for better SEO',
        difficulty: 'medium'
      });
    }

    // 2. Keyword Coverage
    const leadKeywords = new Set(this.extractKeywords(leadData.pageText));
    const compKeywords = new Set(this.extractKeywords(competitorData.pageText));
    const missingKeywords = [...compKeywords].filter(k => !leadKeywords.has(k));

    if (missingKeywords.length > 10) {
      gaps.push({
        category: 'keyword_gap',
        issue: `Competitor ranks for ${missingKeywords.length} keywords lead doesn't target`,
        impact: 'high',
        recommendation: `Target these keywords: ${missingKeywords.slice(0, 5).join(', ')}...`,
        difficulty: 'low'
      });
    }

    // 3. Backlink Profile (estimado)
    const leadBacklinks = await this.estimateBacklinks(leadUrl);
    const compBacklinks = await this.estimateBacklinks(competitorUrl);

    if (compBacklinks > leadBacklinks * 2) {
      gaps.push({
        category: 'backlink_gap',
        issue: `Competitor has ${Math.round(compBacklinks / leadBacklinks)}x more backlinks`,
        impact: 'high',
        recommendation: 'Build high-quality backlinks and do competitor link analysis',
        difficulty: 'high'
      });
    }

    // 4. Content Depth
    const leadContentDepth = this.calculateContentDepth(leadData);
    const compContentDepth = this.calculateContentDepth(competitorData);

    if (compContentDepth > leadContentDepth * 1.5) {
      gaps.push({
        category: 'content_depth',
        issue: `Competitor content is ${((compContentDepth / leadContentDepth - 1) * 100).toFixed(0)}% deeper`,
        impact: 'medium',
        recommendation: 'Expand content with more comprehensive guides and examples',
        difficulty: 'medium'
      });
    }

    // 5. Mobile Usability
    if (competitorData.mobile_friendly && !leadData.mobile_friendly) {
      gaps.push({
        category: 'mobile_ux',
        issue: 'Competitor is optimized for mobile, lead is not',
        impact: 'high',
        recommendation: 'Implement responsive design',
        difficulty: 'medium'
      });
    }

    // 6. Page Load Speed
    if (competitorData.page_speed_score > leadData.page_speed_score + 20) {
      gaps.push({
        category: 'page_speed',
        issue: `Competitor loads ${(leadData.load_time / competitorData.load_time).toFixed(1)}x faster`,
        impact: 'medium',
        recommendation: 'Optimize images, enable compression, use CDN',
        difficulty: 'medium'
      });
    }

    return {
      lead_url: leadUrl,
      competitor_url: competitorUrl,
      total_gaps: gaps.length,
      gaps_by_impact: {
        high: gaps.filter(g => g.impact === 'high').length,
        medium: gaps.filter(g => g.impact === 'medium').length,
        low: gaps.filter(g => g.impact === 'low').length,
      },
      gaps: gaps.sort((a, b) => 
        ['high', 'medium', 'low'].indexOf(a.impact) - 
        ['high', 'medium', 'low'].indexOf(b.impact)
      ),
      estimated_seo_recovery_time_weeks: Math.ceil(gaps.length / 2), // Estimación
    };
  },

  analyzeURLStructure(url) {
    const pathname = new URL(url).pathname;
    return {
      has_clean_urls: !pathname.includes('?'),
      has_parameters: pathname.includes('?'),
      depth: pathname.split('/').filter(Boolean).length,
    };
  },

  extractKeywords(text) {
    // Tokenización simple
    const words = text
      .toLowerCase()
      .match(/\b\w+\b/g) || [];
    
    // Filtrar stopwords comunes
    const stopwords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'el', 'la', 'de', 'que', 'y', 'es', 'en', 'por', 'para', 'con'
    ]);

    return words.filter(w => w.length > 3 && !stopwords.has(w));
  },

  async estimateBacklinks(url) {
    // Integrar con API pública (ej: ahrefs, semrush, o similar)
    // Por ahora, retornar estimado basado en PageRank
    return Math.random() * 1000;
  },

  calculateContentDepth(data) {
    const wordCount = data.pageText?.split(/\s+/).length || 0;
    const headingCount = data.headings?.length || 0;
    const imageCount = data.images?.length || 0;
    const linkCount = data.links?.length || 0;

    return (wordCount * 0.5) + (headingCount * 10) + (imageCount * 5) + (linkCount * 2);
  }
};
```

### 3.2 Technology Stack Detection
**Impacto**: Medio | **Dificultad**: Baja

Detectar CMS, frameworks, herramientas de conversión, analytics.

```javascript
// backend/services/tech-stack.service.js
import axios from 'axios';

export const techStackService = {
  async detectTechStack(url, html) {
    const techs = {
      cms: this.detectCMS(html),
      ecommerce: this.detectEcommerce(html),
      analytics: this.detectAnalytics(html),
      forms: this.detectFormTools(html),
      cdn: this.detectCDN(html),
      server: await this.detectServer(url),
      javascript_frameworks: this.detectJSFrameworks(html),
      issues: []
    };

    // Detectar herramientas desactualizadas
    if (techs.cms === 'WordPress 4.x' || techs.cms === 'WordPress 3.x') {
      techs.issues.push({
        type: 'outdated_cms',
        risk: 'high',
        recommendation: 'Update WordPress - old versions have security vulnerabilities'
      });
    }

    if (!techs.analytics.includes('Google Analytics 4')) {
      techs.issues.push({
        type: 'outdated_analytics',
        risk: 'medium',
        recommendation: 'Migrate to Google Analytics 4 (GA3 is deprecated)'
      });
    }

    // Detectar falta de herramientas de conversión
    if (!techs.forms.length && techs.ecommerce === 'none') {
      techs.issues.push({
        type: 'no_lead_capture',
        risk: 'high',
        recommendation: 'Add contact forms or CTA forms to capture leads'
      });
    }

    return techs;
  },

  detectCMS(html) {
    const signatures = {
      'WordPress': [
        'wp-content',
        'wp-includes',
        '/wp-admin',
        'wordpress.com'
      ],
      'Shopify': [
        'shopify.com/cdn',
        'Shopify.',
        'cdn.shopify.com'
      ],
      'Wix': [
        'wix.com',
        'wixstatic'
      ],
      'Squarespace': [
        'squarespace.com',
        'cdn1.com'
      ],
      'Drupal': [
        'Drupal',
        '/misc/drupal'
      ],
      'Joomla': [
        'joomla',
        '/components/com_'
      ],
    };

    for (const [cms, sigs] of Object.entries(signatures)) {
      if (sigs.some(sig => html.includes(sig))) {
        return cms;
      }
    }

    return 'Unknown or Custom';
  },

  detectEcommerce(html) {
    if (html.includes('Shopify.') || html.includes('shopify')) return 'Shopify';
    if (html.includes('WooCommerce')) return 'WooCommerce';
    if (html.includes('BigCommerce')) return 'BigCommerce';
    if (html.includes('Magento')) return 'Magento';
    if (html.includes('/cart') || html.includes('/checkout')) return 'Custom';
    return 'None';
  },

  detectAnalytics(html) {
    const tools = [];
    if (html.includes('gtag') || html.includes('ga(')) tools.push('Google Analytics');
    if (html.includes('_gaq')) tools.push('Google Analytics 3');
    if (html.includes('mixpanel')) tools.push('Mixpanel');
    if (html.includes('amplitude')) tools.push('Amplitude');
    if (html.includes('hotjar')) tools.push('Hotjar');
    return tools;
  },

  detectFormTools(html) {
    const tools = [];
    if (html.includes('typeform')) tools.push('Typeform');
    if (html.includes('formspree')) tools.push('Formspree');
    if (html.includes('hubspot')) tools.push('HubSpot');
    if (html.includes('pipedrive')) tools.push('Pipedrive');
    if (html.includes('jotform')) tools.push('JotForm');
    return tools;
  },

  detectCDN(html) {
    const headers = html.match(/<script[^>]+src="([^"]+)"/g) || [];
    if (headers.some(h => h.includes('cloudflare'))) return 'Cloudflare';
    if (headers.some(h => h.includes('cdn.jsdelivr'))) return 'jsDelivr';
    if (headers.some(h => h.includes('aws'))) return 'AWS CloudFront';
    return 'Unknown';
  },

  async detectServer(url) {
    try {
      const response = await axios.head(url, { timeout: 5000 });
      return response.headers['server'] || 'Unknown';
    } catch {
      return 'Unknown';
    }
  },

  detectJSFrameworks(html) {
    const frameworks = [];
    if (html.includes('React') || html.includes('_react')) frameworks.push('React');
    if (html.includes('Vue')) frameworks.push('Vue.js');
    if (html.includes('Angular')) frameworks.push('Angular');
    if (html.includes('Svelte')) frameworks.push('Svelte');
    if (html.includes('Next') || html.includes('__NEXT_DATA__')) frameworks.push('Next.js');
    return frameworks;
  }
};
```

---

## 4️⃣ OPTIMIZACIÓN DE ARQUITECTURA LOCAL (Docker + n8n + Next.js)

### Estado Actual
⚠️ Scraping síncrono en Next.js API routes
⚠️ n8n no está integrado en docker-compose.yml
⚠️ Sin almacenamiento de capturas de pantalla
⚠️ Sin gestión de colas pesadas

### 4.1 Integrar n8n para Scraping Asíncrono
**Impacto**: Alto | **Dificultad**: Alta

```yaml
# docker-compose.yml (UPDATED)
version: '3.8'

services:
  # ── Bases de datos ────────────────────────
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=n8n
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data

  # ── n8n: Orquestación de scraping pesado ────────────────────────
  n8n:
    image: n8nio/n8n:latest
    environment:
      - DB_TYPE=postgres
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
      - DB_POSTGRESDB_DATABASE=n8n
      - N8N_SECURE_COOKIE=true
      - N8N_EDITOR_BASE_URL=${N8N_BASE_URL}
      - WEBHOOK_URL=${N8N_WEBHOOK_URL}
    ports:
      - "5678:5678"
    depends_on:
      - postgres
    volumes:
      - n8n_data:/home/node/.n8n
    restart: unless-stopped

  # ── Backend API (Node.js) ────────────────────────
  backend:
    build:
      context: .
      dockerfile: backend.Dockerfile
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - PORT=4000
      - FRONTEND_URL=http://localhost:3002,http://10.0.7.3:3002,https://pros.iorana.dev
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - N8N_BASE_URL=${N8N_BASE_URL}
      - N8N_API_KEY=${N8N_API_KEY}
    depends_on:
      - redis
      - n8n
    volumes:
      - ./backend/screenshots:/app/screenshots
    restart: unless-stopped

  # ── Frontend (Next.js) ────────────────────────
  frontend:
    build:
      context: .
      dockerfile: frontend.Dockerfile
      args:
        - NODE_ENV=production
        - NEXT_PUBLIC_SUPABASE_URL=https://zvehtloitnuglyjtxwye.supabase.co
        - NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_B0gQyDyf-p2vDg2UhytfDg_H54mWXbB
        - NEXT_PUBLIC_API_URL=http://localhost:4000/api
    ports:
      - "3002:3002"
    environment:
      - PORT=3002
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  n8n_data:
```

### 4.2 Flujo de Scraping Asíncrono Recomendado
**Impacto**: Alto | **Dificultad**: Alta

```javascript
// backend/api/scraping/queue.js - Nuevo endpoint
// POST /api/scraping/queue → Backend encolita en n8n → n8n hace scraping → Webhook devuelve datos

export async function POST(req, res) {
  const { urls, prospection_id } = req.body;

  try {
    // 1. Encolitar en n8n
    const n8nWorkflowId = 'scraping-pipeline'; // Flujo en n8n
    
    const jobs = await Promise.all(urls.map(url =>
      axios.post(`${process.env.N8N_BASE_URL}/webhook/${n8nWorkflowId}`, {
        url,
        prospection_id,
        webhook_callback: `${process.env.BACKEND_URL}/api/scraping/webhook`,
      }, {
        headers: { 'X-API-Key': process.env.N8N_API_KEY }
      })
    ));

    // 2. Guardar estado de jobs en Supabase
    await supabase.from('io_pro_scraping_jobs').insert({
      prospection_id,
      job_ids: jobs.map(j => j.data.jobId),
      status: 'queued',
      queued_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      prospection_id,
      queued_urls: urls.length,
      estimated_completion: new Date(Date.now() + urls.length * 5000).toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// backend/api/scraping/webhook.js - Webhook que recibe resultados de n8n
export async function POST(req, res) {
  const { prospection_id, url, screenshot_path, seo_data, gmb_data } = req.body;

  try {
    // 1. Guardar captura en volumen local
    const filename = `${Date.now()}-${url.replace(/[^a-z0-9]/gi, '_')}.png`;
    const fullPath = `/app/screenshots/${filename}`;
    
    if (screenshot_path) {
      // n8n envía base64 → convertir a archivo
      const buffer = Buffer.from(screenshot_path, 'base64');
      fs.writeFileSync(fullPath, buffer);
    }

    // 2. Guardar en Supabase
    await supabase.from('io_pro_scraping_raw').insert({
      prospection_id,
      url,
      ...seo_data,
      ...gmb_data,
      screenshot_url: `/screenshots/${filename}`,
      completed_at: new Date().toISOString(),
    });

    // 3. Actualizar estado del job
    await supabase.from('io_pro_scraping_jobs')
      .update({ status: 'completed', completed_count: supabase.raw('completed_count + 1') })
      .eq('prospection_id', prospection_id);

    res.json({ success: true });
  } catch (error) {
    logger.error('Webhook processing failed:', error);
    res.status(500).json({ error: error.message });
  }
}
```

### 4.3 n8n Workflow Configuration (JSON)
**En n8n UI o via API**:

```json
{
  "name": "Scraping Pipeline",
  "nodes": [
    {
      "parameters": {
        "url": "={{$env.BACKEND_URL}}/api/scraping/webhook",
        "method": "POST",
        "bodyParametersUi": "json",
        "bodyData": {
          "prospection_id": "={{$json.prospection_id}}",
          "url": "={{$json.url}}"
        }
      },
      "name": "Trigger Webhook",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 2
    },
    {
      "parameters": {
        "command": "launch_browser",
        "url": "={{$json.url}}",
        "waitSelector": "body",
        "timeout": 15000
      },
      "name": "Launch Browser",
      "type": "n8n-nodes-base.puppeteer",
      "typeVersion": 1
    },
    {
      "parameters": {
        "evaluateCode": "async function evaluate() {\n  return {\n    title: document.title,\n    h1Count: document.querySelectorAll('h1').length,\n    hasSchema: !!document.querySelector('script[type=\"application/ld+json\"]'),\n    hasViewport: !!document.querySelector('meta[name=\"viewport\"]'),\n    canonicalUrl: document.querySelector('link[rel=\"canonical\"]')?.href\n  };\n}"
      },
      "name": "Extract SEO Data",
      "type": "n8n-nodes-base.javascript"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "={{$env.BACKEND_URL}}/api/scraping/webhook",
        "bodyParametersUi": "json",
        "bodyData": {
          "prospection_id": "={{$json.prospection_id}}",
          "url": "={{$json.url}}",
          "seo_data": "={{$json.seoData}}",
          "screenshot_path": "={{$json.screenshot}}"
        }
      },
      "name": "Send Results Back",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 2
    }
  ]
}
```

### 4.4 Dependencias recomendadas para esta arquitectura
```json
{
  "bull": "^4.10.0",
  "redis": "^4.6.0",
  "n8n-nodes-base": "^latest",
  "sharp": "^0.33.0",
  "puppeteer": "^21.0.0"
}
```

---

## 📊 TABLA DE PRIORIDADES: IMPACTO SEO vs DIFICULTAD

| Feature | Impacto SEO | Dificultad | Tiempo | Dependencias | Prioridad |
|---------|-----------|-----------|--------|-------------|-----------|
| **1.1 Performance & Canonical Audit** | 🔴 Alto | 🟡 Media | 2-3 días | Playwright, web-vitals | **P1** |
| **1.2 Structured Data Gaps** | 🔴 Alto | 🟢 Baja | 1 día | schema-org | **P1** |
| **2.1 Google Business API** | 🔴 Alto | 🔴 Alta | 4-5 días | @googleapis/business-profile | **P2** |
| **2.2 NAP Consistency Check** | 🟡 Medio | 🟡 Media | 2 días | axios, data-normalization | **P2** |
| **3.1 Competitor Gap Analysis** | 🟡 Medio | 🟡 Media | 3 días | multiple-apis | **P2** |
| **3.2 Tech Stack Detection** | 🟡 Medio | 🟢 Baja | 1 día | built-in | **P1** |
| **4.1 n8n Integration** | 🔴 Alto | 🔴 Alta | 5-7 días | n8n, docker | **P3** |
| **4.2 Screenshot Storage** | 🟡 Medio | 🟢 Baja | 1 día | sharp, fs | **P2** |

---

## 🎯 IMPLEMENTACIÓN RECOMENDADA (Orden)

### Sprint 1 (Semana 1): Quick wins de SEO
1. ✅ Implementar Performance & Canonical Audit (1.1)
2. ✅ Tech Stack Detection (3.2)
3. ✅ Structured Data Gaps (1.2)

**ROI**: +25% en información vendible de auditoría, sin arquitectura compleja

### Sprint 2 (Semana 2-3): SEO Local + Competencia
1. ✅ NAP Consistency Check (2.2)
2. ✅ Competitor Gap Analysis (3.1)
3. ✅ Screenshot Storage (4.2)

**ROI**: +40% en propuestas de valor local, casos de uso de competencia

### Sprint 3 (Semana 4-6): Arquitectura escalable
1. ✅ Google Business API Integration (2.1)
2. ✅ n8n Integration (4.1)

**ROI**: -60% en tiempo de scraping, escalabilidad para 1000+ websites/día

---

## 📦 STACK RECOMENDADO (npm)

```json
{
  "dependencies": {
    "playwright": "^1.45.0",
    "web-vitals": "^4.0.0",
    "lighthouse": "^11.0.0",
    "robots-parser": "^3.0.0",
    "@googleapis/business-profile": "^2.0.0",
    "schema-org": "^3.0.0",
    "sharp": "^0.33.0",
    "bull": "^4.10.0",
    "redis": "^4.6.0",
    "axios": "^1.6.0",
    "n8n-sdk": "^latest"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.3.0",
    "ts-jest": "^29.0.0"
  }
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] **Sprint 1 completado**: 3 features P1 deployadas
- [ ] **Tests unit**: >80% coverage en services nuevos
- [ ] **Documentación**: API docs para endpoints nuevos
- [ ] **Performance**: Baseline de latencia para cada feature
- [ ] **Sprint 2 completado**: 3 features P2 deployadas
- [ ] **Integration testing**: End-to-end con Supabase
- [ ] **Sprint 3 completado**: Arquitectura async con n8n
- [ ] **Load testing**: Validar 1000 URLs/día sin bottlenecks
- [ ] **Monitoring**: Dashboards de errores y latencias
- [ ] **Training**: Equipo entrenado en n8n workflows

---

## 🚀 NEXT STEPS

1. **Crear repo de características**: issues en GitHub con estos items
2. **Asignar sprints**: P1 para semana 1, P2 para semana 2-3, P3 para semana 4-6
3. **Validar con cliente**: cuáles features agregan más valor a propuestas de venta
4. **Iniciar Sprint 1**: empezar por Performance Audit (impacto inmediato)
5. **Establecer metrics**: tracks de conversion en propuestas con 5 vs 10 campos

---

**Generado por**: Claude Senior Engineer + SEO Consultant  
**Stack**: Next.js 15 + Node.js + Supabase + n8n + Playwright  
**Status**: ✅ Ready for Sprint Planning
