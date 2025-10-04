@echo off
echo ========================================
echo   Testing OpenWeather API Key
echo ========================================
echo.
echo Your API Key: REMOVED_OPENWEATHER_API_KEY
echo.

echo [1/3] Testing One Call API 3.0 (Current Implementation)...
echo.
curl -s "https://api.openweathermap.org/data/3.0/onecall?lat=33.44&lon=-94.04&appid=REMOVED_OPENWEATHER_API_KEY" > temp_response.json
findstr /C:"\"cod\":401" temp_response.json >nul 2>&1
if %errorlevel% equ 0 (
    echo ❌ API 3.0: FAILED - Unauthorized ^(401^)
    echo    Your API key does NOT have access to One Call API 3.0
    echo.
) else (
    findstr /C:"\"cod\":403" temp_response.json >nul 2>&1
    if %errorlevel% equ 0 (
        echo ❌ API 3.0: FAILED - Forbidden ^(403^)
        echo    You need to subscribe to One Call API 3.0
        echo.
    ) else (
        findstr /C:"\"current\"" temp_response.json >nul 2>&1
        if %errorlevel% equ 0 (
            echo ✅ API 3.0: SUCCESS!
            echo    Your API key works with One Call API 3.0
            echo.
        ) else (
            echo ❌ API 3.0: FAILED - Unknown error
            echo    Check temp_response.json for details
            echo.
        )
    )
)

echo [2/3] Testing One Call API 2.5 (Free Tier)...
echo.
curl -s "https://api.openweathermap.org/data/2.5/onecall?lat=33.44&lon=-94.04&appid=REMOVED_OPENWEATHER_API_KEY" > temp_response2.json
findstr /C:"\"cod\":401" temp_response2.json >nul 2>&1
if %errorlevel% equ 0 (
    echo ❌ API 2.5: FAILED - Your API key is invalid
    echo.
) else (
    findstr /C:"\"current\"" temp_response2.json >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ API 2.5: SUCCESS!
        echo    Your API key works with the free tier API 2.5
        echo.
    ) else (
        echo ❌ API 2.5: FAILED - Unknown error
        echo.
    )
)

echo [3/3] Testing Current Weather API (Basic)...
echo.
curl -s "https://api.openweathermap.org/data/2.5/weather?lat=33.44&lon=-94.04&appid=REMOVED_OPENWEATHER_API_KEY" > temp_response3.json
findstr /C:"\"cod\":401" temp_response3.json >nul 2>&1
if %errorlevel% equ 0 (
    echo ❌ Basic API: FAILED - Your API key is invalid or expired
    echo.
) else (
    findstr /C:"\"weather\"" temp_response3.json >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Basic API: SUCCESS!
        echo    Your API key is valid
        echo.
    ) else (
        echo ❌ Basic API: FAILED - Unknown error
        echo.
    )
)

echo ========================================
echo   Test Results Summary
echo ========================================
echo.

echo Full API responses saved in:
echo   - temp_response.json  ^(API 3.0^)
echo   - temp_response2.json ^(API 2.5^)
echo   - temp_response3.json ^(Basic API^)
echo.

echo ----------------------------------------
echo WHAT TO DO NEXT:
echo ----------------------------------------
echo.

findstr /C:"\"cod\":401" temp_response.json >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  YOUR API KEY NEEDS ONE CALL API 3.0 SUBSCRIPTION
    echo.
    echo Action Required:
    echo 1. Go to: https://openweathermap.org/api/one-call-3
    echo 2. Click "Subscribe" under "One Call by Call"
    echo 3. Choose the plan ^(1,000 calls/day FREE^)
    echo 4. Complete subscription
    echo 5. Your key will work immediately
    echo.
    echo OR use the free API 2.5 by editing:
    echo    src/server/lib/openweather.ts
    echo    Change line 5 to: 
    echo    const ONECALL_BASE = 'https://api.openweathermap.org/data/2.5/onecall';
    echo.
) else (
    findstr /C:"\"current\"" temp_response.json >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ YOUR API KEY IS WORKING!
        echo.
        echo If weather still doesn't work in the app:
        echo 1. Make sure you clicked an earthquake marker
        echo 2. Click the "Show Weather ^& Insights" button
        echo 3. Check browser console ^(F12^) for errors
        echo 4. Check backend terminal for error messages
        echo 5. See TROUBLESHOOTING.md for more help
        echo.
    )
)

echo ========================================
pause

