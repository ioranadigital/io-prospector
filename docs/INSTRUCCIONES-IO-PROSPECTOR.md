# IO Prospector — Flujo de la aplicación

---

## Flujo actual de io-prospector

---

### 🔍 PROSPECCIÓN (búsqueda de leads)

```
1. /prospector
   → Configura búsqueda (sector, ciudad, palabras clave)
   → Lanza scraping

2. /resultados
   → Revisa resultados del scraping
   → Valida cuáles te interesan
   → Guarda los seleccionados como leads

3. CRM > Leads (/leads)
   → Gestiona todos los leads
   → Filtra, busca, cambia estado
   → Envía email o WhatsApp desde aquí

4. /dashboard
   → Histórico de prospecciones
   → Estadísticas globales
```

---

### 🔎 AUDIT SEO (análisis de webs)

```
1. /auditoria
   → Introduce URL
   → Selecciona qué bloques auditar (5 bloques temáticos)
   → Lanza auditoría
   → Redirige automáticamente a /audit-resultados

2. /audit-resultados  ← STAGING (no guarda nada automáticamente)
   → Ve el resultado completo:
      • Score con círculo de color
      • Core Web Vitals (TTFB, FCP, LCP, CLS)
      • Problemas críticos resumidos
      • Análisis por categoría expandible

   → Decide qué hacer:
      ┌─────────────────────────────────────┐
      │ 📋 Guardar en Histórico             │
      │    Solo registro. No crea lead.     │
      │                                     │
      │ 👤 Guardar como Lead                │
      │    Crea lead en CRM + histórico     │
      │                                     │
      │ 📄 Informe para el cliente          │
      │    Vista previa HTML profesional    │
      │    Email HTML compatible Gmail      │
      │    WhatsApp (+ IA cuando se active) │
      │                                     │
      │ ✉️  Enviar por Email                │
      │ 💬 Enviar por WhatsApp              │
      │                                     │
      │ ← Descartar (sin guardar)           │
      └─────────────────────────────────────┘

3. /audit-history
   → Histórico agrupado por dominio/cliente
   → Cada dominio expandible con todas sus auditorías
   → Score promedio por dominio
   → Borrar auditorías individuales o por dominio

4. /audit-config
   → Configura los 85 checks (5 bloques)
   → Activa/desactiva reglas
   → Ajusta penalizaciones
```

---

### 📬 CRM

```
CRM > Leads (/leads)
   → Todos los leads (de prospección + de auditorías)
   → Source visible: "prospector" vs "audit_seo"
   → Enviar email o WhatsApp

CRM > Plantillas (/crm/plantillas)
   → Gestiona plantillas de email y WhatsApp
   → Variables dinámicas ({{business_name}}, {{audit_score}}...)
   → Editor a pantalla completa con preview lado a lado
```

---

### ⚙️ CONFIGURACIÓN

```
/config
   → Categorías/sectores de prospección
   → Exclusiones globales de búsqueda

/audit-config
   → Reglas de auditoría SEO (85 checks en 5 bloques)
```

---

### 🗂 ESTRUCTURA DEL SIDEBAR

```
Prospección
  ├── Prospector        /prospector
  ├── Resultados        /resultados
  ├── Dashboard         /dashboard
  └── Configuración     /config

Audit SEO
  ├── Auditoría         /auditoria
  ├── Resultados        /audit-resultados
  ├── Histórico         /audit-history
  └── Configuración     /audit-config

CRM
  ├── Leads             /leads
  └── Plantillas        /crm/plantillas

Admin
  └── Usuarios          /admin

Ayuda
  └── Guía              /guide
```

---

### 🛠 STACK TÉCNICO

```
Frontend:  Next.js (puerto 3002)
Backend:   Node.js + Express (puerto 4000)
Database:  Supabase (PostgreSQL)
Auth:      Supabase Auth
Email:     Gmail SMTP
WhatsApp:  API configurada en backend
IA:        Claude API (Anthropic) — opcional, activar con ANTHROPIC_API_KEY
```

---

### 🤖 IA — Informe cliente con Claude

El botón **"Mejorar con IA"** en `/audit-resultados > Informe cliente > WhatsApp` usa Claude Haiku para generar un mensaje persuasivo y personalizado basado en los resultados de la auditoría.

**Sin API key:** el botón aparece desactivado y se usa el texto estático generado automáticamente.

**Para activar:** añadir al `.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

---

### 📋 TABLAS SUPABASE RELEVANTES

```
io_pro_leads              → Leads del CRM
io_pro_audit_rules        → 85 checks de auditoría SEO
io_pro_audit_logs         → Histórico de auditorías
io_pro_audits             → Resultados completos de auditorías
io_pro_message_templates  → Plantillas de email y WhatsApp
io_pro_global_exclude_terms → Términos excluidos de prospección
```

---

*Última actualización: 2026-06-04*
