export function onRequest(context) {
  return new Response("Backend is working!", {
    headers: { "Content-Type": "text/plain" },
  });
}
