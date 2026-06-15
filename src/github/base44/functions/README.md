# Base44 Functions Migration Folder

Revision date: 2026-06-15

This folder is the GitHub handoff area for migrating the app's Base44 backend functions to Cloudflare Workers or Vercel backend functions later.

## Current function inventory
See `MIGRATION_MANIFEST.json` for the complete function list currently used by the app.

## Migration rule
Each Base44 function should be ported one-by-one into the target platform while preserving:

1. Input payload shape
2. Entity reads/writes
3. Payment metadata and transaction tracking
4. Admin-only checks
5. Existing PayPal and Stripe secrets
6. Response JSON format

## Target backend structure
Recommended structure for future GitHub migration:

```text
github/base44/functions/
  MIGRATION_MANIFEST.json
  README.md
  adapters/
    cloudflare-worker-template.js
    vercel-function-template.js
```

Do not remove the live `functions/` folder until every migrated endpoint is deployed and tested.