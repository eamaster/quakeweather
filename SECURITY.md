# 🔒 Security Policy

## How We Handle Secrets

QuakeWeather follows security best practices to protect API keys and credentials.

### ✅ Secure Practices

1. **Environment Variables Only**
   - All API keys are stored in environment variables, never hardcoded in source code
   - Frontend tokens use `VITE_` prefix and are injected at build time
   - Backend secrets are read from Cloudflare Workers/Pages environment variables

2. **Git Ignore Protection**
   - `.env`, `.env.*`, and `.dev.vars` are excluded from version control
   - `.env.example` is tracked as a template with placeholders only

3. **Secret Scanning**
   - Automated secret scanning via GitHub Actions (gitleaks)
   - Pre-commit checks via `npm run secret-scan`
   - Scans on every pull request and push to main/master

4. **Server-Side Proxy**
   - All external API calls go through backend proxy
   - API keys never exposed to client-side code
   - Cloudflare Workers/Pages handles all sensitive operations

### 🔑 Required API Keys

#### Frontend (Build-Time)
- **VITE_MAPBOX_TOKEN**: Mapbox public token (required)
  - Get from: https://account.mapbox.com/access-tokens/
  - Set in `.env` file or build environment
  - Injected at build time via Vite

#### Backend (Runtime)
- **OPENWEATHER_API_KEY**: OpenWeather API key (required)
  - Get from: https://openweathermap.org/api
  - Set in Cloudflare Pages/Workers environment variables
  - Or in `.dev.vars` for local development

- **COHERE_API_KEY**: Cohere API key (optional, for AI explanations)
  - Get from: https://cohere.com/
  - Set in Cloudflare Workers secrets
  - Or in `.dev.vars` for local development

### 🚨 If You Discover a Secret in the Repository

1. **Immediately rotate the compromised key**
   - See "Rotating Compromised Keys" section below
   - Do NOT commit the fix with the old key still visible

2. **Remove the secret from git history**
   - See `SCRIPTS_TO_RUN.md` for step-by-step instructions
   - Use `git filter-repo` or BFG Repo-Cleaner

3. **Notify the maintainer**
   - Open a security issue (private) if available
   - Or contact repository maintainer directly

4. **Update documentation**
   - Ensure all examples use placeholders
   - Verify `.env.example` is up to date

### 🔄 Rotating Compromised Keys

#### OpenWeather API Key
1. Log in to https://openweathermap.org/api
2. Go to API keys section
3. Generate a new API key
4. Revoke the old key
5. Update in Cloudflare Pages/Workers environment variables
6. Update local `.dev.vars` file
7. Redeploy application

#### Mapbox Token
1. Log in to https://account.mapbox.com/
2. Go to Access tokens
3. Revoke the compromised token
4. Create a new token
5. Update `VITE_MAPBOX_TOKEN` in build environment
6. Rebuild and redeploy frontend

#### Cohere API Key
1. Log in to https://cohere.com/
2. Go to API keys section
3. Generate a new API key
4. Revoke the old key
5. Update in Cloudflare Workers secrets: `npx wrangler secret put COHERE_API_KEY`
6. Update local `.dev.vars` file
7. Redeploy backend

### 🧪 Running Secret Scans Locally

#### Using npm script:
```bash
npm run secret-scan
```

#### Using gitleaks directly:
```bash
npx gitleaks detect --no-banner --verbose
```

#### What to do if scan fails:
1. **Review the output** - Identify which files contain secrets
2. **Remove the secrets** - Replace with environment variables or placeholders
3. **Verify removal** - Run scan again to confirm
4. **Commit the fix** - Never commit secrets in the fix
5. **Rotate keys** - If secrets were exposed, rotate them immediately

### 📋 Pre-Commit Checklist

Before committing code:
- [ ] Run `npm run secret-scan` locally
- [ ] Verify no hardcoded API keys or tokens
- [ ] Check that `.env.example` is updated if adding new variables
- [ ] Ensure `.gitignore` excludes all env files
- [ ] Test that environment variables are read correctly

### 🔍 What Gets Scanned

The secret scanner checks for:
- API keys (OpenWeather, Mapbox, Cohere, etc.)
- Authentication tokens
- Private keys
- Passwords
- AWS credentials
- GitHub tokens
- And other common secret patterns

### 📚 Additional Resources

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Secret Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/wrangler/commands/#secret)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

### ⚠️ Important Notes

- **Never commit `.dev.vars` or `.env` files**
- **Never commit API keys in code or documentation**
- **Always use environment variables or secrets management**
- **Rotate keys immediately if exposed**
- **Use placeholders in documentation and examples**

---

**Last Updated**: 2025-01-XX  
**Maintained By**: QuakeWeather Team

