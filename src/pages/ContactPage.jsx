import React, { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Mail, MessageSquare, Send, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await base44.entities.Feedback.create({
      user_name: form.name,
      user_email: form.email,
      subject: form.subject,
      message: form.message,
      category: "general",
    });
    setSent(true);
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-purple-900/30 h-16 flex items-center px-6 justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Gamepad2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-white text-sm">GAMER <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Productions</span></span>
        </a>
        <a href="/" className="text-purple-400 text-sm font-semibold hover:text-purple-300">← Back to Home</a>
      </nav>

      <div className="pt-24 pb-16 px-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Contact Us</h1>
          <p className="text-gray-400">Have a question or need support? We're here to help.</p>
        </motion.div>

        {sent ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-green-900/20 border border-green-700/40 rounded-2xl p-10 text-center">
            <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
            <h2 className="text-white font-black text-xl mb-2">Message Sent!</h2>
            <p className="text-gray-400">Thanks for reaching out. We'll get back to you as soon as possible.</p>
            <a href="/" className="inline-block mt-6 px-6 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors">Back to Home</a>
          </motion.div>
        ) : (
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Your Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="John Doe"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Subject</label>
              <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required placeholder="How can we help?"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Message</label>
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={6}
                placeholder="Tell us what's on your mind..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm resize-none" />
            </div>
            <div className="bg-gray-800/60 rounded-xl p-4 text-sm text-gray-400">
              <p className="font-semibold text-gray-300 mb-1">💬 Reach Us on Facebook</p>
              <p>You can also message us directly on Facebook: <a href={OFFICIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline font-semibold">@Gamer.Productions</a></p>
            </div>
            <button type="submit" disabled={sending}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black hover:opacity-90 transition-opacity disabled:opacity-50">
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : "Send Message"}
            </button>
          </motion.form>
        )}
      </div>
    </div>
  );
}