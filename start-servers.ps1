#!/usr/bin/env pwsh
# Script para arrancar backend y frontend de io-prospector

$ErrorActionPreference = "SilentlyContinue"

# Paths
$projectRoot = "E:\git\app\tools\io-prospector"
$backendPath = "$projectRoot\backend"
$frontendPath = "$projectRoot\frontend"

Write-Host "🚀 IO Prospector - Server Launcher" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Kill existing node processes
Write-Host "🛑 Limpiando procesos anteriores..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start backend in a new window
Write-Host "`n📍 Arrancando Backend en puerto 4006..." -ForegroundColor Green
$backendCmd = "cd '$backendPath' && Write-Host '[BACKEND] Iniciando...' && node server.js"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Normal

# Start frontend in a new window
Write-Host "📍 Arrancando Frontend en puerto 3004..." -ForegroundColor Cyan
$frontendCmd = "cd '$frontendPath' && Write-Host '[FRONTEND] Iniciando...' && npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✅ Dos ventanas PowerShell se abrieron con los servidores" -ForegroundColor Green
Write-Host "⏳ Esperando 15 segundos para inicialización..." -ForegroundColor Yellow

Start-Sleep -Seconds 15

# Verify servers are running
Write-Host "`n🔍 Verificando servidores..." -ForegroundColor Cyan

$backendCheck = Test-NetConnection -ComputerName localhost -Port 4006 -InformationLevel Quiet -WarningAction SilentlyContinue
$frontendCheck = Test-NetConnection -ComputerName localhost -Port 3004 -InformationLevel Quiet -WarningAction SilentlyContinue

Write-Host ""
Write-Host "Backend (4006):  $(if ($backendCheck) { '✅ Listo' } else { '⏳ Inicializando' })" -ForegroundColor $(if ($backendCheck) { 'Green' } else { 'Yellow' })
Write-Host "Frontend (3004): $(if ($frontendCheck) { '✅ Listo' } else { '⏳ Inicializando' })" -ForegroundColor $(if ($frontendCheck) { 'Green' } else { 'Yellow' })

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🌐 ACCESO A LA APLICACIÓN:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:3004" -ForegroundColor Cyan
Write-Host "   Backend:   http://localhost:4006" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host ""
Write-Host "💡 Los logs se mostrarán en las ventanas PowerShell separadas." -ForegroundColor Gray
Write-Host "   Cierra una ventana para detener ese servidor." -ForegroundColor Gray
