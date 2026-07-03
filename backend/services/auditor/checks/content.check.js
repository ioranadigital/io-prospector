export const id     = 'content';
export const label  = 'Contenido';
export const weight = 10;

export function run(page) {
  return page.evaluate(() => {
    const bodyText  = document.body?.innerText?.trim() || '';
    const words     = bodyText.split(/\s+/).filter(w => w.length > 2);
    const wordCount = words.length;

    const paragraphs  = document.querySelectorAll('p').length;
    const lists       = document.querySelectorAll('ul, ol').length;
    const tables      = document.querySelectorAll('table').length;
    const videos      = document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length;

    // Ratio texto/código heurístico
    const htmlLength = document.documentElement.outerHTML?.length || 1;
    const textRatio  = Math.round((bodyText.length / htmlLength) * 100);

    // Detectar contenido thin (muy poco texto)
    const isThin = wordCount < 200;

    // Detectar párrafos muy largos
    const longParagraphs = [...document.querySelectorAll('p')]
      .filter(p => (p.innerText?.split(/\s+/).length || 0) > 150).length;

    const checks = [
      {
        id: 'content.wordcount',
        label: 'Palabras en la página',
        status: wordCount >= 300 ? 'pass' : wordCount >= 150 ? 'warn' : 'fail',
        value: wordCount,
        detail: wordCount < 200 ? `Solo ${wordCount} palabras — contenido "thin" (delgado)` : `${wordCount} palabras`,
        fix: 'Añade al menos 300 palabras de contenido relevante para el usuario',
      },
      {
        id: 'content.text_ratio',
        label: 'Ratio texto/HTML',
        status: textRatio >= 15 ? 'pass' : textRatio >= 8 ? 'warn' : 'fail',
        value: `${textRatio}%`,
        detail: textRatio < 10 ? `Solo ${textRatio}% de texto — demasiado código y poco contenido` : `${textRatio}% ratio texto/código`,
        fix: 'Reduce HTML innecesario o añade más contenido de texto',
      },
      {
        id: 'content.paragraphs',
        label: 'Párrafos estructurados',
        status: paragraphs >= 3 ? 'pass' : paragraphs > 0 ? 'warn' : 'fail',
        value: paragraphs,
        detail: `${paragraphs} párrafos encontrados`,
        fix: 'Estructura el contenido en párrafos claros con etiquetas <p>',
      },
      {
        id: 'content.long_paragraphs',
        label: 'Sin párrafos excesivamente largos',
        status: longParagraphs === 0 ? 'pass' : longParagraphs <= 2 ? 'warn' : 'fail',
        value: longParagraphs,
        detail: longParagraphs > 0 ? `${longParagraphs} párrafo(s) con más de 150 palabras — difícil de leer` : 'Párrafos bien dimensionados',
        fix: 'Divide párrafos largos en fragmentos más cortos (máx 150 palabras)',
      },
      {
        id: 'content.multimedia',
        label: 'Contenido multimedia',
        status: videos > 0 || lists > 0 || tables > 0 ? 'pass' : 'warn',
        value: `${videos} vídeos, ${lists} listas, ${tables} tablas`,
        detail: `Vídeos: ${videos} | Listas: ${lists} | Tablas: ${tables}`,
        fix: 'Añade listas, imágenes, vídeos o tablas para enriquecer el contenido',
      },
    ];

    return checks;
  });
}
