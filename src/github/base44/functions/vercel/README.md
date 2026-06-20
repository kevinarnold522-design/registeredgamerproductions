# Vercel Adapter

Use `api/base44-functions.js` for a safe query-based route:

```text
POST /api/base44-functions?function=createPaypalOrder
POST /api/base44-functions?function=api/register
```

If you want path-based function names in a real Vercel repo, you can rename/copy this file to Vercel's catch-all route format:

```text
api/base44-functions/[...name].js
```

Then route examples become:

```text
POST /api/base44-functions/createPaypalOrder
POST /api/base44-functions/api/register
```

Required env:

```text
BASE44_FUNCTION_BASE_URL
``