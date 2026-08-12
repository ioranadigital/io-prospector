export const id     = 'headings';
export const label  = 'Estructura de Headings';
export const weight = 20;

export function run(page) {
  return page.evaluate(() => {
    const getHeadings = (tag) =>
      [...document.querySelectorAll(tag)].map(el => el.innerText?.trim()).filter(Boolean);

    const h1s = getHeadings('h1');
    const h2s = getHeadings('h2');
    const h3s = getHeadings('h3');
    const h4s = getHeadings('h4');
    const h5s = getHeadings('h5');
    const h6s = getHeadings('h6');

    const checks = [
      {
        id: 'headings.h1.exists',
        label: 'H1 existe',
        status: h1s.length > 0 ? 'pass' : 'fail',
        value: h1s[0] || null,
        detail: h1s.length === 0 ? 'No hay H1 en la página' : `"${h1s[0]?.slice(0, 80)}"`,
        fix: 'Añade un H1 único que describa el contenido principal de la página',
      },
    ];

    // "H1 único" y "H1 longitud" solo tienen sentido si ya existe al menos un
    // H1 — cuando no hay ninguno, el problema ya lo reporta "H1 existe" de
    // arriba; evaluarlos igualmente triplicaba la misma causa raíz (sin H1)
    // como tres fails distintos, penalizando el score de más y duplicando el
    // mensaje en el informe.
    if (h1s.length > 0) {
      checks.push({
        id: 'headings.h1.unique',
        label: 'H1 único (solo 1)',
        status: h1s.length === 1 ? 'pass' : 'fail',
        value: h1s.length,
        detail: h1s.length > 1 ? `Hay ${h1s.length} H1s — Google puede confundirse con el tema principal` : '1 H1 correcto',
        fix: h1s.length > 1 ? 'Usa solo un H1 por página' : null,
      });
      checks.push({
        id: 'headings.h1.length',
        label: 'H1 longitud (20-70 chars)',
        status: h1s[0].length >= 20 && h1s[0].length <= 70 ? 'pass' : 'warn',
        value: h1s[0].length,
        detail: `${h1s[0].length} caracteres`,
        fix: 'El H1 debe tener entre 20 y 70 caracteres',
      });
    }

    checks.push(
      {
        id: 'headings.h2.exists',
        label: 'H2 existen',
        status: h2s.length > 0 ? 'pass' : 'warn',
        value: h2s.length,
        detail: h2s.length > 0 ? `${h2s.length} H2s encontrados` : 'Sin H2s — estructura de contenido pobre',
        fix: 'Añade H2s para estructurar el contenido en secciones',
      },
      {
        id: 'headings.hierarchy',
        label: 'Jerarquía correcta (H1→H2→H3)',
        status: h1s.length === 1 && h2s.length > 0 ? 'pass'
               : h1s.length > 1 || (h3s.length > 0 && h2s.length === 0) ? 'fail' : 'warn',
        value: `H1:${h1s.length} H2:${h2s.length} H3:${h3s.length}`,
        detail: h3s.length > 0 && h2s.length === 0 ? 'H3 sin H2 padre — jerarquía rota' : `H1:${h1s.length} | H2:${h2s.length} | H3:${h3s.length}`,
        fix: 'Estructura: un H1, varios H2 como secciones, H3 como subsecciones',
      },
      {
        id: 'headings.keywords',
        label: 'H1 y H2 tienen contenido relevante',
        status: h1s[0]?.length > 5 && h2s.some(h => h.length > 5) ? 'pass' : 'warn',
        value: [...h2s.slice(0, 3)].join(' | ') || null,
        detail: `H2s: ${h2s.slice(0, 3).map(h => `"${h.slice(0,40)}"`).join(', ') || 'ninguno'}`,
        fix: 'Los headings deben contener palabras clave relevantes para el negocio',
      },
    );

    return checks;
  });
}
