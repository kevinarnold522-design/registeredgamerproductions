// =====================================================================
// Gamer.Productions — Cloudflare Worker (primary backend)
// Mirrors the Base44 backend functions + a generic entity REST layer.
// Base44 remains the live backup via the dual-write layer in db.js.
// =====================================================================
import { createRecord, updateRecord, deleteRecord, listRecords } from "./db.js";
import { handleFunction } from "./functions.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, api_key",
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...CORS } });

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean);

    try {
      // ---- Backend functions:  /functions/<name> ----
      if (parts[0] === "functions" && parts[1]) {
        const body = request.method === "POST" ? await request.json().catch(() => ({})) : {};
        const result = await handleFunction(parts[1], body, env, request);
        return json(result.body, result.status || 200);
      }

      // ---- Generic entity REST:  /entities/<Entity>[/<id>] ----
      if (parts[0] === "entities" && parts[1]) {
        const entity = parts[1];
        const id = parts[2];

        if (request.method === "GET") {
          const filter = Object.fromEntries(url.searchParams.entries());
          const limit = Number(filter.limit) || 50;
          delete filter.limit;
          return json(await listRecords(env, entity, filter, limit));
        }
        if (request.method === "POST") {
          return json(await createRecord(env, entity, await request.json()), 201);
        }
        if (request.method === "PUT" && id) {
          return json(await updateRecord(env, entity, id, await request.json()));
        }
        if (request.method === "DELETE" && id) {
          return json(await deleteRecord(env, entity, id));
        }
      }

      // ---- Health check ----
      if (parts[0] === "health" || parts.length === 0) {
        return json({ status: "ok", primary: "cloudflare", backup: "base44", time: new Date().toISOString() });
      }

      return json({ error: "Not found" }, 404);
    } catch (err) {
      console.error("Worker error:", err.message, err.stack);
      return json({ error: err.message }, 500);
    }
  },
};