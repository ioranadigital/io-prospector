# Configuración Requerida en Coolify para pros.iorana.dev

## 🚨 PROBLEMA ENCONTRADO
El servidor responde con **404 Not Found** en todos los endpoints. Esto indica:
- El servidor está corriendo
- Pero las aplicaciones (frontend + backend) NO están siendo servidas correctamente

## ✅ SOLUCIÓN REQUERIDA EN COOLIFY

### Opción 1: Usar docker-compose.yml (RECOMENDADO)

Coolify debe ejecutar:
```bash
docker-compose -f docker-compose.yml up
```

**Esto levanta 2 servicios independientes:**
- `frontend`: Next.js en puerto 3000 (usa `frontend.Dockerfile`)
- `backend`: Express en puerto 4000 (usa `backend.Dockerfile`)

### Opción 2: Usar Dockerfile general (ACTUAL - PROBLEMA)

Coolify actualmente parece estar usando:
```bash
docker build -f Dockerfile .
```

**Problema:** 
- Ambas apps están en el mismo contenedor
- Script de inicio quizás no funciona correctamente
- Puertos pueden estar en conflicto

---

## 🔧 CONFIGURACIÓN EN COOLIFY

### 1. Verificar Build Command
```
Debería ser:
  docker-compose build
  
NO:
  docker build .
```

### 2. Verificar Start Command
```
Debería ser:
  docker-compose up
  
NO:
  npm start (incorrecto para monorepo)
```

### 3. Verificar Exposed Ports
```
Frontend: 3000
Backend:  4000
Reverse Proxy: Debería estar en 443 → 3000 (frontend)
```

### 4. Verificar Environment Variables
```
Para Frontend (durante build):
  NEXT_PUBLIC_SUPABASE_URL=https://zvehtloitnuglyjtxwye.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_B0gQyDyf-p2vDg2UhytfDg_H54mWXbB
  NEXT_PUBLIC_API_URL=https://pros.iorana.dev/api

Para Backend (runtime):
  NODE_ENV=production
  PORT=4000
  FRONTEND_URL=https://pros.iorana.dev
  SUPABASE_URL=<tu-url>
  SUPABASE_KEY=<tu-secret-key>
```

### 5. Verificar Reverse Proxy
```
Domain: pros.iorana.dev
Target: http://localhost:3000 (frontend)
HTTPS: Enabled (con certificado)

Backend API:
Path: /api/*
Target: http://localhost:4000
```

---

## 🧪 VALIDACIÓN

### Desde local (con -k para ignorar certificado):
```bash
# Frontend (debería devolver HTML)
curl -k https://pros.iorana.dev

# Backend (debería devolver JSON)
curl -k https://pros.iorana.dev/api/health
```

### Resultado esperado:
```
✅ Frontend: <html>...Next.js app...</html>
✅ Backend: {"status":"ok","ts":"2026-05-25T..."}
```

### Resultado actual:
```
❌ Both: 404 page not found
```

---

## 📋 CHECKLIST PARA COOLIFY

- [ ] Usar `docker-compose.yml` en lugar de `Dockerfile`
- [ ] Exponer puertos 3000 (frontend) y 4000 (backend)
- [ ] Configurar reverse proxy en 3000 para HTTPS
- [ ] Configurar variables de entorno de BUILD (NEXT_PUBLIC_*)
- [ ] Configurar variables de entorno de RUNTIME (SUPABASE_*)
- [ ] Verificar que `/app/frontend/.next` existe después del build
- [ ] Verificar que backend levanta en puerto 4000
- [ ] Probar endpoints con `curl`

---

## 🔍 PRÓXIMOS PASOS

1. Acceder a Coolify dashboard
2. Seleccionar proyecto `io-prospector`
3. Verificar Build Command
4. Verificar Start Command
5. Verificar Environment Variables
6. Hacer rebuild si es necesario
7. Verificar logs del deploy

