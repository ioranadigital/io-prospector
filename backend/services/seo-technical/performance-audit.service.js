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
        args: ['--disable-dev-shm-usage']
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

        // LCP (Largest Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          window.vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
        }).observe({ entryTypes: ['largest-contentful-paint'], buffered: true });

        // CLS (Cumulative Layout Shift)
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

      // Esperar estabilización para recolectar Web Vitals
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

      // Debe ser absoluto
      if (!canonicalUrl.startsWith('http')) {
        return false;
      }
      // Debe ser del mismo dominio
      if (canonical.origin !== original.origin) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
};
