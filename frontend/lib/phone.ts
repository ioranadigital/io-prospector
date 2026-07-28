// Añade +34 cuando el número viene sin prefijo internacional (scraping ES).
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('34')) return `+${digits}`;
  return `+34${digits}`;
}

// Quita el prefijo "whatsapp:" que Twilio antepone en los campos From/To.
export function stripWhatsappPrefix(raw: string): string {
  return raw.replace(/^whatsapp:/, '');
}

// io_pro_leads.phone se guarda en formatos distintos según el origen del lead
// (local sin prefijo, con 34, o con +34). Devuelve las variantes a probar al
// hacer matching de un remitente de Twilio contra la tabla de leads.
export function phoneLookupVariants(raw: string): string[] {
  const digits = stripWhatsappPrefix(raw).replace(/[^\d]/g, '');
  const local = digits.startsWith('34') && digits.length > 9 ? digits.slice(2) : digits;
  return [local, `34${local}`, `+34${local}`];
}
