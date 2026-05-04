# 🔍 SCRAPER COMPLETO: SerpAPI → CSV → Dashboard

**Flujo:**
```
Terminal
  ↓
node scraper-cli.js (busca en Google)
  ↓
SerpAPI (resultados SERP)
  ↓
Puppeteer (extrae email, phone, HTTPS)
  ↓
Google Maps scraping (intenta GMB data)
  ↓
CSV local en E:\Prospector-Data\YYYY-MM-DD\
  ↓
node orchestrator.js (procesa CSV)
  ↓
Dashboard + Emails listos
```

---

## 📋 REQUISITOS PREVIOS

### 1. SerpAPI Key (Obligatorio)

1. Ve a https://serpapi.com
2. Sign up (gratis) → 100 búsquedas/mes
3. Copia tu API key
4. Pégala en `.env`:

```env
SERP_API_KEY=tu-api-key-aqui
```

**Verifica:**
```bash
echo $env:SERP_API_KEY  # PowerShell
```

### 2. Dependencias instaladas

```bash
cd E:\git\io-prospector\backend
npm install
```

---

## 🚀 QUICK START

### **Opción 1: Desde Terminal (Más fácil)**

```bash
cd E:\git\io-prospector\backend\scripts
node scraper-cli.js --query "fontanería" --city "Madrid" --pages-from 2 --pages-to 3
```

**Output:**
```
╔════════════════════════════════════════════════════════════╗
║                     🚀 INICIANDO SCRAPER                  ║
╚════════════════════════════════════════════════════════════╝

📍 Query: "fontanería"
📍 City: "Madrid"
📄 Páginas: 2 → 3
⏱️  Por favor espera...
```

Espera... (5-10 minutos por 20 resultados)

```
╔════════════════════════════════════════════════════════════╗
║                  ✅ SCRAPING COMPLETADO                   ║
╚════════════════════════════════════════════════════════════╝

📊 Resultados:
  📈 Total leads encontrados: 18
  📄 Archivo CSV: leads-fontanería-2026-05-03T10-23-45.csv
  📍 Ubicación: E:\Prospector-Data\2026-05-03\
```

### **Opción 2: Desde API (Backend running)**

```bash
curl -X POST http://localhost:4001/api/scraping/start-csv \
  -H "Content-Type: application/json" \
  -d '{
    "query": "fontanería",
    "city": "Madrid",
    "pagesFrom": 2,
    "pagesTo": 3
  }'
```

---

## 📊 QUÉ EXTRAE CADA PASO

### **Paso 1: SerpAPI (Google Search)**
```
✅ Company_Name (del título)
✅ Website URL (del enlace)
✅ Position en Google (posición en SERP)
```

### **Paso 2: ContactExtractor (Puppeteer)**
```
✅ Email (regex en HTML)
✅ Phone (regex en HTML, formato español)
✅ SSL_Active (HTTPS check)
❌ Si falla: deja vacío
```

### **Paso 3: GMBScraper (Google Maps)**
```
✅ GMB_Rating (⭐ estrellas)
✅ Review_Count (número de reseñas)
✅ GMB_Claimed (Sí/No)
❌ Si no puede acceder: deja vacío
```

### **Output Final: CSV**
```csv
Company_Name,First_Name,Email,Website,Phone,GMB_Rating,Review_Count,GMB_Claimed,Has_Website,SSL_Active
Fontanería García,propietario,carlos@fontaneria.es,https://fontaneria-garcia.es,+34912345678,3.8,42,Sí,Sí,Sí
Restaurant El Pulpo,propietario,info@pulpo.es,https://pulpo-restaurant.es,+34934567890,4.2,156,No,Sí,Sí
Sin Web Company,propietario,,,,,,No,No,No
```

---

## ⏱️ TIEMPOS ESTIMADOS

| Operación | Tiempo |
|-----------|--------|
| 1-10 resultados | 2-5 min |
| 10-20 resultados | 5-10 min |
| 20-30 resultados | 10-15 min |
| Por cada website | ~30-60 seg |

**Nota:** Incluye rate limiting (1.5-2.5 seg entre requests)

---

## 📝 EJEMPLOS DE USO

### Búsqueda simple
```bash
node scraper-cli.js --query "electricista" --city "Barcelona"
```

### Búsqueda con más páginas
```bash
node scraper-cli.js -q "dentista" -c "Valencia" --pages-from 2 --pages-to 5
```

