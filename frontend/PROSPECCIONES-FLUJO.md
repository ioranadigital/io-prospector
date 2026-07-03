# 📋 Flujo de Prospecciones Guardadas

## ¿Cómo se guardan las prospecciones?

El sistema tiene un flujo de guardado **manual y explícito** para mantener control total sobre qué prospecciones se guardan.

---

## 🔄 Proceso Completo

### 1️⃣ **Ejecutar Prospección** (`🔍 Prospector`)
```
Ir a /prospector
↓
Seleccionar categoría + ubicación + rango de páginas
↓
Click "Iniciar prospección"
↓
Sistema scrapeea Google y analiza SEO
↓
⏳ Prospección en progreso...
```

### 2️⃣ **Prospección Completada**
```
✅ Se muestra resumen con:
  - Leads encontrados
  - Botón "Guardar"
  - Botón "Descargar CSV"
  - Botón "Ver Dashboard"
  - Botón "Descargar Emails"
```

### 3️⃣ **Guardar Prospección** (PASO CRÍTICO)
```
Click botón "Guardar"
↓
Se guarda en Supabase: io_prosp_search_sessions
↓
Datos guardados:
  - id (session_id único)
  - query (término buscado)
  - city (municipio)
  - category (categoría)
  - pages_from, pages_to (rango)
  - status ("completed")
  - total_found (# de leads)
  - created_at, updated_at (timestamps)
↓
✅ Toast: "Prospección guardada en admin"
```

### 4️⃣ **Ver Prospecciones Guardadas** (`📋 Histórico`)
```
Ir a /historico
↓
ProspectionsAdmin muestra tabla con:
  - Búsqueda realizada
  - Ciudad
  - Categoría
  - Leads encontrados
  - Fecha creación
  - Status (Completada/Error/En progreso)
  - Botón Actualizar
  - Botón Eliminar (con confirmación)
```

### 5️⃣ **Eliminar Prospección** (si es de prueba)
```
Click botón "Eliminar"
↓
Confirmación: "¿Eliminar prospección X?"
↓
Doble confirmación: "Se borrarán también todos sus leads"
↓
DELETE io_prosp_search_sessions WHERE id = session_id
DELETE io_prosp_leads WHERE session_id = session_id
↓
✅ Toast: "Prospección eliminada completamente"
```

---

## 📊 Vista General: Dónde Aparecen

| Página | Qué se ve | Qué se puede hacer |
|--------|-----------|-------------------|
| 🔍 **Prospector** | Búsqueda en progreso, resultado, historial local | Ejecutar búsqueda, Guardar prospección |
| 📋 **Histórico** | Tabla de prospecciones guardadas | Ver, Actualizar lista, Eliminar |
| 📈 **Dashboard** | Métricas de búsquedas locales (API) | Ver histórico API |
| ⚙️ **Admin** | Plantillas de email/whatsapp | Crear, editar, activar plantillas |

---

## 🗄️ Tabla: `io_prosp_search_sessions`

```sql
CREATE TABLE io_prosp_search_sessions (
  id TEXT PRIMARY KEY,
  query TEXT NOT NULL,
  city TEXT NOT NULL,
  category TEXT,
  pages_from INTEGER,
  pages_to INTEGER,
  status TEXT,              -- 'completed', 'in_progress', 'failed'
  total_found INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 💾 Función de Guardado

**Ubicación**: `frontend/lib/prospections.ts`

```typescript
export async function saveProspectionToSupabase(prospection: {
  id: string;
  query: string;
  city: string;
  category?: string;
  pages_from: number;
  pages_to: number;
  status: 'completed' | 'in_progress' | 'failed';
  total_found: number;
})
```

**Usa UPSERT**: Si la prospección ya existe, la actualiza. Si no, la crea.

---

## 🎯 Casos de Uso

### Caso 1: Guardar una prospección completada
```
1. Ejecutar búsqueda en /prospector
2. Ver resultado ✅ Prospección completada
3. Click "Guardar"
4. Ir a /historico → ver prospección guardada
5. Desde /historico → administrar/eliminar
```

### Caso 2: Eliminar prospecciones de prueba
```
1. Ir a /historico
2. Ver lista de prospecciones guardadas
3. Click "Eliminar" en la que quieras borrar
4. Confirmar dos veces
5. Prospección + todos sus leads = BORRADOS
```

### Caso 3: Actualizar lista de prospecciones
```
1. Ir a /historico
2. Click botón "Actualizar"
3. Refrescará la tabla desde Supabase
4. Verá cambios nuevos
```

---

## ⚠️ Notas Importantes

1. **Manual vs Automático**: 
   - ❌ Las prospecciones NO se guardan automáticamente
   - ✅ Debes hacer click "Guardar" explícitamente
   - ✅ Esto te da control total: guardar solo las que importan

2. **Dos Sistemas de Histórico**:
   - **Prospector**: Histórico local (API backend)
   - **Histórico**: Prospecciones en Supabase (persistentes)

3. **Eliminación Cascada**:
   - Si eliminas una prospección → se borran TODOS sus leads
   - ⚠️ No se puede deshacer (no hay papelera)

4. **Leads vs Prospecciones**:
   - Una **prospección** = una búsqueda (1 session)
   - Pueden haber **múltiples leads** por prospección
   - Leads se ven en `/leads` (tabla global)
   - Prospecciones se ven en `/historico` (historial de búsquedas)

---

## 🔗 Flujo Visual

```
┌─────────────────┐
│    Prospector   │
│   Ejecutar búsqueda
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Prospección Completada  │
│  - CSV                  │
│  - Dashboard            │
│  - Guardar ⭐ IMPORTANTE
└────────┬────────────────┘
         │ (click Guardar)
         ▼
┌──────────────────────────────┐
│  Supabase: io_prosp_sessions │
│  (Prospección guardada)      │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────┐
│  /historico      │
│  - Ver tabla     │
│  - Actualizar    │
│  - Eliminar ⚠️   │
└──────────────────┘
```

---

## 📞 Troubleshooting

### "No aparece en Histórico después de Guardar"
- ✅ Refreshea la página (`F5`)
- ✅ Click botón "Actualizar" en /historico
- ✅ Verifica en Supabase dashboard que exista el registro

### "No puedo eliminar una prospección"
- ✅ Comprueba que exista (visible en tabla)
- ✅ Intenta refrescar primero
- ✅ Revisa permisos en Supabase RLS

### "Guardé pero no veo los leads"
- ✅ Los leads se guardan automáticamente (en `io_prosp_leads`)
- ✅ Ve a `/leads` para ver TODOS los leads
- ✅ Los leads NO se asocian automáticamente a la prospección guardada

---

## 🚀 Próximas Mejoras

- [ ] Auto-guardar prospecciones completadas
- [ ] Vincular leads con prospección guardada
- [ ] Búsqueda/filtrado en histórico
- [ ] Exportar prospecciones como CSV
- [ ] Papelera con 30 días de retención
