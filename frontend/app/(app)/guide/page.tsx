'use client';

import { useState } from 'react';
import { ChevronDown, Search, Database, Settings, BarChart3, Zap, Mail, MessageCircle, Lightbulb, CheckCircle, Timer, BookOpen, HelpCircle, Eye, Download, Trash2, Pencil, MapPin, Phone, Target } from 'lucide-react';

type Section = 'start' | 'prospector' | 'leads' | 'modal' | 'admin' | 'dashboard' | 'variables' | 'faq';

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState<Section>('start');

  const sections = {
    start: {
      title: 'Inicio Rápido',
      icon: Zap,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">¿Qué es IO-Prospector?</h3>
            <p className="text-zinc-300 mb-4">
              Una plataforma completa para buscar negocios en Google, analizar su SEO técnico, extraer datos de Google My Business y enviar campañas personalizadas de Email/WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Search size={18} className="text-blue-400" />
                <span className="font-semibold">Prospector</span>
              </div>
              <p className="text-sm text-zinc-400">Busca negocios en Google e identifica oportunidades SEO</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database size={18} className="text-green-400" />
                <span className="font-semibold">Leads</span>
              </div>
              <p className="text-sm text-zinc-400">Gestiona tus leads con detalles completos y contacta</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Settings size={18} className="text-purple-400" />
                <span className="font-semibold">Admin</span>
              </div>
              <p className="text-sm text-zinc-400">Configura plantillas y gestiona prospecciones</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={18} className="text-yellow-400" />
                <span className="font-semibold">Dashboard</span>
              </div>
              <p className="text-sm text-zinc-400">Métricas y estadísticas de tu actividad</p>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-200">
              <span className="flex items-start gap-1.5"><Lightbulb size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" /><span><strong>Consejo:</strong> Comienza en Prospector para buscar negocios, luego gestiona los leads en Leads, configura plantillas en Admin y analiza métricas en Dashboard.</span></span>
            </p>
          </div>
        </div>
      ),
    },

    prospector: {
      title: 'Prospector — Buscar Negocios',
      icon: Search,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Paso 1: Seleccionar Categoría</h3>
            <p className="text-zinc-300 mb-3">Elige una categoría principal (Abogados, Fontaneros, etc.) y subcategoría.</p>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm">
              <p className="flex items-center gap-1.5"><CheckCircle size={13} className="text-green-400" /> Categoría: Servicios Profesionales</p>
              <p className="flex items-center gap-1.5"><CheckCircle size={13} className="text-green-400" /> Subcategoría: Abogados</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Paso 2: Seleccionar Ubicación</h3>
            <p className="text-zinc-300 mb-3">Elige la región geográfica donde buscar.</p>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm space-y-2">
              <p className="flex items-center gap-1.5"><CheckCircle size={13} className="text-green-400" /> Comunidad Autónoma: Andalucía</p>
              <p className="flex items-center gap-1.5"><CheckCircle size={13} className="text-green-400" /> Provincia: Sevilla</p>
              <p className="flex items-center gap-1.5"><CheckCircle size={13} className="text-green-400" /> Municipio: Sevilla (capital)</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Paso 3: Rango de Búsqueda</h3>
            <p className="text-zinc-300 mb-3">Selecciona de qué páginas de Google extraer resultados (pág. 2-5 es recomendado).</p>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm">
              <p className="flex items-center gap-1.5"><BarChart3 size={13} className="text-blue-400" /> Páginas 2 → 5 = ~40 resultados a analizar (<Timer size={12} className="inline" /> ~4-6 minutos)</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Paso 4: Iniciar Búsqueda</h3>
            <p className="text-zinc-300 mb-3">Haz click en "Iniciar prospección" y espera a que termine.</p>
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 text-sm">
              <p className="text-green-200 flex items-center gap-1.5"><CheckCircle size={13} className="text-green-400" /> El sistema:
              <ul className="mt-2 space-y-1 ml-4">
                <li>• Scrapeará los resultados de Google</li>
                <li>• Analizará SEO de cada sitio</li>
                <li>• Extraerá datos de Google My Business</li>
                <li>• Guardará los leads en la BD</li>
              </ul>
              </p>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-200">
              <span className="flex items-center gap-1.5"><Timer size={13} className="text-yellow-400 flex-shrink-0" /> <span><strong>Tiempo:</strong> Aproximadamente 2-3 minutos por búsqueda.</span></span>
            </p>
          </div>
        </div>
      ),
    },

    leads: {
      title: 'Leads — Gestionar Contactos',
      icon: Database,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Tabla de Leads</h3>
            <p className="text-zinc-300 mb-3">Aquí ves todos los negocios encontrados con información rápida:</p>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-2 text-sm">
              <div><strong>Negocio:</strong> Nombre y website</div>
              <div><strong>Email:</strong> Email del negocio (si disponible)</div>
              <div><strong>Teléfono:</strong> Teléfono (si disponible)</div>
              <div><strong>Rating SEO:</strong> Score de 0-100</div>
              <div><strong>Rating GMB:</strong> Estrellas en Google Maps</div>
              <div><strong>Estado:</strong> Último contacto y plantilla usada</div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Acciones por Lead</h3>
            <div className="grid gap-3">
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Eye size={16} className="text-purple-400" />
                  <span className="font-semibold">Ver Ficha Completa</span>
                </div>
                <p className="text-sm text-zinc-400">Abre modal con todos los detalles del lead (editable)</p>
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Mail size={16} className="text-blue-400" />
                  <span className="font-semibold">Enviar Email</span>
                </div>
                <p className="text-sm text-zinc-400">Selecciona plantilla y envía email personalizado</p>
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle size={16} className="text-green-400" />
                  <span className="font-semibold">Enviar WhatsApp</span>
                </div>
                <p className="text-sm text-zinc-400">Envía mensaje de WhatsApp con plantilla</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Historial de Envíos</h3>
            <p className="text-zinc-300 mb-3">Tab "Historial" muestra todos los emails/WhatsApp enviados:</p>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-green-400 flex-shrink-0" /> Filtrar por tipo (Email/WhatsApp)</li>
              <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-green-400 flex-shrink-0" /> Filtrar por estado (Enviado, Error, Pendiente)</li>
              <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-green-400 flex-shrink-0" /> Ver plantilla usada</li>
              <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-green-400 flex-shrink-0" /> Fecha exacta del envío</li>
            </ul>
          </div>
        </div>
      ),
    },

    modal: {
      title: 'Ficha Completa del Lead',
      icon: Database,
      content: (
        <div className="space-y-6">
          <p className="text-zinc-300">Al clickear "Ver Ficha" se abre un modal con toda la información del lead, dividida en secciones:</p>

          <div className="space-y-3">
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-1.5"><MapPin size={14} /> Información General</h4>
              <p className="text-sm text-zinc-400">Nombre, website, ciudad, categoría</p>
            </div>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-1.5"><Phone size={14} /> Contacto (Editable)</h4>
              <p className="text-sm text-zinc-400">Email y teléfono — puedes editar si falta info</p>
            </div>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-1.5"><Search size={14} /> SEO Detectado</h4>
              <p className="text-sm text-zinc-400">Score, SSL, Mobile, Schema, broken links — datos extraídos automáticamente</p>
            </div>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-1.5"><MapPin size={14} /> Google My Business</h4>
              <p className="text-sm text-zinc-400">Rating, reviews, claimed, fotos</p>
            </div>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-1.5"><Target size={14} /> Contexto Comercial (Editable)</h4>
              <p className="text-sm text-zinc-400">Competidor principal, servicios faltantes, icebreaker, notas personalizadas</p>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-200">
              <span className="flex items-start gap-1.5"><Lightbulb size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" /><span><strong>Editar:</strong> Click en "<Pencil size={12} className="inline" /> Editar" para cambiar email, teléfono, notas y contexto. Luego "Guardar Cambios".</span></span>
            </p>
          </div>
        </div>
      ),
    },

    admin: {
      title: 'Administración',
      icon: Settings,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Gestión de Plantillas</h3>
            <p className="text-zinc-300 mb-3">Crea y edita plantillas de Email/WhatsApp reutilizables:</p>
            <ul className="text-sm text-zinc-400 space-y-2">
              <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-green-400 flex-shrink-0" /> Categorías: Análisis Inicial, Prospección, Seguimiento, General</li>
              <li className="flex items-start gap-1.5"><CheckCircle size={13} className="text-green-400 flex-shrink-0 mt-0.5" /> Variables dinámicas: <code className="bg-zinc-800 px-1 py-0.5 rounded text-xs">{'{{business_name}}'}</code>, <code className="bg-zinc-800 px-1 py-0.5 rounded text-xs">{'{{audit_score}}'}</code>, <code className="bg-zinc-800 px-1 py-0.5 rounded text-xs">{'{{gmb_rating}}'}</code>, etc.</li>
              <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-green-400 flex-shrink-0" /> Vista previa en tiempo real</li>
              <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-green-400 flex-shrink-0" /> Activa/desactiva plantillas fácilmente</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Variables Disponibles</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-zinc-800 border border-zinc-700 rounded p-2">
                <p className="font-semibold text-blue-400">SEO</p>
                <p className="text-zinc-400 text-xs font-mono">{'{{audit_score}}'}, {'{{seo_gap}}'}</p>
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded p-2">
                <p className="font-semibold text-yellow-400">GMB</p>
                <p className="text-zinc-400 text-xs font-mono">{'{{gmb_rating}}'}, {'{{review_count}}'}</p>
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded p-2">
                <p className="font-semibold text-green-400">Negocio</p>
                <p className="text-zinc-400 text-xs font-mono">{'{{business_name}}'}, {'{{website}}'}</p>
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded p-2">
                <p className="font-semibold text-purple-400">Contexto</p>
                <p className="text-zinc-400 text-xs font-mono">{'{{main_competitor}}'}</p>
              </div>
            </div>
          </div>

        </div>
      ),
    },

    dashboard: {
      title: 'Dashboard — Métricas',
      icon: BarChart3,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Resumen Ejecutivo</h3>
            <p className="text-zinc-300 mb-3">Principales KPIs de tu actividad:</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                <p className="text-sm text-zinc-400">Prospecciones</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                <p className="text-sm text-zinc-400">Leads Totales</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                <p className="text-sm text-zinc-400">Última Búsqueda</p>
                <p className="text-sm font-semibold">—</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Histórico de Prospecciones</h3>
            <p className="text-zinc-300 mb-3">Tabla con todas las búsquedas realizadas:</p>
            <ul className="text-sm text-zinc-400 space-y-2">
              <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-green-400 flex-shrink-0" /> Estado (Completada, Error, En progreso)</li>
              <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-green-400 flex-shrink-0" /> Búsqueda realizada y rango de páginas</li>
              <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-green-400 flex-shrink-0" /> Ciudad/ubicación</li>
              <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-green-400 flex-shrink-0" /> Leads encontrados</li>
              <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-green-400 flex-shrink-0" /> Fecha y hora</li>
              <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-green-400 flex-shrink-0" /> Acciones por prospección completada:
                <ul className="mt-1 ml-4 space-y-1">
                  <li className="flex items-center gap-1.5"><Eye size={12} className="flex-shrink-0" /> <strong>Ver:</strong> Abre dashboard detallado en backend</li>
                  <li className="flex items-center gap-1.5"><Download size={12} className="flex-shrink-0" /> <strong>CSV:</strong> Descarga resultados en CSV</li>
                  <li className="flex items-center gap-1.5"><Trash2 size={12} className="flex-shrink-0 text-red-400" /> <strong>Eliminar:</strong> Borra prospección + todos sus leads (confirmación requerida)</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      ),
    },

    variables: {
      title: 'Variables de Plantillas',
      icon: Mail,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Variables SEO</h3>
            <div className="space-y-2 text-sm">
              <div className="bg-zinc-800 border border-zinc-700 rounded p-2">
                <p className="font-mono text-blue-400">{'{{audit_score}}'}</p>
                <p className="text-zinc-400">Puntuación de auditoría (0-100)</p>
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded p-2">
                <p className="font-mono text-blue-400">{'{{seo_gap}}'}</p>
                <p className="text-zinc-400">Error principal detectado</p>
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded p-2">
                <p className="font-mono text-blue-400">{'{{ssl_active}}'}</p>
                <p className="text-zinc-400">¿Tiene SSL? (sí/no)</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Variables GMB</h3>
            <div className="space-y-2 text-sm">
              <div className="bg-zinc-800 border border-zinc-700 rounded p-2">
                <p className="font-mono text-yellow-400">{'{{gmb_rating}}'}</p>
                <p className="text-zinc-400">Rating en Google Maps (0-5 estrellas)</p>
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded p-2">
                <p className="font-mono text-yellow-400">{'{{review_count}}'}</p>
                <p className="text-zinc-400">Número de reseñas</p>
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded p-2">
                <p className="font-mono text-yellow-400">{'{{gmb_claimed}}'}</p>
                <p className="text-zinc-400">¿Reclamado? (sí/no)</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Variables de Negocio</h3>
            <div className="space-y-2 text-sm">
              <div className="bg-zinc-800 border border-zinc-700 rounded p-2">
                <p className="font-mono text-green-400">{'{{business_name}}'}</p>
                <p className="text-zinc-400">Nombre del negocio</p>
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded p-2">
                <p className="font-mono text-green-400">{'{{website}}'}</p>
                <p className="text-zinc-400">Sitio web</p>
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded p-2">
                <p className="font-mono text-green-400">{'{{main_competitor}}'}</p>
                <p className="text-zinc-400">Competidor principal</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    faq: {
      title: 'Preguntas Frecuentes',
      icon: MessageCircle,
      content: (
        <div className="space-y-4">
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <p className="font-semibold mb-2">¿Cuánto tarda una prospección?</p>
            <p className="text-sm text-zinc-400">Aproximadamente 2-3 minutos por búsqueda (depende del rango de páginas).</p>
          </div>

          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <p className="font-semibold mb-2">¿Se pueden editar los datos del lead?</p>
            <p className="text-sm text-zinc-400">Sí, en el modal de ficha completa. Haz click en "<Pencil size={12} className="inline" /> Editar" para cambiar email, teléfono, contexto, notas, etc.</p>
          </div>

          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <p className="font-semibold mb-2">¿Qué pasa si no aparece el email/teléfono?</p>
            <p className="text-sm text-zinc-400">El scraper intenta extraerlo automáticamente. Si no aparece, puedes agregarlo manualmente en la ficha del lead.</p>
          </div>

          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <p className="font-semibold mb-2">¿Cómo funcionan las variables de plantillas?</p>
            <p className="text-sm text-zinc-400">Se reemplazan automáticamente con datos reales del lead. Ej: <code className="bg-zinc-900 px-1 py-0.5 rounded text-xs font-mono">{'{{business_name}}'}</code> → "Clínica Veterinaria Torres".</p>
          </div>

          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <p className="font-semibold mb-2">¿Se pueden eliminar prospecciones?</p>
            <p className="text-sm text-zinc-400">Sí, en Dashboard → Acciones (columna roja "<Trash2 size={12} className="inline text-red-400" /> Eliminar"). Se requiere confirmación y se elimina la sesión con TODOS sus leads asociados (irreversible).</p>
          </div>

          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <p className="font-semibold mb-2">¿Dónde se guardan los emails/WhatsApp enviados?</p>
            <p className="text-sm text-zinc-400">En Leads → Historial. Muestra tipo, estado, plantilla usada y fecha exacta de envío.</p>
          </div>
        </div>
      ),
    },
  };

  const sectionKeys = Object.keys(sections) as Section[];
  const currentContent = sections[activeSection];
  const CurrentIcon = currentContent.icon;

  return (
    <div className="space-y-6 fade-in max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><BookOpen size={22} className="text-white" /> Guía de Uso</h1>
        <p className="text-zinc-400">Documentación completa de IO-Prospector</p>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {sectionKeys.map(key => {
          const section = sections[key];
          const Icon = section.icon;
          const isActive = activeSection === key;
          return (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{section.title.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <CurrentIcon size={32} className="text-blue-400" />
          <h2 className="text-2xl font-bold">{currentContent.title}</h2>
        </div>

        <div className="space-y-4">
          {currentContent.content}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-sm text-zinc-400">
        <p>
          Para más detalles técnicos, consulta la documentación en <code className="bg-zinc-900 px-2 py-1 rounded">INSTRUCCIONES-IO-PROSPECTO.md</code>
        </p>
      </div>
    </div>
  );
}
