function corsHeaders(request) {
  const origin = request.headers.get("Origin");
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "Content-Type, Authorization, api_key",
    "Vary": "Origin, Access-Control-Request-Headers",
    ...(origin ? { "Access-Control-Allow-Credentials": "true" } : {}),
  };
}

function json(request, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(request),
    },
  });
}

export async function onRequestGet(context) {
  const { request } = context;
  const countryCode = String(
    request.cf?.country ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    ""
  ).toUpperCase();

  const countryNames = {
    PH: "Philippines",
  };

  return json(request, {
    countryCode,
    country: countryCode,
    countryName: countryNames[countryCode] || countryCode || "Unknown",
  });
}

export function onRequestOptions(context) {
  return new Response(null, { headers: corsHeaders(context.request) });
}