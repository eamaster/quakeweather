# 🔒 Security Notice

## ⚠️ CRITICAL: API Keys Were Exposed

**If you're seeing this after November 12, 2025:**

API keys and tokens were previously committed to this repository in documentation files. These have been **removed**, but if you cloned this repository before the cleanup, you should:

### Immediate Actions Required

1. **Rotate ALL API keys immediately:**
   - OpenWeather API Key → [Rotate here](https://home.openweathermap.org/api_keys)
   - Mapbox Token → [Rotate here](https://account.mapbox.com/access-tokens/)
   - Cohere API Key → [Rotate here](https://dashboard.cohere.com/api-keys)

2. **Never use the old exposed keys** - They should be considered compromised

3. **Use environment variables** for all new keys (never commit them)

---

## 📋 Previously Exposed Credentials

The following credentials were exposed in Git history:

- **OpenWeather API Keys**: Multiple keys in various `.md` files
- **Mapbox Token**: Hardcoded in `Map.tsx` and documented in `.md` files
- **Cohere API Key**: Hardcoded with fallback in `explain.ts` route

**Status:** ✅ All references removed from current codebase

**Action Required:** 🔴 **ROTATE ALL KEYS IMMEDIATELY**

---

## 🛡️ Security Best Practices

### DO:
- ✅ Use environment variables for all API keys
- ✅ Add `.env` and `.dev.vars` to `.gitignore`
- ✅ Use Wrangler secrets for production: `npx wrangler secret put <KEY_NAME>`
- ✅ Review commits before pushing to ensure no secrets
- ✅ Use `.env.example` files to show required variables (without actual values)

### DON'T:
- ❌ NEVER commit API keys to Git
- ❌ NEVER hardcode credentials in source code
- ❌ NEVER share credentials in documentation
- ❌ NEVER push `.env` or `.dev.vars` files to Git

---

## 🔄 How to Rotate Compromised API Keys

### OpenWeather API Key

1. Go to: https://home.openweathermap.org/api_keys
2. Click "Revoke" on the old key
3. Click "Generate" to create a new key
4. Update your environment:
   ```bash
   npx wrangler secret put OPENWEATHER_API_KEY
   # Enter new key
   ```

### Mapbox Token

1. Go to: https://account.mapbox.com/access-tokens/
2. Click "Revoke" on the exposed token
3. Click "Create a token" for a new one
4. Update your environment:
   ```bash
   npx wrangler secret put MAPBOX_TOKEN
   # Enter new token
   
   # Also update for frontend:
   # Edit .env file: VITE_MAPBOX_TOKEN=new_token
   # Or in Cloudflare Pages → Settings → Environment Variables
   ```

### Cohere API Key

1. Go to: https://dashboard.cohere.com/api-keys
2. Revoke the old key
3. Generate a new API key
4. Update your environment:
   ```bash
   npx wrangler secret put COHERE_API_KEY
   # Enter new key
   ```

---

## 📧 Reporting Security Issues

If you discover a security vulnerability in QuakeWeather, please:

1. **DO NOT** open a public issue
2. Email the maintainer directly (check GitHub profile)
3. Provide details about the vulnerability
4. Allow reasonable time for a fix before public disclosure

---

## ✅ Current Security Status

**Last Security Audit:** November 12, 2025

**Issues Found:**
- ✅ FIXED: API keys in documentation files
- ✅ FIXED: Hardcoded Mapbox token in Map.tsx
- ✅ FIXED: Hardcoded Cohere API key in explain.ts

**Current Status:**
- ✅ All credentials removed from codebase
- ✅ Environment variables properly configured
- ✅ `.gitignore` updated to prevent future exposure
- ✅ `.cursorignore` added to protect sensitive files
- ✅ Example files created (`.dev.vars.example`)

**Action Required by Users:**
- 🔴 **ROTATE ALL API KEYS** if you used the exposed ones
- ✅ Use environment variables going forward
- ✅ Never commit `.env` or `.dev.vars` files

---

**For more information on API key security, see:** [How to Rotate API Keys](https://howtorotate.com/)

