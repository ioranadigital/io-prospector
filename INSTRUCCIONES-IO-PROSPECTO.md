# 📊 IO-PROSPECTOR — Manual de Uso y Configuración

**Herramienta SEO de prospección y automatización de contactos para Iorana Digital**

---

## 🎯 ¿Qué es IO-Prospector?

Una plataforma completa para:
1. **Buscar negocios** en Google Maps + Google Search
2. **Analizar SEO técnico** automáticamente (audit scores, SSL, mobile, schema, etc.)
3. **Extraer datos GMB** (Google My Business) — ratings, reviews, fotos
4. **Gestionar leads** con modal de detalles completo
5. **Enviar campañas** de Email y WhatsApp personalizadas
6. **Administrar plantillas** de mensajes con variables dinámicas
7. **Rastrear actividades** de contacto

---

## 🚀 Inicio Rápido

### Requisitos
- **Node.js** 18+
- **PostgreSQL** 14+ (via Supabase)
- **Supabase CLI** instalado
- **n8n** (opcional, para envíos reales de Email/WhatsApp)

### 1️⃣ Configurar Variables de Entorno

Crear `.env.local` en la raíz del proyecto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# N8n (opcional)
N8N_WEBHOOK_SEND_EMAIL=https://your-n8n.com/webhook/send-email
N8N_WEBHOOK_SEND_WHATSAPP=https://your-n8n.com/webhook/send-whatsapp

# Claude API (para generar icebreakers automáticos)
CLAUDE_API_KEY=sk-proj-...
```

### 2️⃣ Inicializar Base de Datos

```bash
# Crear tablas y estructura
supabase db push

# O ejecutar SQL manualmente en Supabase:
# 1. Schema principal: schema-io_prosp.sql
# 2. Plantillas iniciales: setup-plantillas-analisis.sql
```

### 3️⃣ Instalar y Ejecutar

```bash
# Frontend (Next.js)
cd frontend
npm install
npm run dev
# Acceder en http://localhost:3000

