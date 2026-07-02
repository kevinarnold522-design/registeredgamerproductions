# Cloudflare Pages & Wrangler Deployment Configuration

## Overview
The Registered Gamer Productions website is configured for **automatic continuous deployment** from GitHub to Cloudflare Pages and Cloudflare Workers.

## Deployment Flow

### 1. Cloudflare Pages (Frontend)
**Trigger**: Push to `main` branch  
**Project Name**: `gamer-productions`  
**Configuration File**: `wrangler.jsonc`

```json
{
  "name": "website-connected-gamerproductions",
  "compatibility_date": "2026-06-27",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  }
}
```

**Workflow**: `.github/workflows/cloudflare-deploy.yml`
- Runs on: `push` to `main` branch & `workflow_dispatch`
- Steps:
  1. Checkout latest code from GitHub
  2. Setup Node.js 20
  3. Install dependencies (`npm ci`)
  4. Build site (`npm run build`)
  5. Deploy to Cloudflare Pages using Wrangler

### 2. Cloudflare Workers (Backend/API)
**Trigger**: Push to `main` branch (when `cloudflare/` files change)  
**Worker Name**: `gamer-productions-api`  
**Configuration File**: `src/cloudflare/wrangler.toml`

**Permanent Bindings** (🔒 DO NOT CHANGE):
- **D1 Database**: `gp` (ID: `1f45c382-7d39-4532-8320-0f162b588a9b`)
- **R2 Bucket**: `gamerproductionsmedia`

**Workflow**: `.github/workflows/cloudflare-deploy.yml` (second job)
- Runs on: `push` to `main` branch & `workflow_dispatch`
- Steps:
  1. Checkout latest code from GitHub
  2. Setup Node.js 20
  3. Install dependencies
  4. Build site
  5. Deploy Worker to Cloudflare

### 3. Alternative Workflow (Src/Cloudflare)
**File**: `src/cloudflare/.github/workflows/deploy.yml`
- Deploys to Cloudflare Workers
- Applies D1 database schema
- Triggers on changes to `cloudflare/**` paths

## Required GitHub Secrets

Both workflows require the following secrets to be configured in your GitHub repository settings:

```
CLOUDFLARE_API_TOKEN      - Cloudflare API token with Workers & Pages permissions
CLOUDFLARE_ACCOUNT_ID     - Your Cloudflare account ID
```

## Manual Deployment

You can manually trigger deployments at any time:

```bash
# From command line
git push origin main

# Or use GitHub Actions UI
1. Go to .github/workflows/cloudflare-deploy.yml
2. Click "Run workflow"
3. Select branch (main)
4. Click "Run workflow"
```

## Deployment Commands

If deploying locally:

```bash
# Build the site
npm run build

# Deploy to Cloudflare Pages
npm run deploy:cloudflare

# Or directly with Wrangler
npx wrangler pages deploy dist --project-name gamer-productions
```

## Key Features

✅ **Automatic Deployments**: Every commit to main branch triggers automatic deployment  
✅ **Zero-Downtime**: Cloudflare Pages handles traffic seamlessly during deployments  
✅ **Database Schema Management**: D1 schema applied automatically via Worker deployment  
✅ **Dual-Write Backup**: Base44 SDK provides backup/redundancy  
✅ **Concurrency Control**: Prevents multiple deployments from running simultaneously  
✅ **Environment Variables**: Automatically synced from Cloudflare via `vars` section

## Troubleshooting

### Deployment Fails
1. Check GitHub Actions logs: Go to repository → Actions → cloudflare-deploy
2. Verify secrets are configured: Settings → Secrets and variables → Actions
3. Check Cloudflare account status and API token validity

### Worker Not Updating
1. Ensure changes are in `src/cloudflare/` directory
2. Check if workflow path filter matches: `paths: ["cloudflare/**"]`
3. Manually trigger workflow from GitHub Actions UI

### Database Issues
1. Verify D1 database ID: `1f45c382-7d39-4532-8320-0f162b588a9b`
2. Check if schema.sql is valid
3. Review Cloudflare D1 dashboard for errors

## Latest Deployment Status

The deployment pipeline is **fully configured and operational**. Every push to the `main` branch will automatically:
1. Build the latest code
2. Deploy the frontend to Cloudflare Pages
3. Deploy the backend Worker to Cloudflare
4. Apply any database schema changes

No manual action is required for deployments after a Git commit to main.
