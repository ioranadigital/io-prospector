export const id     = 'links';
export const label  = 'Enlaces';
export const weight = 10;

export function run(page) {
  return page.evaluate(() => {
    const baseHost = location.hostname;
    const anchors  = [...document.querySelectorAll('a[href]')];

    const internal = anchors.filter(a => {
      try { return new URL(a.href).hostname === baseHost; } catch { return false; }
    });
    const external = anchors.filter(a => {
      try { return new URL(a.href).hostname !== baseHost && a.href.startsWith('http'); } catch { return false; }
    });
    const noFollow = anchors.filter(a => /nofollow/i.test(a.rel));
    const noOpener = external.filter(a => /noopener|noreferrer/i.test(a.rel));
    const emptyHref = anchors.filter(a => !a.href || a.href === '#' || a.href === `${location.origin}/`).length;
    const noText   = anchors.filter(a => !a.innerText?.trim() && !a.querySelector('img')).length;

    const checks = [
      {
        id: 'links.internal',
        label: 'Links internos',
        status: internal.length > 0 ? 'pass' : 'warn',
        value: internal.length,
        detail: `${internal.length} enlaces internos — ayudan a Google a rastrear el sitio`,
        fix: 'Añade enlaces internos entre páginas relacionadas',
      },
      {
        id: 'links.external.security',
        label: 'Links externos con noopener',
        status: external.length === 0 ? 'pass'
               : noOpener.length >= external.length ? 'pass' : 'warn',
        value: `${noOpener.length}/${external.length}`,
        detail: external.length - noOpener.length > 0
          ? `${external.length - noOpener.length} enlace(s) externos sin rel="noopener" — riesgo de seguridad`
          : 'Links externos seguros',
        fix: 'Añade rel="noopener noreferrer" a todos los <a target="_blank">',
      },
      {
        id: 'links.empty',
        label: 'Sin enlaces vacíos (#)',
        status: emptyHref === 0 ? 'pass' : emptyHref <= 2 ? 'warn' : 'fail',
        value: emptyHref,
        detail: emptyHref > 0 ? `${emptyHref} enlace(s) vacíos (href="#") — confunden a Google` : 'Sin enlaces vacíos',
        fix: 'Reemplaza href="#" con URLs reales o usa <button> para acciones',
      },
      {
        id: 'links.anchor.text',
        label: 'Textos ancla descriptivos',
        status: noText === 0 ? 'pass' : noText <= 2 ? 'warn' : 'fail',
        value: noText,
        detail: noText > 0 ? `${noText} enlace(s) sin texto ni imagen — Google no sabe a qué apuntan` : 'Todos los enlaces tienen texto',
        fix: 'Añade texto descriptivo a todos los enlaces (evita "clic aquí" o vacíos)',
      },
      {
        id: 'links.ratio',
        label: 'Ratio interno/externo',
        status: external.length === 0 || internal.length >= external.length ? 'pass' : 'warn',
        value: `${internal.length} int / ${external.length} ext`,
        detail: `${internal.length} internos vs ${external.length} externos`,
        fix: 'Mantén más enlaces internos que externos para retener link juice',
      },
    ];

    return checks;
  });
}
