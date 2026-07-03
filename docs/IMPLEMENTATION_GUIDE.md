# 🚀 IO Prospector — Guía de Implementación Paso a Paso

**Status**: Ready to implement  
**Total Time Estimate**: 4-6 semanas (3 sprints)  
**Difficulty**: Media-Alta

---

## ⚡ QUICK START

```bash
# 1. Instalar todas las dependencias recomendadas
cd backend && npm install playwright web-vitals lighthouse robots-parser \
  @googleapis/business-profile schema-org sharp bull redis axios

# 2. Crear estructura de carpetas nuevas
mkdir -p backend/services/seo-technical
mkdir -p backend/services/gmb-api
mkdir -p backend/services/competitor-analysis
mkdir -p backend/services/tech-stack
mkdir -p backend/api/audit
mkdir -p backend/screenshots

# 3. Preparar Docker para n8n + Redis + PostgreSQL
# (Ver sección 4.1)
```

---

## SPRINT 1: Quick Wins (Semana 1)

### Feature 1.1: Performance & Canonical Audit

#### Paso 1: Crear el servicio
**Archivo**: `backend/services/seo-technical/performance-audit.service.js`

```javascript
import { chromium } from 'playwright';
import { logger } from '../../utils/logger.js';

export const performanceAuditService = {
  async auditPerformanceAndCanonical(url) {
    const result = {
      url,
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
      top_issue: null,
      top_issue_severity: null,
      error: null,
    };

    let browser;
    try {
      browser = await chromium.launch({ 
        headless: true,
        args: ['--disable-dev-shm-usage'] // Importante para VPS con poca RAM
      });
      
      const page = await browser.newPage();
      
      // Inyectar script para recolectar Web Vitals
      await page.addInitScript(() => {
        window.vitals = { startTime: performance.now() };
        
        // TTFB
        const perfNav = performance.getEntriesByType('navigation')[0];
        if (perfNav) {
          window.vitals.ttfb = perfNav.responseStart - perfNav.requestStart;
        }

        // LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          window.vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
        }).observe({ entryTypes: ['largest-contentful-paint'], buffered: true });

        // CLS
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              window.vitals.cls = clsValue;
            }
          }
        }).observe({ entryTypes: ['layout-shift'], buffered: true });
      });

      const startTime = Date.now();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      const loadTime = Date.now() - startTime;

      // Esperar estabilización
      await page.waitForTimeout(2000);

      // Extraer Web Vitals
      const vitals = await page.evaluate(() => window.vitals || {});
      result.ttfb_ms = Math.round(vitals.ttfb || 0);
      result.largest_contentful_paint_ms = Math.round(vitals.lcp || 0);
      result.cumulative_layout_shift = (vitals.cls || 0).toFixed(3);

      // Extraer HTML para análisis
      const html = await page.content();

      // === CANONICAL ===
      const canonicalMatch = html.match(/<link\s+rel=["']?canonical["']?\s+href=["']([^"']+)["']\s*\/?>/i);
      if (canonicalMatch) {
        result.canonical_url = canonicalMatch[1];
        result.canonical_is_valid = this.validateCanonical(url, canonicalMatch[1]);
      }

      // === H1 ANALYSIS ===
      const h1Elements = await page.locator('h1').all();
      result.h1_count = h1Elements.length;
      
      if (h1Elements.length > 1) {
        result.h1_is_unique = false;
        result.critical_issues.push('❌ Multiple H1 tags found (best practice: 1 per page)');
      } else if (h1Elements.length === 0) {
        result.critical_issues.push('❌ No H1 tag found (required for SEO)');
      }

      // === NOINDEX CHECK ===
      if (html.match(/<meta\s+name=["']?robots["']?\s+content=["']?([^"']*noindex[^"']*)["']/i)) {
        result.has_noindex = true;
        result.critical_issues.push('❌ Page is marked as noindex (won\'t appear in search results)');
      }

      // === ROBOTS.TXT CHECK ===
      try {
        const robotsUrl = new URL('/robots.txt', url).href;
        const robotsResponse = await fetch(robotsUrl, { timeout: 5000 });
        
        if (robotsResponse.ok) {
          result.robots_txt_status = 'present';
          const robotsContent = await robotsResponse.text();
          const pathname = new URL(url).pathname || '/';
          
          // Verificar si esta URL está bloqueada
          const disallowRules = robotsContent.match(/^Disallow:\s*(.*)$/gim) || [];
          for (const rule of disallowRules) {
            const rulePath = rule.replace(/^Disallow:\s*/i, '').trim();
            if (rulePath && pathname.startsWith(rulePath)) {
              result.robots_txt_blocks_indexing = true;
              result.critical_issues.push(`❌ robots.txt blocks: "${rulePath}"`);
              break;
            }
          }
        } else {
          result.robots_txt_status = 'missing';
          result.warnings.push('⚠️ robots.txt not found (best practice to have one)');
        }
      } catch (e) {
        result.robots_txt_status = 'error';
        logger.warn(`robots.txt check failed: ${e.message}`);
      }

      // === PERFORMANCE WARNINGS ===
      if (result.ttfb_ms > 600) {
        result.warnings.push(`⚠️ Slow TTFB: ${result.ttfb_ms}ms (target: <300ms)`);
      }
      if (result.largest_contentful_paint_ms > 2500) {
        result.warnings.push(`⚠️ Slow LCP: ${result.largest_contentful_paint_ms}ms (target: <2.5s)`);
      }
      if (parseFloat(result.cumulative_layout_shift) > 0.1) {
        result.warnings.push(`⚠️ High CLS: ${result.cumulative_layout_shift} (target: <0.1)`);
      }

      // === SET TOP ISSUE ===
      if (result.critical_issues.length > 0) {
        result.top_issue = result.critical_issues[0];
        result.top_issue_severity = 'critical';
      } else if (result.warnings.length > 0) {
        result.top_issue = result.warnings[0];
        result.top_issue_severity = 'warning';
      } else {
        result.top_issue = '✅ No critical SEO issues found';
        result.top_issue_severity = 'success';
      }

      await browser.close();
    } catch (error) {
      logger.error(`Performance audit failed for ${url}:`, error.message);
      result.error = error.message;
      result.top_issue = `❌ Audit failed: ${error.message}`;
      result.top_issue_severity = 'error';
    }

    return result;
  },

  validateCanonical(originalUrl, canonicalUrl) {
    try {
      const original = new URL(originalUrl);
      const canonical = new URL(canonicalUrl);
      
      // Validaciones
      if (!canonicalUrl.startsWith('http')) {
        return false; // Debe ser absoluto
      }
      if (canonical.origin !== original.origin) {
        return false; // Debe ser del mismo dominio
      }
      return true;
    } catch {
      return false;
    }
  }
};
```