### Con categoría específica
```bash
node scraper-cli.js --query "plomería" --city "Sevilla" --category "sanitarios"
```

---

## 🔄 FLUJO COMPLETO: De 0 a Dashboard

### **Paso 1: Ejecutar scraper**
```bash
node scraper-cli.js --query "fontanería" --city "Madrid" --pages-from 2 --pages-to 3
# Output: E:\Prospector-Data\2026-05-03\leads-fontanería-2026-05-03T10-23-45.csv
```

### **Paso 2: Procesar con orquestador**
```bash
cd ..\..
cd scripts
node orchestrator.js "E:\Prospector-Data\2026-05-03\leads-fontanería-2026-05-03T10-23-45.csv"
# Output: 
#   - E:\git\io-prospector\dashboards\prospection-2026-05-03.md
#   - E:\git\io-prospector\dashboards\emails-2026-05-03.csv
```

### **Paso 3: Ver dashboard**
```
Abre en navegador o editor:
E:\git\io-prospector\dashboards\prospection-2026-05-03.md
```

### **Paso 4: Enviar emails**
```
Abre: E:\git\io-prospector\dashboards\emails-2026-05-03.csv
Personaliza si quieres (opcional)
Envía escalonado (máx 20/día)
```

---

## ⚠️ PROBLEMAS Y SOLUCIONES

| Problema | Causa | Solución |
|----------|-------|----------|
| "SERP_API_KEY no configurada" | No está en .env | Agrega tu key a `.env` |
| "SerpAPI error 401" | Key inválida | Verifica la key en https://serpapi.com |
| "SerpAPI error 429" | Límite alcanzado | Espera o upgrade plan |
| Email/Phone vacíos | HTML no parseable | Normal, sitios varían |
| GMB data vacío | Google Maps bloqueado | Normal, best-effort |
| Playwright timeout | Sitio muy lento | Intenta con --pages-from reducido |
| CSV no se crea | Permiso de carpeta | Verifica `E:\Prospector-Data\` existe |

---

## 🎯 INTERPRETACIÓN DE DATOS

### Email/Phone vacíos
```
✅ Normal. Los sitios web varían en estructura.
⚠️  Completa manualmente si es crítico.
```

### GMB data vacío
```
✅ El scraper lo intentó, pero Google Maps está protegido.
⚠️  Opciones:
   1. Manualmente en Google Maps/Search
   2. Usar Google Maps API (pago)
   3. Dejar vacío y marcar como "investigar"
```

### Rating bajo (< 3.0)
```
🔴 Prioridad ALTA: Esta empresa tiene problemas de reputación
   → Campaña de "Gestión de Reputación"
```

### Sin GMB reclamado
```
🔴 Prioridad ALTA: Oportunidad de venta
   → Campaña de "Reclamación de GMB"
```

---

## 💡 TIPS

1. **Comienza pequeño**: 2-3 páginas (20-30 resultados)
2. **Valida primero**: Revisa el CSV en Excel antes de procesar
3. **Completa manualmente**: GMB data si es crítica
4. **Reutiliza**: Guarda CSVs anteriores, puedes reprocesar
5. **Monitoriza**: Anota qué queries dan mejor ROI

---

## 📞 FLUJO FINAL

```
CSV descargado
    ↓
Revisa en Excel (5 min)
    ↓
Procesa con orquestador (< 1 min)
    ↓
Lee Dashboard (5-10 min)
    ↓
Personaliza emails (opcional, 15 min)
    ↓
Envía campaña (escalonado)
    ↓
Monitoriza respuestas
    ↓
Optimiza y repite
```

---

## ✅ CHECKLIST

- [ ] SerpAPI key en `.env`
- [ ] Puppeteer instalado (`npm install`)
- [ ] `E:\Prospector-Data\` creado
- [ ] Primer scraping exitoso
- [ ] CSV validado en Excel
- [ ] Orquestador generó dashboard
- [ ] Dashboard abierto en navegador
- [ ] Emails generados correctamente
- [ ] Campaña escalonada enviada
- [ ] Respuestas monitoreadas

---

**¿Listo para empezar?**

```bash
node scraper-cli.js --query "tu-sector" --city "tu-ciudad"
```

¡Vamos! 🚀

---

*Scraper v2 | Iorana Digital | Mayo 2026*
