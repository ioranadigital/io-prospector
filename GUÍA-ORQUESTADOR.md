# 🎯 GUÍA: ORQUESTADOR DE PROSPECCIÓN LOCAL

**Bienvenido.** Este es tu nuevo flujo para procesar leads, generar dashboards y crear campañas de correo personalizadas — TODO OFFLINE.

---

## 📍 ESTRUCTURA NUEVA

```
E:\git\io-prospector\
│
├── backend/scripts/                    ← TUS HERRAMIENTAS (aquí estamos)
│   ├── orchestrator.js                 ← El comando principal (lo único que necesitas)
│   ├── csv-processor.js
│   ├── lead-analyzer.js
│   ├── dashboard-generator.js
│   ├── email-generator.js
│   ├── README.md                       ← Docs técnica
│   ├── example-leads.csv               ← Plantilla de CSV
│   └── package.json (actualizado)
│
├── dashboards/                         ← OUTPUT (se crea automático)
│   ├── prospection-2026-05-03.md       ← Tu dashboard
│   └── emails-2026-05-03.csv           ← Emails listos para enviar
│
└── E:\Prospector-Data\                 ← INPUT (tú creas esto)
    └── 2026-05\
        └── leads.csv                   ← Tu CSV original
```

---

## 🚀 QUICK START (3 pasos)

### **Paso 1: Preparar tu CSV**

Coloca tu CSV en `E:\Prospector-Data\<fecha>\leads.csv` con esta estructura:

| Company_Name | First_Name | Email | Website | Phone | GMB_Rating | Review_Count | GMB_Claimed | Has_Website | SSL_Active | Main_Competitor | Missing_Service | Icebreaker | SEO_Gap |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Fontanería García | Carlos | carlos@email.com | https://... | +34... | 3.8 | 42 | Sí | Sí | No | Fontanería López | Servicios 24h | Foto resuelta | Tarda 8s en cargar |

**👉 Plantilla disponible:** `backend/scripts/example-leads.csv`

### **Paso 2: Instalar dependencias (solo la primera vez)**

```bash
cd E:\git\io-prospector\backend
npm install
```

### **Paso 3: Ejecutar orquestador**

```bash
cd E:\git\io-prospector\backend\scripts
node orchestrator.js "E:\Prospector-Data\2026-05\leads.csv"
```

**Output:**
```
📋 Iniciando prospección...
📖 Leyendo CSV...
   ✓ 20 registros procesados

🔍 Analizando urgencia...
   ✓ Análisis completado

📊 Generando Dashboard...
   ✓ Guardado en: E:\git\io-prospector\dashboards\prospection-2026-05-03.md

📧 Generando correos...
   ✓ 18 emails generados

✅ PROSPECCIÓN COMPLETADA
═══════════════════════════════════════════════════
📊 Dashboard:          E:\git\io-prospector\dashboards\prospection-2026-05-03.md
📧 Emails (CSV):       E:\git\io-prospector\dashboards\emails-2026-05-03.csv
📈 Total leads:        20
🔴 Prioridad Alta:     7
🟠 Prioridad Media:    9
🟡 Prioridad Baja:     4
═══════════════════════════════════════════════════
```

---

## 📊 QUÉ RECIBES

### **1. Dashboard (Markdown)**

Abre `dashboards/prospection-YYYY-MM-DD.md` en tu navegador o editor.

**Contiene:**
- ✅ Resumen ejecutivo (totales, porcentajes)
- ✅ Gráfico ASCII de problemas más comunes
- ✅ Tabla de TOP leads por prioridad (alta → baja)
- ✅ Análisis de reputación en Google Maps
- ✅ Desglose por tipo de campaña
- ✅ Próximos pasos recomendados

**Ejemplo:**
```markdown
# 📊 DASHBOARD DE PROSPECCIÓN

## 📈 RESUMEN EJECUTIVO
| Métrica | Valor | % |
| Total leads | 247 | 100% |
| 🔴 Prioridad Alta | 89 | 36% |
| 🟠 Prioridad Media | 104 | 42% |
| 🟡 Prioridad Baja | 54 | 22% |

## 🔍 PROBLEMAS MÁS COMUNES
Sin GMB reclamado ████████████████ 124
Sin HTTPS ████████ 52
Reputación baja ██████ 38
...
```

### **2. Correos Personalizados (CSV)**

Abre `dashboards/emails-YYYY-MM-DD.csv` en Excel o Google Sheets.

**Columnas:**
- `To` — Email del lead
- `Subject` — Asunto personalizado por campaña
- `Campaign` — Tipo (web_design, ssl_upgrade, gmb_claim, reputation, optimization)
- `Priority` — HIGH / MEDIUM / LOW
- `Status` — pending (listo para enviar)

**Ejemplo de asunto generado automáticamente:**
```
🔴 "Fontanería García — Aumenta clientes con web profesional" → web_design
🟠 "⚠️ Restaurant El Pulpo — Tu web NO es segura (HTTPS)" → ssl_upgrade
📍 "Restaurant El Pulpo — Reclama tu perfil en Google Maps" → gmb_claim
⭐ "Electricista Domínguez — Mejora tu reputación online" → reputation
```

---

## 🎯 CLASIFICACIÓN POR URGENCIA

El sistema clasifica automáticamente cada lead:

### 🔴 **PRIORIDAD ALTA** (urgency_score 50-100)
- ❌ Sin GMB reclamado → **+40 pts**
- ❌ Sin página web → **+40 pts**
- ❌ Sin HTTPS → **+25 pts**
- ❌ Reputación < 4⭐ → **+25 pts**