#### Paso 2: Crear endpoint API
**Archivo**: `backend/api/audit/performance.js`

```javascript
import { performanceAuditService } from '../../services/seo-technical/performance-audit.service.js';
import { supabase } from '../../config/supabase.js';

export async function POST(req, res) {
  const { url, prospection_id } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Ejecutar auditoría
    const auditResult = await performanceAuditService.auditPerformanceAndCanonical(url);

    // Guardar en BD
    const { data, error } = await supabase
      .from('io_pro_scraping_raw')
      .update({
        ttfb_ms: auditResult.ttfb_ms,
        lcp_ms: auditResult.largest_contentful_paint_ms,
        cls: auditResult.cumulative_layout_shift,
        canonical_url: auditResult.canonical_url,
        h1_count: auditResult.h1_count,
        robots_txt_status: auditResult.robots_txt_status,
        has_noindex: auditResult.has_noindex,
        top_issue: auditResult.top_issue,
        top_issue_severity: auditResult.top_issue_severity,
      })
      .eq('website', url)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      url,
      prospection_id,
      audit: auditResult,
      saved: !!data?.length,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Audit failed',
      details: error.message,
    });
  }
}
```

#### Paso 3: Actualizar schema de BD

**SQL a ejecutar en Supabase**:

```sql
-- Agregar columnas para performance audit si no existen
ALTER TABLE io_pro_scraping_raw
ADD COLUMN IF NOT EXISTS ttfb_ms INTEGER,
ADD COLUMN IF NOT EXISTS lcp_ms INTEGER,
ADD COLUMN IF NOT EXISTS cls NUMERIC,
ADD COLUMN IF NOT EXISTS canonical_url TEXT,
ADD COLUMN IF NOT EXISTS h1_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS robots_txt_status TEXT,
ADD COLUMN IF NOT EXISTS has_noindex BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS top_issue TEXT,
ADD COLUMN IF NOT EXISTS top_issue_severity TEXT;

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_top_issue ON io_pro_scraping_raw(top_issue_severity);
CREATE INDEX IF NOT EXISTS idx_ttfb ON io_pro_scraping_raw(ttfb_ms);
```

