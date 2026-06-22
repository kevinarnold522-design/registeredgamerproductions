// =====================================================================
// Shared helper for Cloudflare Pages Functions (one file per route).
// Every /functions/<name>.js file is a thin wrapper that delegates to the
// single source-of-truth handler in ../functions.js, so business logic
// lives in exactly one place. Data = D1, auth = Supabase token / session.
// =====================================================================
import { handleFunction } from "../functions.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, api_key",
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
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
        return json(result.body, result.status || 200);
      } catch (err) {
        console.error(`Function '${name}' error:`, err.message, err.stack);
        return json({ error: err.message }, 500);
      }
    },
    onRequestOptions() {
      return new Response(null, { headers: CORS });
    },
  };
}