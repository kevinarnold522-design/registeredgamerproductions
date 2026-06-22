// =====================================================================
// Supabase entities client — the app's single, permanent database layer.
//
// Every entity lives in a Supabase Postgres table with a fixed header
// (id, created_date, updated_date, created_by_id, created_by) plus a
// `data jsonb` column holding all entity-specific fields.
//
// This client exposes the exact same shape the app already calls on
// `base44.entities.<Entity>.list/filter/get/create/update/delete`, and
// flattens `data` back to the top level so every existing page keeps
// working with no changes. All reads and writes go straight to Supabase.
// =====================================================================
import { supabase } from "@/lib/supabaseClient";

// Columns that live as real table columns (everything else goes in `data`).
const HEADER = new Set(["id", "created_date", "updated_date", "created_by_id", "created_by"]);

// Turn a stored row { id, created_date, ..., data:{...} } into the flat
// record shape the app expects ({ id, created_date, ...all data fields }).
function flatten(row) {
  if (!row) return row;
  const { data, ...header } = row;
  return { ...(data || {}), ...header };
}

// Split a flat record into { header, data } for storage.
function split(record = {}) {
  const header = {};
  const data = {};
  for (const [k, v] of Object.entries(record)) {
    if (HEADER.has(k)) header[k] = v;
    else data[k] = v;
  }
  return { header, data };
}

function parseSort(sort) {
  if (!sort) return { column: "created_date", ascending: false };
  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;
  // Header fields are real columns; everything else lives inside data.
  const column = HEADER.has(field) ? field : `data->>${field}`;
  return { column, ascending: !desc };
}

// Apply an equality filter object. Header fields hit real columns; the rest
// match against the jsonb `data` field via the ->> text accessor.
function applyFilter(builder, query = {}) {
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    if (HEADER.has(k)) {
      builder = builder.eq(k, v);
    } else {
      // jsonb text comparison — values are coerced to strings by Postgres.
      builder = builder.eq(`data->>${k}`, String(v));
    }
  }
  return builder;
}

function makeEntity(name) {
  return {
    async list(sort, limit) {
      const { column, ascending } = parseSort(sort);
      let q = supabase.from(name).select("*").order(column, { ascending });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return (data || []).map(flatten);
    },

    async filter(query = {}, sort, limit) {
      const { column, ascending } = parseSort(sort);
      let q = supabase.from(name).select("*");
      q = applyFilter(q, query);
      q = q.order(column, { ascending });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return (data || []).map(flatten);
    },

    async get(id) {
      if (!id) return null;
      const { data, error } = await supabase.from(name).select("*").eq("id", id).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? flatten(data) : null;
    },

    async create(record = {}) {
      const { header, data } = split(record);
      const row = { ...header, data };
      const { data: inserted, error } = await supabase.from(name).insert(row).select("*").single();
      if (error) throw new Error(error.message);
      return flatten(inserted);
    },

    async bulkCreate(items = []) {
      const rows = items.map((it) => {
        const { header, data } = split(it);
        return { ...header, data };
      });
      const { data: inserted, error } = await supabase.from(name).insert(rows).select("*");
      if (error) throw new Error(error.message);
      return (inserted || []).map(flatten);
    },

    async update(id, patch = {}) {
      // Merge patch into existing data so partial updates don't wipe fields.
      const { data: current, error: readErr } = await supabase.from(name).select("data").eq("id", id).maybeSingle();
      if (readErr) throw new Error(readErr.message);
      const { header, data } = split(patch);
      const mergedData = { ...((current && current.data) || {}), ...data };
      const row = { ...header, data: mergedData };
      const { data: updated, error } = await supabase.from(name).update(row).eq("id", id).select("*").single();
      if (error) throw new Error(error.message);
      return flatten(updated);
    },

    async delete(id) {
      const { error } = await supabase.from(name).delete().eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    },

    // Realtime subscription — mirrors the old SDK's signature. Calls the
    // handler with { id, type: 'create'|'update'|'delete', data } and returns
    // an unsubscribe function.
    subscribe(handler) {
      const channel = supabase
        .channel(`realtime-${name}-${Math.random().toString(36).slice(2)}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: name },
          (payload) => {
            const typeMap = { INSERT: "create", UPDATE: "update", DELETE: "delete" };
            const row = payload.new && Object.keys(payload.new).length ? payload.new : payload.old;
            handler({
              id: row?.id,
              type: typeMap[payload.eventType] || payload.eventType,
              data: flatten(row),
            });
          }
        )
        .subscribe();
      return () => {
        try { supabase.removeChannel(channel); } catch (_) {}
      };
    },
  };
}

export const supabaseEntities = new Proxy(
  {},
  { get: (_t, name) => makeEntity(String(name)) }
);

export default supabaseEntities;