// Cliente HTTP centralizado — todas las llamadas al backend pasan por aquí

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4006/api';
console.log('API BASE URL:', BASE);

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  console.log('Fetching:', `${BASE}${path}`);
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      // Normaliza errores de validación (Zod devuelve un array de issues)
      const toText = (e: any): string => {
        if (Array.isArray(e)) return e.map(i => i?.message || JSON.stringify(i)).join(' · ');
        if (typeof e === 'string') return e;
        return e?.message || JSON.stringify(e);
      };
      if (err?.error !== undefined) errMsg = toText(err.error);
      else if (err?.message) errMsg = err.message;
      else if (Array.isArray(err)) errMsg = toText(err);
    } catch {
      errMsg = res.statusText || errMsg;
    }
    // warn (no error) para no disparar el overlay de error de Next dev; el caller maneja el throw
    console.warn(`[API] ${path}:`, errMsg);
    throw new Error(errMsg);
  }
  return res.json();
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Leads
  getLeads:    (params?: Record<string, string>) => request(`/leads?${new URLSearchParams(params)}`),
  getLead:     (id: string)               => request(`/leads/${id}`),
  updateLead:  (id: string, body: object) => request(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteLead:  (id: string)               => request(`/leads/${id}`, { method: 'DELETE' }),
  addActivity: (id: string, body: object) => request(`/leads/${id}/activity`, { method: 'POST', body: JSON.stringify(body) }),

  // Contact
  sendEmail:   (body: object)             => request('/contact/email', { method: 'POST', body: JSON.stringify(body) }),
  sendWhatsApp:(body: object)             => request('/contact/whatsapp', { method: 'POST', body: JSON.stringify(body) }),
  getTemplates:(type?: string)            => request(`/contact/templates${type ? `?type=${type}` : ''}`),
  renderTemplate:(body: object)           => request('/contact/templates/render', { method: 'POST', body: JSON.stringify(body) }),

  // Bulk Contact
  sendBulkEmails: (body: object)          => request('/contact/bulk-emails', { method: 'POST', body: JSON.stringify(body) }),
  sendBulkWhatsApp:(body: object)         => request('/contact/bulk-whatsapp', { method: 'POST', body: JSON.stringify(body) }),
  getBulkEmailStatus: (batchId: string)   => request(`/contact/bulk-emails/${batchId}/status`),
  getBulkWhatsAppStatus: (batchId: string) => request(`/contact/bulk-whatsapp/${batchId}/status`),

  // CRM
  getKanban:   ()                         => request('/crm/kanban'),
  updateStatus:(id: string, status: string) => request(`/crm/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getCrmStats: ()                         => request('/crm/stats'),

  // Analytics
  getAnalyticsSummary: ()                 => request('/analytics/summary'),

  // Demo
  generateDemo:(lead_id: string)          => request('/demo/generate', { method: 'POST', body: JSON.stringify({ lead_id }) }),

  // Scraping
  startProspection: (body: object)        => request('/scraping/start', { method: 'POST', body: JSON.stringify(body) }),
  getProspectionStatus: (id: string)      => request(`/scraping/status/${id}`),
  getProspectionHistory: ()               => request('/scraping/history'),
  downloadFile: (id: string, type: string) => {
    const baseUrl = BASE.replace('/api', '');
    return `${baseUrl}/api/scraping/download/${id}/${type}`;
  },

  // Leads - Import from scraping
  importFromScraping: (body: object)      => request('/leads/import-from-scraping', { method: 'POST', body: JSON.stringify(body) }),

  // Auditoría onsite — el backend encola la auditoría (Bull) en vez de
  // bloquear el request; aquí se hace polling hasta que termina, pero el
  // contrato hacia quien llama sigue siendo el mismo de siempre: esperar y
  // recibir el resultado completo, o que se lance un error con mensaje.
  auditUrl: async (url: string, { pollIntervalMs = 2000, timeoutMs = 90_000 }: { pollIntervalMs?: number; timeoutMs?: number } = {}) => {
    const { jobId } = await request<{ jobId: string }>('/audit/url', { method: 'POST', body: JSON.stringify({ url }) });
    const startedAt = Date.now();

    while (true) {
      if (Date.now() - startedAt > timeoutMs) {
        throw new Error('La auditoría está tardando más de lo normal. Inténtalo de nuevo en unos minutos.');
      }

      await sleep(pollIntervalMs);

      const status = await request<{ status: string; result?: any; error?: string }>(`/audit/status/${jobId}`);
      if (status.status === 'completed') return status.result;
      if (status.status === 'failed') throw new Error(status.error || 'Error al auditar el sitio.');
      // status === 'processing' → seguir esperando
    }
  },
};
