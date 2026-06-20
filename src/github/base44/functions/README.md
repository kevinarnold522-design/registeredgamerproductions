# Portable Base44 Backend Functions

Revision date: 2026-06-20

This folder is the GitHub handoff area for running the app's Base44 backend functions on multiple deployment targets:

- Vercel Serverless Functions
- Supabase Edge Functions
- Cloudflare Workers
- Cloudflare Pages Functions

The live app still uses the root `functions/` folder. Do not remove that folder until every migrated endpoint is deployed and tested on the target platform.

## What was added

```text
github/base44/functions/
  FUNCTION_REGISTRY.json
  MIGRATION_MANIFEST.json
  README.md
  shared/
    portableFunctionProxy.js
  adapters/
    cloudflare-worker-template.js
    supabase-edge-template.js
    vercel-function-template.js
  cloudflare/
    worker.js
    pages-functions/[[function]].js
  supabase/
    functions/base44-functions/index.js
  vercel/
    api/base44-functions.js
    README.md
```

## Function inventory

All current backend functions are registered in `FUNCTION_REGISTRY.json` and `MIGRATION_MANIFEST.json`, including admin, PayPal, Supabase upload, email notification, ghost-account, moderation, and test functions.

## Compatibility behavior

The adapters preserve:

1. Function name routing
2. POST payload shape
3. Authorization/api headers
4. JSON response format
5. Vercel, Supabase Edge, Cloudflare Worker, and Cloudflare Pages request styles

Until a function is fully ported into a target platform, the adapter proxies requests to the configured Base44/backend function root.

## Required environment variable

Set this in the target platform:

```text
BASE44_FUNCTION_BASE_URL=https://your-function-root.example.com
```

The adapter appends the function name to that root. Examples:

```text
POST /api/base44-functions/createPaypalOrder
POST /api/base44-functions/api/register
POST /functions/createPaypalOrder
POST /functions/v1/base44-functions?function=createPaypalOrder
```

Payment/storage functions still need their existing platform secrets when fully ported:

```text
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
SUPABASE_SERVICE_ROLE_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## Deploy target notes

### Vercel

Copy `vercel/api/base44-functions.js` and `shared/portableFunctionProxy.js` into the same relative structure in a Vercel project. Calls go to `/api/base44-functions?function=<functionName>`. If you want path-style calls, copy the same file into Vercel's catch-all route format: `api/base44-functions/[...name].js`.

### Supabase Edge Functions

Copy `supabase/functions/base44-functions/index.js` and `shared/portableFunctionProxy.js` into a Supabase functions project. Calls can include `?function=<functionName>` or the function path after `/base44-functions/`.

### Cloudflare Workers

Use `cloudflare/worker.js` as the Worker entry. Route `/functions/*` or `/api/base44-functions/*` to the Worker.

### Cloudflare Pages Functions

Use `cloudflare/pages-functions/[[function]].js` as a catch-all Pages Function route.

## Migration rule

When fully porting a function, preserve:

1. Input payload shape
2. Entity reads/writes
3. Payment metadata and transaction tracking
4. Admin-only checks
5. Existing PayPal, Stripe, and Supabase secrets
6. Response JSON format