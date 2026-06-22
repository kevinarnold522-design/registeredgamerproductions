/* global process */
import { invokePortableFunction } from "../shared/portableFunctionProxy.js";

export default async function handler(req, res) {
  try {
    const result = await invokePortableFunction({
      functionName: req.query.function || req.query.name || req.body?.functionName || req.body?.name,
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