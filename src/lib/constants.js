export const ADMIN_EMAILS = [
  "kevinjersey2019@gmail.com",
  "arnoldk137@gmail.com",
  "kevinarnold522@gmail.com",
];

export const isAdmin = (email) => ADMIN_EMAILS.includes(email?.toLowerCase());

// Two moderator types:
// "account_moderator" — platform-wide, no ads, near-admin power, CAN delete content but admin must approve
// "group_moderator"   — captain of their own gaming community group only, Captain badge, NO delete power
export const MODERATOR_TYPES = {
  account_moderator: {
    label: "Account Moderator",
    badge: "🛡️ Account Mod",
    color: "text-blue-400",
    bg: "bg-blue-900/20 border-blue-700/40",
    canDelete: true,        // can REQUEST deletion (admin approves)
    noAds: true,
    platformWide: true,
    desc: "Platform-wide moderator. No ads. Can manage content, but deletions require admin final approval.",
  },
  group_moderator: {
    label: "Group Moderator",
    badge: "🛡️ Captain",
    color: "text-yellow-400",
    bg: "bg-yellow-900/20 border-yellow-700/40",
    canDelete: false,       // NO delete power
    noAds: false,
    platformWide: false,
    desc: "Captain of their own gaming community group only. Max 3 groups.",
  },
};

export const CATEGORIES = [
  {
    id: "games",
    label: "🎮 Games",
    icon: "🎮",
    subcategories: ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile", "How To / Guides"],
  },
  {
    id: "gear",
    label: "🖥️ Gaming Gear",
    icon: "🖥️",
    subcategories: ["Keyboards", "Mice", "Monitors", "Headsets", "Controllers", "Chairs", "Gaming PCs", "Laptops"],
  },
  {
    id: "modding",
    label: "🔧 Modding Community",
    icon: "🔧",
    subcategories: [
      "WWE2K", "Football Life", "GTA 4", "GTA 5", "GTA SA",
      "Android", "PES", "FIFA", "NBA2K", "PPSSPP/PSP", "PS2", "PC",
    ],
  },
  {
    id: "store",
    label: "🏪 Store",
    icon: "🏪",
    subcategories: [
      "Game Accounts", "In-Game Items", "Skins", "Gift Cards",
      "Premium Mods - WWE2K", "Premium Mods - GTA 5", "Premium Mods - GTA SA",
      "Premium Mods - FIFA", "Premium Mods - PES", "Premium Mods - NBA2K",
      "Premium Mods - Football Life", "Premium Mods - PPSSPP/PSP",
      "Accessories", "Top Tech Equipment",
    ],
  },
  {
    id: "tournaments",
    label: "🏆 Tournaments",
    icon: "🏆",
    subcategories: ["FPS", "Battle Royale", "MOBA", "Sports", "Fighting", "Mobile Gaming"],
  },
  {
    id: "content_streaming",
    label: "🎬 Content/Streaming",
    icon: "🎬",
    subcategories: ["Gaming Videos", "Live Streams", "Tutorials", "Reviews", "Highlights", "Clips", "Gameplay Streams", "Esports Events"],
  },
  {
    id: "jobs",
    label: "💼 Gaming Jobs",
    icon: "💼",
    subcategories: ["QA Testing", "Game Dev", "Community Manager", "Esports Coach", "Content Creator"],
  },
  {
    id: "services",
    label: "🛠️ Services",
    icon: "🛠️",
    subcategories: ["PC Repair", "Custom Builds", "Coaching", "Boosting", "Design Services"],
  },
];

export const ACCOUNT_TYPES = [
  {
    id: "regular",
    label: "Regular Account",
    icon: "👤",
    desc: "Browse, buy, enjoy the community and share your gaming videos or products. Perfect for everyday gamers.",
    color: "from-blue-600 to-cyan-600",
  },
  {
    id: "digital_creator",
    label: "Digital Creator",
    icon: "🎨",
    desc: "Upload gameplay videos, mods, tutorials, streams, walkthroughs, highlights & missions. Earn from your content and sell digital products.",
    color: "from-purple-600 to-pink-600",
    videoTypes: ["🎮 Gameplay", "🔧 Mods", "📚 Tutorials", "📡 Streams", "🗺️ Walkthroughs", "🏆 Missions", "✂️ Highlights", "⚽ Sports Games", "🎯 FPS"],
  },
  {
    id: "business",
    label: "Professional Business",
    icon: "🏢",
    desc: "List your products, share your gaming videos, grow your brand, and reach thousands of gamers.",
    color: "from-green-600 to-emerald-600",
  },
];

export const TERMS_AND_CONDITIONS = `
TERMS AND CONDITIONS — GAMER Productions
Last Updated: May 2026

1. ACCEPTANCE OF TERMS
By accessing or using GAMER Productions ("Platform"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree, do not use the Platform.

2. ELIGIBILITY
You must be at least 13 years of age to use this Platform. By registering, you confirm you meet this requirement. Users under 18 must have parental consent.

3. ACCOUNT REGISTRATION & SECURITY
- You are responsible for maintaining the confidentiality of your account credentials.
- You agree to provide accurate, current, and complete information during registration.
- OTP (One-Time Password) verification is required for account security.
- Sharing your account with others is prohibited.

4. USER CONDUCT
You agree NOT to:
- Post illegal, harmful, or fraudulent content.
- Impersonate other users or entities.
- Engage in spam, phishing, or scam activities.
- Upload malicious files or software.
- Violate intellectual property rights.

5. MARKETPLACE RULES
- Sellers are responsible for the accuracy of their listings.
- GAMER Productions charges a 10% commission on completed transactions.
- All sales are subject to platform review and approval.
- Counterfeit, illegal, or prohibited items are strictly banned.

6. PAYMENTS & TRANSACTIONS
- Supported payment methods: PayPal, GCash, BDO, BPI, UnionBank, and other accepted methods.
- Transactions are processed securely. GAMER Productions is not liable for third-party payment failures.
- Refunds are subject to seller and platform policies.

7. SELLER VERIFICATION
- Business sellers must submit valid government-issued IDs and business registration documents.
- Verification is required to receive a verified badge and access full selling features.

8. INTELLECTUAL PROPERTY
All content on GAMER Productions, including logos, branding, and platform design, is owned by GAMER Productions. User-generated content remains the property of the user, but a license is granted to the platform to display it.

9. PRIVACY POLICY
We collect and process personal data in accordance with applicable privacy laws (including GDPR and the Philippine Data Privacy Act). Your data is never sold to third parties.

10. GOOGLE ADSENSE COMPLIANCE
GAMER Productions uses Google AdSense for advertising. By using this Platform, you consent to Google's use of cookies to serve ads based on your visit history. You may opt out via Google Ad Settings.

11. DIGITAL MILLENNIUM COPYRIGHT ACT (DMCA)
We respect intellectual property rights. If you believe content infringes your copyright, contact us with a DMCA takedown notice.

12. LIMITATION OF LIABILITY
GAMER Productions is not liable for any indirect, incidental, or consequential damages arising from platform use.

13. TERMINATION
We reserve the right to suspend or terminate accounts that violate these Terms.

14. GOVERNING LAW
These Terms are governed by the laws of the Republic of the Philippines and international applicable standards.

15. CONTACT
For questions, contact: support@gamerproductions.com

By creating an account, you confirm you have read, understood, and agreed to these Terms and Conditions.
`;