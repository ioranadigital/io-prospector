'use client';
import { useState, useEffect } from 'react';
import { Phone, Mail, MessageCircle, FileText, Loader2, Leaf, Flame, Zap } from 'lucide-react';
import { ScriptModal } from '@/components/ui/ScriptModal';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CrmPage() {
  const [leads,       setLeads]       = useState<any[]>([]);
  const [selected,    setSelected]    = useState<any | null>(null);
  const [scriptLead,  setScriptLead]  = useState<any | null>(null);
  const [emailData,   setEmailData]   = useState({ subject: '', body: '' });
  const [waMessage,   setWaMessage]   = useState('');
  const [tab,         setTab]         = useState<'email'|'whatsapp'>('email');
  const [sending,     setSending]     = useState(false);
  const [templates,   setTemplates]   = useState<any[]>([]);

  useEffect(() => {
    api.getLeads({ limit: '100' } as any).then((r: any) => setLeads(r.data || []));
    api.getTemplates('email').then((t: any) => setTemplates(t));
  }, []);

  async function loadTemplate(tpl: any) {
    if (!selected) return;
    try {
      const rendered = await api.renderTemplate({ template_id: tpl.id, lead_id: selected.id }) as any;
      setEmailData({ subject: rendered.subject || '', body: rendered.body || '' });
      toast.success('Plantilla cargada');
    } catch (e: any) { toast.error(e.message); }
  }

  async function sendEmail() {
    if (!selected?.email) return toast.error('Este lead no tiene email');
    setSending(true);
    try {
      await api.sendEmail({ lead_id: selected.id, to: selected.email, ...emailData });
      toast.success('Email enviado');
    } catch (e: any) { toast.error(e.message); }
    setSending(false);
  }

  async function sendWhatsApp() {
    if (!selected?.phone) return toast.error('Este lead no tiene teléfono');
    setSending(true);
    try {
      await api.sendWhatsApp({ lead_id: selected.id, phone: selected.phone, message: waMessage });
      toast.success('WhatsApp enviado');
      setWaMessage('');
    } catch (e: any) { toast.error(e.message); }
    setSending(false);
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-4rem)] fade-in">
      {/* Lista de leads */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-2 overflow-y-auto">
        <h1 className="text-lg font-bold text-white mb-2">CRM Contacto</h1>
        {leads.map(lead => (
          <div key={lead.id} onClick={() => setSelected(lead)}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selected?.id === lead.id
                ? 'bg-blue-600/15 border-blue-600/40'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
            }`}>
            <p className="text-sm font-medium text-zinc-200 truncate">{lead.business_name}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{lead.city} · score {lead.audit_score ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* Panel de contacto */}
      {selected ? (
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white">{selected.business_name}</h2>
                <p className="text-xs text-zinc-500 mt-0.5">{selected.city} · {selected.category}</p>
              </div>
              <div className="flex items-center gap-2">
                {selected.phone && (
                  <a href={`tel:${selected.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/15 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/25">
                    <Phone size={12} /> {selected.phone}
                  </a>
                )}
                <button onClick={() => setScriptLead(selected)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-medium hover:bg-zinc-700">
                  <FileText size={12} /> Guión
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-800">
            {(['email','whatsapp'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  tab === t ? 'text-blue-400 border-b-2 border-blue-500' : 'text-zinc-500 hover:text-zinc-300'
                }`}>
                {t === 'email' ? <><Mail size={13} className="inline mr-1.5" />Email</> : <><MessageCircle size={13} className="inline mr-1.5" />WhatsApp</>}
              </button>
            ))}
          </div>

          {/* Email */}
          {tab === 'email' && (
            <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
              <div className="flex gap-2 flex-wrap">
                {templates.map(t => (
                  <button key={t.id} onClick={() => loadTemplate(t)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs transition-colors">
                    {t.name}
                  </button>
                ))}
              </div>
              <input value={emailData.subject} onChange={e => setEmailData(d => ({ ...d, subject: e.target.value }))}
                placeholder="Asunto del email..." className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500" />
              <textarea value={emailData.body} onChange={e => setEmailData(d => ({ ...d, body: e.target.value }))}
                rows={10} placeholder="Cuerpo del email..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 resize-none font-mono" />
              <button onClick={sendEmail} disabled={sending || !emailData.body}
                className="flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
                Enviar email a {selected.email || '(sin email)'}
              </button>
            </div>
          )}

          {/* WhatsApp */}
          {tab === 'whatsapp' && (
            <div className="flex-1 p-6 flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-2">
                {['soft','medium','hard'].map(intensity => (
                  <button key={intensity} onClick={async () => {
                    const t = await api.getTemplates('whatsapp') as any[];
                    const tpl = t.find(x => x.intensity === intensity);
                    if (tpl) setWaMessage(tpl.body
                      .replace(/{{business_name}}/g, selected.business_name)
                      .replace(/{{audit_score}}/g, selected.audit_score ?? '?')
                      .replace(/{{city}}/g, selected.city ?? ''));
                  }} className="py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium capitalize transition-colors">
                    {intensity === 'soft'
                      ? <><Leaf size={13} className="inline mr-1 text-green-400" />Suave</>
                      : intensity === 'medium'
                        ? <><Flame size={13} className="inline mr-1 text-orange-400" />Media</>
                        : <><Zap size={13} className="inline mr-1 text-yellow-400" />Fuerte</>}
                  </button>
                ))}
              </div>
              <textarea value={waMessage} onChange={e => setWaMessage(e.target.value)}
                rows={8} placeholder="Mensaje de WhatsApp..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 resize-none" />
              <button onClick={sendWhatsApp} disabled={sending || !waMessage}
                className="flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
                {sending ? <Loader2 size={15} className="animate-spin" /> : <MessageCircle size={15} />}
                Enviar WhatsApp a {selected.phone || '(sin teléfono)'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-zinc-600">
          <div className="text-center">
            <p className="text-lg">Selecciona un lead</p>
            <p className="text-sm mt-1">para gestionar el contacto</p>
          </div>
        </div>
      )}

      {scriptLead && <ScriptModal lead={scriptLead} onClose={() => setScriptLead(null)} />}
    </div>
  );
}