#### Paso 4: Probar el endpoint

```bash
curl -X POST http://localhost:4000/api/audit/performance \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "prospection_id": "test-123"
  }'
```

---

### Feature 1.2: Tech Stack Detection

#### Paso 1: Crear el servicio
**Archivo**: `backend/services/tech-stack/tech-detection.service.js`

```javascript
import axios from 'axios';
import { logger } from '../../utils/logger.js';

export const techDetectionService = {
  async detectTechStack(url, html) {
    const techs = {
      cms: this.detectCMS(html),
      ecommerce: this.detectEcommerce(html),
      analytics: this.detectAnalytics(html),
      forms: this.detectFormTools(html),
      cdn: this.detectCDN(html),
      server: await this.detectServer(url),
      javascript_frameworks: this.detectJSFrameworks(html),
      issues: [],
      risks: []
    };

    // === DETECTAR ISSUES ===
    if (techs.cms?.includes('WordPress')) {
      const versionMatch = html.match(/wp-content\/themes\/[^\/]+\/style\.css[^>]*ver=([0-9.]+)/);
      if (versionMatch && this.isOldWordPressVersion(versionMatch[1])) {
        techs.issues.push({
          type: 'outdated_cms',
          value: `WordPress ${versionMatch[1]}`,
          risk: 'high',
          recommendation: 'Update WordPress immediately (security vulnerabilities)'
        });
        techs.risks.push('outdated_wordpress');
      }
    }

    if (!techs.analytics.length) {
      techs.issues.push({
        type: 'no_analytics',
        risk: 'high',
        recommendation: 'Install Google Analytics 4 to track user behavior'
      });
      techs.risks.push('no_analytics');
    }

    if (!techs.forms.length && techs.ecommerce === 'none') {
      techs.issues.push({
        type: 'no_lead_capture',
        risk: 'high',
        recommendation: 'Add contact forms or CTA forms to capture leads'
      });
      techs.risks.push('no_lead_capture');
    }

    if (!techs.cdn) {
      techs.issues.push({
        type: 'no_cdn',
        risk: 'medium',
        recommendation: 'Use a CDN (Cloudflare, AWS CloudFront) to speed up assets'
      });
      techs.risks.push('no_cdn');
    }

    return techs;
  },

  detectCMS(html) {
    const signatures = {
      'WordPress': ['wp-content', 'wp-includes', '/wp-admin', 'wordpress.com', 'wp_version'],
      'Shopify': ['shopify.com/cdn', 'Shopify.', 'cdn.shopify.com', 'myshopify.com'],
      'Wix': ['wix.com', 'wixstatic', 'wix.js'],
      'Squarespace': ['squarespace.com', 'cdn1.com', 'static.squarespace'],
      'Drupal': ['Drupal', '/misc/drupal', 'drupal.js'],
      'Joomla': ['joomla', '/components/com_'],
      'Webflow': ['webflow.com', 'webflow.js'],
      'Next.js': ['__NEXT_DATA__', 'next/router'],
      'React': ['__REACT_DEVTOOLS_GLOBAL_HOOK__', 'react-dom'],
      'Vue': ['__vue__', 'vue.global.js'],
    };

    const detected = [];
    for (const [cms, sigs] of Object.entries(signatures)) {
      if (sigs.some(sig => html.includes(sig))) {
        detected.push(cms);
      }
    }

    return detected.length > 0 ? detected : ['Unknown/Custom'];
  },

  detectEcommerce(html) {
    if (html.includes('Shopify.') || html.includes('shopify')) return 'Shopify';
    if (html.includes('WooCommerce')) return 'WooCommerce';
    if (html.includes('BigCommerce')) return 'BigCommerce';
    if (html.includes('Magento')) return 'Magento';
    if (html.includes('PrestaShop')) return 'PrestaShop';
    if (html.match(/\/cart|\/checkout|\/shop/)) return 'Custom Ecommerce';
    return 'None';
  },

  detectAnalytics(html) {
    const tools = [];
    if (html.includes('gtag') || html.includes('ga(')) tools.push('Google Analytics');
    if (html.includes('_gaq')) tools.push('Google Analytics 3 (Deprecated)');
    if (html.includes('mixpanel')) tools.push('Mixpanel');
    if (html.includes('amplitude')) tools.push('Amplitude');
    if (html.includes('hotjar')) tools.push('Hotjar');
    if (html.includes('segment')) tools.push('Segment');
    if (html.includes('dataLayer')) tools.push('GTM Data Layer');
    return tools;
  },

  detectFormTools(html) {
    const tools = [];
    if (html.includes('typeform')) tools.push('Typeform');
    if (html.includes('formspree')) tools.push('Formspree');
    if (html.includes('hubspot')) tools.push('HubSpot Forms');
    if (html.includes('pipedrive')) tools.push('Pipedrive');
    if (html.includes('jotform')) tools.push('JotForm');
    if (html.includes('brevo') || html.includes('sendinblue')) tools.push('Brevo Forms');
    if (html.match(/<form[^>]*onsubmit/)) tools.push('Custom Form Handler');
    return tools;
  },

  detectCDN(html) {
    if (html.includes('cloudflare')) return 'Cloudflare';
    if (html.includes('cdn.jsdelivr.net')) return 'jsDelivr';
    if (html.includes('cloudfront.amazonaws.com')) return 'AWS CloudFront';
    if (html.includes('unpkg.com')) return 'unpkg';
    if (html.includes('cdnjs.cloudflare.com')) return 'CDNJS';
    return null;
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
    if (html.includes('__NEXT_DATA__')) frameworks.push('Next.js');
    if (html.includes('__REACT_DEVTOOLS_GLOBAL_HOOK__')) frameworks.push('React');
    if (html.includes('__vue__')) frameworks.push('Vue.js');
    if (html.includes('__NUXT__')) frameworks.push('Nuxt');
    if (html.includes('Astro')) frameworks.push('Astro');
    if (html.includes('SvelteKit')) frameworks.push('SvelteKit');
    return frameworks;
  },

  isOldWordPressVersion(version) {
    const major = parseInt(version?.split('.')[0] || 0);
    return major < 6; // Considerar WordPress 5.x y anteriores como obsoleto
  }
};
```

