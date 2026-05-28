import React, { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, FileText, AlertTriangle } from "lucide-react";

const termsSections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using GAMER Productions, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the platform. We reserve the right to modify these terms at any time, and continued use of the platform constitutes acceptance of any modifications.`
  },
  {
    title: "2. User Accounts",
    content: `You must be at least 13 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account. GAMER Productions reserves the right to suspend or terminate accounts that violate these terms.`
  },
  {
    title: "3. Content & Intellectual Property",
    content: `Users retain ownership of their original content. By posting content on GAMER Productions, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content within the platform. You represent and warrant that you own or have the right to use all content you post, and that it does not infringe on any third-party intellectual property rights.`
  },
  {
    title: "4. Prohibited Content",
    content: `Users may not post: content that infringes any copyright, trademark, or other intellectual property; illegal or harmful content; hate speech, harassment, or threats; spam or misleading information; sexually explicit content; cheats or hacks for online multiplayer games that harm other players; or any content that violates applicable laws.`
  },
  {
    title: "5. Marketplace Rules",
    content: `Sellers are solely responsible for the products and services they list. GAMER Productions takes a 10% platform fee on all sales. Sellers must deliver purchased digital goods promptly. Fraudulent listings will result in immediate account termination and potential legal action. Physical goods must be accurately described and in the condition stated.`
  },
  {
    title: "6. Monetization Requirements",
    content: `To qualify for the Gaming Checkmark monetization program, all content must be 100% original and created by the account holder. Reposts, re-uploads, or third-party content will not be approved for monetization. GAMER Productions reserves the right to deny, suspend, or revoke monetization at any time. Views must be organic — bot or purchased traffic results in permanent ban.`
  },
  {
    title: "7. Payments & Refunds",
    content: `Payments are processed through PayPal and Stripe. GAMER Productions does not store payment credentials. Refunds are handled on a case-by-case basis. Digital products are generally non-refundable once downloaded. For physical products, buyers may request a refund within 7 days if the item is not as described.`
  },
  {
    title: "8. Limitation of Liability",
    content: `GAMER Productions is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including loss of profits, data, or goodwill.`
  },
  {
    title: "9. Governing Law",
    content: `These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration, except where prohibited by law.`
  },
];

const dmcaSections = [
  {
    title: "DMCA Notice & Takedown Policy",
    content: `GAMER Productions respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA). If you believe any content on our platform infringes your copyright, please submit a DMCA takedown notice.`
  },
  {
    title: "To File a DMCA Takedown Notice, Include:",
    content: `1. Your full legal name and contact information (email, address, phone). 2. A description of the copyrighted work you claim has been infringed. 3. The URL or specific location of the allegedly infringing content on our platform. 4. A statement that you have a good faith belief that the use is not authorized. 5. A statement that the information in your notice is accurate, under penalty of perjury. 6. Your physical or electronic signature.`
  },
  {
    title: "Submit DMCA Notices To:",
    content: `Email: dmca@gamerproductions.com\n\nWe will process valid DMCA notices within 5-10 business days and remove infringing content promptly. Repeat infringers will have their accounts permanently terminated.`
  },
  {
    title: "Counter-Notice",
    content: `If you believe your content was removed in error, you may submit a counter-notice including: your contact information, identification of the removed content, a statement under penalty of perjury that the material was removed by mistake or misidentification, and your consent to the jurisdiction of the relevant federal district court.`
  },
];

export default function TermsDMCA() {
  const [tab, setTab] = useState("terms");

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

      <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Terms & DMCA</h1>
          <p className="text-gray-500 text-sm">Last Updated: May 28, 2026</p>
        </motion.div>

        {/* Tab Switch */}
        <div className="flex gap-2 mb-8 bg-gray-900 rounded-xl p-1">
          <button onClick={() => setTab("terms")} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === "terms" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>
            Terms of Service
          </button>
          <button onClick={() => setTab("dmca")} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === "dmca" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>
            DMCA Policy
          </button>
        </div>

        {tab === "terms" && (
          <div className="space-y-6">
            {termsSections.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-white font-bold text-base mb-3">{s.title}</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{s.content}</p>
              </motion.div>
            ))}
          </div>
        )}

        {tab === "dmca" && (
          <div className="space-y-6">
            <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-2xl p-5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-300 text-sm">Filing a false DMCA claim is a violation of federal law and may result in legal liability. Only submit a notice if you are the actual copyright holder or authorized agent.</p>
            </div>
            {dmcaSections.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-white font-bold text-base mb-3">{s.title}</h2>
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">{s.content}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}