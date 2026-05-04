import { supabase } from './supabase';

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
    const { data, error } = await supabase
      .from('io_prosp_search_sessions')
      .upsert(
        {
          id: prospection.id,
          query: prospection.query,
          city: prospection.city,
          category: prospection.category || null,
          pages_from: prospection.pages_from,
          pages_to: prospection.pages_to,
          status: prospection.status,
          total_found: prospection.total_found,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving prospection to Supabase:', error);
    throw error;
  }
}
