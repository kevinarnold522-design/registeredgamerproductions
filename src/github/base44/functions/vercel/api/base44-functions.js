/* global process */
import { invokePortableFunction } from "../../shared/portableFunctionProxy.js";

export default async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, api_key, x-base44-user-token");
      return res.status(204).end();
    }

    const functionName = req.query.function || req.query.name || req.body?.functionName || req.body?.name;
    const result = await invokePortableFunction({
      functionName,
      payload: req.body || {},
      request: { headers: req.headers },
      env: process.env,
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(result.status || 200).json(result.body);
  } catch (error) {
    console.error("Vercel portable function error", error);
    return res.status(500).json({ error: error.message });
  }
}