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
      'WordPress': ['wp-content', 'wp-includes', '/wp-admin', 'wordpress.com', 'wp_version', 'wp-emoji-release.min.js'],
      'Shopify': ['shopify.com/cdn', 'Shopify.', 'cdn.shopify.com', 'myshopify.com'],
      'Wix': ['wix.com', 'wixstatic', 'wix.js'],
      'Squarespace': ['squarespace.com', 'cdn1.com', 'static.squarespace'],
      'Drupal': ['Drupal', '/misc/drupal', 'drupal.js'],
      'Joomla': ['joomla', '/components/com_'],
      'Webflow': ['webflow.com', 'webflow.js'],
      'Next.js': ['__NEXT_DATA__', 'next/router', '/_next/'],
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
    if (html.match(/\/cart|\/checkout|\/shop|add.*to.*cart/i)) return 'Custom Ecommerce';
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
    if (html.match(/<form[^>]*onsubmit/i)) tools.push('Custom Form Handler');
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(url, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeoutId);
      return response.headers.get('server') || 'Unknown';
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
    return major < 6;
  }
};
