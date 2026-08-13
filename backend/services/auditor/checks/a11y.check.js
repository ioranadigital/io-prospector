export const id     = 'a11y';
export const label  = 'Accesibilidad';
export const weight = 10;

// Cierra 5 de las 7 reglas "a11y.*" fantasma de io_pro_audit_rules.
// "a11y.headings.semantic" se deja fuera: ya la cubre headings.hierarchy
// (mismo check, distinta categoría en la BD — duplicarlo repetiría el mismo
// problema que ya se corrigió para H1 en headings.check.js).
// El contraste (WCAG AA) se calcula con la fórmula de luminancia relativa
// del propio W3C, sin librería nueva. Las funciones viven dentro del propio
// page.evaluate() porque Playwright no puede pasar funciones como argumento
// a través de la frontera Node↔navegador, solo datos serializables.
export function run(page) {
  return page.evaluate(() => {
    const luminance = ([r, g, b]) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const contrastRatio = (rgbA, rgbB) => {
      const lA = luminance(rgbA);
      const lB = luminance(rgbB);
      const lighter = Math.max(lA, lB);
      const darker = Math.min(lA, lB);
      return (lighter + 0.05) / (darker + 0.05);
    };

    const parseColor = str => {
      const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!m) return null;
      const alpha = m[4] !== undefined ? parseFloat(m[4]) : 1;
      return alpha === 0 ? null : [+m[1], +m[2], +m[3]];
    };

    const getEffectiveBg = el => {
      let node = el;
      while (node) {
        const rgb = parseColor(getComputedStyle(node).backgroundColor);
        if (rgb) return rgb;
        node = node.parentElement;
      }
      return [255, 255, 255];
    };

    // 1. lang en <html> — mismo dato que meta.lang, categoría a11y para que
    // el check_id 'a11y.lang.declaration' (ya existente en io_pro_audit_rules)
    // tenga un módulo real que lo produzca.
    const lang = document.documentElement.lang?.trim() || '';

    // 2. Calidad del alt text (más allá de "existe o no")
    const imgs = [...document.querySelectorAll('img')];
    const withAlt = imgs.filter(i => i.alt?.trim());
    const genericAltPattern = /^(img|image|photo|foto|imagen|picture|dsc|IMG)[\s_-]*\d*\.?(jpe?g|png|gif|webp)?$/i;
    const poorAlt = withAlt.filter(i => {
      const alt = i.alt.trim();
      return alt.length < 3 || genericAltPattern.test(alt);
    });

    // 3. Botones/enlaces sin texto accesible (solo icono, sin aria-label)
    const iconOnlyEls = [...document.querySelectorAll('button, a, [role="button"]')].filter(el => {
      const hasText = el.textContent?.trim().length > 0;
      const hasAriaLabel = el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby');
      const hasTitle = el.hasAttribute('title');
      const hasImgAlt = el.querySelector('img[alt]:not([alt=""])');
      return !hasText && !hasAriaLabel && !hasTitle && !hasImgAlt;
    });

    // 4. Campos de formulario sin label asociado
    const inputs = [...document.querySelectorAll(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea'
    )];
    const unlabeledInputs = inputs.filter(inp => {
      const hasLabelFor = inp.id && document.querySelector(`label[for="${inp.id}"]`);
      const hasAriaLabel = inp.hasAttribute('aria-label') || inp.hasAttribute('aria-labelledby');
      const wrappedInLabel = inp.closest('label');
      return !hasLabelFor && !hasAriaLabel && !wrappedInLabel;
    });

    // 5. Contraste de color (WCAG AA) sobre una muestra de texto visible
    const textEls = [...document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, li, button')]
      .filter(el => el.textContent?.trim().length > 3 && el.children.length === 0)
      .slice(0, 60);
    const lowContrastEls = textEls.filter(el => {
      const style = getComputedStyle(el);
      const fg = parseColor(style.color);
      if (!fg) return false;
      const bg = getEffectiveBg(el);
      const ratio = contrastRatio(fg, bg);
      const fontSize = parseFloat(style.fontSize);
      const isBold = parseInt(style.fontWeight, 10) >= 700;
      const minRatio = (fontSize >= 18 || (fontSize >= 14 && isBold)) ? 3 : 4.5;
      return ratio < minRatio;
    });

    // 6. Navegación por teclado — antipatrones básicos detectables sin interacción real
    const positiveTabindex = [...document.querySelectorAll('[tabindex]')]
      .filter(el => parseInt(el.getAttribute('tabindex'), 10) > 0);
    const clickableNonInteractive = [...document.querySelectorAll('div[onclick], span[onclick]')]
      .filter(el => !el.hasAttribute('tabindex') && !el.hasAttribute('role'));
    const keyboardIssues = positiveTabindex.length + clickableNonInteractive.length;

    const checks = [
      {
        id: 'a11y.lang.declaration',
        label: 'Idioma declarado (lang) — accesibilidad',
        status: lang ? 'pass' : 'fail',
        value: lang || null,
        detail: lang ? `lang="${lang}" — los lectores de pantalla usan la pronunciación correcta` : 'Sin atributo lang — los lectores de pantalla no saben qué idioma pronunciar',
        fix: 'Añade lang="es" (o el idioma correspondiente) a la etiqueta <html>',
      },
      {
        id: 'a11y.alt.quality',
        label: 'Calidad del texto alternativo',
        status: poorAlt.length === 0 ? 'pass' : poorAlt.length <= 3 ? 'warn' : 'fail',
        value: poorAlt.length,
        detail: poorAlt.length > 0
          ? `${poorAlt.length} imagen(es) con alt genérico o demasiado corto (ej. "img_01.jpg") — no describe el contenido para lectores de pantalla`
          : 'Los textos alternativos son descriptivos',
        fix: 'Escribe alt descriptivos del contenido real de la imagen, no del nombre de archivo',
      },
      {
        id: 'a11y.aria.labels',
        label: 'Botones/enlaces con nombre accesible',
        status: iconOnlyEls.length === 0 ? 'pass' : iconOnlyEls.length <= 2 ? 'warn' : 'fail',
        value: iconOnlyEls.length,
        detail: iconOnlyEls.length > 0
          ? `${iconOnlyEls.length} elemento(s) interactivo(s) sin texto ni aria-label — un lector de pantalla no puede anunciar su función`
          : 'Todos los elementos interactivos tienen nombre accesible',
        fix: 'Añade aria-label="descripción de la acción" a botones/enlaces que solo muestran un icono',
      },
      {
        id: 'a11y.form.labels',
        label: 'Campos de formulario con label',
        status: unlabeledInputs.length === 0 ? 'pass' : unlabeledInputs.length <= 2 ? 'warn' : 'fail',
        value: unlabeledInputs.length,
        detail: unlabeledInputs.length > 0
          ? `${unlabeledInputs.length} campo(s) de formulario sin <label> asociado — un lector de pantalla no anuncia qué debe rellenar el usuario`
          : 'Todos los campos de formulario tienen label asociado',
        fix: 'Asocia cada input con <label for="id-del-input"> o envuélvelo dentro de un <label>',
      },
      {
        id: 'a11y.contrast',
        label: 'Contraste de color (WCAG AA)',
        status: lowContrastEls.length === 0 ? 'pass' : lowContrastEls.length <= 3 ? 'warn' : 'fail',
        value: `${lowContrastEls.length}/${textEls.length} muestreados`,
        detail: lowContrastEls.length > 0
          ? `${lowContrastEls.length} bloque(s) de texto con contraste insuficiente (< 4.5:1, o 3:1 en texto grande) — difícil de leer para usuarios con baja visión`
          : 'El contraste de texto muestreado cumple WCAG AA',
        fix: 'Aumenta el contraste entre el color del texto y su fondo (mínimo 4.5:1 para texto normal)',
      },
      {
        id: 'a11y.keyboard.nav',
        label: 'Navegación por teclado',
        status: keyboardIssues === 0 ? 'pass' : keyboardIssues <= 2 ? 'warn' : 'fail',
        value: keyboardIssues,
        detail: keyboardIssues > 0
          ? `${keyboardIssues} elemento(s) con tabindex positivo o clicables sin ser accesibles por teclado — rompe el orden natural de navegación`
          : 'Sin antipatrones de navegación por teclado detectados',
        fix: 'Evita tabindex positivos; añade tabindex="0" + role="button" a elementos clicables que no sean <button>/<a>',
      },
    ];

    return checks;
  });
}