#### Paso 2: Integrar en scraper existente

**Modificar**: `backend/services/scraper.service.js`

```javascript
// En la función scrape(), después de extraer datos:
import { techDetectionService } from './tech-stack/tech-detection.service.js';

// ... código existente ...

const html = await page.content();
const techStack = await techDetectionService.detectTechStack(url, html);

// Retornar junto con otros datos
return {
  email,
  phone,
  address,
  seo: { /* ... */ },
  tech_stack: techStack, // ← AÑADIR
};
```

---

### Feature 1.3: Structured Data Gaps

#### Paso 1: Crear el servicio
**Archivo**: `backend/services/seo-technical/structured-data.service.js`

```javascript
export const structuredDataService = {
  async detectStructuredDataGaps(url, html) {
    const gaps = [];
    
    // Detectar tipos de negocio por señales en la URL y HTML
    const isEcommerce = html.match(/\/product|\/shop|\/cart|checkout|price|Add to cart/i);
    const isLocal = html.match(/map|address|location|hours|nearby|directions/i);
    const isService = html.match(/service|book|appointment|schedule/i);
    const isMedia = html.match(/article|news|blog|video|post/i);

    // Verificar presencia de schemas
    const hasOrgSchema = html.includes('Organization');
    const hasProductSchema = html.includes('Product') || html.includes('Offer');
    const hasLocalSchema = html.includes('LocalBusiness') || html.includes('OpeningHoursSpecification');
    const hasReviewSchema = html.includes('Review') || html.includes('AggregateRating');
    const hasArticleSchema = html.includes('NewsArticle') || html.includes('BlogPosting');
    const hasSchemaOrgStructure = html.includes('schema.org');

    // === VALIDAR NECESIDAD POR TIPO DE SITIO ===
    if (!hasOrgSchema && !hasSchemaOrgStructure) {
      gaps.push({
        type: 'missing_organization_schema',
        severity: 'medium',
        description: 'No Organization schema found',
        recommendation: 'Add structured data for your business/brand',
        example: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Business Name",
  "url": "${url}",
  "logo": "https://example.com/logo.png",
  "description": "Your business description"
}
</script>`,
        impact: 'low'
      });
    }

    if (isEcommerce && !hasProductSchema) {
      gaps.push({
        type: 'missing_product_schema',
        severity: 'high',
        description: 'Product pages should have Product + Offer schema',
        recommendation: 'Add Product and Offer schemas for rich snippets',
        example: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "description": "Product description",
  "offers": {
    "@type": "Offer",
    "price": "19.99",
    "priceCurrency": "EUR"
  }
}
</script>`,
        impact: 'high'
      });
    }

    if (isLocal && !hasLocalSchema) {
      gaps.push({
        type: 'missing_local_schema',
        severity: 'high',
        description: 'Local business pages need LocalBusiness schema',
        recommendation: 'Add LocalBusiness and OpeningHoursSpecification',
        example: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Your Business",
  "address": { "@type": "PostalAddress", "streetAddress": "...", "addressLocality": "...", "postalCode": "..." },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": "Monday",
    "opens": "09:00",
    "closes": "17:00"
  }
}
</script>`,
        impact: 'high'
      });
    }

    if (isMedia && !hasArticleSchema) {
      gaps.push({
        type: 'missing_article_schema',
        severity: 'medium',
        description: 'Blog posts need NewsArticle or BlogPosting schema',
        recommendation: 'Add article structured data',
        example: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Article Title",
  "description": "Article description",
  "datePublished": "2026-06-02",
  "author": { "@type": "Person", "name": "Author Name" }
}
</script>`,
        impact: 'medium'
      });
    }

    if (!hasReviewSchema && (isEcommerce || isLocal)) {
      gaps.push({
        type: 'missing_review_schema',
        severity: 'medium',
        description: 'Missing Review/AggregateRating schema',
        recommendation: 'Add review ratings for credibility',
        example: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "AggregateRating",
  "ratingValue": "4.5",
  "reviewCount": "48"
}
</script>`,
        impact: 'medium'
      });
    }

    return {
      url,
      total_gaps: gaps.length,
      gaps_by_severity: {
        high: gaps.filter(g => g.severity === 'high').length,
        medium: gaps.filter(g => g.severity === 'medium').length,
        low: gaps.filter(g => g.severity === 'low').length,
      },
      gaps: gaps.sort((a, b) => 
        ['high', 'medium', 'low'].indexOf(a.severity) - 
        ['high', 'medium', 'low'].indexOf(b.severity)
      )
    };
  }
};
```

---

## SPRINT 2: SEO Local + Competencia (Semana 2-3)

### Feature 2.1: NAP Consistency Check

#### Paso 1: Instalar dependencias

```bash
npm install puppeteer axios cheerio
```

#### Paso 2: Crear el servicio
**Archivo**: `backend/services/gmb-api/nap-consistency.service.js`

```javascript
import axios from 'axios';
import { logger } from '../../utils/logger.js';

