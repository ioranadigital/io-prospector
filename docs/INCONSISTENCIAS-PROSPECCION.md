# Inconsistencias del flujo de Prospección

> Verificación realizada el 2026-06-06 (código + datos reales en Supabase).
> Acompaña a `FLUJO-PROSPECCION.md`.

Leyenda severidad: 🔴 Alta · 🟠 Media · 🟡 Baja.

---

## ✅ Estado tras corrección (2026-06-06)

| # | Tema | Estado | Qué se hizo |
|---|------|--------|-------------|
| 1 | Flujo v1 huérfano | ✅ Resuelto | Eliminado `/resultados` (página y enlace), `search.routes.js`, `prospector.service.js`, desmontado `/api/search`, borrados métodos v1 de `api.ts` y el código muerto del Prospector |
| 2 | `source` / audit→lead | ✅ Resuelto | Añadida columna `source` a `io_pro_leads` (+ backfill); audit inserta `source:'audit'`; orquestador `source:'prospector'` |
| 3 | Doble destino resultados | ✅ Resuelto | Quitado el botón "Resultados" del panel de prospección |
| 4 | Mojibake | ✅ Resuelto (display) | Util compartido `lib/text.ts` aplicado en tabla Prospector, CRM e histórico. ⏳ Origen (guardado) pendiente |
| 5 | `status` no canónico | ✅ Resuelto | Eliminado el escritor `'pending'` (era `/resultados`). Quedan `candidate` → `active` |
| 6 | Origen por `session_id` | ✅ Resuelto | Las pestañas de Leads usan ahora la columna `source` |
| 7 | "Guardar prospección" | ↔️ Sin cambios | Se mantiene (no molesta; ya estaba aclarado) |

> Backfill: los 29 leads existentes quedaron como `source='prospector'` (todos venían de scraping).
> Detalle original de cada punto abajo.

---

## 🔴 1. Flujo "v1" huérfano (código y página muertos)

Coexisten **dos** motores de prospección:

| | v2 (activo) | v1 (huérfano) |
|---|---|---|
| Endpoint | `POST /api/scraping/start` | `POST /api/search/start` |
| Servicio | `prospector-v2.service.js` | `prospector.service.js` |
| Escribe en | CSV → `io_pro_leads` | `io_pro_scraping_raw` |
| Lo dispara | `api.startProspection` (Prospector) | `api.startSearch` → **nadie lo llama** |

**Evidencia:** `api.startSearch` no tiene ningún uso en el frontend. Tablas `io_pro_scraping_raw` y `io_pro_results_pending` = **0 filas**.

**Impacto:** La página **`/resultados`** (menú Prospección ▸ Resultados) lee `io_pro_scraping_raw` → **siempre está vacía**. Y en el Prospector hay código muerto asociado: `handleImportFromScraping`, estados `scrapingRaw` / `selectedScrapingIds` / `importingRaw`, y el botón/Link **"Resultados"** del panel de prospección completada.

**Recomendación:** decidir y limpiar. O bien (a) **eliminar v1** (quitar `/resultados` del menú o reusarla, borrar `search.routes /search/start`, `prospector.service.js`, el import-from-scraping del Prospector, y las tablas `io_pro_scraping_raw` / `io_pro_results_pending`); o (b) reconectar v1 si se quería un paso de "revisión" intermedio. Hoy es ruido.

---

## 🔴 2. "Guardar como Lead" del Audit está roto

`audit-resultados/page.tsx` (`handleSaveAsLead`) inserta en `io_pro_leads` el campo **`source: 'audit_seo'`**, pero la columna **`source` no existe** (`42703: column io_pro_leads.source does not exist`).

**Impacto:** crear un lead desde una auditoría **falla**. En consecuencia, la pestaña **"Auditoría"** de `/leads` (que se define como `session_id IS NULL`) no se llena por esa vía.

**Recomendación:** o **añadir** la columna `source text` a `io_pro_leads` (y usarla como origen real), o **quitar** `source` del insert. Recomendado: añadir `source` y usarla para las pestañas (ver punto 6).

---

## 🟠 3. Doble "destino de resultados" en el Prospector

Tras completar una prospección, la UI ofrece a la vez:
- ✅ La tabla **"Resultados del scraping — selecciona los interesantes"** (activa, candidatos → "Enviar a Leads").
- ❌ Un botón **"Resultados"** que lleva a `/resultados` (vacío, flujo v1).

**Impacto:** confunde sobre dónde están los resultados.
**Recomendación:** quitar el botón "Resultados" (y el import-from-scraping) al limpiar el punto 1.

---

## 🟠 4. Mojibake corregido en una sola página

Datos antiguos tienen doble-codificación UTF-8 (`AlmerÃ­a`, `PeluquerÃ­a`). Solo **`prospecciones-historico`** aplica `fixMojibake`. La **tabla del Prospector** y **`/leads`** muestran el texto crudo.

**Recomendación:** mejor arreglar el **origen** (que el scraper guarde UTF-8 correcto en `io_pro_search_sessions` / `io_pro_leads`). Como parche, extraer `fixMojibake` a un util compartido y aplicarlo en todas las tablas.

---

## 🟠 5. Semántica de `status` no canónica

Valores de `io_pro_leads.status` según quién escribe:
- Orquestador (scraping): `'candidate'`
- Promover a Leads: `'active'`
- `/resultados` → Guardar en Leads (v1): `'pending'`
- Filtro de `/leads`: muestra todo **excepto** `'candidate'`

**Impacto:** funciona por casualidad (cualquier valor ≠ candidate se ve), pero no hay un conjunto de estados definido; un futuro cambio puede romperlo.
**Recomendación:** definir estados canónicos (p. ej. `candidate` → `active`) y documentarlos; normalizar los inserts.

---

## 🟡 6. Origen del lead inferido por `session_id`

`/leads` define **Prospector** = `session_id != null` y **Auditoría** = `session_id == null`. Pero los leads subidos por **CSV** (`CsvUploader`) también tienen `session_id null` → se mostrarían como "Auditoría".

**Recomendación:** usar una columna explícita **`source`** (`prospector` | `audit` | `csv`) en lugar de inferir por `session_id` (encaja con el punto 2).

---

## 🟡 7. "Guardar prospección" casi redundante

Desde que el backend **auto-crea** la sesión en `io_pro_search_sessions` al arrancar (`executeProspectionAsync`), el botón manual "Guardar prospección" solo hace un upsert de lo mismo.

**Recomendación:** mantenerlo como "marcar/renombrar" o retirarlo para simplificar.

---

## Resumen de acciones sugeridas (orden de impacto)

1. Arreglar **#2** (columna `source` o quitar el campo) — desbloquea audit→lead.
2. Limpiar **#1/#3** (eliminar flujo v1 y `/resultados` o reusarla).
3. Unificar **#4** (mojibake) y **#5/#6** (estados y origen).
