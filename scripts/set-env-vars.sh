#!/bin/bash
# Script to set Cloudflare Pages environment variables
# This script helps you set environment variables for the quakeweather project

set -e

PROJECT_NAME="quakeweather"
ACCOUNT_ID="767ce92674d0bd477eef696c995faf16"

echo "🔧 Setting Cloudflare Pages Environment Variables"
echo "=================================================="
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: wrangler CLI is not installed"
    echo "   Install it with: npm install -g wrangler"
    exit 1
fi

# Check if user is authenticated
if ! wrangler whoami &> /dev/null; then
    echo "❌ Error: You are not authenticated with Cloudflare"
    echo "   Run: wrangler login"
    exit 1
fi

echo "📝 This script will help you set environment variables for Cloudflare Pages"
echo "   Project: $PROJECT_NAME"
echo "   Account ID: $ACCOUNT_ID"
echo ""

# Function to set a secret (runtime variable)
set_secret() {
    local var_name=$1
    local description=$2
    local is_build_time=$3
    
    echo ""
    echo "Setting: $var_name"
    echo "Description: $description"
    
    if [ "$is_build_time" = "true" ]; then
        echo "⚠️  NOTE: This is a BUILD-TIME variable (VITE_ prefix)"
        echo "   For build-time variables, you MUST set them in the Cloudflare Dashboard:"
        echo "   https://dash.cloudflare.com/$ACCOUNT_ID/pages/view/$PROJECT_NAME/settings/environment-variables"
        echo "   And mark it as 'Available during build'"
        echo ""
        read -p "Do you want to set this in the dashboard instead? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "   → Open: https://dash.cloudflare.com/$ACCOUNT_ID/pages/view/$PROJECT_NAME/settings/environment-variables"
            echo "   → Click 'Production' environment"
            echo "   → Add variable: $var_name"
            echo "   → Mark as 'Available during build': YES"
            echo "   → Enter your value and save"
            return
        fi
    fi
    
    read -sp "Enter value for $var_name: " value
    echo
    
    if [ -z "$value" ]; then
        echo "   ⚠️  Skipping $var_name (empty value)"
        return
    fi
    
    # For Pages, we use wrangler pages secret put
    # Note: This sets runtime secrets, not build-time env vars
    if [ "$is_build_time" = "true" ]; then
        echo "   ⚠️  WARNING: Build-time variables (VITE_*) cannot be set via CLI"
        echo "   You MUST set $var_name in the Cloudflare Dashboard:"
        echo "   https://dash.cloudflare.com/$ACCOUNT_ID/pages/view/$PROJECT_NAME/settings/environment-variables"
        echo "   And mark it as 'Available during build'"
    else
        echo "   Setting runtime secret: $var_name"
        echo "$value" | wrangler pages secret put "$var_name" --project-name="$PROJECT_NAME" || {
            echo "   ❌ Failed to set $var_name"
            echo "   You may need to set it manually in the dashboard"
        }
    fi
}

# Set VITE_MAPBOX_TOKEN (build-time variable)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. VITE_MAPBOX_TOKEN (BUILD-TIME VARIABLE - REQUIRED)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  IMPORTANT: Build-time variables (VITE_*) MUST be set in the dashboard"
echo "   They cannot be set via CLI because they're needed during the build process"
echo ""
echo "   Manual setup required:"
echo "   1. Go to: https://dash.cloudflare.com/$ACCOUNT_ID/pages/view/$PROJECT_NAME/settings/environment-variables"
echo "   2. Click 'Production' environment"
echo "   3. Click 'Add variable'"
echo "   4. Variable name: VITE_MAPBOX_TOKEN"
echo "   5. Value: Your Mapbox token (get it from https://account.mapbox.com/access-tokens/)"
echo "   6. ✅ CHECK 'Available during build' (this is crucial!)"
echo "   7. Click 'Save'"
echo ""
read -p "Press Enter after you've set VITE_MAPBOX_TOKEN in the dashboard... " -r
echo ""

# Set OPENWEATHER_API_KEY (runtime variable)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. OPENWEATHER_API_KEY (RUNTIME VARIABLE - REQUIRED)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
set_secret "OPENWEATHER_API_KEY" "OpenWeather API key for weather data" "false"

# Set COHERE_API_KEY (runtime variable, optional)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. COHERE_API_KEY (RUNTIME VARIABLE - OPTIONAL)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "Do you want to set COHERE_API_KEY? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    set_secret "COHERE_API_KEY" "Cohere API key for AI explanations" "false"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Environment Variables Setup Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: After setting environment variables, you MUST redeploy:"
echo "   1. Go to: https://dash.cloudflare.com/$ACCOUNT_ID/pages/view/$PROJECT_NAME"
echo "   2. Click 'Deployments' tab"
echo "   3. Click 'Create deployment' or retry the latest deployment"
echo "   4. Environment variables are only applied to new builds"
echo ""
echo "🔗 Quick links:"
echo "   • Environment Variables: https://dash.cloudflare.com/$ACCOUNT_ID/pages/view/$PROJECT_NAME/settings/environment-variables"
echo "   • Deployments: https://dash.cloudflare.com/$ACCOUNT_ID/pages/view/$PROJECT_NAME/deployments"
echo ""

