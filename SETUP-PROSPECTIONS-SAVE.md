# 🔧 Setup: Prospecciones Guardadas

## ❌ Problema Encontrado

Cuando hacías click en "Guardar prospección", te aparecía un error. **La causa:** schema incorrecto en Supabase.

### Detalles técnicos
- **Tabla:** `io_prosp_search_sessions`
- **Problema:** La columna `id` estaba definida como `UUID` pero el backend envía un `TEXT` (string)
- **Resultado:** Supabase rechazaba el INSERT con error de tipo

---

## ✅ Solución

### Paso 1: Ejecutar SQL en Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Abre **SQL Editor** (panel izquierdo)
4. **Crea una nueva query** y copia todo el contenido de:
   ```
   setup-prospections-table.sql
   ```
5. Click **RUN** (o Ctrl+Enter)

Este script:
- ✅ Recrea la tabla con `id TEXT` (no UUID)
- ✅ Añade índices para performance
- ✅ Configura RLS policies (Row Level Security)
- ✅ Permite que usuarios autenticados inserten/lean datos

### Paso 2: Verificar en Supabase

1. Ve a **Table Editor** en Supabase
2. Busca `io_prosp_search_sessions`
3. Verifica que exista con estas columnas:
   ```
   id (Text) ✓
   query (Text) ✓
   city (Text) ✓
   category (Text) ✓
   pages_from (Int8) ✓
   pages_to (Int8) ✓
   status (Text) ✓
   total_found (Int8) ✓
   created_at (Timestamp) ✓
   updated_at (Timestamp) ✓
   ```

### Paso 3: Código Frontend (Cambios realizados)

✅ **HECHO:** Los siguientes cambios ya están implementados:

**`frontend/lib/prospections.ts`**
- Mejor manejo de errores
- Log detallado de qué se guarda
- Error message transparente al usuario

**`frontend/app/prospector/page.tsx`**
- Toast muestra el error real, no genérico
- Botón "Guardar" (línea 304-309) con color verde

**`frontend/app/historico/page.tsx`**
- Página dedicada para gestionar prospecciones guardadas
- Usando componente `ProspectionsAdmin`

---

## 🧪 Test Completo (Paso a Paso)

### Ejecutar una prospección:
1. Ve a **🔍 Prospector**
2. Selecciona categoría + ciudad + rango páginas
3. Click **"Iniciar prospección"**
4. Espera a que termine (⏳ progreso)

### Guardar:
5. Cuando veas **"✅ Prospección completada"**
6. Click en botón verde **"Guardar"**
7. Si ves ✅ "Prospección guardada en Histórico" → **FUNCIONA**

### Verificar:
8. Ve a **📋 Histórico**
9. Debes ver la prospección guardada en la tabla
10. Prueba el botón **"Actualizar"** para refrescar
11. Prueba **"Eliminar"** con una prospección de prueba

---

## 📊 Vista General: Dónde aparecen

| Página | Qué pasa |
|--------|----------|
| 🔍 **Prospector** | Ejecutas búsqueda → ves resultado → **Guardar** |
| 📋 **Histórico** | Ves todas las prospecciones guardadas |
| 📊 **Leads** | Ves todos los leads de todas las prospecciones |
| 📈 **Dashboard** | Métricas generales (histórico API) |
| ⚙️ **Admin** | Solo plantillas email/whatsapp |

---

## ⚠️ Si sigue sin funcionar

### 1️⃣ Verifica RLS en Supabase
```
Supabase → Table Editor → io_prosp_search_sessions → "RLS" tab
```
Debes ver 4 policies:
- ✅ Allow inserts for authenticated users
- ✅ Allow select for authenticated users
- ✅ Allow updates for authenticated users
- ✅ Allow deletes for authenticated users

### 2️⃣ Verifica en Console
Abre DevTools (F12) → **Console**

Cuando hagas click "Guardar", verás:
```javascript
// Cuando envías:
Guardando prospección: {id: "...", query: "...", city: "..."}

// Si funciona:
Prospección guardada exitosamente: [{...}]

// Si falla:
Error saving prospection: [el error real de Supabase]
```

### 3️⃣ Reinicia dev server
```bash
# Terminal en frontend/
npm run dev
```

### 4️⃣ Limpia localStorage
```javascript
// En Console del navegador:
localStorage.clear()
// Luego F5 para refrescar
```

---

## 🔄 Flujo Completo Visual

```
┌─────────────────┐
│  🔍 Prospector  │
│ Ejecutar búsq.  │
└────────┬────────┘
         │
         ▼
    ✅ Completada
         │
         ▼ (click Guardar)
  Supabase INSERT
    io_prosp_search_sessions
         │
         ▼
┌──────────────────┐
│ 📋 Histórico     │
│ - Ver tabla      │
│ - Actualizar     │
│ - Eliminar (⚠️)  │
└──────────────────┘
```

---

## 💾 Ficheros Afectados

- ✅ `schema-io_prosp.sql` — Actualizado (id TEXT)
- ✅ `setup-prospections-table.sql` — Nuevo (script SQL completo)
- ✅ `frontend/lib/prospections.ts` — Mejorado (mejor error handling)
- ✅ `frontend/app/prospector/page.tsx` — Actualizado (mejor toast)
- ✅ `frontend/app/historico/page.tsx` — Existente (sin cambios)
- ✅ `frontend/components/prospections/ProspectionsAdmin.tsx` — Existente (sin cambios)

---

## 🚀 Próximas Mejoras

- [ ] Auto-guardar prospecciones completadas
- [ ] Búsqueda/filtrado en histórico
- [ ] Exportar prospecciones como CSV
- [ ] Papelera con 30 días de retención
- [ ] Vincular leads con prospección guardada

---

## 📞 Soporte

Si tienes problemas:
1. Abre DevTools (F12) → Console
2. Copia el error que ves
3. Verifica en Supabase que la tabla exista
4. Revisa RLS policies (Supabase → Table → RLS tab)
