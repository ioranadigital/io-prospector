#!/usr/bin/env pwsh
<#
.SYNOPSIS
Script de despliegue para io-prospector en Coolify
.DESCRIPTION
Configura y despliega io-prospector en el proyecto "1. B PROYECTOS TOOLS" de Coolify
.EXAMPLE
./deploy.ps1 -CoolifyToken "tu-token" -Environment production
#>

param(
    [string]$CoolifyToken = $env:COOLIFY_TOKEN,
    [string]$CoolifyUrl = "http://89.167.103.147:8000",
    [string]$ProjectId = "dcccsw48ccog00k0k0wkc0oo",
    [string]$AppName = "io-prospector",
    [string]$GitHubRepo = "https://github.com/ioranadigital/io-prospector",
    [string]$GitHubBranch = "main",
    [string]$Domain = "pros.iorana.dev",
    [string]$Environment = "production"
)

Write-Host "`n🚀 DESPLIEGUE DE IO-PROSPECTOR" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Validación
if (-not $CoolifyToken) {
    Write-Host "`n❌ ERROR: No se encontró COOLIFY_TOKEN" -ForegroundColor Red
    Write-Host "`nSoluciones:" -ForegroundColor Yellow
    Write-Host "1. Obtén el token en: $CoolifyUrl/settings"
    Write-Host "2. Ejecuta: `$env:COOLIFY_TOKEN = 'tu-token'"
    Write-Host "3. O: ./deploy.ps1 -CoolifyToken 'tu-token'"
    exit 1
}

Write-Host "✅ Token de Coolify detectado" -ForegroundColor Green

# Headers para API
$headers = @{
    'Authorization' = "Bearer $CoolifyToken"
    'Content-Type' = 'application/json'
}

# Función para crear aplicación
function New-CoolifyApp {
    param(
        [string]$Url,
        [hashtable]$Headers,
        [string]$ProjectId,
        [string]$Name,
        [string]$Repo,
        [string]$Branch,
        [string]$Domain
    )

    $body = @{
        project_id = $ProjectId
        name = $Name
        type = "docker"
        repository_url = $Repo
        branch = $Branch
        build_pack = "nodejs"
        ports = @(3000, 4000)
        healthcheck_path = "/health"
        healthcheck_port = 3000
        domains = @($Domain)
        environment_variables = @{
            NODE_ENV = "production"
            FRONTEND_URL = "https://$Domain"
        }
    } | ConvertTo-Json

    Write-Host "`n📝 Creando aplicación '$Name'..." -ForegroundColor Yellow

    try {
        $response = Invoke-RestMethod -Uri "$Url/api/applications" `
            -Method Post `
            -Headers $Headers `
            -Body $body

        Write-Host "✅ Aplicación creada: $($response.id)" -ForegroundColor Green
        return $response.id
    } catch {
        Write-Host "⚠️ Error al crear aplicación: $($_.Exception.Message)" -ForegroundColor Yellow
        return $null
    }
}

# Función para iniciar deploy
function Start-Deploy {
    param(
        [string]$Url,
        [hashtable]$Headers,
        [string]$AppId
    )

    Write-Host "`n🔨 Iniciando despliegue..." -ForegroundColor Yellow

    try {
        $response = Invoke-RestMethod -Uri "$Url/api/applications/$AppId/deploy" `
            -Method Post `
            -Headers $Headers

        Write-Host "✅ Despliegue iniciado (Job ID: $($response.job_id))" -ForegroundColor Green
        return $response.job_id
    } catch {
        Write-Host "⚠️ Error al iniciar deploy: $($_.Exception.Message)" -ForegroundColor Yellow
        return $null
    }
}

# Función para monitorear despliegue
function Watch-Deployment {
    param(
        [string]$Url,
        [hashtable]$Headers,
        [string]$AppId,
        [string]$JobId
    )

    Write-Host "`n⏳ Monitoreando despliegue (Job: $JobId)..." -ForegroundColor Cyan
    $maxAttempts = 120  # 10 minutos
    $attempt = 0

    while ($attempt -lt $maxAttempts) {
        try {
            $status = Invoke-RestMethod -Uri "$Url/api/deployments/$JobId" `
                -Method Get `
                -Headers $Headers

            switch ($status.status) {
                "completed" {
                    Write-Host "`n✅ DESPLIEGUE EXITOSO" -ForegroundColor Green
                    Write-Host "🌐 App disponible en: https://$Domain" -ForegroundColor Green
                    return $true
                }
                "failed" {
                    Write-Host "`n❌ DESPLIEGUE FALLÓ" -ForegroundColor Red
                    Write-Host "Logs: $($status.logs)" -ForegroundColor Yellow
                    return $false
                }
                "running" {
                    Write-Host "  ⏳ Compilando... [$attempt/$maxAttempts]" -NoNewline
                    Start-Sleep -Seconds 5
                    $attempt++
                }
            }
        } catch {
            Write-Host "`n⚠️ Error al obtener status: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }

    Write-Host "`n⚠️ Timeout: despliegue aún en progreso" -ForegroundColor Yellow
    return $null
}

# Ejecutar despliegue
try {
    Write-Host "`n📡 Conectando a Coolify..." -ForegroundColor Cyan

    # Intentar obtener proyecto
    $projectInfo = Invoke-RestMethod -Uri "$CoolifyUrl/api/projects/$ProjectId" `
        -Method Get `
        -Headers $headers

    Write-Host "✅ Proyecto encontrado: $($projectInfo.name)" -ForegroundColor Green

    # Crear o actualizar aplicación
    $appId = New-CoolifyApp -Url $CoolifyUrl -Headers $headers `
        -ProjectId $ProjectId -Name $AppName -Repo $GitHubRepo `
        -Branch $GitHubBranch -Domain $Domain

    if ($appId) {
        # Iniciar despliegue
        $jobId = Start-Deploy -Url $CoolifyUrl -Headers $headers -AppId $appId

        if ($jobId) {
            # Monitorear despliegue
            Watch-Deployment -Url $CoolifyUrl -Headers $headers -AppId $appId -JobId $jobId
        }
    }

} catch {
    Write-Host "`n❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Verifica que el token sea válido"
    Write-Host "2. Verifica que $CoolifyUrl sea accesible"
    Write-Host "3. Verifica que el proyecto ID sea correcto: $ProjectId"
    exit 1
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Proceso completado" -ForegroundColor Green
Write-Host "🔗 Dashboard: $CoolifyUrl/project/$ProjectId" -ForegroundColor Cyan
