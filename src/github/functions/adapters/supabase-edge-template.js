/* global Deno */
import { handlePortableRequest } from "../shared/portableFunctionProxy.js";

const env = { get: (key) => Deno.env.get(key) };

Deno.serve(async (request) => {
  try {
    return await handlePortableRequest({ request, env });
  } catch (error) {
    console.error("Supabase Edge function adapter error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});