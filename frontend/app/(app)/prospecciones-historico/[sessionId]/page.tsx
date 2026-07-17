'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { fixMojibake } from '@/lib/text';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, Search, Clock, Tag, Download } from 'lucide-react';
import { LeadsTable } from '@/components/LeadsTable';
import { EmailSendModal } from '@/components/EmailSendModal';
import { WhatsAppSendModal } from '@/components/WhatsAppSendModal';
import { LeadDetailModal } from '@/components/leads/LeadDetailModal';

type Session = {
  id: string;
  query: string | null;
  city: string | null;
  category: string | null;
  total_found: number | null;
  status: string | null;
  created_at: string;
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function ProspeccionDetallePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLead, setDetailLead] = useState<any | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<any[]>([]);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);

  useEffect(() => { if (sessionId) loadData(); }, [sessionId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [{ data: sessionData }, { data: leadsData, error: leadsError }] = await Promise.all([
        supabase.from('io_pro_search_sessions').select('*').eq('id', sessionId).single(),
        supabase.from('io_pro_leads').select('*').eq('session_id', sessionId).order('created_at', { ascending: false }),
      ]);
      if (leadsError) throw leadsError;
      setSession(sessionData || null);
      setLeads(leadsData || []);
    } catch (err) {
      console.error(err);
      toast.error('Error cargando la prospección');
    } finally {
      setLoading(false);
    }
  };

  const handleModalSuccess = () => loadData();

  if (loading) return <div className="text-zinc-500 text-center py-24">Cargando prospección...</div>;

  if (!session) {
    return (
      <div className="w-full space-y-4">
        <button onClick={() => router.push('/prospecciones-historico')} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft size={15} /> Volver al histórico
        </button>
        <p className="text-center text-zinc-500 py-16 bg-zinc-900 border border-zinc-800 rounded-xl">
          No se encontró esta prospección.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <button onClick={() => router.push('/prospecciones-historico')} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
        <ArrowLeft size={15} /> Volver al histórico
      </button>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Search size={18} /> {fixMojibake(session.query) || session.category || 'Prospección'}
          </h1>
          <a
            href={api.downloadFile(session.id, 'csv')}
            download
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
          >
            <Download size={14} /> CSV
          </a>
        </div>
        <div className="flex items-center gap-5 text-xs text-zinc-400 flex-wrap">
          {session.category && <span className="flex items-center gap-1"><Tag size={12} /> {session.category}</span>}
          <span className="flex items-center gap-1"><MapPin size={12} /> {fixMojibake(session.city) || '—'}</span>
          <span className="flex items-center gap-1"><Clock size={12} /> {fmtDate(session.created_at)}</span>
          <span className={`font-semibold ${session.status === 'completed' ? 'text-green-400' : session.status === 'error' ? 'text-red-400' : 'text-yellow-400'}`}>
            {session.total_found ?? leads.length} leads
          </span>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <LeadsTable
          leads={leads}
          onOpenDetail={(lead) => setDetailLead(lead)}
          onSendEmail={(lead) => { setSelectedLeads([lead]); setEmailModalOpen(true); }}
          loading={false}
        />
      </div>

      {detailLead && (
        <LeadDetailModal
          lead={detailLead}
          isOpen={!!detailLead}
          onClose={() => setDetailLead(null)}
          onSendEmail={() => { setSelectedLeads([detailLead]); setEmailModalOpen(true); }}
          onSendWhatsApp={() => { setSelectedLeads([detailLead]); setWhatsappModalOpen(true); }}
          onUpdate={handleModalSuccess}
        />
      )}
      <EmailSendModal
        leads={selectedLeads}
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
      <WhatsAppSendModal
        leads={selectedLeads}
        isOpen={whatsappModalOpen}
        onClose={() => setWhatsappModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