**Acción:** Campaña inmediata

### 🟠 **PRIORIDAD MEDIA** (urgency_score 25-50)
- ⚠️ Sin reseñas (pero con GMB) → **+10 pts**
- ⚠️ Servicio no optimizado → **+10 pts**

**Acción:** Campaña secundaria o nutrición

### 🟡 **PRIORIDAD BAJA** (urgency_score < 25)
- ℹ️ Pocos problemas detectados

**Acción:** Seguimiento posterior

---

## 📧 CAMPAÑAS AUTOMÁTICAS

El sistema crea **correos contextualizados** según el tipo de problema:

| Tipo | Gancho | Cuerpo | CTA |
|------|--------|--------|-----|
| **web_design** | "Sin web pierdes 40% de clientes" | Importancia de presencia web | "Agendar demo de web" |
| **ssl_upgrade** | "Google te penaliza sin HTTPS" | Seguridad + ranking | "Agendar instalación" |
| **gmb_claim** | "Apareces pero sin control" | Ventajas de GMB oficial | "Agendar reclamación" |
| **reputation** | "Rating bajo pierde clientes" | Gestión de reseñas | "Agendar revisión" |
| **optimization** | "Comprador te está ganando" | SEO local mejorable | "Agendar auditoría" |

### Personalización en el email:
✅ Nombre del propietario  
✅ Nombre de la empresa  
✅ Competidor que lo está ganando  
✅ Servicio específico sin optimizar  
✅ "Icebreaker" personal (si está en CSV)  
✅ Problema técnico detectado  

---

## 🛠️ FLUJO DE ENVÍO RECOMENDADO

```
1️⃣ Lee dashboard → Identifica TOP 10 leads de prioridad ALTA
   ↓
2️⃣ Abre emails.csv → Personaliza si quieres (opcional)
   ↓
3️⃣ Envía escalonado:
   - Día 1: Leads 1-20
   - Día 2: Leads 21-40
   - Día 3: Leads 41-60
   (máx 20/día para evitar spam filters)
   ↓
4️⃣ Monitoriza respuestas
   ↓
5️⃣ Si tasa baja, ajusta asuntos y vuelve a correr script
```

---

## 📋 COLUMNAS ESPERADAS EN TU CSV

### Obligatorias:
- `Company_Name` (string)
- `Email` (string válido)
- `Phone` (string)

### Recomendadas:
- `First_Name` — Nombre del owner
- `Website` — URL (con https://)
- `GMB_Rating` — Nota 0-5
- `Review_Count` — Cantidad de reseñas
- `GMB_Claimed` — Sí/No
- `Has_Website` — Sí/No
- `SSL_Active` — Sí/No

### Personalización (para emails más efectivos):
- `Main_Competitor` — "Fontanería López"
- `Missing_Service` — "Servicios de urgencia 24h"
- `Icebreaker` — "He visto la foto del apagón resuelto"
- `SEO_Gap` — "Tu web tarda 8 segundos en cargar"

---

## ⚙️ OPCIONES AVANZADAS

### Cambiar directorio de output
```bash
node orchestrator.js "E:\Prospector-Data\2026-05\leads.csv" --output-dir "E:\Mis-Dashboards"
```

### Ver JSON procesado
```bash
node csv-processor.js "E:\Prospector-Data\2026-05\leads.csv"
```

### Modificar puntos de urgencia
Edita `lead-analyzer.js`:
```javascript
if (!lead.gmb_claimed) urgency_score += 40; // ← Cambiar aquí (ej: +50)
```

---

## 🐛 Troubleshooting

| Error | Causa | Solución |
|-------|-------|----------|
| "Archivo no encontrado" | Ruta incorrecta | Usa ruta absoluta: `E:\Prospector-Data\...` |
| "csv-parse not found" | Dependencias no instaladas | `npm install` en `/backend` |
| Dashboard vacío | CSV sin datos | Verifica que el CSV tiene al menos 1 fila de datos |
| Emails sin asunto | Falta `campaign_type` | Revisa que leads tengan problemas detectados |
| Nombres truncados | Espacios en blanco | CSV parser normaliza auto, pero revisa formato |

---

## 📞 PRÓXIMAS MEJORAS

- [ ] Generador de videos de prospección (Loom)
- [ ] Integración con n8n para envío automático
- [ ] Dashboard interactivo (HTML con filtros)
- [ ] Analytics de respuestas (tracking links)
- [ ] A/B testing de asuntos

---

## 📞 SOPORTE

**Ruta de archivos:**
```
Backend scripts: E:\git\io-prospector\backend\scripts\
Documentación:  E:\git\io-prospector\backend\scripts\README.md
Dashboards:     E:\git\io-prospector\dashboards\
```

**Comandos útiles:**
```bash
# Listar scripts
ls E:\git\io-prospector\backend\scripts\

# Ver ejemplo CSV
cat E:\git\io-prospector\backend\scripts\example-leads.csv

# Verificar instalación
npm list csv-parse
```

---

## ✅ RESUMEN

**Tu nuevo flujo es:**
1. Prepara CSV en `E:\Prospector-Data\<fecha>\`
2. Ejecuta: `node orchestrator.js "ruta-csv"`
3. Lee dashboard en `dashboards/prospection-YYYY-MM-DD.md`
4. Envía emails desde `dashboards/emails-YYYY-MM-DD.csv`
5. Monitoriza respuestas y optimiza

**Todo offline. Todo tuyo. Todo rápido.** 🚀

---

*Creado para Iorana Digital | SEO Local*  
*v1.0.0 | Mayo 2026*
