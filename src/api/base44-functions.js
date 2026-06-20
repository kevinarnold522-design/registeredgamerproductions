/* global process */
import { createClient } from "@supabase/supabase-js";

const BUCKET = "gamerproductionsmedia";
const MAX_BYTES = 25 * 1024 * 1024;

function json(res, status, body) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, api_key");
  return res.status(status).json(body);
}

function safePath(folder, fileName) {
  const originalName = String(fileName || "upload").replace(/[^a-zA-Z0-9._-]/g, "-");
  const extension = originalName.includes(".") ? originalName.split(".").pop() : "bin";
  const safeFolder = String(folder || "uploads").replace(/[^a-zA-Z0-9/_-]/g, "-");
  return `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${String(extension || "bin").toLowerCase()}`;
}

async function createSupabaseUpload(req, res) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://smymannqqogtshvsiqyp.supabase.co";
  if (!serviceKey) return json(res, 500, { error: "Supabase upload service is not configured." });

  const size = Number(req.body?.size || 0);
  if (size > MAX_BYTES) return json(res, 400, { error: "File is too large. Maximum size is 25MB." });

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const path = safePath(req.body?.folder, req.body?.fileName);
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) return json(res, 500, { error: error.message });

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return json(res, 200, { bucket: BUCKET, path, token: data.token, signedUrl: data.signedUrl, publicUrl: publicData.publicUrl });
}

async function forwardToCloudflare(req, res, functionName) {
  const cloudflareBase = (process.env.VITE_CF_API_URL || process.env.CF_API_URL || "https://website-connected-gamerproductions.kevinarnold522.workers.dev").replace(/\/$/, "");
  const response = await fetch(`${cloudflareBase}/functions/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
    },
    body: JSON.stringify(req.body || {}),
  });
  const data = await response.json().catch(() => ({}));
  return json(res, response.status, data);
}

export default async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") return json(res, 204, {});
    const functionName = req.query.function || req.query.name || req.body?.functionName || req.body?.name;
    if (functionName === "createSupabaseUpload") return createSupabaseUpload(req, res);
    if (functionName === "updateProfileMedia") return forwardToCloudflare(req, res, "updateProfileMedia");
    return json(res, 404, { error: "Function not found" });
  } catch (error) {
    console.error("Vercel function error", error);
    return json(res, 500, { error: error.message });
  }
}