/* global process */
import { invokePortableFunction } from "../shared/portableFunctionProxy.js";

// Vercel adapter template for every registered Base44 backend function.
// Recommended final path: /api/base44-functions/[...name].js
// Required env: BASE44_FUNCTION_BASE_URL
export default async function handler(req, res) {
  try {
    const name = Array.isArray(req.query.name) ? req.query.name.join("/") : req.query.name;
    const result = await invokePortableFunction({
      functionName: name || req.body?.functionName || req.body?.name,
      payload: req.body || {},
      request: { headers: req.headers },
      env: process.env,
    });
    return res.status(result.status || 200).json(result.body);
  } catch (error) {
    console.error("Vercel function adapter error", error);
    return res.status(500).json({ error: error.message });
  }
}