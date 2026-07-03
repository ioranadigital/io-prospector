# Flujo de Prospección — IO Prospector

> Resumen de cómo funciona el apartado de **Prospección** (scraping de negocios) y conversión a Leads.
> Fecha: 2026-06-06 · Puertos: frontend `3004`, backend `4006`.

---

## 1. Resumen en una frase

El usuario lanza una **búsqueda por sector + ubicación** → el backend **scrapea** Google y audita cada web → los resultados se guardan como **candidatos** → el usuario **selecciona** los interesantes y los **promueve** a la sección **Leads**.

---

## 2. Flujo paso a paso (el activo)

```
[Prospector UI]                [Backend]                         [Supabase]
/prospector
  │  elige Categoría▸Subcategoría (SECTORS), CCAA▸Provincia▸Municipio, nº páginas
  │  api.startProspection() ───► POST /api/scraping/start
  │                                 │ valida (Zod) + genera UUID
  │                                 │ crea estado en memoria (prospectionStateService)
  │                                 │ responde { sessionId }
  │  ◄─ sessionId                   │ executeProspectionAsync() (en background):
  │                                 │   1) upsert sesión ───────────► io_pro_search_sessions (status:running)
  │  polling /scraping/status/:id   │   2) startProspectionV2() → scraping → CSV en disco
  │                                 │   3) orchestrateProspection(csv):
  │                                 │        - analiza + genera dashboard.md + emails.csv
  │                                 │        - inserta leads ───────► io_pro_leads (status:'candidate')
  │                                 │   4) update sesión ───────────► io_pro_search_sessions (status:completed,total_found)
  │  status=completed
  │  getLeads({session_id}) ──────► GET /api/leads?session_id=…  ◄── io_pro_leads (incluye candidatos)
  │
  ▼
[Tabla "Resultados del scraping — selecciona los interesantes"]
  │  checkbox 1 a 1  → "Enviar N a Leads"
  │  update status:'active' ──────────────────────────────────────► io_pro_leads
  ▼
[/leads · pestaña "Prospector"]  → muestra leads con session_id y status≠candidate
```

### Botón "Guardar prospección"
Guarda/actualiza la **sesión** (no los leads) en `io_pro_search_sessions` vía `/api/config/prospections/save` (upsert). Es visible en el **Dashboard** y en el **Historial** del Prospector. Desde el fix de auto-creación de sesión, es prácticamente redundante (la sesión ya se crea al arrancar).

---

## 3. Páginas relacionadas

| Página | Ruta | Qué muestra |
|---|---|---|
| Prospector | `/prospector` | Lanzar scraping + tabla de candidatos + promover a Leads |
| Leads | `/leads` | CRM. Pestañas **Todos / Prospector / Auditoría**. Excluye candidatos |
| Histórico de Prospecciones | `/prospecciones-historico` | Sesiones agrupadas **Categoría▸Subcategoría▸sesión** (dedupe) |
| Dashboard | `/dashboard` | Métricas (pestaña Prospecting: sesiones, leads, top categorías/ciudades) |

---

## 4. Modelo de datos

- **`io_pro_search_sessions`** — una fila por prospección lanzada: `query, city, category, ccaa, provincia, municipio, pages_from/to, status, total_found, created_at, finished_at`.
- **`io_pro_leads`** — negocios encontrados. Campos clave para este flujo:
  - `session_id` → enlaza con la prospección (FK). **null** = no vino de scraping (auditoría / CSV).
  - `status` → `candidate` (recién scrapeado, oculto en Leads) · `active`/otros (promovido, visible).
  - `audit_score`, `audit_data`, datos de contacto, etc.
- **`io_pro_lead_activities`** — emails/whatsapp/llamadas por lead.

### Estados de un lead (origen scraping)
```
candidate  ──(Enviar a Leads)──►  active        → visible en /leads
   │
   └─ (no seleccionado) permanece como candidate (oculto de Leads, sigue ligado a su sesión)
```

---

## 5. Convenciones / decisiones

- El histórico **solo** se llena de forma controlada (no hay auto-guardado oculto desde el motor de auditoría).
- Los **candidatos** no cuentan en el Dashboard ni aparecen en Leads hasta promoverse.
- Jerarquía sector: la subcategoría se guarda en `category`; el padre se deriva de `lib/sectors.ts` (`SECTORS`).
- Codificación: hay datos antiguos con mojibake; la UI los corrige al mostrar (`decodeURIComponent(escape())`).

---

## 6. Inconsistencias detectadas y corregidas

Se auditó el flujo (ver `INCONSISTENCIAS-PROSPECCION.md`) y se corrigieron:
- Eliminado el **flujo v1 huérfano** (`/resultados`, `/api/search`, `prospector.service.js`, código muerto del Prospector).
- Arreglado **audit→lead** con la columna `source` en `io_pro_leads`.
- Origen de leads (pestañas de `/leads`) ahora por columna `source` (`prospector` | `audit`).
- Mojibake corregido en la UI vía `lib/text.ts` (origen/guardado pendiente).

Queda pendiente (menor): corregir la codificación **en el guardado** (scraper/CSV) para no depender del parche de display.
