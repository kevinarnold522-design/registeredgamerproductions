export const BACKEND_FUNCTIONS = [
  "adminGhostAccounts",
  "adminUpdateEntity",
  "api/hello",
  "api/register",
  "biweeklyReport",
  "capturePaypalPayment",
  "captureTier1Payment",
  "completePayment",
  "connectSellerPaypal",
  "copyrightViolationAlert",
  "createManagedAccount",
  "createPaypalOrder",
  "createSupabaseUpload",
  "createTier1Order",
  "dailyUpdatesEmail",
  "deleteListingPermanent",
  "getPaypalConfig",
  "getSellerPaypalStatus",
  "logLogin",
  "loginAsGhost",
  "moderateListing",
  "notifyNewContent",
  "notifyNewMember",
  "salesNotification",
  "sendDailyRewardEmail",
  "sendOrderNotification",
  "sendPaypalGuideEmail",
  "setKevinTestProfilePicture",
  "test",
  "testSupabaseListingUpload",
  "updateProfileMedia",
  "uploadToR2",
  "verifyPaymentStatus"
];

export const FUNCTION_SET = new Set(BACKEND_FUNCTIONS);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, api_key, x-base44-user-token",
};

function cleanName(name) {
  return String(name || "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .replace(/^functions\//, "")
    .replace(/^api\/base44-functions\//, "");
}

function getEnvValue(env, key) {
  if (!env) return undefined;
  if (typeof env.get === "function") return env.get(key);
  return env[key];
}

function headerValue(headers, key) {
  if (!headers) return undefined;
  if (typeof headers.get === "function") return headers.get(key);
  return headers[key] || headers[key.toLowerCase()] || headers[key.toUpperCase()];
}

export function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS, ...headers },
  });
}

export function optionsResponse() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function readJson(request) {
  if (!request) return {};
  if (request.body && typeof request.body === "object" && !(request.body instanceof ReadableStream)) return request.body;
  if (typeof request.json === "function") return await request.json().catch(() => ({}));
  return {};
}

export function getFunctionNameFromUrl(url, prefixes = ["/functions/", "/api/base44-functions/", "/base44-functions/"]) {
  const parsed = new URL(url, "https://local.base44.dev");
  const queryName = parsed.searchParams.get("function") || parsed.searchParams.get("name");
  if (queryName) return cleanName(queryName);

  for (const prefix of prefixes) {
    const idx = parsed.pathname.indexOf(prefix);
    if (idx >= 0) return cleanName(decodeURIComponent(parsed.pathname.slice(idx + prefix.length)));
  }
  return "";
}

export async function invokePortableFunction({ functionName, payload, request, env, fetchImpl = fetch }) {
  const name = cleanName(functionName || payload?.functionName || payload?.name);
  if (!FUNCTION_SET.has(name)) {
    return {
      status: 404,
      body: {
        error: "Unknown backend function",
        functionName: name,
        available_functions: BACKEND_FUNCTIONS,
      },
    };
  }

  const baseUrl = getEnvValue(env, "BASE44_FUNCTION_BASE_URL");
  if (!baseUrl) {
    return {
      status: 501,
      body: {
        error: "Portable adapter is ready, but BASE44_FUNCTION_BASE_URL is not configured.",
        functionName: name,
        expected_env: "BASE44_FUNCTION_BASE_URL",
        note: "Set this to your deployed Base44/backend function root URL, then this adapter will proxy the same payload shape on Vercel, Supabase Edge Functions, or Cloudflare.",
      },
    };
  }

  const encodedPath = name.split("/").map(encodeURIComponent).join("/");
  const targetUrl = `${String(baseUrl).replace(/\/+$/, "")}/${encodedPath}`;
  const forwardHeaders = { "Content-Type": "application/json" };
  const authorization = headerValue(request?.headers, "authorization");
  const apiKey = headerValue(request?.headers, "api_key");
  const userToken = headerValue(request?.headers, "x-base44-user-token");
  if (authorization) forwardHeaders.Authorization = authorization;
  if (apiKey) forwardHeaders.api_key = apiKey;
  if (userToken) forwardHeaders["x-base44-user-token"] = userToken;

  const response = await fetchImpl(targetUrl, {
    method: "POST",
    headers: forwardHeaders,
    body: JSON.stringify(payload || {}),
  });

  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
  return { status: response.status, body };
}

export async function handlePortableRequest({ request, env, functionName }) {
  if (request?.method === "OPTIONS") return optionsResponse();
  const payload = await readJson(request);
  const name = functionName || getFunctionNameFromUrl(request?.url || "");
  const result = await invokePortableFunction({ functionName: name, payload, request, env });
  return jsonResponse(result.body, result.status || 200);
}