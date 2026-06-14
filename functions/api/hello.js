export function onRequest(context) {
  return new Response("Backend is working!", {
    headers: { "Content-Type": "text/plain" },
  });
}
export async function onRequest(context) {
  // context.env contains your Supabase keys!
  const supabaseUrl = context.env.SUPABASE_URL;
  const supabaseKey = context.env.SUPABASE_ANON_KEY;
  
  // You can now use these to make secure requests to your database
  return new Response(JSON.stringify({ message: "Supabase ready to connect!" }), {
    headers: { "Content-Type": "application/json" },
  });
}
