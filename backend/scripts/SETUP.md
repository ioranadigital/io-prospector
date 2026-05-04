# ✅ SETUP CHECKLIST

## 📦 Instalación completada

- ✅ `csv-parse` instalado
- ✅ 4 scripts funcionales creados
- ✅ Documentación completa
- ✅ Plantilla de CSV incluida

---

## 🚀 ¿LISTO PARA USAR?

### 1️⃣ Verificar instalación
```bash
cd E:\git\io-prospector\backend
npm list csv-parse
# Debe mostrar: csv-parse@5.6.0 (o superior)
```

### 2️⃣ Crear directorio de datos
```bash
mkdir E:\Prospector-Data\2026-05
# O en PowerShell:
New-Item -ItemType Directory -Path "E:\Prospector-Data\2026-05" -Force
```

### 3️⃣ Copiar plantilla de ejemplo (OPCIONAL)
```bash
copy E:\git\io-prospector\backend\scripts\example-leads.csv E:\Prospector-Data\2026-05\leads.csv
```

### 4️⃣ Ejecutar orquestador
```bash
cd E:\git\io-prospector\backend\scripts
node orchestrator.js "E:\Prospector-Data\2026-05\leads.csv"
```

---

## 📂 ARCHIVOS CREADOS

```
E:\git\io-prospector\backend\scripts\
├── orchestrator.js              ← Main script (el que usas)
├── csv-processor.js             ← Lee CSV
├── lead-analyzer.js             ← Clasifica por urgencia
├── dashboard-generator.js       ← Genera Markdown
├── email-generator.js           ← Genera correos
├── example-leads.csv            ← Plantilla
├── README.md                    ← Docs técnica
└── SETUP.md                     ← Este archivo
```

---

## 🎯 FLUJO DE USO

```
Tu CSV en E:\Prospector-Data\
         ↓
   node orchestrator.js
         ↓
    [Dashboard] + [Emails CSV]
    En E:\git\io-prospector\dashboards\
```

---

## 📝 PRÓXIMO PASO

Lee la guía completa:
```
E:\git\io-prospector\GUÍA-ORQUESTADOR.md
```

O ejecuta directamente:
```bash
cd E:\git\io-prospector\backend\scripts
node orchestrator.js "E:\Prospector-Data\2026-05\leads.csv"
```

---

**¿Necesitas ayuda?** → Consulta `README.md` en esta carpeta
