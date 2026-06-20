import { handlePortableRequest } from "../shared/portableFunctionProxy.js";

export default {
  async fetch(request, env) {
    try {
      return await handlePortableRequest({ request, env });
    } catch (error) {
      console.error("Cloudflare portable function error", error);
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
};