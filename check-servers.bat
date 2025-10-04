@echo off
echo ========================================
echo   QuakeWeather - Server Status Check
echo ========================================
echo.
echo Checking if servers are running...
echo.

echo [1/3] Testing Frontend Server (http://localhost:5173)...
curl -s http://localhost:5173 > nul 2>&1
if %errorlevel% equ 0 (
    echo   ✅ Frontend is running on port 5173
) else (
    curl -s http://localhost:5174 > nul 2>&1
    if %errorlevel% equ 0 (
        echo   ✅ Frontend is running on port 5174
    ) else (
        echo   ❌ Frontend is NOT running
        echo      Start it with: npm run dev
    )
)

echo.
echo [2/3] Testing Backend Server (http://localhost:8787)...
curl -s http://localhost:8787/api/health > nul 2>&1
if %errorlevel% equ 0 (
    echo   ✅ Backend API is running on port 8787
    echo.
    echo   API Response:
    curl -s http://localhost:8787/api/health
    echo.
) else (
    echo   ❌ Backend API is NOT running
    echo      Start it with: npx wrangler pages dev dist --port=8787
)

echo.
echo [3/3] Testing API Endpoints...
curl -s http://localhost:8787/api/quakes?feed=all_hour > nul 2>&1
if %errorlevel% equ 0 (
    echo   ✅ Quakes API is working
) else (
    echo   ❌ Quakes API is not responding
)

echo.
echo ========================================
echo   Status Check Complete
echo ========================================
echo.
echo If both servers show ✅, your app should work!
echo If you see ❌, start the missing server(s).
echo.
pause

