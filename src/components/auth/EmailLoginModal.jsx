const handleSocialLogin = (provider) => {
setMessage(`Connecting to ${provider}...`);
// Placeholder logic for OAuth redirection or handling
console.log(`OAuth initiated via ${provider}`);
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
<div className="flex justify-between items-center mb-5">
<h2 className="text-white font-black text-2xl">Sign Up / In</h2>
<button onClick={onClose} className="text-gray-400 hover:text-white">
<X size={24} />
</button>
</div>

{/* Email / Password Direct D1 Form */}
<form onSubmit={handleSubmit} className="space-y-4 mb-5">
<div>
<label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Email Address</label>
<input
type="email"
required
value={email}
onChange={(e) => setEmail(e.target.value)}
className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
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
className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
placeholder="••••••••"
/>
</div>

<button
type="submit"
disabled={loading}
className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 text-sm"
>
{loading ? "Processing..." : "Submit to D1"}
</button>
</form>

{/* Separator Divider Line */}
<div className="relative flex py-2 items-center mb-4">
<div className="flex-grow border-t border-white/10"></div>
<span className="flex-shrink mx-4 text-gray-500 text-xs uppercase tracking-widest font-bold">Or Sign In With</span>
<div className="flex-grow border-t border-white/10"></div>
</div>

{/* Social Provider Grid */}
<div className="grid grid-cols-2 gap-3 mb-4">
<button
onClick={() => handleSocialLogin("Google")}
className="flex items-center justify-center gap-2 bg-gray-900 border border-white/10 rounded-xl py-3 px-4 text-white text-sm hover:bg-gray-800 transition-colors font-medium"
>
<span>Google</span>
</button>
<button
onClick={() => handleSocialLogin("Facebook")}
className="flex items-center justify-center gap-2 bg-gray-900 border border-white/10 rounded-xl py-3 px-4 text-white text-sm hover:bg-gray-800 transition-colors font-medium"
>
<span>Facebook</span>
</button>
<button
onClick={() => handleSocialLogin("Instagram")}
className="flex items-center justify-center gap-2 bg-gray-900 border border-white/10 rounded-xl py-3 px-4 text-white text-sm hover:bg-gray-800 transition-colors font-medium"
>
<span>Instagram</span>
</button>
<button
onClick={() => handleSocialLogin("Yahoo")}
className="flex items-center justify-center gap-2 bg-gray-900 border border-white/10 rounded-xl py-3 px-4 text-white text-sm hover:bg-gray-800 transition-colors font-medium"
>
<span>Yahoo</span>
</button>
</div>

{message && (
<p className="text-center text-xs font-medium text-white bg-white/5 py-2 px-3 rounded-xl border border-white/5">
{message}
</p>
)}
</motion.div>
</div>
</AnimatePresence>
);
}
