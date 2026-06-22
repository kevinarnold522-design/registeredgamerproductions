// Cloudflare Worker — FUNCTIONS ONLY
// Supabase handles data (entities) and auth.
import { handleFunction } from "./functions.js";
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" };
const json = (data, status) => new Response(JSON.stringify(data), { status: status || 200, headers: { "Content-Type": "application/json", ...CORS } });
export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean);
    try {
      if (parts[0] === "functions" && parts[1]) {
        const body = request.method === "POST" ? await request.json().catch(() => ({})) : {};
        const result = await handleFunction(parts[1], body, env, request);
        return json(result.body, result.status || 200);
      }
      if (parts[0] === "media" && parts[1] && request.method === "GET") {
        const key = parts.slice(1).join("/");
        const obj = await env.MEDIA.get(key);
        if (!obj) return json({ error: "Not found" }, 404);
        const headers = new Headers();
        obj.writeHttpMetadata(headers);
        headers.set("etag", obj.httpEtag);
        return new Response(obj.body, { headers });
      }
      if (parts[0] === "health" || parts.length === 0) return json({ status: "ok", service: "functions-only", time: new Date().toISOString() });
      return json({ error: "Not found" }, 404);
    } catch (err) {
      console.error("Worker error:", err.message);
      return json({ error: err.message }, 500);
    }
  },
};
