// =====================================================================
// Data-access layer — Cloudflare D1 is PRIMARY, Base44 is the BACKUP.
// Every write goes to D1 first (source of truth), then mirrors to Base44
// so Base44 stays a usable, up-to-date backup of all data.
// =====================================================================

// Map entity name -> typed D1 table. Anything not listed falls back to the
// generic `entity_records` JSON mirror so no data is ever lost.
const TABLE_MAP = {
  User: "users",
  UserProfile: "user_profiles",
  Listing: "listings",
  Order: "orders",
  GamingCommunity: "gaming_communities",
  CommunityMember: "community_members",
  ChannelPost: "channel_posts",
  Notification: "notifications",
  Transactions: "transactions",
  GlobalTransactions: "global_transactions",
  Follow: "follows",
};

// Columns that hold JSON in D1 (arrays/objects) and must be stringified.
const JSON_COLUMNS = new Set([
  "avatar_urls", "verification_docs", "payment_methods", "payout_details",
  "social_links", "saved_addresses", "gaming_accounts", "subcategories",
  "images", "tags", "keywords", "platforms", "store_platforms",
  "store_platform_links", "logo_urls", "cover_urls", "moderator_emails",
  "sections", "image_urls",
]);

function genId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 24);
}

function encodeValue(key, value) {
  if (value === undefined) return null;
  if (JSON_COLUMNS.has(key) && typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }
  if (typeof value === "boolean") return value ? 1 : 0;
  return value;
}

// Decode a row coming back from a typed D1 table: JSON columns are stored as
// strings, so parse them back into arrays/objects for the frontend.
function decodeRow(row) {
  if (!row) return row;
  const out = { ...row };
  for (const key of JSON_COLUMNS) {
    const v = out[key];
    if (typeof v === "string" && v.length) {
      try { out[key] = JSON.parse(v); } catch { /* leave as-is */ }
    }
  }
  return out;
}

// ---- Base44 backup mirror (best-effort, never blocks the primary write) ----
async function mirrorToBase44(env, op, entityName, idOrData, maybeData) {
  if (env.BASE44_BACKUP_ENABLED !== "true" || !env.BASE44_SERVICE_TOKEN || !env.BASE44_APP_ID) return;
  const base = `https://app.base44.com/api/apps/${env.BASE44_APP_ID}/entities/${entityName}`;
  const headers = {
    "Content-Type": "application/json",
    "api_key": env.BASE44_SERVICE_TOKEN,
  };
  try {
    if (op === "create") {
      await fetch(base, { method: "POST", headers, body: JSON.stringify(idOrData) });
    } else if (op === "update") {
      await fetch(`${base}/${idOrData}`, { method: "PUT", headers, body: JSON.stringify(maybeData) });
    } else if (op === "delete") {
      await fetch(`${base}/${idOrData}`, { method: "DELETE", headers });
    }
  } catch (err) {
    console.error(`Base44 backup mirror failed (${op} ${entityName}):`, err.message);
  }
}

export async function createRecord(env, entityName, data) {
  const id = data.id || genId();
  const now = new Date().toISOString();
  const record = { id, created_date: now, updated_date: now, ...data, id };
  const table = TABLE_MAP[entityName];

  if (table) {
    const cols = Object.keys(record);
    const placeholders = cols.map(() => "?").join(", ");
    const values = cols.map((c) => encodeValue(c, record[c]));
    await env.DB.prepare(
      `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`
    ).bind(...values).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO entity_records (id, entity_name, data, created_date, updated_date, created_by_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(id, entityName, JSON.stringify(record), now, now, record.created_by_id || null).run();
  }

  // mirror to Base44 backup (non-blocking failure)
  await mirrorToBase44(env, "create", entityName, record);
  return record;
}

export async function updateRecord(env, entityName, id, data) {
  const now = new Date().toISOString();
  const patch = { ...data, updated_date: now };
  const table = TABLE_MAP[entityName];

  if (table) {
    const cols = Object.keys(patch);
    const setClause = cols.map((c) => `${c} = ?`).join(", ");
    const values = cols.map((c) => encodeValue(c, patch[c]));
    await env.DB.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`)
      .bind(...values, id).run();
    await mirrorToBase44(env, "update", entityName, id, patch);
    const fresh = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first();
    return decodeRow(fresh) || { id, ...patch };
  }

  const row = await env.DB.prepare(`SELECT data FROM entity_records WHERE id = ?`).bind(id).first();
  const merged = { ...(row ? JSON.parse(row.data) : {}), ...patch };
  await env.DB.prepare(`UPDATE entity_records SET data = ?, updated_date = ? WHERE id = ?`)
    .bind(JSON.stringify(merged), now, id).run();

  await mirrorToBase44(env, "update", entityName, id, patch);
  return merged;
}

export async function deleteRecord(env, entityName, id) {
  const table = TABLE_MAP[entityName];
  if (table) {
    await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
  } else {
    await env.DB.prepare(`DELETE FROM entity_records WHERE id = ?`).bind(id).run();
  }
  await mirrorToBase44(env, "delete", entityName, id);
  return { id, deleted: true };
}

export async function listRecords(env, entityName, filter = {}, limit = 50) {
  const table = TABLE_MAP[entityName];
  if (table) {
    const keys = Object.keys(filter);
    const where = keys.length ? "WHERE " + keys.map((k) => `${k} = ?`).join(" AND ") : "";
    const values = keys.map((k) => encodeValue(k, filter[k]));
    const { results } = await env.DB.prepare(
      `SELECT * FROM ${table} ${where} ORDER BY created_date DESC LIMIT ?`
    ).bind(...values, limit).all();
    return (results || []).map(decodeRow);
  }
  const { results } = await env.DB.prepare(
    `SELECT data FROM entity_records WHERE entity_name = ? ORDER BY created_date DESC LIMIT ?`
  ).bind(entityName, limit).all();
  return (results || []).map((r) => JSON.parse(r.data));
}