import { handlePortableRequest } from "../shared/portableFunctionProxy.js";

// Cloudflare Worker adapter for every registered Base44 backend function.
// Route examples:
//   POST /functions/createPaypalOrder
//   POST /functions/api/register
// Required env: BASE44_FUNCTION_BASE_URL
export default {
  async fetch(request, env) {
    try {
      return await handlePortableRequest({ request, env });
    } catch (error) {
      console.error("Cloudflare Worker function adapter error", error);
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
};