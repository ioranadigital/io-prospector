export const id     = 'mobile';
export const label  = 'Mobile';
export const weight = 12;

// Cierra 3 de las 4 reglas "mobile.*" fantasma de io_pro_audit_rules.
// "mobile.orientation" se deja fuera deliberadamente: evaluar el
// comportamiento real al rotar el viewport requiere un segundo pase de
// Playwright con otro viewport (coste alto para un check de bajo valor en
// sitios de negocio estándar, no apps/juegos) — no encaja en el esfuerzo
// "medio" de este sprint.
export function run(page) {
  return page.evaluate(() => {
    const viewportMeta = document.querySelector('meta[name="viewport"]')?.content?.trim() || '';

    // Tap targets: Google recomienda un área táctil mínima de 44x44px
    const interactive = [...document.querySelectorAll('button, a, input[type="submit"], input[type="button"], [role="button"]')];
    const smallTargets = interactive.filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44);
    });

    // Tamaño de fuente: por debajo de 12px obliga a hacer zoom en móvil
    const textEls = [...document.querySelectorAll('p, span, li, a, div')]
      .filter(el => el.textContent?.trim().length > 20 && el.children.length === 0);
    const smallFontEls = textEls.filter(el => {
      const size = parseFloat(getComputedStyle(el).fontSize);
      return size > 0 && size < 12;
    });

    const checks = [
      {
        id: 'mobile.viewport.meta',
        label: 'Meta viewport para móvil',
        status: viewportMeta ? 'pass' : 'fail',
        value: viewportMeta || null,
        detail: viewportMeta ? 'Meta viewport configurado' : 'Sin meta viewport — la página no se adapta a móvil',
        fix: 'Añade <meta name="viewport" content="width=device-width, initial-scale=1">',
      },
      {
        id: 'mobile.button.size',
        label: 'Tamaño de botones/enlaces táctiles',
        status: smallTargets.length === 0 ? 'pass' : smallTargets.length <= 3 ? 'warn' : 'fail',
        value: smallTargets.length,
        detail: smallTargets.length > 0
          ? `${smallTargets.length} elemento(s) interactivo(s) por debajo de 44×44px — difíciles de pulsar en móvil`
          : 'Todos los elementos interactivos tienen un tamaño táctil adecuado',
        fix: 'Aumenta el área táctil de botones/enlaces a al menos 44×44px (incluyendo el padding)',
      },
      {
        id: 'mobile.font.size',
        label: 'Tamaño de fuente legible en móvil',
        status: smallFontEls.length === 0 ? 'pass' : smallFontEls.length <= 3 ? 'warn' : 'fail',
        value: smallFontEls.length,
        detail: smallFontEls.length > 0
          ? `${smallFontEls.length} bloque(s) de texto con menos de 12px — obliga a hacer zoom en móvil`
          : 'Texto con un tamaño de fuente legible',
        fix: 'Usa un tamaño de fuente mínimo de 12px (16px recomendado) para el texto de cuerpo',
      },
    ];

    return checks;
  });
}
