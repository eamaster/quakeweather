# PowerShell script to set up environment variables for local build
# This creates a .env file from .env.example if it doesn't exist

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  QuakeWeather - Environment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (Test-Path .env) {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
    Write-Host ""
    Write-Host "Current .env file contents:" -ForegroundColor Yellow
    Get-Content .env | ForEach-Object {
        if ($_ -match 'VITE_MAPBOX_TOKEN') {
            $parts = $_ -split '=', 2
            if ($parts.Length -eq 2 -and $parts[1] -notmatch 'your_|placeholder') {
                Write-Host "  $($parts[0])=***HIDDEN***" -ForegroundColor Green
            } else {
                Write-Host "  $_" -ForegroundColor Red
                Write-Host "  ⚠️  WARNING: VITE_MAPBOX_TOKEN is not set!" -ForegroundColor Red
            }
        } else {
            Write-Host "  $_"
        }
    }
} else {
    Write-Host "⚠️  .env file not found" -ForegroundColor Yellow
    Write-Host ""
    
    if (Test-Path .env.example) {
        Write-Host "Creating .env file from .env.example..." -ForegroundColor Cyan
        Copy-Item .env.example .env
        Write-Host "✅ Created .env file" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  IMPORTANT: Edit .env file and set your VITE_MAPBOX_TOKEN!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Open .env file in your editor"
        Write-Host "2. Replace 'your_mapbox_public_token_here' with your actual Mapbox token"
        Write-Host "3. Get your token from: https://account.mapbox.com/access-tokens/"
        Write-Host ""
    } else {
        Write-Host "❌ ERROR: .env.example file not found!" -ForegroundColor Red
        Write-Host "Please create a .env file manually with:" -ForegroundColor Yellow
        Write-Host "  VITE_MAPBOX_TOKEN=your_mapbox_token_here" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if VITE_MAPBOX_TOKEN is set
$envContent = Get-Content .env -ErrorAction SilentlyContinue
$hasToken = $envContent | Where-Object { $_ -match '^VITE_MAPBOX_TOKEN=' -and $_ -notmatch 'your_|placeholder' }

if (-not $hasToken) {
    Write-Host "❌ VITE_MAPBOX_TOKEN is not set in .env file!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please edit .env file and set your Mapbox token:" -ForegroundColor Yellow
    Write-Host "  1. Open .env in your editor"
    Write-Host "  2. Find the line: VITE_MAPBOX_TOKEN=your_mapbox_public_token_here"
    Write-Host "  3. Replace 'your_mapbox_public_token_here' with your actual token"
    Write-Host "  4. Get your token from: https://account.mapbox.com/access-tokens/"
    Write-Host ""
    exit 1
} else {
    Write-Host "✅ VITE_MAPBOX_TOKEN is set in .env file" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now build and deploy:" -ForegroundColor Cyan
    Write-Host "  npm run build" -ForegroundColor White
    Write-Host "  npm run pages:deploy" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use the deploy script:" -ForegroundColor Cyan
    Write-Host "  .\deploy.bat" -ForegroundColor White
    Write-Host ""
}

