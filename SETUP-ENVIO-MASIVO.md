# 📧 Setup: Sistema de Envío Masivo (Email + WhatsApp)

## Implementación Completada

✅ **Frontend (Next.js)**
- Tabla interactiva de leads con selección múltiple
- Modal para envío masivo de emails con templates
- Modal para envío masivo de WhatsApp con intensidades (soft/medium/hard)
- UI de progreso en tiempo real

✅ **Backend (Node.js + Express)**
- Sistema de colas con Bull + Redis
- Procesamiento asincrónico de emails y WhatsApp
- Tracking de batches de envío
- Endpoints para envío masivo y status

✅ **Base de Datos**
- Tabla `contact_batches` para tracking
- Tabla `lead_activities` para auditoría

---

## Configuración Local Requerida

### 1. Instalar Redis

**En Windows (Recomendado: Windows Subsystem for Linux v2)**

```bash
# Opción A: Usar WSL2 + Ubuntu
wsl --install
wsl --list --verbose

# Dentro de WSL:
sudo apt update
sudo apt install redis-server
redis-server
```

**Alternativa: Docker**
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

**Alternativa: Usar MemoryDB local (Windows nativo)**
```bash
# Descargar: https://github.com/microsoftarchive/redis/releases
# Instalar y ejecutar: redis-server.exe
```

### 2. Actualizar Schema en Supabase

Copia y ejecuta en **Supabase SQL Editor** (`https://app.supabase.com/project/YOUR_PROJECT/sql`):

```sql
-- Copiar el contenido COMPLETO de schema.sql
-- (Se incluyó la tabla contact_batches al final)
```

O ejecuta directamente desde archivo:

```bash
# En la carpeta raíz del proyecto
supabase db push
```

### 3. Configurar Variables de Entorno

Actualiza `backend/.env`:

```env
# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# El resto debe estar ya configurado
SUPABASE_URL=https://...
SUPABASE_KEY=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
```

---

## Flujo de Uso

### Desde Frontend

1. **Prospección:** Usuario hace scraping y obtiene leads
2. **Selección:** Selecciona múltiples leads en la tabla
3. **Modal Email/WhatsApp:** Elige template o escribe mensaje personalizado
4. **Envío:** Sistema crea jobs en la cola
5. **Progreso:** Real-time progress bar
6. **Confirmación:** Toast con resultado

### En Backend

```
Usuario → Frontend Modal
    ↓
[POST] /api/contact/bulk-emails
    ↓
queueService.sendBulkEmails()
    ↓
Bull Queue (procesamiento asincrónico)
    ↓
contactService.sendEmail()
    ↓
Supabase: lead_activities + leads.crm_status = 'contacted'
    ↓
[GET] /api/contact/bulk-emails/{batch_id}/status
    ↓
Frontend actualiza progreso
```

---

## API Endpoints

### Email Masivo

```
POST /api/contact/bulk-emails
{
  "lead_ids": ["uuid1", "uuid2"],
  "subject": "Mejora tu SEO",
  "body": "Hola {{business_name}}, encontramos {{issue_count}} problemas SEO...",
  "template_id": "uuid" (optional)
}

Response:
{
  "batch_id": "email-1715000000000",
  "jobs_count": 2
}
```

```
GET /api/contact/bulk-emails/{batch_id}/status
Response:
{
  "batch_id": "email-1715000000000",
  "status": "processing|completed",
  "total": 2,
  "completed": 1,
  "failed": 0,
  "percentage": 50,
  "sent": 1
}
```

### WhatsApp Masivo

```
POST /api/contact/bulk-whatsapp
{
  "lead_ids": ["uuid1", "uuid2"],
  "message": "Hola {{business_name}}, tenemos propuesta para ti",
  "intensity": "soft|medium|hard",
  "template_id": "uuid" (optional)
}

Response:
{
  "batch_id": "whatsapp-1715000000000",
  "jobs_count": 2,
  "sequences": 1|2|3
}
```

---

## Intensidades de WhatsApp

| Intensidad | Mensajes | Timing | Caso de Uso |
|-----------|----------|--------|-----------|
| **Soft** 🌱 | 1 | Ahora | Primera presentación |
| **Medium** ⚡ | 2 | 0h, +24h | Follow-up estándar |
| **Hard** 🔥 | 3 | 0h, +24h, +48h | Prospección agresiva |

---

## Variables de Template

Usar en los campos `subject` y `body`:

```
{{business_name}}      → Nombre del negocio
{{city}}               → Ciudad
{{email}}              → Email del prospecto
{{category}}           → Categoría del negocio
{{audit_score}}        → Score SEO (0-100)
{{audit_issues}}       → Listado de problemas SEO detectados
{{issue_count}}        → Cantidad de problemas
{{top_issue}}          → Problema más crítico
```

**Ejemplo completo:**
```
Asunto:
"{{business_name}} — {{issue_count}} problemas SEO en {{city}}"

Cuerpo:
"Hola {{business_name}},

Analizamos tu web y encontramos {{issue_count}} problemas SEO:

{{audit_issues}}

Tu audit score: {{audit_score}}/100

¿Podríamos ayudarte?"
```

---

## Desarrollo Local

### Iniciar Stack Completo

```bash
# Terminal 1: Backend
cd backend
npm run dev
# → http://localhost:4001

# Terminal 2: Frontend
cd frontend
npm run dev
# → http://localhost:3000

# Terminal 3: Redis
redis-server
# → localhost:6379
```

### Testing de Colas

```bash
# Ver estado de la cola de emails
node -e "
import Queue from 'bull';
const q = new Queue('emails', { redis: { host: '127.0.0.1', port: 6379 } });
console.log(await q.getJobCounts());
"
```

---

## Próximas Mejoras

### Fase 2: WhatsApp Business API
- [ ] Migrar de whatsapp-web.js a WhatsApp Business API
- [ ] Webhook para confirmación de entrega
- [ ] Estadísticas de lectura

### Fase 3: Analytics
- [ ] Dashboard de campañas (tasa de apertura, clicks, respuestas)
- [ ] A/B testing de templates
- [ ] Integración con CRM kanban

### Fase 4: Automatización
- [ ] Triggers automáticos (por score, status, fecha)
- [ ] Secuencias de drip email
- [ ] Integración n8n

---

## Troubleshooting

**Error: "Redis connection refused"**
```bash
# Verificar que Redis está corriendo
redis-cli ping
# Debe retornar: PONG
```

**Error: "Bull queue not processing"**
```bash
# Verificar logs del backend
# Asegurar que Redis_HOST y REDIS_PORT en .env son correctos
```

**Emails no se envían**
```bash
# Verificar credenciales SMTP
# Asegurar que el App Password de Gmail está correcto
# En Gmail: 2FA activado → Generar App Password
```

**WhatsApp requiere QR**
```bash
# whatsapp-web.js necesita escanear QR en la primera ejecución
# Los QR aparecerán en los logs del backend
# En producción: usar WhatsApp Business API (fase 2)
```

---

## Notas Técnicas

- **Bull Queue**: En-memory + Redis persistence
- **contactService**: Sincrónico (envía real-time)
- **queueService**: Asincrónico (procesa en background)
- **Retries**: 3 intentos con exponential backoff
- **TTL de jobs**: Removidos al completarse (sin clutter)

---

**Última actualización:** 2026-05-04  
**Versión:** 1.0.0 (Initial Release)
