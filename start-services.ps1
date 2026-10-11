# ==============================================================================
# Veritas Platform - Microservice Cluster Launcher
# Starts PostgreSQL (2157), FastAPI (8000), Spring Boot (8080), React Vite (5173)
# ==============================================================================

Write-Host ">>> Starting Veritas PostgreSQL 18 on Port 2157..." -ForegroundColor Cyan
Start-Process -FilePath "C:\Program Files\PostgreSQL\18\bin\postgres.exe" -ArgumentList "-D c:\TTProject\data\postgres_data -p 2157" -NoNewWindow

Start-Sleep -Seconds 2

Write-Host ">>> Starting AI Engine (FastAPI) on Port 8000..." -ForegroundColor Green
Start-Process -FilePath "c:\TTProject\ai-engine\venv\Scripts\uvicorn.exe" -ArgumentList "main:app --host 127.0.0.1 --port 8000" -WorkingDirectory "c:\TTProject\ai-engine" -NoNewWindow

Write-Host ">>> Starting Spring Boot 3 Backend on Port 8080..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/c mvnw.cmd spring-boot:run" -WorkingDirectory "c:\TTProject\backend" -NoNewWindow

Write-Host ">>> Starting React 19 Frontend on Port 5173..." -ForegroundColor Magenta
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory "c:\TTProject\frontend" -NoNewWindow

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Veritas Integrity Platform Cluster Online" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Frontend Portal:        http://localhost:5173" -ForegroundColor White
Write-Host " Spring Boot REST API:   http://localhost:8080" -ForegroundColor White
Write-Host " Python AI Engine API:   http://localhost:8000" -ForegroundColor White
Write-Host " PostgreSQL Graph DB:    localhost:2157/veritasdb" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
