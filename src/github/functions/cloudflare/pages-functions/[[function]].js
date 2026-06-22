import { handlePortableRequest, getFunctionNameFromUrl } from "../../shared/portableFunctionProxy.js";

export async function onRequest(context) {
  const { request, env, params } = context;
  try {
    const routeName = Array.isArray(params.function) ? params.function.join("/") : params.function;
    const functionName = routeName || getFunctionNameFromUrl(request.url);
    return await handlePortableRequest({ request, env, functionName });
  } catch (error) {
    console.error("Cloudflare Pages portable function error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}