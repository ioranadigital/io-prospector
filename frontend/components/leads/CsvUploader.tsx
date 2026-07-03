'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Upload } from 'lucide-react';

const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID || 'default';

export function CsvUploader({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return headers.reduce((obj, header, i) => {
        obj[header] = values[i] || null;
        return obj;
      }, {} as Record<string, any>);
    });
    return rows;
  };

  const calculateSEOGap = (row: any): string => {
    const gaps: string[] = [];

    if (row.Load_Time_Ms && parseInt(row.Load_Time_Ms) > 3000) {
      gaps.push(`Tu web tarda ${row.Load_Time_Ms}ms en cargar`);
    }
    if (row.SSL_Active === 'No') {
      gaps.push('No tienes SSL activo');
    }
    if (row.Has_Schema === 'No') {
      gaps.push('Falta implementar schema JSON-LD');
    }
    if (row.Broken_Links_Count && parseInt(row.Broken_Links_Count) > 0) {
      gaps.push(`Tienes ${row.Broken_Links_Count} enlaces rotos`);
    }
    if (row.Is_Mobile_Responsive === 'No') {
      gaps.push('Tu web no es responsive');
    }

    return gaps.length > 0 ? gaps.join(' | ') : 'Revisar SEO técnico';
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);

      // Get existing emails to detect duplicates
      const { data: existingLeads } = await supabase
        .from('io_pro_leads')
        .select('email');

      const existingEmails = new Set(existingLeads?.map(l => l.email) || []);
      let duplicateCount = 0;
      let insertedCount = 0;

      // Insert new leads mapped to io_pro_leads schema
      const leadsToInsert = rows
        .filter(row => {
          if (!row.Email) return false;
          if (existingEmails.has(row.Email)) {
            duplicateCount++;
            return false;
          }
          return true;
        })
        .map(row => ({
          business_name: row.Company_Name || row.Business_Name || 'N/A',
          email: row.Email,
          website: row.Website || null,
          phone: row.Phone || null,
          city: row.City || null,
          category: row.Category || null,
          gmb_rating: row.GMB_Rating ? parseFloat(row.GMB_Rating) : null,
          review_count: row.Review_Count ? parseInt(row.Review_Count) : null,
          gmb_claimed: row.GMB_Claimed === 'Sí' || row.GMB_Claimed === 'true',
          ssl_active: row.SSL_Active === 'Sí' || row.SSL_Active === 'true',
          is_mobile_responsive: row.Is_Mobile_Responsive === 'Sí' || row.Is_Mobile_Responsive === 'true',
          has_schema: row.Has_Schema === 'Sí' || row.Has_Schema === 'true',
          broken_links_count: row.Broken_Links_Count ? parseInt(row.Broken_Links_Count) : null,
          photo_count: row.Photo_Count ? parseInt(row.Photo_Count) : null,
          main_competitor: row.Main_Competitor || null,
          missing_service: row.Missing_Service || null,
          icebreaker: row.Icebreaker || null,
          seo_gap: calculateSEOGap(row),
          status: 'candidate',
          crm_status: 'new',
          priority: 'normal',
          audit_score: 0,
        }));

      if (leadsToInsert.length > 0) {
        const { error } = await supabase
          .from('io_pro_leads')
          .insert(leadsToInsert);

        if (error) throw error;
        insertedCount = leadsToInsert.length;
      }

      toast.success(
        `${insertedCount} leads importados${duplicateCount > 0 ? ` | ${duplicateCount} duplicados ignorados` : ''}`
      );
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Error al importar CSV');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleUpload}
        disabled={loading}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-sm font-medium"
      >
        <Upload size={16} />
        {loading ? 'Importando...' : 'Importar CSV'}
      </button>
    </div>
  );
}
