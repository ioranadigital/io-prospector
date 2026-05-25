# 🎯 ORQUESTADOR DE PROSPECCIÓN LOCAL

Sistema modular para procesar CSVs de prospección, generar Dashboards y correos personalizados.

## 📦 Scripts

### 1. **csv-processor.js** — Lectura y normalización de CSVs
```bash
node csv-processor.js <ruta-csv>
```
- Lee el CSV
- Normaliza tipos de datos (booleanos, números, strings)
- Valida estructura
- Output: JSON en consola

### 2. **lead-analyzer.js** — Clasificación por urgencia
Análisis automático de cada lead:
- ✅ Calcula **urgency_score** (0-100)
- ✅ Detecta **problemas** (issues)
- ✅ Asigna **prioridad** (HIGH/MEDIUM/LOW)
- ✅ Sugiere **tipo de campaña**

**Criterios de urgencia:**
| Problema | Puntos | Prioridad |
|----------|--------|-----------|
| Sin GMB reclamado | +40 | 🔴 CRÍTICO |
| Sin web | +40 | 🔴 CRÍTICO |
| Sin HTTPS | +25 | 🟠 ALTO |
| Reputación < 4⭐ | +25 | 🟠 ALTO |
| Sin reseñas (con GMB) | +10 | 🟡 MEDIO |

### 3. **dashboard-generator.js** — Generación de reportes Markdown
Crea un Dashboard visual con:
- 📊 Resumen ejecutivo (totales, porcentajes)
- 📈 Gráfico ASCII de problemas más comunes
- 🎯 Tabla de leads clasificados por prioridad
- 📋 Análisis detallado (reputación, campaña, etc.)
- 🚀 Próximos pasos recomendados

Output: `dashboards/prospection-YYYY-MM-DD.md`

### 4. **email-generator.js** — Redacción de correos personalizados
Genera correos con:
- ✍️ Asunto personalizado por tipo de campaña
- 🎯 Gancho (icebreaker) personalizado
- 📍 Problema detectado + solución
- 🚀 CTA contextualizado
- 📧 Versión HTML + texto plano

Output: `dashboards/emails-YYYY-MM-DD.csv`

---

## 🚀 FLUJO COMPLETO (Recomendado)

### Opción 1: Orquestador automático (Simplest)
```bash
cd E:\git\io-prospector\backend\scripts
node orchestrator.js "E:\Prospector-Data\2026-05\leads.csv"
```

**Output:**
- ✅ Dashboard Markdown
- ✅ CSV de emails listos para enviar
- ✅ Resumen en consola

### Opción 2: Paso a paso (Para debug)
```bash
# 1. Leer CSV
node csv-processor.js "E:\Prospector-Data\2026-05\leads.csv" > leads.json

# 2. Analizar (requiere modificar el script para export)
node lead-analyzer.js leads.json

# 3. Generar dashboard (idem)
node dashboard-generator.js leads.json

# 4. Generar emails
node email-generator.js leads.json
```

---

## 📝 ESTRUCTURA ESPERADA DEL CSV

Tu CSV debe tener estas columnas **exactamente así**:

```csv
Company_Name,First_Name,Email,Website,Phone,GMB_Rating,Review_Count,GMB_Claimed,Has_Website,SSL_Active,Main_Competitor,Missing_Service,Icebreaker,SEO_Gap
Fontanería García,Carlos,carlos@example.com,https://fontaneria-garcia.es,+34 912345678,3.8,42,Sí,Sí,No,Fontanería López,"Servicios de urgencia 24h","He visto que subiste una foto de la inundación resuelta","Tu web tarda 8 segundos en cargar"
Restaurant El Pulpo,María,maria@example.com,,+34 934567890,4.2,156,No,No,,Restaurante Mariscos,"Reservas online",,
```

### Columnas obligatorias:
- `Company_Name` (string) — Nombre del negocio
- `Email` (string) — Correo de contacto
- `Phone` (string) — Teléfono

### Columnas recomendadas:
- `First_Name` — Nombre del owner (si no está, usa "propietario")
- `Website` — URL de su web
- `GMB_Rating` — Nota en Google Maps (0-5)
- `Review_Count` — Cantidad de reseñas
- `GMB_Claimed` — Sí/No
- `Has_Website` — Sí/No
- `SSL_Active` — Sí/No

### Columnas de personalización:
- `Main_Competitor` — Quién los está ganando en Google
- `Missing_Service` — Qué servicio falta optimizar
- `Icebreaker` — Frase personalizada (ej: comentario sobre sus redes)
- `SEO_Gap` — Error técnico detectado

---

## 📊 EJEMPLO DE OUTPUT

### Dashboard (Markdown)
```markdown
# 📊 DASHBOARD DE PROSPECCIÓN
Generado: 03/05/2026 · Iorana Digital

## 📈 RESUMEN EJECUTIVO
| Métrica | Valor | % |
|---------|-------|-----|
| Total de leads | 247 | 100% |
| 🔴 Prioridad Alta | 89 | 36% |
| 🟠 Prioridad Media | 104 | 42% |
| 🟡 Prioridad Baja | 54 | 22% |

## 🔍 PROBLEMAS MÁS COMUNES
Sin GMB reclamado ████████████████ 124
Sin HTTPS ████████ 52
Reputación baja ██████ 38
...
```

### Emails (CSV)
```csv
To,Subject,Campaign,Priority,Status
carlos@example.com,"Fontanería García — Aumenta clientes con web profesional",web_design,HIGH,pending
maria@example.com,"⚠️ Restaurant El Pulpo — Tu web NO es segura (HTTPS)",ssl_upgrade,HIGH,pending
```

---

## 🔧 INSTALACIÓN DE DEPENDENCIAS

El orquestador usa `csv-parse`. Si no está instalado:

```bash
cd E:\git\io-prospector\backend
npm install csv-parse
```

---

## 💡 FLUJO RECOMENDADO DE USO

1. **Descarga/Prepara tu CSV** en `E:\Prospector-Data\<fecha>\`
2. **Ejecuta orquestador**:
   ```bash
   node scripts/orchestrator.js "E:\Prospector-Data\2026-05\leads.csv"
   ```
3. **Lee el Dashboard** generado en `dashboards/prospection-YYYY-MM-DD.md`
4. **Personaliza emails** si es necesario (el CSV te lo pone listo)
5. **Envía campaña** escalonada (máx 20/día)
6. **Monitoriza respuestas** y optimiza mensajes

---

## ⚙️ PERSONALIZACIÓN

### Cambiar directorio de output
```bash
node orchestrator.js "ruta/csv" --output-dir "E:\Mis-Dashboards"
```

### Modificar puntos de urgencia
Edita `lead-analyzer.js`, línea de `urgency_score`:
```javascript
if (!lead.gmb_claimed) urgency_score += 40; // ← Cambiar aquí
```

### Cambiar asuntos de email
Edita `email-generator.js`, función `buildSubject()`.

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| "CSV no encontrado" | Verifica la ruta (usa rutas completas) |
| "csv-parse no instalado" | `npm install csv-parse` en `/backend` |
| Dashboard vacío | Asegúrate de que el CSV tiene datos válidos |
| Emails sin personalización | Rellena las columnas `Icebreaker`, `Main_Competitor` |

---

**Creado por:** Iorana Digital · SEO Local  
**Versión:** 1.0.0  
**Última actualización:** Mayo 2026