export const napConsistencyService = {
  async checkNAPConsistency(businessName, address, phone) {
    const results = {
      business_name: businessName,
      address: address,
      phone: phone,
      consistency_score: 100,
      verified_sources: [],
      inconsistencies: [],
      risks: []
    };

    const sources = [
      { name: 'Google Maps', searchUrl: 'https://www.google.com/maps/search/' },
      { name: 'Facebook', searchUrl: 'https://www.facebook.com/search/businesses/' },
      { name: 'Yelp', searchUrl: 'https://www.yelp.com/search?find_desc=' },
    ];

    for (const source of sources) {
      try {
        // Búsqueda simplificada (en producción usar APIs oficiales)
        const searchQuery = `${businessName} ${address} ${phone}`;
        const searchUrl = `${source.searchUrl}${encodeURIComponent(searchQuery)}`;

        const response = await axios.get(searchUrl, {
          timeout: 5000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        // Simulación: en producción harías parsing real
        const found = {
          source: source.name,
          name: businessName,
          address: address,
          phone: phone,
          is_present: true
        };

        // Comparar datos
        const nameMatches = this.normalizeString(found.name) === this.normalizeString(businessName);
        const addressMatches = this.normalizeString(found.address) === this.normalizeString(address);
        const phoneMatches = this.normalizePhone(found.phone) === this.normalizePhone(phone);

        results.verified_sources.push({
          ...found,
          name_matches: nameMatches,
          address_matches: addressMatches,
          phone_matches: phoneMatches
        });

        // Detectar inconsistencias
        if (!nameMatches) {
          results.inconsistencies.push({
            source: source.name,
            type: 'name_mismatch',
            found: found.name,
            expected: businessName
          });
          results.consistency_score -= 10;
        }

        if (!addressMatches) {
          results.inconsistencies.push({
            source: source.name,
            type: 'address_mismatch',
            found: found.address,
            expected: address
          });
          results.consistency_score -= 15;
        }

        if (!phoneMatches) {
          results.inconsistencies.push({
            source: source.name,
            type: 'phone_mismatch',
            found: found.phone,
            expected: phone
          });
          results.consistency_score -= 10;
        }

      } catch (error) {
        logger.warn(`NAP check failed for ${source.name}:`, error.message);
        results.inconsistencies.push({
          source: source.name,
          type: 'check_failed',
          error: error.message
        });
      }
    }

    // Calcular score final
    results.consistency_score = Math.max(0, results.consistency_score);

    if (results.inconsistencies.length > 5) {
      results.risks.push('Multiple NAP inconsistencies found - hurt local SEO');
    }

    return results;
  },

  normalizeString(str) {
    return str
      ?.toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[,.\-]/g, '')
      .trim() || '';
  },

  normalizePhone(phone) {
    return phone?.replace(/\D/g, '') || '';
  }
};
```

---

### Feature 3.1: Competitor Gap Analysis

#### Paso 1: Crear el servicio
**Archivo**: `backend/services/competitor-analysis/gap-analysis.service.js`

```javascript
import axios from 'axios';
import { logger } from '../../utils/logger.js';

export const competitorGapService = {
  async analyzeCompetitorGap(leadUrl, competitorUrl) {
    try {
      const [leadData, competitorData] = await Promise.all([
        this.extractCompetitorMetrics(leadUrl),
        this.extractCompetitorMetrics(competitorUrl),
      ]);

      const gaps = [];

      // === 1. URL Structure ===
      const leadUrls = this.analyzeURLStructure(leadUrl);
      const compUrls = this.analyzeURLStructure(competitorUrl);

      if (compUrls.has_clean_urls && !leadUrls.has_clean_urls) {
        gaps.push({
          category: 'url_structure',
          issue: 'Competitor uses clean URLs while you use parameters',
          severity: 'medium',
          recommendation: 'Implement URL rewriting (mod_rewrite or next.js rewrites)',
          difficulty: 'medium'
        });
      }

      // === 2. Content Depth ===
      const leadDepth = leadData.word_count || 0;
      const compDepth = competitorData.word_count || 0;

      if (compDepth > leadDepth * 1.5) {
        gaps.push({
          category: 'content_depth',
          issue: `Competitor content is ${Math.round((compDepth / leadDepth) * 100)}% deeper`,
          severity: 'high',
          recommendation: `Expand your content to at least ${Math.round(compDepth * 0.9)} words`,
          current_words: leadDepth,
          competitor_words: compDepth,
          difficulty: 'low'
        });
      }

      // === 3. Heading Structure ===
      if ((competitorData.heading_count || 0) > (leadData.heading_count || 0) * 1.3) {
        gaps.push({
          category: 'heading_structure',
          issue: 'Competitor has better heading hierarchy',
          severity: 'low',
          recommendation: 'Improve content structure with more H2/H3 headings',
          difficulty: 'low'
        });
      }

      // === 4. Mobile Responsiveness ===
      if (competitorData.is_mobile_friendly && !leadData.is_mobile_friendly) {
        gaps.push({
          category: 'mobile_ux',
          issue: 'Competitor is mobile-optimized, you are not',
          severity: 'high',
          recommendation: 'Implement responsive design',
          difficulty: 'medium'
        });
      }

      // === 5. Page Speed ===
      if (competitorData.load_time && leadData.load_time && 
          competitorData.load_time < leadData.load_time * 0.6) {
        gaps.push({
          category: 'page_speed',
          issue: `Competitor loads ${Math.round(leadData.load_time / competitorData.load_time)}x faster`,
          severity: 'medium',
          recommendation: 'Enable compression, optimize images, use CDN',
          current_ttfb: leadData.load_time,
          competitor_ttfb: competitorData.load_time,
          difficulty: 'medium'
        });
      }

      // === 6. Analytics & Tracking ===
      if (competitorData.has_analytics && !leadData.has_analytics) {
        gaps.push({
          category: 'analytics',
          issue: 'Competitor tracks users, you don\'t',
          severity: 'high',
          recommendation: 'Install Google Analytics 4',
          difficulty: 'low'
        });
      }

      // === 7. Conversion Tools ===
      if ((competitorData.forms || 0) > 0 && (leadData.forms || 0) === 0) {
        gaps.push({
          category: 'lead_capture',
          issue: `Competitor has ${competitorData.forms} form(s), you have none`,
          severity: 'high',
          recommendation: 'Add contact forms to capture leads',
          competitor_forms: competitorData.forms,
          difficulty: 'low'
        });
      }

      return {
        lead_url: leadUrl,
        competitor_url: competitorUrl,
        total_gaps: gaps.length,
        gaps_by_severity: {
          high: gaps.filter(g => g.severity === 'high').length,
          medium: gaps.filter(g => g.severity === 'medium').length,
          low: gaps.filter(g => g.severity === 'low').length,
        },
        gaps: gaps.sort((a, b) => 
          ['high', 'medium', 'low'].indexOf(a.severity) - 
          ['high', 'medium', 'low'].indexOf(b.severity)
        ),
        estimated_weeks_to_fix: Math.ceil(gaps.length / 2),
      };
    } catch (error) {
      logger.error('Gap analysis failed:', error.message);
      return {
        lead_url: leadUrl,
        competitor_url: competitorUrl,
        error: error.message,
        total_gaps: 0
      };
    }
  },

  async extractCompetitorMetrics(url) {
    try {
      const response = await axios.get(url, { timeout: 10000 });
      const html = response.data;

      return {
        url,
        word_count: (html.match(/\b\w+\b/g) || []).length,
        heading_count: (html.match(/<h[1-6]/gi) || []).length,
        image_count: (html.match(/<img/gi) || []).length,
        link_count: (html.match(/<a\s/gi) || []).length,
        is_mobile_friendly: html.includes('viewport'),
        has_analytics: html.includes('gtag') || html.includes('ga('),
        forms: (html.match(/<form/gi) || []).length,
        has_schema: html.includes('schema.org'),
        load_time: 1000, // En producción usar Web Vitals
      };
    } catch (error) {
      logger.warn(`Failed to extract metrics from ${url}:`, error.message);
      return { url, error: error.message };
    }
  },

  analyzeURLStructure(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      return {
        has_clean_urls: !pathname.includes('?'),
        has_parameters: !!pathname.match(/[?&]/),
        depth: pathname.split('/').filter(Boolean).length,
        has_trailing_slash: pathname.endsWith('/'),
      };
    } catch {
      return { has_clean_urls: false, has_parameters: false, depth: 0 };
    }
  }
};
```

---

## SPRINT 3: Arquitectura Asíncrona (Semana 4-6)

### Feature 4.1: Integración n8n + Docker Compose

#### Paso 1: Actualizar docker-compose.yml

**Archivo**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  # === PostgreSQL para n8n ===
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-n8n}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme}
      POSTGRES_DB: ${POSTGRES_DB:-n8n}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U n8n"]
      interval: 10s
      timeout: 5s
      retries: 5

  # === Redis para colas ===
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # === n8n para Scraping Asíncrono ===
  n8n:
    image: n8nio/n8n:latest
    environment:
      DB_TYPE: postgres
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_USER: ${POSTGRES_USER:-n8n}
      DB_POSTGRESDB_PASSWORD: ${POSTGRES_PASSWORD:-changeme}
      DB_POSTGRESDB_DATABASE: ${POSTGRES_DB:-n8n}
      N8N_SECURE_COOKIE: 'true'
      N8N_EDITOR_BASE_URL: ${N8N_EDITOR_BASE_URL:-http://localhost:5678}
      WEBHOOK_URL: ${N8N_WEBHOOK_URL:-http://localhost:5678}
      N8N_USER_MANAGEMENT_DISABLED: 'false'
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  # === Backend API ===
  backend:
    build:
      context: .
      dockerfile: backend.Dockerfile
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      PORT: 4000
      FRONTEND_URL: ${FRONTEND_URL:-http://localhost:3002}
      SUPABASE_URL: ${SUPABASE_URL}
      SUPABASE_KEY: ${SUPABASE_KEY}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      N8N_BASE_URL: ${N8N_BASE_URL:-http://n8n:5678}
      N8N_API_KEY: ${N8N_API_KEY}
    depends_on:
      redis:
        condition: service_healthy
      n8n:
        condition: service_started
    volumes:
      - ./backend/screenshots:/app/screenshots
      - ./backend/logs:/app/logs
    restart: unless-stopped

  # === Frontend ===
  frontend:
    build:
      context: .
      dockerfile: frontend.Dockerfile
      args:
        NODE_ENV: ${NODE_ENV:-production}
        NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:4000/api}
    ports:
      - "3002:3002"
    environment:
      PORT: 3002
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  n8n_data:
```

#### Paso 2: Crear archivo .env para Docker

**Archivo**: `.env.docker`

```env
# ═══════════════════════════════════
# DOCKER ENVIRONMENT VARIABLES
# ═══════════════════════════════════

# PostgreSQL (for n8n)
POSTGRES_USER=n8n_user
POSTGRES_PASSWORD=secure_password_here
POSTGRES_DB=n8n_database

# n8n
N8N_EDITOR_BASE_URL=http://localhost:5678
N8N_WEBHOOK_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key_here

# Backend
NODE_ENV=production
FRONTEND_URL=http://localhost:3002,http://10.0.7.3:3002
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Frontend
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

#### Paso 3: Crear servicio de n8n en backend

**Archivo**: `backend/services/n8n-orchestrator.service.js`

```javascript
import axios from 'axios';
import { logger } from '../utils/logger.js';

export const n8nOrchestratorService = {
  n8nClient: null,