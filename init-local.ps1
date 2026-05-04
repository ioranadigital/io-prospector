# init-local.ps1 — Setup rápido para desarrollo local

Write-Host "🚀 Inicializando Prospector Local..." -ForegroundColor Cyan

# 1. Verificar Redis
Write-Host "`n1️⃣ Verificando Redis..." -ForegroundColor Yellow
$redisRunning = $false
try {
    $redisCheck = redis-cli ping 2>$null
    if ($redisCheck -eq "PONG") {
        Write-Host "✅ Redis está corriendo" -ForegroundColor Green
        $redisRunning = $true
    }
} catch {
    Write-Host "⚠️ Redis NO está corriendo" -ForegroundColor Red
    Write-Host "   Instrucciones:" -ForegroundColor Yellow
    Write-Host "   - WSL2: wsl redis-server" -ForegroundColor Gray
    Write-Host "   - Docker: docker run -d -p 6379:6379 redis:7-alpine" -ForegroundColor Gray
    Write-Host "   - Windows: Descargar de https://github.com/microsoftarchive/redis/releases" -ForegroundColor Gray
}

# 2. Backend dependencies
Write-Host "`n2️⃣ Instalando dependencias Backend..." -ForegroundColor Yellow
Push-Location backend
if ((Test-Path node_modules) -and (Test-Path package.json)) {
    Write-Host "✅ node_modules existe" -ForegroundColor Green
} else {
    npm install
}
Pop-Location

# 3. Frontend dependencies
Write-Host "`n3️⃣ Instalando dependencias Frontend..." -ForegroundColor Yellow
Push-Location frontend
if ((Test-Path node_modules) -and (Test-Path package.json)) {
    Write-Host "✅ node_modules existe" -ForegroundColor Green
} else {
    npm install
}
Pop-Location

# 4. Verificar .env
Write-Host "`n4️⃣ Verificando .env..." -ForegroundColor Yellow
if (Test-Path backend\.env) {
    $envContent = Get-Content backend\.env | Select-String "SUPABASE_URL|SMTP_HOST"
    if ($envContent.Count -gt 0) {
        Write-Host "✅ backend/.env existe y tiene configuración" -ForegroundColor Green
    } else {
        Write-Host "⚠️ backend/.env existe pero falta configurar:" -ForegroundColor Yellow
        Write-Host "   - SUPABASE_URL" -ForegroundColor Gray
        Write-Host "   - SUPABASE_KEY" -ForegroundColor Gray
        Write-Host "   - SMTP_HOST, SMTP_USER, SMTP_PASS" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠️ backend/.env no existe. Copiar de .env.example y rellenar" -ForegroundColor Yellow
}

# 5. Schema en Supabase
Write-Host "`n5️⃣ Verificar Schema en Supabase..." -ForegroundColor Yellow
Write-Host "   → Ejecuta el contenido de schema.sql en tu proyecto Supabase" -ForegroundColor Gray
Write-Host "   → SQL Editor: https://app.supabase.com/project/YOUR_PROJECT/sql" -ForegroundColor Gray

Write-Host "`n" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ SETUP COMPLETADO" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`n📝 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. npm run dev        (en terminal 1 → Backend)" -ForegroundColor Gray
Write-Host "   2. npm run dev        (en terminal 2 → Frontend)" -ForegroundColor Gray
Write-Host "   3. redis-server       (en terminal 3 → Redis)" -ForegroundColor Gray
Write-Host "   4. Abre http://localhost:3000" -ForegroundColor Gray

Write-Host "`n📚 Documentación:" -ForegroundColor Cyan
Write-Host "   → Leer SETUP-ENVIO-MASIVO.md para detalles técnicos" -ForegroundColor Gray

if (-not $redisRunning) {
    Write-Host "`n⚠️ AVISO: Redis no está corriendo. Sin Redis, las colas no funcionarán." -ForegroundColor Red
}
