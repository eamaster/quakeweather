# Root Cause: VITE_MAPBOX_TOKEN Not Available During Local Build

## The Problem

When you deploy using `wrangler pages deploy dist`, you're deploying a **pre-built** `dist` folder that was built **locally** on your machine. 

**The issue**: 
- Cloudflare Pages dashboard environment variables are **only available during Cloudflare's build process**
- When you run `npm run build` locally, Vite needs `VITE_MAPBOX_TOKEN` **during the local build**
- Your local build doesn't have access to Cloudflare dashboard variables
- The deployed `dist` folder was built without the token, so the error persists

## The Solution

You have **two options**:

### Option 1: Set Environment Variable Locally (For Manual Deployment)

Create a local `.env` file (gitignored) with your Mapbox token:

1. **Create `.env` file** in the project root:
   ```
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   ```

2. **Rebuild** the project:
   ```powershell
   npm run build
   ```

3. **Deploy** the new build:
   ```powershell
   npm run pages:deploy
   ```

### Option 2: Use Cloudflare Pages Build System (Recommended)

Instead of building locally, let Cloudflare Pages build the project using the environment variables from the dashboard:

1. **Connect your Git repository** to Cloudflare Pages
2. **Set build command**: `npm run build`
3. **Set build output directory**: `dist`
4. **Push to Git** - Cloudflare will automatically build and deploy
5. The build will use environment variables from the dashboard

## Why This Happens

- **Local Build** (`npm run build`): Runs on your machine, needs local environment variables
- **Cloudflare Build**: Runs on Cloudflare's servers, uses dashboard environment variables
- **Manual Deploy** (`wrangler pages deploy dist`): Deploys a pre-built folder (built locally)
- **Automatic Deploy** (Git integration): Cloudflare builds the project (uses dashboard variables)

## Recommended Fix

Since you're using manual deployment, use **Option 1**:

1. Create `.env` file locally with the token
2. Rebuild the project
3. Redeploy

The `.env` file is already gitignored, so it won't be committed to the repository.

