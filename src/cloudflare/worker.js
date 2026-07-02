// =====================================================================
// Gamer.Productions — Cloudflare Worker (primary backend)
// Mirrors the Base44 backend functions + a generic entity REST layer.
// Base44 remains the live backup via the dual-write layer in db.js.
// =====================================================================
import { createRecord, updateRecord, deleteRecord, listRecords } from "./db.js";
import { handleFunction } from "./functions.js";
import { normalizeListingRecord } from "../lib/categoryMatching.js";

const SUPABASE_FALLBACK_URL = "https://smymannqqogtshvsiqyp.supabase.co";
const SUPABASE_FALLBACK_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNteW1hbm5xcW9ndHNodnNpcXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MjMyOTYsImV4cCI6MjA5Njk5OTI5Nn0.mY40GwnnOoUXf111fgAhWgfzc8sapyBNcLISzbMWocg";
const ACTIVE_LISTINGS_CACHE_TTL_SECONDS = 120;

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

async function fetchSupabaseListingPage(env, from = 0, pageSize = 1000) {
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || SUPABASE_FALLBACK_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_KEY || env.VITE_SUPABASE_ANON_KEY || SUPABASE_FALLBACK_ANON_KEY;

  const url = new URL(`${supabaseUrl}/rest/v1/Listing`);
  url.searchParams.set("select", "id,created_date,updated_date,data");
  url.searchParams.set("data->>status", "eq.active");
  url.searchParams.set("order", "created_date.desc");

  const res = await fetch(url.toString(), {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Range: `${from}-${from + pageSize - 1}`,
      Prefer: "count=exact",
    },
  });
  const text = await res.text();
  let data = [];
  try { data = text ? JSON.parse(text) : []; } catch { data = []; }
  if (!res.ok) {
    throw new Error(data?.message || `Supabase listings request failed (${res.status})`);
  }
  return Array.isArray(data) ? data : [];
}

async function fetchAllActiveListings(env) {
  const out = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const rows = await fetchSupabaseListingPage(env, from, pageSize);
    out.push(...rows.map((row) =>
      normalizeListingRecord({
        ...(row?.data || {}),
        id: row?.id,
        created_date: row?.created_date,
        updated_date: row?.updated_date,
      })
    ));
    if (rows.length < pageSize) break;
    from += pageSize;
  }

  return out;
}

function withCors(request, response, extraHeaders = {}) {
  const headers = new Headers(response.headers);
  const cors = corsHeaders(request);
  Object.entries(cors).forEach(([key, value]) => headers.set(key, value));
  Object.entries(extraHeaders).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, { status: response.status, headers });
}

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

      // ---- Cached listing snapshot: GET /cache/listings-active ----
      if (parts[0] === "cache" && parts[1] === "listings-active" && request.method === "GET") {
        const cache = caches.default;
        const cacheKey = new Request(`${url.origin}/cache/listings-active`, { method: "GET" });
        const cached = await cache.match(cacheKey);
        if (cached) {
          return withCors(request, cached, { "X-GP-Cache": "HIT" });
        }

        const rows = await fetchAllActiveListings(env);
        const response = new Response(JSON.stringify(rows), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": `public, max-age=${ACTIVE_LISTINGS_CACHE_TTL_SECONDS}, s-maxage=${ACTIVE_LISTINGS_CACHE_TTL_SECONDS}`,
          },
        });
        await cache.put(cacheKey, response.clone());
        return withCors(request, response, { "X-GP-Cache": "MISS" });
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
