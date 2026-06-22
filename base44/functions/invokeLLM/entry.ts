import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Proxies the Core.InvokeLLM integration so the frontend (whose base44 client
// only has entities/functions/auth) can run AI generation — e.g. the AI
// Listing Assistant. Returns the LLM result directly.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));
    const { prompt, response_json_schema, file_urls, add_context_from_internet, model } = body || {};

    if (!prompt || !String(prompt).trim()) {
      return Response.json({ error: 'A prompt is required.' }, { status: 400 });
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      ...(response_json_schema ? { response_json_schema } : {}),
      ...(Array.isArray(file_urls) && file_urls.length ? { file_urls } : {}),
      ...(add_context_from_internet ? { add_context_from_internet: true } : {}),
      ...(model ? { model } : {}),
    });

    return Response.json({ result });
  } catch (error) {
    console.error('invokeLLM error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});