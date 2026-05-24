export const ADMIN_EMAILS = [
  "kevinjersey2019@gmail.com",
  "arnoldk137@gmail.com",
  "kevinarnold522@gmail.com",
];

export const isAdmin = (email) => ADMIN_EMAILS.includes(email?.toLowerCase());

export const CATEGORIES = [
  {
    id: "games",
    label: "🎮 Games",
    icon: "🎮",
    subcategories: ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"],
  },
  {
    id: "gear",
    label: "🖥️ Gaming Gear",
    icon: "🖥️",
    subcategories: ["Keyboards", "Mice", "Monitors", "Headsets", "Controllers", "Chairs"],
  },
  {
    id: "buy_sell",
    label: "🛒 Buy & Sell",
    icon: "🛒",
    subcategories: ["Game Accounts", "In-Game Items", "Skins", "Premium Mods", "Gift Cards"],
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
    id: "tournaments",
    label: "🏆 Tournaments",
    icon: "🏆",
    subcategories: ["FPS", "Battle Royale", "MOBA", "Sports", "Fighting"],
  },
  {
    id: "content",
    label: "🎬 Content",
    icon: "🎬",
    subcategories: ["Streaming", "Videos", "Tutorials", "Reviews", "Highlights"],
  },
  {
    id: "jobs",
    label: "💼 Gaming Jobs",
    icon: "💼",
    subcategories: ["QA Testing", "Game Dev", "Community Manager", "Esports Coach", "Content Creator"],
  },
];

export const ACCOUNT_TYPES = [
  {
    id: "regular",
    label: "Regular Account",
    icon: "👤",
    desc: "Browse, buy, and enjoy the community. Perfect for everyday gamers.",
    color: "from-blue-600 to-cyan-600",
  },
  {
    id: "digital_creator",
    label: "Digital Creator",
    icon: "🎨",
    desc: "Sell your premium mods, content, and digital creations to the community.",
    color: "from-purple-600 to-pink-600",
  },
  {
    id: "business",
    label: "Professional Business",
    icon: "🏢",
    desc: "List your products, grow your brand, and reach thousands of gamers.",
    color: "from-green-600 to-emerald-600",
  },
];