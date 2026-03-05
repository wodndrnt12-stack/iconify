@echo off
cd /d "%~dp0"
start "Iconify Server" cmd /c "npx --yes serve . -p 8000 2>nul || python -m http.server 8000 2>nul || python3 -m http.server 8000"
timeout /t 2 /nobreak >nul
start "" "http://localhost:8000/icon_dashboard.html"
exit
