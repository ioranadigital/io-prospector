const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function saveProspectionToSupabase(prospection: {
  id: string;
  query: string;
  city: string;
  category?: string;
  pages_from: number;
  pages_to: number;
  status: 'completed' | 'in_progress' | 'failed';
  total_found: number;
}) {
  try {
    console.log('Guardando prospección:', prospection);

    const response = await fetch(`${API_BASE}/config/prospections/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: prospection.id,
        query: prospection.query,
        city: prospection.city,
        category: prospection.category || null,
        pages_from: prospection.pages_from,
        pages_to: prospection.pages_to,
        status: prospection.status,
        total_found: prospection.total_found,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error || errorData.message || `HTTP ${response.status}`;
      throw new Error(errorMsg);
    }

    const data = await response.json();
    console.log('Prospección guardada exitosamente:', data);
    return data;
  } catch (error: any) {
    const errorMsg = error?.message || 'Error desconocido';
    console.error('Error saving prospection:', errorMsg);
    throw new Error(errorMsg);
  }
}
