Deno.serve(async () => {
  return Response.json({
    error: 'Image uploads are handled directly by Supabase Storage from the app. This backend upload endpoint is disabled.'
  }, { status: 410 });
});