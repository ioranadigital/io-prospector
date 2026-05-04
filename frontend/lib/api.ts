// Cliente HTTP centralizado — todas las llamadas al backend pasan por aquí

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      errMsg = err.error || err.message || errMsg;
    } catch {
      errMsg = res.statusText || errMsg;
    }
    console.error(`[API Error] ${path}:`, errMsg);
    throw new Error(errMsg);
  }
  return res.json();
}

export const api = {
  // Search
  startSearch: (body: object)              => request('/search/start', { method: 'POST', body: JSON.stringify(body) }),
  getSessions: ()                          => request('/search/sessions'),
  getSession:  (id: string)               => request(`/search/sessions/${id}`),
  getCategories: ()                        => request('/search/categories'),

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
};
