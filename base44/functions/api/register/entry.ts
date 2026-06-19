export async function onRequestPost(context) {
try {
const { request, env } = context;
const { email, password } = await request.json();

if (!email || !password) {
return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
}

// Hash password with native Web Crypto API
const encoder = new TextEncoder();
const data = encoder.encode(password);
const hashBuffer = await crypto.subtle.digest("SHA-256", data);
const passwordHash = Array.from(new Uint8Array(hashBuffer))
.map(b => b.toString(16).padStart(2, "0"))
.join("");

const userId = crypto.randomUUID();

// Securely insert into D1 using your 'DB' binding
await env.DB.prepare(
"INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)"
)
.bind(userId, email, passwordHash)
.run();

return new Response(JSON.stringify({ success: true }), {
status: 200,
headers: { "Content-Type": "application/json" }
});

} catch (error) {
return new Response(JSON.stringify({ error: error.message }), { status: 500 });
}
}
