// =====================================================================
// Shared helper for Cloudflare Pages Functions (one file per route).
// Every /functions/<name>.js file is a thin wrapper that delegates to the
// single source-of-truth handler in ../functions.js, so business logic
// lives in exactly one place. Data = D1, auth = Supabase token / session.
// =====================================================================
import { handleFunction } from "../functions.js";

function corsHeaders(request, methods = "POST, OPTIONS") {
  const origin = request.headers.get("Origin");
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "Content-Type, Authorization, api_key",
    "Vary": "Origin, Access-Control-Request-Headers",
    ...(origin ? { "Access-Control-Allow-Credentials": "true" } : {}),
  };
}

const json = (request, data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(request) },
  });

// Build a Pages Functions handler bound to a specific backend function name.
// Returns { onRequestPost, onRequestOptions } to export from each route file.
export function makeFunctionRoute(name) {
  return {
    async onRequestPost(context) {
      const { request, env } = context;
      try {
        const body = await request.json().catch(() => ({}));
        const result = await handleFunction(name, body, env, request);
        return json(request, result.body, result.status || 200);
      } catch (err) {
        console.error(`Function '${name}' error:`, err.message, err.stack);
        return json(request, { error: err.message }, 500);
      }
    },
    onRequestOptions(context) {
      return new Response(null, { headers: corsHeaders(context.request) });
    },
  };
}