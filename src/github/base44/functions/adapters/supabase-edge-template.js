/* global Deno */
import { handlePortableRequest } from "../shared/portableFunctionProxy.js";

// Supabase Edge Function adapter for every registered Base44 backend function.
// Recommended function name: base44-functions
// Route examples:
//   /functions/v1/base44-functions/createPaypalOrder
//   /functions/v1/base44-functions?function=createPaypalOrder
// Required env: BASE44_FUNCTION_BASE_URL
const env = { get: (key) => Deno.env.get(key) };

Deno.serve(async (request) => {
  try {
    return await handlePortableRequest({ request, env });
  } catch (error) {
    console.error("Supabase Edge function adapter error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});