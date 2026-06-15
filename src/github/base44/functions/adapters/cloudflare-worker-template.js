// Cloudflare Workers migration template for Base44 backend functions.
// Copy one live Base44 function at a time and adapt its handler into this fetch shape.

export default {
  async fetch(request, env) {
    try {
      const payload = await request.json().catch(() => ({}));
      return Response.json({
        ok: true,
        message: "Replace this template with a migrated Base44 function handler.",
        payload
      });
    } catch (error) {
      console.error(error);
      return Response.json({ error: error.message }, { status: 500 });
    }
  }
};