export async function onRequest(context) {
  // 1. Access your environment variables
  const supabaseUrl = context.env.SUPABASE_URL;
  const supabaseKey = context.env.SUPABASE_ANON_KEY;

  // 2. Perform your logic
  // For now, let's return a response confirming the environment is ready
  return new Response(JSON.stringify({ 
    status: "Backend is working!",
    supabaseConfigured: !!supabaseUrl && !!supabaseKey // Returns true if keys are set
  }), {
    headers: { "Content-Type": "application/json" },
  });
}
 
