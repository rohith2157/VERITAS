@echo off
title Veritas Platform Launcher
echo ==========================================================
echo       VERITAS PLATFORM - 1-CLICK SYSTEM LAUNCHER
echo ==========================================================
echo Starting distributed microservices:
echo   1. Python AI & Similarity Engine (Port 8000)
echo   2. Spring Boot 3 Enterprise Gateway (Port 8080)
echo   3. React 19 Frontend Dashboard (Port 5173)
echo ==========================================================

:: 1. Launch Python FastAPI
start "Veritas AI Engine (Port 8000)" cmd /k "cd /d %~dp0ai-engine && .\venv\Scripts\python.exe -m uvicorn main:app --port 8000 --reload"

:: 2. Launch Spring Boot
start "Veritas Spring Boot Gateway (Port 8080)" cmd /k "cd /d %~dp0backend && .\mvnw.cmd spring-boot:run"

:: 3. Launch React Frontend
start "Veritas React Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo All 3 microservices have been launched in separate terminal windows!
echo Opening browser to http://localhost:5173 in 8 seconds...
timeout /t 8 >nul
start http://localhost:5173

echo.
echo System is running! Keep this window open or close it when done.
pause

