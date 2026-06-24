// =====================================================================
// Gamer.Productions — Cloudflare Worker (primary backend)
// Mirrors the Base44 backend functions + a generic entity REST layer.
// Base44 remains the live backup via the dual-write layer in db.js.
// =====================================================================
import { createRecord, updateRecord, deleteRecord, listRecords } from "./db.js";
import { handleFunction } from "./functions.js";

function corsHeaders(request, methods = "GET, POST, PUT, DELETE, OPTIONS") {
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

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders(request) });

    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean);

    try {
      // Auth is handled entirely by Supabase on the frontend; the Worker only
      // verifies the Supabase access token (Bearer) inside each function.

      // ---- Backend functions:  /functions/<name> ----
      if (parts[0] === "functions" && parts[1]) {
        const body = request.method === "POST" ? await request.json().catch(() => ({})) : {};
        const result = await handleFunction(parts[1], body, env, request);
        return json(request, result.body, result.status || 200);
      }

      // ---- Generic entity REST:  /entities/<Entity>[/<id>] ----
      if (parts[0] === "entities" && parts[1]) {
        const entity = parts[1];
        const id = parts[2];

        if (request.method === "GET") {
          const filter = Object.fromEntries(url.searchParams.entries());
          const limit = Number(filter.limit) || 50;
          delete filter.limit;
          return json(request, await listRecords(env, entity, filter, limit));
        }
        if (request.method === "POST") {
          return json(request, await createRecord(env, entity, await request.json()), 201);
        }
        if (request.method === "PUT" && id) {
          return json(request, await updateRecord(env, entity, id, await request.json()));
        }
        if (request.method === "DELETE" && id) {
          return json(request, await deleteRecord(env, entity, id));
        }
      }

      // ---- Orders + R2 files snapshot:  GET /orders-files ----
      if (parts[0] === "orders-files") {
        const dbResult = await env.DB.prepare(
          "SELECT Id, CustomerName, OrderDate FROM [Order] ORDER BY OrderDate DESC LIMIT 100"
        ).all();
        const r2Result = await env.MEDIA.list();
        return json(request, {
          orders: dbResult.results,
          files: r2Result.objects,
        });
      }

      // ---- Health check ----
      if (parts[0] === "health" || parts.length === 0) {
        return json(request, { status: "ok", primary: "cloudflare", backup: "base44", time: new Date().toISOString() });
      }

      return json(request, { error: "Not found" }, 404);
    } catch (err) {
      console.error("Worker error:", err.message, err.stack);
      return json(request, { error: err.message }, 500);
    }
  },
};