'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search, BarChart3, Settings, Database, Zap,
  ClipboardList, Activity, Users, BookOpen, SlidersHorizontal, Code, Wrench, ChevronDown
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'Prospección',
    items: [
      { href: '/prospector',              icon: Search,             label: 'Prospector',   desc: 'Buscar & scrapear' },
      { href: '/prospecciones-historico', icon: BarChart3,          label: 'Histórico',    desc: 'Sectores ya scrapeados' },
      { href: '/config',                  icon: SlidersHorizontal,  label: 'Configuración',desc: 'Sectores, exclusiones, API' },
    ]
  },
  {
    title: 'Audit SEO',
    items: [
      { href: '/auditoria',         icon: Activity,           label: 'Auditoría',         desc: 'Analizar cualquier URL' },
      { href: '/audit-resultados',  icon: ClipboardList,      label: 'Resultados',        desc: 'Revisar & guardar como lead' },
      { href: '/audit-historico',   icon: BarChart3,          label: 'Histórico',         desc: 'Resultados por cliente' },
      { href: '/audit-config',      icon: SlidersHorizontal,  label: 'Configuración',     desc: 'Checks, pesos, umbrales' },
    ],
    subsections: [
      {
        title: 'HERRAMIENTAS',
        items: [
          { href: '/schema-analyzer-pro',   icon: Wrench, label: 'Schema.org PRO',  desc: 'Análisis avanzado (30+ tipos)' },
        ]
      }
    ]
  },
  {
    title: 'CRM',
    items: [
      { href: '/dashboard',       icon: BarChart3,         label: 'Dashboard',  desc: 'Métricas y análisis' },
      { href: '/leads',           icon: Database,          label: 'Leads',      desc: 'Leads de prospección y auditoría' },
      { href: '/crm/plantillas',  icon: ClipboardList,     label: 'Plantillas', desc: 'Email y WhatsApp' },
    ]
  },
  {
    title: 'Admin',
    items: [
      { href: '/admin',  icon: Users,    label: 'Usuarios',      desc: 'Gestión de accesos (próximo)' },
      { href: '/config', icon: Settings, label: 'Configuración', desc: 'Sectores, exclusiones, API' },
    ]
  },
  {
    title: 'Ayuda',
    items: [
      { href: '/guide', icon: BookOpen, label: 'Guía', desc: 'Instrucciones de uso' },
    ]
  },
];

export function Sidebar() {
  const path = usePathname() || '';

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-zinc-900 border-r border-zinc-800 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">IO Prospector</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Iorana Digital</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={section.title} className={idx > 0 ? 'mt-4' : ''}>
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest px-2 mb-1.5">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {/* Items principales */}
              {section.items.map(({ href, icon: Icon, label, desc }) => {
                const active = path === href || (href !== '/admin' && path.startsWith(href + '/'));
                return (
                  <Link
                    key={`${href}-${label}`}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      active
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    }`}
                  >
                    <Icon size={15} strokeWidth={active ? 2 : 1.5} className="flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{label}</p>
                      <p className="text-[11px] text-zinc-500 truncate">{desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Subsecciones */}
            {section.subsections && section.subsections.map((subsection) => (
              <div key={subsection.title} className="mt-3 ml-2">
                <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-2 mb-1">
                  {subsection.title}
                </p>
                <div className="space-y-0.5 border-l border-zinc-700/50 ml-3 pl-3">
                  {subsection.items.map(({ href, icon: Icon, label, desc }) => {
                    const active = path === href || (href !== '/admin' && path.startsWith(href + '/'));
                    return (
                      <Link
                        key={`${href}-${label}`}
                        href={href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                          active
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                        }`}
                      >
                        <Icon size={14} strokeWidth={active ? 2 : 1.5} className="flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-xs">{label}</p>
                          <p className="text-[10px] text-zinc-600 truncate">{desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {idx < NAV_SECTIONS.length - 1 && (
              <div className="mt-4 border-t border-zinc-800/60" />
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-zinc-800">
        <p className="text-[11px] text-zinc-600">v1.0.0 · Local</p>
      </div>
    </aside>
  );
}
