// Vercel serverless migration template for Base44 backend functions.
// Copy one live Base44 function at a time and adapt its handler into this function.

export default async function handler(req, res) {
  try {
    const payload = req.body || {};
    return res.status(200).json({
      ok: true,
      message: "Replace this template with a migrated Base44 function handler.",
      payload
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}