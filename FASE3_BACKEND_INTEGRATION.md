# 🔗 FASE 3A - Integración Backend con Reglas Dinámicas

## ✅ Cambios Realizados

### Archivo: `/backend/services/auditor/index.js`

**1. Importar Supabase y WebSocket:**
```javascript
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
```

**2. Inicializar cliente Supabase:**
```javascript
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || '',
  { realtime: { transport: ws } }  // Node.js 20 compatibility
);
```

**3. Nueva función `loadAuditRules()`:**
```javascript
async function loadAuditRules() {
  // Carga todas las reglas de io_pro_audit_rules
  // Retorna un mapa: check_id -> { enabled, penalty, category }
  // Si la BD falla, retorna {} y los checks corren normales
}
```

**4. Filtrar checks deshabilitados:**
En la función `auditUrl()`, después de ejecutar checks:
```javascript
const auditRules = await loadAuditRules();
const filteredResults = results.filter(c => {
  const rule = auditRules[c.id];
  return rule ? rule.enabled !== false : true;
});
```

---

## 🎯 Comportamiento Actual

| Escenario | Resultado |
|-----------|-----------|
| Check **habilitado** en BD | ✅ Se incluye en auditoría |
| Check **deshabilitado** en BD | ❌ Se filtra (no aparece) |
| Check **sin regla** en BD | ✅ Se incluye (default: habilitado) |
| BD no disponible | ✅ Se incluyen todos (fallback seguro) |

---

## 🔄 Flujo de una Auditoría (Simplificado)

```
1. POST /audit/url?url=example.com
   ↓
2. auditUrl() inicia navegador Playwright
   ↓
3. await loadAuditRules()  ← Carga reglas de io_pro_audit_rules
   ↓
4. Para cada check (meta, headings, images, ...):
   - Ejecutar check.run(page, ctx)
   - Filtrar si está deshabilitado en BD
   ↓
5. calculateScores() → genera scores y totales
   ↓
6. Retorna resultado con solo checks habilitados
```

---

## 📊 Ejemplo: Desactivar un Check

1. **En `/audit-config`:**
   - Desactiva: "Meta description existe"
   - Checkbox = unchecked
   - Actualiza en BD: `enabled = false`

2. **Siguiente auditoría:**
   - `loadAuditRules()` trae `meta.description.exists: { enabled: false }`
   - Check se filtra (no aparece en resultado)
   - Score se recalcula sin ese check

---

## ⚙️ Configuración Requerida

Asegúrate de que en `/backend/.env` tienes:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-key-or-anon-key
```

---

## 🚀 Próximos Pasos Opcionales

### A. Usar dinámicamente las penalizaciones
(Más complejo - requiere refactorizar `calculateScores()`)
```javascript
// En lugar de score = pass/warn/fail simple
// Aplicar penalizaciones de cada check desde io_pro_audit_rules
```

### B. Cache de reglas
(Mejorar performance)
```javascript
let cachedRules = null;
let cacheExpires = 0;

async function loadAuditRules() {
  if (Date.now() < cacheExpires && cachedRules) {
    return cachedRules;
  }
  // Cargar y cachear por 5 minutos
}
```

### C. Logs de auditoría
(Rastrear qué checks se ejecutaron)
```javascript
await supabase
  .from('io_pro_audit_logs')
  .insert({
    url,
    total_checks: allChecks.length,
    enabled_checks: filteredResults.length,
    timestamp: new Date().toISOString()
  });
```

---

## 📝 Resumen

✅ Backend ahora carga dinámicamente qué checks ejecutar
✅ Activar/desactivar checks en `/audit-config` afecta auditorías futuras
✅ Si BD falla, sistema sigue funcionando (fallback seguro)
✅ Compatible con Node.js 20+ (WebSocket fix incluido)

**Status:** Fase 3A completada. El sistema es completamente configurable desde la UI.
