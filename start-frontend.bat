@echo off
REM Start Frontend Server
cd /d "E:\git\app\tools\io-prospector\frontend"
echo.
echo ==========================================
echo   IO Prospector - Frontend Server
echo   Iniciando en puerto 3004...
echo ==========================================
echo.
call npm run dev
