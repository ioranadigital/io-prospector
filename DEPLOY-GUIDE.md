# 🚀 Guía de Deploy: io-prospector a Hetzner

**Versión:** 2.0 (Corregida para Producción)  
**Fecha:** 2026-06-23  
**Status:** ✅ LISTO PARA HETZNER

---

## 📋 Pre-requisitos

- VPS Hetzner con Docker y Docker Compose instalado
- Acceso SSH a la VPS
- Dominios configurados (pros.iorana.dev, api.pros.iorana.dev)
- Certificados SSL (Let's Encrypt)

---

## 🔧 PASO 1: Setup del VPS

```bash
# SSH al VPS
ssh root@your.hetzner.ip

# Actualizar sistema
apt-get update && apt-get upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker --version
docker-compose --version
```

---

## 📁 PASO 2: Clonar Repositorio

```bash
# Clone el repositorio
git clone https://github.com/iorana/io-prospector.git
cd io-prospector

# Crear directorio para certificados SSL
mkdir -p ssl/certs
mkdir -p ssl/logs
```

---

## 🔐 PASO 3: Configurar SSL/TLS (Let's Encrypt)

### Opción A: Usando Certbot (Recomendado)

```bash
# Instalar Certbot
apt-get install -y certbot python3-certbot-nginx

# Generar certificados para frontend
certbot certonly --standalone \
  -d pros.iorana.dev \
  -d www.pros.iorana.dev \
  --email admin@iorana.dev \
  --agree-tos

# Generar certificados para API backend
certbot certonly --standalone \
  -d api.pros.iorana.dev \
  --email admin@iorana.dev \
  --agree-tos

# Generar DH parameter (para seguridad SSL)
openssl dhparam -out ssl/dhparam.pem 2048

# Copiar certificados a la carpeta correcta
cp /etc/letsencrypt/live/pros.iorana.dev/fullchain.pem ssl/certs/pros.iorana.dev.crt
cp /etc/letsencrypt/live/pros.iorana.dev/privkey.pem ssl/certs/pros.iorana.dev.key
cp /etc/letsencrypt/live/api.pros.iorana.dev/fullchain.pem ssl/certs/api.pros.iorana.dev.crt
cp /etc/letsencrypt/live/api.pros.iorana.dev/privkey.pem ssl/certs/api.pros.iorana.dev.key
```

### Opción B: Auto-renovación con Cron

```bash
# Crear script de renovación
cat > /home/user/renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/pros.iorana.dev/fullchain.pem /root/io-prospector/ssl/certs/
cp /etc/letsencrypt/live/api.pros.iorana.dev/fullchain.pem /root/io-prospector/ssl/certs/
docker exec io-prospector-nginx nginx -s reload
EOF

chmod +x /home/user/renew-ssl.sh

# Agregar a crontab (ejecutar diariamente a las 3am)
(crontab -l 2>/dev/null; echo "0 3 * * * /home/user/renew-ssl.sh") | crontab -
```

---

## 🔑 PASO 4: Configurar Variables de Entorno

```bash
# Crear archivo .env en el VPS
cat > .env << 'EOF'
# ===========================
# SUPABASE Configuration
# ===========================
SUPABASE_URL=https://your-supabase-instance.supabase.co
SUPABASE_KEY=your-service-role-key-here
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-instance.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# ===========================
# Network Configuration
# ===========================
FRONTEND_URL=https://pros.iorana.dev
NEXT_PUBLIC_API_URL=https://api.pros.iorana.dev

# ===========================
# Server Ports
# ===========================
BACKEND_PORT=4000
FRONTEND_PORT=3002
REDIS_PORT=6379

# ===========================
# Node Environment
# ===========================
NODE_ENV=production

# ===========================
# Redis & Bull
# ===========================
REDIS_URL=redis://redis:6379
BULL_QUEUE_PREFIX=io_prospector

# ===========================
# Email Configuration
# ===========================
EMAIL_FROM=noreply@iorana.dev
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# ===========================
# Logging
# ===========================
LOG_LEVEL=info
EOF

# Restringir permisos del archivo .env
chmod 600 .env
```

---

## 🐳 PASO 5: Iniciar Servicios con Docker Compose

```bash
# Crear directorio para logs
mkdir -p logs

# Iniciar servicios (producción)
docker-compose -f docker-compose.production.yml up -d

# Verificar estado
docker-compose -f docker-compose.production.yml ps

# Ver logs
docker-compose -f docker-compose.production.yml logs -f

# Ver logs de un servicio específico
docker-compose -f docker-compose.production.yml logs backend
docker-compose -f docker-compose.production.yml logs frontend
docker-compose -f docker-compose.production.yml logs redis
docker-compose -f docker-compose.production.yml logs nginx
```

---

## ✅ PASO 6: Verificar que todo funciona

```bash
# Health check del backend
curl -i https://api.pros.iorana.dev/health

# Health check del frontend
curl -i https://pros.iorana.dev

# Ver logs en tiempo real
docker-compose -f docker-compose.production.yml logs -f --tail=50

# Verificar conectividad a Supabase
docker exec io-prospector-backend node -e "
  require('dotenv').config();
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  console.log('✅ Supabase conectado');
"

# Verificar Redis
docker exec io-prospector-redis redis-cli ping
```

---

## 🔄 PASO 7: Configurar Auto-restart y Monitoreo

```bash
# Crear script de monitoreo
cat > /home/user/monitor-prospector.sh << 'EOF'
#!/bin/bash
# Verificar que los servicios estén corriendo
docker-compose -f /root/io-prospector/docker-compose.production.yml ps | grep -q "Up"
if [ $? -ne 0 ]; then
  echo "Servicios caídos en $(date)" >> /var/log/prospector-monitor.log
  docker-compose -f /root/io-prospector/docker-compose.production.yml restart
fi
EOF

chmod +x /home/user/monitor-prospector.sh

# Agregar a crontab (ejecutar cada 5 minutos)
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/user/monitor-prospector.sh") | crontab -
```

---

## 🔒 PASO 8: Configurar Firewall

```bash
# Permitir SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Verificar reglas
ufw status
```

---

## 📊 PASO 9: Configurar Backups

```bash
# Crear script de backup
cat > /home/user/backup-prospector.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/prospector"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup de datos Redis
docker exec io-prospector-redis redis-cli BGSAVE
docker cp io-prospector-redis:/data/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# Backup de archivos de configuración
tar -czf $BACKUP_DIR/config_$DATE.tar.gz .env nginx.conf

# Mantener solo últimos 30 días
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completado en $BACKUP_DIR"
EOF

chmod +x /home/user/backup-prospector.sh

# Ejecutar daily
(crontab -l 2>/dev/null; echo "0 2 * * * /home/user/backup-prospector.sh") | crontab -
```

---

## 🛠️ Comandos Útiles para Mantenimiento

```bash
# Ver estado de los servicios
docker-compose -f docker-compose.production.yml ps

# Reiniciar un servicio específico
docker-compose -f docker-compose.production.yml restart backend

# Detener todos los servicios
docker-compose -f docker-compose.production.yml down

# Eliminar volúmenes (⚠️ CUIDADO - elimina datos)
docker-compose -f docker-compose.production.yml down -v

# Ejecutar comando en un contenedor
docker exec io-prospector-backend npm start

# Ver uso de recursos
docker stats

# Limpiar imágenes sin usar
docker image prune -a
```

---

## 🚨 Troubleshooting

### Backend no se conecta a Redis
```bash
docker logs io-prospector-backend | grep -i redis
docker exec io-prospector-redis redis-cli ping
```

### Frontend no se carga
```bash
# Verificar build
docker logs io-prospector-frontend
# Verificar conectividad a API
curl -i http://backend:4000/health
```

### SSL/TLS no funciona
```bash
# Verificar certificados
ls -la ssl/certs/
# Validar certificado
openssl x509 -in ssl/certs/pros.iorana.dev.crt -text -noout
```

### Out of memory
```bash
# Aumentar límite de memoria
docker-compose -f docker-compose.production.yml down
# Editar docker-compose.production.yml y agregar mem_limit:
# mem_limit: 2g
```

---

## 📞 Soporte

- **Logs:** `docker-compose logs -f`
- **Documentación:** Consulta DEPLOY-HETZNER-CHECKLIST.md
- **Issues:** GitHub issues del proyecto

---

**Status:** ✅ Deploy listo para Hetzner  
**Última actualización:** 2026-06-23
