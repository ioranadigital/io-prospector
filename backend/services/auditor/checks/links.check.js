export const id     = 'links';
export const label  = 'Enlaces';
export const weight = 10;

// Límite de enlaces internos a verificar con una petición HTTP real — una
// auditoría no debe convertirse en un crawler completo del sitio; con esto
// se cubre una muestra representativa sin disparar decenas de requests ni
// alargar mucho la duración total.
const MAX_LINKS_TO_VERIFY = 15;
const LINK_CHECK_TIMEOUT_MS = 4000;

async function findBrokenLinks(hrefs) {
  const sample = hrefs.slice(0, MAX_LINKS_TO_VERIFY);
  const results = await Promise.allSettled(sample.map(async href => {
    try {
      let res = await fetch(href, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(LINK_CHECK_TIMEOUT_MS) });
      // Algunos servidores no soportan HEAD correctamente (405) aunque el enlace funcione con GET
      if (res.status === 405) {
        res = await fetch(href, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(LINK_CHECK_TIMEOUT_MS) });
      }
      return res.status >= 400 ? { href, status: res.status } : null;
    } catch {
      return { href, status: 'sin respuesta' };
    }
  }));

  return {
    checked: sample.length,
    broken: results.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value),
  };
}

export async function run(page) {
  const { checks, internalHrefs } = await page.evaluate(() => {
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
    const internalHrefs = [...new Set(internal.map(a => a.href))];

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

    return { checks, internalHrefs };
  });

  const { checked, broken } = await findBrokenLinks(internalHrefs);
  checks.push({
    id: 'links.broken',
    label: 'Enlaces internos rotos (status HTTP real)',
    status: checked === 0 ? 'info' : broken.length === 0 ? 'pass' : broken.length <= 2 ? 'warn' : 'fail',
    value: checked > 0 ? `${broken.length}/${checked} rotos` : null,
    detail: checked === 0
      ? 'Sin enlaces internos para verificar'
      : broken.length > 0
        ? `${broken.length} de ${checked} enlace(s) verificados devuelven error: ${broken.map(b => `${b.href} (${b.status})`).slice(0, 3).join(', ')}${broken.length > 3 ? '…' : ''}`
        : `${checked} enlace(s) internos verificados, todos responden correctamente`,
    fix: broken.length > 0 ? 'Corrige o elimina los enlaces rotos; revisa si apuntan a páginas movidas o eliminadas' : null,
  });

  return checks;
}