# Backend (Edge Functions en Supabase)
# Las funciones se despliegan automáticamente al hacer: supabase functions deploy
```

---

## 📋 Estructura del Proyecto

```
io-prospector/
├── frontend/                    # Next.js 16 + TypeScript
│   ├── app/
│   │   ├── admin/              # Gestión de plantillas y prospecciones
│   │   ├── prospector/         # Motor de búsqueda (Google scraping)
│   │   ├── leads/              # Tabla de leads y detalles
│   │   └── dashboard/          # Métricas históricas
│   └── components/
│       ├── leads/              # LeadsTable, LeadDetailModal, SendModal
│       ├── templates/          # TemplatesAdmin
│       ├── prospections/       # ProspectionsAdmin
│       ├── activities/         # ActivitiesTable
│       └── layout/             # Sidebar, navigation
├── supabase/
│   └── functions/
│       ├── send-email/         # Edge Function para enviar emails
│       └── send-whatsapp/      # Edge Function para enviar WhatsApp
├── schema-io_prosp.sql         # Tablas principales
└── setup-plantillas-analisis.sql  # Plantillas iniciales
```

---

## 📊 Flujo de Uso Principal

### Fase 1: Buscar Negocios (🔍 Prospector)

1. **Ir a** `/prospector`
2. **Seleccionar**:
   - Categoría (ej: Abogados, Fontaneros, etc.)
   - Comunidad Autónoma, Provincia, Municipio
   - Rango de páginas de Google (ej: 2-5)
3. **Iniciar búsqueda** — El sistema:
   - Scraper Google Search con Playwright
   - Obtiene URLs de negocios
   - Analiza cada sitio (SEO, SSL, Mobile, Schema)
   - Extrae datos GMB automáticamente
4. **Resultados** aparecen en tabla con:
   - Nombre negocio + web
   - Rating SEO (audit_score/100)
   - Rating GMB (stars)
   - Estado contacto

### Fase 2: Gestionar Leads (📊 Leads)

1. **Ir a** `/leads`
2. **Tabla muestra**:
   - Negocio y website
   - Email y teléfono
   - Rating SEO y GMB
   - Último contacto + plantilla usada
3. **Acciones por lead**:
   - 👁️ **Ver ficha completa** — Abre LeadDetailModal
   - 📧 **Enviar Email** — Selecciona plantilla y envía
   - 💬 **Enviar WhatsApp** — Envía vía WhatsApp

### Fase 3: Detalles del Lead (Modal)

En el modal completo puedes:
- **Ver**: Nombre, web, ciudad, categoría
- **Editar**: Email, teléfono
- **Revisar SEO**: Score, SSL, Mobile, Schema, broken links
- **Revisar GMB**: Rating, reviews, claimed, fotos
- **Actualizar contexto**: Competidor principal, servicios faltantes, icebreaker, notas
- **Contactar**: Botones de Email y WhatsApp

### Fase 4: Administrar Plantillas (⚙️ Admin)

1. **Ir a** `/admin`
2. **Sección de Plantillas**:
   - Ver por categoría (Análisis Inicial, Prospección, Seguimiento, General)
   - Filtrar por tipo (Email/WhatsApp)
   - Crear/editar con variables disponibles
3. **Variables disponibles** en plantillas:
   - **Negocio**: `{{business_name}}`, `{{website}}`
   - **SEO**: `{{audit_score}}`, `{{seo_gap}}`, `{{issue_count}}`
   - **GMB**: `{{gmb_rating}}`, `{{review_count}}`, `{{gmb_claimed}}`, `{{photo_count}}`
   - **Contexto**: `{{main_competitor}}`, `{{missing_service}}`

### Fase 5: Limpiar Prospecciones (Admin)

En `/admin` → **Prospecciones Guardadas**:
- Listar todas las búsquedas realizadas
- Ver leads encontrados por sesión
- **Eliminar prospecciones de prueba** (borra sesión + leads asociados)

### Fase 6: Rastrear Actividades (📋 Historial)

En `/leads` → Tab **Historial**:
- Ver todos los emails/WhatsApp enviados
- Filtrar por tipo y estado (Enviado, Error, Pendiente)
- Plantilla usada para cada envío
- Fecha y hora exacta

---

## 🔧 Configuración Avanzada

### Variables de Plantilla

#### Tipos SEO
```
{{audit_score}}        → "85" (0-100)
{{seo_gap}}            → "No tiene HTTPS, SSL activo"
{{issue_count}}        → "12"
{{ssl_active}}         → "sí/no"
{{is_mobile_responsive}} → "sí/no"
{{has_schema}}         → "sí/no"
{{broken_links_count}} → "5"
```

#### Tipos GMB
```
{{gmb_rating}}         → "4.5" (0-5)
{{review_count}}       → "23"
{{gmb_claimed}}        → "sí/no"
{{photo_count}}        → "12"
{{gmb_status}}         → "4.5/5 ⭐ (23 reseñas)"
```

#### Contexto Comercial
```
{{business_name}}      → "Clínica Veterinaria Torres"
{{website}}            → "veterinaria.com"
{{main_competitor}}    → "Clínica Pets Plus"
{{missing_service}}    → "No tiene blog"
{{icebreaker}}         → Frase personalizada (generada automáticamente)
```

### Crear Plantilla de Email

**Ejemplo: Análisis SEO Técnico**

```
Asunto: {{business_name}} — Análisis SEO Gratuito 📊

Hola {{business_name}},

Hicimos un análisis técnico de {{website}} y encontramos:

⚠️ PROBLEMAS DETECTADOS:
{{seo_gap}}

📈 DATOS ACTUALES:
- Score SEO: {{audit_score}}/100
- SSL: {{ssl_active}}
- Mobile-friendly: {{is_mobile_responsive}}
- Schema: {{has_schema}}

💡 OPORTUNIDAD:
Mejorando estos puntos, {{main_competitor}} estaría muy por debajo de ti.

¿Quieres una propuesta sin compromiso?

Saludos,
Equipo Iorana
```

### Crear Plantilla de WhatsApp

**Ejemplo: GMB Urgencia**

```
Hola {{business_name}} 👋

Tu Google Maps: {{gmb_status}}
{{main_competitor}}: 4.8/5 ⭐

La diferencia = pierdes clientes.

