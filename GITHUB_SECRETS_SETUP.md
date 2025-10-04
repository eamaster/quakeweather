# GitHub Secrets Setup Guide

🔐 **Required GitHub Secrets for Automated Deployment**

You **MUST** configure these secrets before GitHub Actions can deploy to Cloudflare Pages.

---

## 📍 Where to Add Secrets

Go to: **https://github.com/eamaster/quakeweather/settings/secrets/actions**

Or navigate:
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions** (in left sidebar)
4. Click **New repository secret**

---

## 🔑 Required Secrets

### 1. CLOUDFLARE_API_TOKEN

**How to get it:**
1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use template: **"Edit Cloudflare Workers"**
4. Or create custom token with these permissions:
   - **Account** → **Cloudflare Pages** → **Edit**
5. Click **Continue to summary** → **Create Token**
6. **Copy the token** (you'll only see it once!)

**In GitHub:**
- **Name:** `CLOUDFLARE_API_TOKEN`
- **Value:** Paste the token you copied
- Click **Add secret**

---

### 2. CLOUDFLARE_ACCOUNT_ID

**Value:** `767ce92674d0bd477eef696c995faf16`

**In GitHub:**
- **Name:** `CLOUDFLARE_ACCOUNT_ID`
- **Value:** `767ce92674d0bd477eef696c995faf16`
- Click **Add secret**

**How to find it (if needed):**
1. Go to: https://dash.cloudflare.com
2. Click on your domain or any Cloudflare Pages project
3. Look at the URL: `https://dash.cloudflare.com/YOUR_ACCOUNT_ID/...`
4. Or go to Overview page - Account ID is shown in the right sidebar

---

### 3. OPENWEATHER_API_KEY (Optional, but recommended)

**Value:** `REMOVED_OPENWEATHER_API_KEY`

**In GitHub:**
- **Name:** `OPENWEATHER_API_KEY`
- **Value:** `REMOVED_OPENWEATHER_API_KEY`
- Click **Add secret**

**Note:** This is optional for GitHub Actions build, but you MUST set it in Cloudflare Pages environment variables for the app to work.

---

### 4. MAPBOX_TOKEN (Optional, but recommended)

**Value:** `REMOVED_MAPBOX_TOKEN`

**In GitHub:**
- **Name:** `MAPBOX_TOKEN`
- **Value:** `REMOVED_MAPBOX_TOKEN`
- Click **Add secret**

---

## ✅ Verification Checklist

After adding all secrets, verify:

- [ ] **CLOUDFLARE_API_TOKEN** - Set in GitHub Secrets
- [ ] **CLOUDFLARE_ACCOUNT_ID** - Set to `767ce92674d0bd477eef696c995faf16`
- [ ] **OPENWEATHER_API_KEY** - Set in GitHub Secrets (optional)
- [ ] **MAPBOX_TOKEN** - Set in GitHub Secrets (optional)

---

## 🚀 Test the Deployment

After setting up the secrets:

1. **Make any small change** to trigger a deployment:
   ```bash
   git commit --allow-empty -m "Test deployment"
   git push origin main
   ```

2. **Watch GitHub Actions:**
   - Go to: https://github.com/eamaster/quakeweather/actions
   - Click on the latest workflow run
   - Watch it build and deploy

3. **Check Cloudflare Pages:**
   - Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather
   - You should see a new deployment

---

## 🐛 Common Issues

### Error: "Invalid API Token"
**Solution:** 
- Make sure the token has **Cloudflare Pages Edit** permission
- Create a new token if needed
- Update the `CLOUDFLARE_API_TOKEN` secret

### Error: "Account ID not found"
**Solution:**
- Double-check the Account ID: `767ce92674d0bd477eef696c995faf16`
- Make sure there are no extra spaces

### Error: "Project not found"
**Solution:**
- The first deployment will create the project automatically
- If it fails, create the project manually in Cloudflare Pages first

---

## 📝 Important Notes

1. **GitHub Secrets vs Cloudflare Environment Variables:**
   - **GitHub Secrets:** Used by GitHub Actions to deploy
   - **Cloudflare Environment Variables:** Used by the running app at runtime
   - You need to set API keys in **BOTH** places!

2. **After Deployment:**
   - Don't forget to set `OPENWEATHER_API_KEY` and `MAPBOX_TOKEN` in Cloudflare Pages environment variables
   - Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/settings/environment-variables

3. **Security:**
   - Never commit secrets to the repository
   - Never share your API tokens publicly
   - Secrets are encrypted in GitHub and only accessible to workflows

---

## 🎯 Quick Setup Summary

```bash
# Step 1: Add GitHub Secrets (4 secrets)
1. CLOUDFLARE_API_TOKEN (create at dash.cloudflare.com)
2. CLOUDFLARE_ACCOUNT_ID = 767ce92674d0bd477eef696c995faf16
3. OPENWEATHER_API_KEY = REMOVED_OPENWEATHER_API_KEY
4. MAPBOX_TOKEN = REMOVED_MAPBOX_TOKEN

# Step 2: Trigger deployment
git commit --allow-empty -m "Test deployment"
git push origin main

# Step 3: Set Cloudflare Pages environment variables
Go to Cloudflare Dashboard → Pages → quakeweather → Settings → Environment Variables
Add: OPENWEATHER_API_KEY and MAPBOX_TOKEN
```

---

**Ready to deploy! 🚀**

