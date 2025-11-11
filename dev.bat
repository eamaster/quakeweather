@echo off
REM Local development script for QuakeWeather

echo 🛠️ Starting QuakeWeather in development mode...
echo.
echo This will start:
echo   - Frontend (Vite) at http://localhost:5173
echo   - Backend (Cloudflare Functions) at http://localhost:8787
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start both dev servers
start "Frontend Dev Server" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul
start "Backend Dev Server" cmd /k "npx wrangler pages dev dist --port=8787"

echo.
echo ✅ Servers starting...
echo 🌐 Open http://localhost:5173 in your browser
echo.
pause

