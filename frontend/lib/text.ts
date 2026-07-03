// Utilidades de texto compartidas.

/**
 * Corrige doble-codificación UTF-8 (mojibake) en datos antiguos.
 * Ej: "PeluquerÃ­a" -> "Peluquería", "AlmerÃ­a" -> "Almería".
 * Si el texto ya es correcto, lanza y se devuelve tal cual.
 */
export function fixMojibake(s: string | null | undefined): string {
  if (!s) return '';
  try { return decodeURIComponent(escape(s)); } catch { return s; }
}
