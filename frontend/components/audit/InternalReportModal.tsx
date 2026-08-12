'use client';
import { useState } from 'react';
import { X, ClipboardList, FileCode, Eye, Copy, Check, Download, XCircle, AlertTriangle, Lightbulb, Code2 } from 'lucide-react';
import { InternalReport, internalReportToMarkdown } from '@/lib/audit-internal-report';

interface InternalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: InternalReport;
}

export function InternalReportModal({ isOpen, onClose, report }: InternalReportModalProps) {
  const [mode, setMode] = useState<'detalle' | 'markdown'>('detalle');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const markdown = internalReportToMarkdown(report);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe-interno-${report.domain}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categoriesWithIssues = report.categories.filter(c => c.issues.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><ClipboardList size={18} /> Informe interno (equipo)</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {report.domain} · Score: {report.score}/100 · {report.totalIssues} aspecto{report.totalIssues !== 1 ? 's' : ''} a mejorar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
              {([
                { id: 'detalle',  icon: <Eye size={12} />,      label: 'Detalle técnico' },
                { id: 'markdown', icon: <FileCode size={12} />, label: 'Exportar' },
              ] as const).map(t => (
                <button key={t.id} onClick={() => setMode(t.id)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-1 ${mode === t.id ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg transition text-zinc-400">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto">

          {mode === 'detalle' && (
            <div className="p-6 space-y-5">
              {categoriesWithIssues.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-12">Sin errores ni avisos detectados — nada que mejorar por ahora.</p>
              ) : categoriesWithIssues.map(cat => (
                <div key={cat.id} className="border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 bg-zinc-800/50 border-b border-zinc-800 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{cat.label}</h3>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-zinc-500">{cat.scorePercent}% correcto</span>
                      {cat.failCount > 0 && <span className="text-red-400 flex items-center gap-1"><XCircle size={11} /> {cat.failCount}</span>}
                      {cat.warnCount > 0 && <span className="text-yellow-400 flex items-center gap-1"><AlertTriangle size={11} /> {cat.warnCount}</span>}
                    </div>
                  </div>
                  <div className="divide-y divide-zinc-800/60">
                    {cat.issues.map(issue => (
                      <div key={issue.checkId} className="px-5 py-4 space-y-2">
                        <div className="flex items-start gap-2">
                          {issue.status === 'fail'
                            ? <XCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                            : <AlertTriangle size={15} className="text-yellow-400 flex-shrink-0 mt-0.5" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white">{issue.label}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">{issue.detail}</p>
                          </div>
                          {issue.value !== null && issue.value !== undefined && issue.value !== '' && (
                            <span className="text-xs text-zinc-300 font-mono bg-zinc-800/60 border border-zinc-700/50 rounded px-2 py-1 flex-shrink-0 max-w-[35%] truncate" title={String(issue.value)}>
                              {String(issue.value)}
                            </span>
                          )}
                        </div>
                        {issue.fix && (
                          <p className="text-xs text-zinc-400 flex items-start gap-1.5 pl-[23px]">
                            <Lightbulb size={12} className="text-blue-400 flex-shrink-0 mt-0.5" /> {issue.fix}
                          </p>
                        )}
                        {issue.example && (
                          <div className="pl-[23px]">
                            <p className="text-xs text-zinc-500 flex items-center gap-1.5 mb-1"><Code2 size={12} /> Ejemplo</p>
                            <pre className="text-xs text-emerald-300 font-mono bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 whitespace-pre-wrap break-words">{issue.example}</pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {mode === 'markdown' && (
            <div className="flex flex-col h-full p-6 gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-400">Versión en texto/Markdown — para pegar en un ticket, Notion o Slack interno</p>
                <div className="flex gap-2">
                  <button onClick={handleCopy}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition">
                    {copied ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar</>}
                  </button>
                  <button onClick={handleDownload}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition">
                    <Download size={13} /> Descargar .md
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                value={markdown}
                className="flex-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-xs text-zinc-300 font-mono resize-none focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
