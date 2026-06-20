/* global Deno */
import { handlePortableRequest } from "../../../shared/portableFunctionProxy.js";

const env = {
  get(key) {
    return Deno.env.get(key);
  },
};

Deno.serve(async (request) => {
  try {
    return await handlePortableRequest({ request, env });
  } catch (error) {
    console.error("Supabase Edge portable function error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});