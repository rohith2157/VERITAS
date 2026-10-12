# ==============================================================================
# Veritas Platform - Microservice Cluster Stopper
# Cleanly stops PostgreSQL (2157), FastAPI (8000), Spring Boot (8080), React Vite (5173)
# ==============================================================================

Write-Host ">>> Stopping Veritas Platform Microservices..." -ForegroundColor Yellow

# 1. Stop PostgreSQL on Port 2157
try {
    Write-Host "Stopping PostgreSQL (Port 2157)..." -ForegroundColor Cyan
    & "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" stop -D "c:\TTProject\data\postgres_data" -m fast -s
} catch {}

# 2. Stop Python FastAPI / Uvicorn (Port 8000)
$uvicornProcs = Get-Process -Name python, uvicorn -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*c:\TTProject\ai-engine\venv*" }
if ($uvicornProcs) {
    Write-Host "Stopping FastAPI Uvicorn engine..." -ForegroundColor Green
    $uvicornProcs | Stop-Process -Force -ErrorAction SilentlyContinue
}

# 3. Stop Spring Boot Backend (Port 8080)
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($port8080) {
    Write-Host "Stopping Spring Boot 3 Backend (:8080)..." -ForegroundColor Yellow
    $port8080.OwningProcess | Select-Object -Unique | ForEach-Object {
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    }
}

# 4. Stop React Vite (Port 5173)
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    Write-Host "Stopping React 19 Frontend (:5173)..." -ForegroundColor Magenta
    $port5173.OwningProcess | Select-Object -Unique | ForEach-Object {
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " All Veritas Platform Services Stopped Successfully" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
