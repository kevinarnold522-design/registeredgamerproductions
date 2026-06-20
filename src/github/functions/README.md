# Main GitHub Portable Functions

This main `github/functions` folder mirrors the Base44 handoff functions and includes adapters for all 3 deployment targets:

- Vercel
- Supabase Edge Functions
- Cloudflare Workers / Pages Functions

## Structure

```text
github/functions/
  FUNCTION_REGISTRY.json
  MIGRATION_MANIFEST.json
  shared/portableFunctionProxy.js
  vercel/api/base44-functions.js
  supabase/functions/base44-functions/index.js
  cloudflare/worker.js
  cloudflare/pages-functions/[[function]].js
```

## Usage

Set this environment variable in the target platform:

```text
BASE44_FUNCTION_BASE_URL=https://your-function-root.example.com
```

Then call functions through the target route:

```text
POST /api/base44-functions?function=createPaypalOrder
POST /functions/createPaypalOrder
POST /functions/v1/base44-functions?function=createPaypalOrder
```

All registered functions are listed in `FUNCTION_REGISTRY.json`.