¿15 min? Te muestro cómo mejorar 📍
```

---

## 🗄️ Tablas Principales

### `io_prosp_leads`
Cada negocio encontrado con:
- Datos básicos: `business_name`, `website`, `city`, `category`, `email`, `phone`
- SEO: `audit_score`, `seo_gap`, `ssl_active`, `is_mobile_responsive`, `has_schema`, `broken_links_count`
- GMB: `gmb_rating`, `review_count`, `gmb_claimed`, `photo_count`
- Comercial: `main_competitor`, `missing_service`, `icebreaker`, `notes`
- Estado: `crm_status`, `priority`, `last_contact_at`

### `io_prosp_message_templates`
Plantillas de contacto:
- `type`: 'email' | 'whatsapp'
- `category`: 'ANALISIS INICIAL' | 'PROSPECCIÓN' | 'SEGUIMIENTO' | 'GENERAL'
- `name`: Nombre de la plantilla
- `subject`: Para emails (null en WhatsApp)
- `body`: Contenido con variables {{}}
- `is_active`: Filtrar plantillas activas

### `io_prosp_lead_activities`
Historial de contactos:
- `lead_id`: Referencia al lead
- `type`: 'email' | 'whatsapp' | 'call'
- `outcome`: 'sent' | 'failed' | 'pending'
- `metadata`: {template_name, template_id, variables}
- `created_at`: Timestamp

### `io_prosp_search_sessions`
Histórico de búsquedas:
- `query`: Término buscado
- `city`, `category`: Ubicación y tipo
- `pages_from`, `pages_to`: Rango de Google
- `status`: 'completed' | 'in_progress' | 'failed'
- `total_found`: Leads encontrados
- `created_at`: Fecha búsqueda

---

## 🚨 Troubleshooting

### **"No hay leads en la tabla"**
- ✅ Verifica que `io_prosp_leads` tiene datos
- ✅ Comprueba el filtro de sesión (session_id)
- ✅ Ejecuta una búsqueda nueva en `/prospector`

### **"Las plantillas no aparecen"**
- ✅ Ve a `/admin` y verifica que haya plantillas creadas
- ✅ Comprueba que `is_active = true`
- ✅ Asegúrate de que el `type` coincide (email vs whatsapp)

### **"Envío falla con 'Template not found'"**
- ✅ Verifica que el `templateId` existe en DB
- ✅ Comprueba que la plantilla es del tipo correcto

### **"Los emails/WhatsApp se quedan en 'Pendiente'"**
- ✅ Si n8n NO está configurado: los envíos quedan en Mock (console.log)
- ✅ Configura `N8N_WEBHOOK_*` en `.env` para envíos reales
- ✅ Comprueba logs del backend: `supabase functions logs`

### **"Las variables no se reemplazan"**
- ✅ Verifica sintaxis: `{{variable_name}}` (dobles llaves)
- ✅ Comprueba que el lead tiene datos para esa variable
- ✅ Si está vacío, se reemplaza por string vacío

### **"GMB no extrae datos"**
- ✅ El scraper requiere conexión a Google Maps
- ✅ Si falla, se guardan null (pero lead se crea igual)
- ✅ Campos de GMB pueden editarse manualmente en modal

---

## 🔐 Seguridad

### Variables de Entorno Sensibles
- `SUPABASE_SERVICE_ROLE_KEY`: **NUNCA** en repo
- `CLAUDE_API_KEY`: Guardar en `.env.local`
- `N8N_WEBHOOK_*`: URLs internas, usar HTTPS

### Permisos en Supabase
- Habilitar **RLS** (Row Level Security) en tablas
- API Keys con permisos limitados solo lectura si es posible
- Service Role Key solo en Edge Functions

---

## 📈 Métricas y Reporting

**Dashboard** (`/dashboard`):
- Total prospecciones realizadas
- Total leads acumulados
- Última búsqueda
- Tabla histórica con acciones (descargar CSV, ver dashboard detallado)

**Tabla de Actividades** (`/leads` → Historial):
- Filtrar por tipo (Email/WhatsApp)
- Filtrar por estado (Enviado, Error, Pendiente)
- Ver plantilla usada para cada envío
- Fecha exacta del contacto

---

## 🎨 Personalización UI

### Colores principales (Tailwind v4)
- Primary: Blue (`bg-blue-600`)
- Success: Green (`bg-green-600`)
- Error: Red (`bg-red-600`)
- Warning: Yellow (`bg-yellow-600`)
- Background: Zinc-950/900/800

### Componentes reutilizables
- `LeadsTable` — Tabla filtrable de leads
- `LeadDetailModal` — Panel completo de lead
- `SendModal` — Selector de plantilla y vista previa
- `ActivitiesTable` — Historial de contactos
- `TemplatesAdmin` — Gestor de plantillas
- `ProspectionsAdmin` — Gestor de prospecciones

---

## 📞 Soporte y Contacto

**Problemas técnicos**: Revisa `schema-io_prosp.sql` y ejecuta migraciones
**Bugs en UI**: Comprueba browser console (F12)
**Edge Functions**: `supabase functions logs send-email`

---

## 📝 Versión

- **v1.0.0** — Sistema completo de prospección SEO
- Última actualización: 2026-05-04
