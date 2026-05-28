import React from "react";
import { motion } from "framer-motion";
import { Gamepad2, Shield } from "lucide-react";

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly to us when you create an account, such as your name, email address, username, and profile details. We also collect information about your activity on the platform including listings created, purchases made, messages sent, and content uploaded. Automatically collected data includes IP address, browser type, device identifiers, and usage analytics.`
  },
  {
    title: "2. How We Use Your Information",
    content: `We use collected information to: operate and improve the GAMER Productions platform; process transactions and send related notices; send marketing communications (with your consent); respond to comments and questions; monitor and analyze trends and usage; detect and prevent fraudulent transactions and other illegal activities; and personalize your experience.`
  },
  {
    title: "3. Information Sharing",
    content: `We do not sell, trade, or otherwise transfer your personally identifiable information to third parties without your consent, except to trusted third parties who assist us in operating our website (e.g., PayPal, Stripe for payment processing), as long as those parties agree to keep this information confidential. We may also release your information when required to comply with the law.`
  },
  {
    title: "4. Cookies",
    content: `We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, some portions of our service may not function properly.`
  },
  {
    title: "5. Advertising",
    content: `GAMER Productions may display third-party advertisements, including those served by Monetag and Quge5 ad networks. These advertisers may use cookies and web beacons to measure effectiveness and personalize ad content. We do not control the content of these advertisements. By using our platform, you consent to the display of such ads.`
  },
  {
    title: "6. Data Security",
    content: `We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or method of electronic storage is 100% secure. We strive to use commercially acceptable means to protect your information.`
  },
  {
    title: "7. Children's Privacy",
    content: `Our platform is not directed to children under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.`
  },
  {
    title: "8. Your Rights",
    content: `You have the right to: access and receive a copy of your personal data; rectify inaccurate data; request deletion of your data; object to processing of your data; and data portability. To exercise these rights, please contact us at support@gamerproductions.com.`
  },
  {
    title: "9. Changes to This Policy",
    content: `We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.`
  },
  {
    title: "10. Contact Us",
    content: `If you have any questions about this Privacy Policy, please contact us at support@gamerproductions.com or through our Contact page.`
  },
];

export default function PrivacyPolicy() {
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last Updated: May 28, 2026</p>
        </motion.div>

        <div className="space-y-6">
          {sections.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-base mb-3">{s.title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{s.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}