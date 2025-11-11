@echo off
echo ========================================
echo   QuakeWeather - Development Startup
echo ========================================
echo.
echo Starting both Frontend and Backend servers...
echo.
echo IMPORTANT:
echo - Frontend will be at http://localhost:5173 (or 5174)
echo - Backend will be at http://localhost:8787
echo - You need BOTH servers running!
echo.
echo Building the app first...
call npm run build
echo.
echo Starting servers in separate windows...
echo.

REM Start Frontend in new window
start "QuakeWeather Frontend" cmd /k "npm run dev"

REM Wait a bit
timeout /t 3 /nobreak > nul

REM Start Backend in new window
start "QuakeWeather Backend" cmd /k "npx wrangler pages dev dist --port=8787"

echo.
echo ========================================
echo   Servers Started!
echo ========================================
echo.
echo Frontend: http://localhost:5173 (check window for actual port)
echo Backend:  http://localhost:8787
echo.
echo Close the separate windows to stop the servers
echo.
pause

