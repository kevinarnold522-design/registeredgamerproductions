import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function EmailLoginModal({ isOpen, onClose }) {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");

if (!isOpen) return null;

const handleSubmit = async (e) => {
e.preventDefault();
setLoading(true);
setMessage("");

try {
const res = await fetch("/api/register", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ email, password }),
});

const data = await res.json();

if (res.ok && data.success) {
setMessage("Account successfully saved to Cloudflare D1!");
setTimeout(() => {
onClose();
}, 2000);
} else {
setMessage(data.error || "Something went wrong.");
}
} catch (err) {
setMessage("Failed to connect to registration server.");
} finally {
setLoading(false);
}
};

return (
<AnimatePresence>
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4" onClick={onClose}>
<motion.div
initial={{ scale: 0.95 }}
animate={{ scale: 1 }}
exit={{ scale: 0.95 }}
onClick={(e) => e.stopPropagation()}
className="bg-gray-950 border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-2xl"
>
<div className="flex justify-between items-center mb-6">
<h2 className="text-white font-black text-2xl">Sign Up / In</h2>
<button onClick={onClose} className="text-gray-400 hover:text-white">
<X size={24} />
</button>
</div>

<form onSubmit={handleSubmit} className="space-y-4 mb-4">
<div>
<label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Email Address</label>
<input
type="email"
required
value={email}
onChange={(e) => setEmail(e.target.value)}
className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
placeholder="you@example.com"
/>
</div>
<div>
<label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Password</label>
<input
type="password"
required
value={password}
onChange={(e) => setPassword(e.target.value)}
className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
placeholder="••••••••"
/>
</div>

<button
type="submit"
disabled={loading}
className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
>
{loading ? "Processing..." : "Submit to D1"}
</button>
</form>

{message && (
<p className="text-center text-sm font-medium text-white bg-white/5 py-2 px-3 rounded-xl border border-white/5">
{message}
</p>
)}
</motion.div>
</div>
</AnimatePresence>
);
}
