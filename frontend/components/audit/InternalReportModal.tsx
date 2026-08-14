'use client';
import { useState } from 'react';
import { X, ClipboardList, FileCode, Eye, Copy, Check, Download, XCircle, AlertTriangle, CheckCircle, Info, Lightbulb, Code2, Printer, FileType } from 'lucide-react';
import { InternalReport, internalReportToMarkdown, internalReportToHtml, getScoreLabel } from '@/lib/audit-internal-report';

interface InternalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: InternalReport;
}

const STATUS_STYLE: Record<string, { icon: React.FC<any>; color: string }> = {
  fail: { icon: XCircle,       color: 'text-red-700 dark:text-red-400' },
  warn: { icon: AlertTriangle, color: 'text-yellow-700 dark:text-yellow-400' },
  info: { icon: Info,          color: 'text-blue-700 dark:text-blue-400' },
  pass: { icon: CheckCircle,   color: 'text-green-700 dark:text-green-400' },
};

export function InternalReportModal({ isOpen, onClose, report }: InternalReportModalProps) {
  const [mode, setMode] = useState<'detalle' | 'exportar'>('detalle');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const markdown = internalReportToMarkdown(report);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadWord = () => {
    const html = internalReportToHtml(report);
    const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe-interno-${report.domain}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    const html = internalReportToHtml(report);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.onload = () => win.print();
    // Fallback si onload no dispara (contenido ya cargado por document.write)
    setTimeout(() => win.print(), 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-4xl h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2"><ClipboardList size={18} /> Informe interno (equipo)</h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-0.5">
              {report.domain} · Score: {report.score}/100 · {report.totalIssues} aspecto{report.totalIssues !== 1 ? 's' : ''} a mejorar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
              {([
                { id: 'detalle',  icon: <Eye size={12} />,      label: 'Detalle técnico' },
                { id: 'exportar', icon: <FileCode size={12} />, label: 'Exportar' },
              ] as const).map(t => (
                <button key={t.id} onClick={() => setMode(t.id)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-1 ${mode === t.id ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition text-zinc-500 dark:text-zinc-400">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto">

          {mode === 'detalle' && (
            <div className="p-6 space-y-5">
              {/* Score + Resultados + Core Web Vitals — mismos datos que en /audit-resultados */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <p className="text-3xl font-bold text-zinc-900 dark:text-white">{report.score}<span className="text-sm text-zinc-600 dark:text-zinc-500">/100</span></p>
                  <p className="text-xs font-semibold mt-1" style={{ color: getScoreLabel(report.score).color }}>{getScoreLabel(report.score).label}</p>
                  {report.duration !== null && <p className="text-[11px] text-zinc-600 dark:text-zinc-500 mt-1">{report.duration}ms</p>}
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-xl p-4">
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-500 uppercase tracking-wider font-semibold mb-2">Resultados</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center justify-between"><span className="text-zinc-500 dark:text-zinc-400">Correctos</span><span className="font-bold text-green-700 dark:text-green-400">{report.summary.pass}</span></div>
                    <div className="flex items-center justify-between"><span className="text-zinc-500 dark:text-zinc-400">Avisos</span><span className="font-bold text-yellow-700 dark:text-yellow-400">{report.summary.warn}</span></div>
                    <div className="flex items-center justify-between"><span className="text-zinc-500 dark:text-zinc-400">Errores</span><span className="font-bold text-red-700 dark:text-red-400">{report.summary.fail}</span></div>
                  </div>
                </div>
                <div className="col-span-2 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-xl p-4">
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-500 uppercase tracking-wider font-semibold mb-2">Core Web Vitals</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2"><span className="text-zinc-600 dark:text-zinc-500 font-mono">TTFB <span className="text-zinc-400 dark:text-zinc-600">(Time to First Byte)</span></span><span className="font-bold text-zinc-900 dark:text-white flex-shrink-0">{report.performance?.ttfb ?? '—'}ms</span></div>
                    <div className="flex items-center justify-between gap-2"><span className="text-zinc-600 dark:text-zinc-500 font-mono">FCP <span className="text-zinc-400 dark:text-zinc-600">(First Contentful Paint)</span></span><span className="font-bold text-zinc-900 dark:text-white flex-shrink-0">{report.performance?.fcp ?? '—'}s</span></div>
                    <div className="flex items-center justify-between gap-2"><span className="text-zinc-600 dark:text-zinc-500 font-mono">LCP <span className="text-zinc-400 dark:text-zinc-600">(Largest Contentful Paint)</span></span><span className="font-bold text-zinc-900 dark:text-white flex-shrink-0">{report.performance?.lcp ?? '—'}s</span></div>
                    <div className="flex items-center justify-between gap-2"><span className="text-zinc-600 dark:text-zinc-500 font-mono">CLS <span className="text-zinc-400 dark:text-zinc-600">(Cumulative Layout Shift)</span></span><span className="font-bold text-zinc-900 dark:text-white flex-shrink-0">{report.performance?.cls ?? '—'}</span></div>
                  </div>
                </div>
              </div>

              {report.categories.map(cat => (
                <div key={cat.id} className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 bg-zinc-100 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{cat.label}</h3>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-zinc-600 dark:text-zinc-500">{cat.scorePercent}% correcto</span>
                      {cat.failCount > 0 && <span className="text-red-700 dark:text-red-400 flex items-center gap-1"><XCircle size={11} /> {cat.failCount}</span>}
                      {cat.warnCount > 0 && <span className="text-yellow-700 dark:text-yellow-400 flex items-center gap-1"><AlertTriangle size={11} /> {cat.warnCount}</span>}
                      <span className="text-green-700 dark:text-green-400 flex items-center gap-1"><CheckCircle size={11} /> {cat.passCount}</span>
                    </div>
                  </div>
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                    {cat.checks.map(check => {
                      const { icon: Icon, color } = STATUS_STYLE[check.status];
                      return (
                        <div key={check.checkId} className="px-5 py-4 space-y-2">
                          <div className="flex items-start gap-2">
                            <Icon size={15} className={`${color} flex-shrink-0 mt-0.5`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{check.label}</p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{check.detail}</p>
                            </div>
                            {check.value !== null && check.value !== undefined && check.value !== '' && typeof check.value !== 'boolean' && (
                              <span className="text-xs text-zinc-700 dark:text-zinc-300 font-mono bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700/50 rounded px-2 py-1 flex-shrink-0 max-w-[35%] truncate" title={String(check.value)}>
                                {String(check.value)}
                              </span>
                            )}
                          </div>
                          {check.fix && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-1.5 pl-[23px]">
                              <Lightbulb size={12} className="text-blue-700 dark:text-blue-400 flex-shrink-0 mt-0.5" /> {check.fix}
                            </p>
                          )}
                          {check.example && (
                            <div className="pl-[23px]">
                              <p className="text-xs text-zinc-600 dark:text-zinc-500 flex items-center gap-1.5 mb-1"><Code2 size={12} /> Ejemplo</p>
                              <pre className="text-xs text-emerald-700 dark:text-emerald-300 font-mono bg-black/40 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 whitespace-pre-wrap break-words">{check.example}</pre>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {mode === 'exportar' && (
            <div className="flex flex-col h-full p-6 gap-6">
              <div className="grid grid-cols-3 gap-3">
                <button onClick={handlePrintPdf}
                  className="flex flex-col items-center gap-2 px-4 py-5 bg-red-50 dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800/50 hover:border-red-600 rounded-xl transition text-center">
                  <Printer size={22} className="text-red-700 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">Imprimir / Guardar PDF</span>
                  <span className="text-[11px] text-zinc-600 dark:text-zinc-500">Abre el informe maquetado y usa "Guardar como PDF" del navegador</span>
                </button>
                <button onClick={handleDownloadWord}
                  className="flex flex-col items-center gap-2 px-4 py-5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 hover:border-blue-600 rounded-xl transition text-center">
                  <FileType size={22} className="text-blue-700 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Descargar Word (.doc)</span>
                  <span className="text-[11px] text-zinc-600 dark:text-zinc-500">Documento editable, listo para abrir en Microsoft Word</span>
                </button>
                <button onClick={handleCopyMarkdown}
                  className="flex flex-col items-center gap-2 px-4 py-5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 rounded-xl transition text-center">
                  {copied ? <Check size={22} className="text-zinc-900 dark:text-white" /> : <Copy size={22} className="text-zinc-700 dark:text-zinc-300" />}
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">{copied ? 'Copiado' : 'Copiar como Markdown'}</span>
                  <span className="text-[11px] text-zinc-600 dark:text-zinc-500">Para pegar en un ticket, Notion o Slack interno</span>
                </button>
              </div>
              <div className="flex-1 flex flex-col gap-2 min-h-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-zinc-600 dark:text-zinc-500 uppercase tracking-wider font-semibold">Vista previa Markdown</p>
                  <button onClick={() => {
                    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `informe-interno-${report.domain}.md`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }} className="text-xs text-zinc-600 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1">
                    <Download size={12} /> Descargar .md
                  </button>
                </div>
                <textarea
                  readOnly
                  value={markdown}
                  className="flex-1 w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300 font-mono resize-none focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
