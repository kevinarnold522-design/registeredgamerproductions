import React from "react";
import { motion } from "framer-motion";

export const MASCOTS = [
  {
    id: "argentina-penguin",
    name: "Football Life Penguin",
    role: "Football Life / PES",
    image: "https://media.base44.com/images/public/6a126acdde36b8358b1010f3/bcc42761a_0A6C238E-59C1-48B0-9714-0037484B4EC3.png",
    country: "Argentina",
    keywords: ["football life", "pes", "efootball", "argentina", "soccer", "football", "eafc", "ea fc"],
    glow: "rgba(56,189,248,0.75)",
  },
  {
    id: "eafc-moose",
    name: "EAFC Moose",
    role: "EAFC Groups",
    image: "https://media.base44.com/images/public/6a126acdde36b8358b1010f3/a08f62096_F0158797-6390-4E4A-B980-CCEC50A1F046.png",
    country: "Canada",
    keywords: ["eafc", "ea fc", "fifa", "england", "premier", "football"],
    glow: "rgba(96,165,250,0.75)",
  },
  {
    id: "brazil-bird",
    name: "Brazil Gaming Bird",
    role: "Gaming Community",
    image: "https://media.base44.com/images/public/6a126acdde36b8358b1010f3/d9fd35df5_ACF6986D-0934-45F4-9DF6-0790BEA31D17.png",
    country: "Brazil",
    keywords: ["brazil", "gaming", "community", "modding", "football", "soccer"],
    glow: "rgba(250,204,21,0.75)",
  },
  {
    id: "france-chicken",
    name: "French Chicken",
    role: "European Gaming",
    image: "https://api.dicebear.com/7.x/3d-avatar/svg?seed=FranceChicken&scale=120&backgroundColor=b6e3ff",
    country: "France",
    animal: "Chicken",
    keywords: ["france", "gaming", "european", "chicken", "esports"],
    glow: "rgba(59,130,246,0.75)",
  },
  {
    id: "germany-eagle",
    name: "German Eagle",
    role: "Strategy Gaming",
    image: "https://api.dicebear.com/7.x/3d-avatar/svg?seed=GermanyEagle&scale=120&backgroundColor=ffcccc",
    country: "Germany",
    animal: "Eagle",
    keywords: ["germany", "gaming", "strategy", "eagle", "european"],
    glow: "rgba(239,68,68,0.75)",
  },
  {
    id: "portugal-tiger",
    name: "Portuguese Tiger",
    role: "Community Hub",
    image: "https://api.dicebear.com/7.x/3d-avatar/svg?seed=PortugalTiger&scale=120&backgroundColor=ffffcc",
    country: "Portugal",
    animal: "Tiger",
    keywords: ["portugal", "gaming", "community", "tiger", "iberian"],
    glow: "rgba(234,179,8,0.75)",
  },
  {
    id: "spain-bull",
    name: "Spanish Bull",
    role: "Combat Games",
    image: "https://api.dicebear.com/7.x/3d-avatar/svg?seed=SpainBull&scale=120&backgroundColor=ffddcc",
    country: "Spain",
    animal: "Bull",
    keywords: ["spain", "gaming", "combat", "bull", "iberian"],
    glow: "rgba(249,115,22,0.75)",
  },
  {
    id: "belgium-dog",
    name: "Belgian Saint Bernard",
    role: "Cooperative Gaming",
    image: "https://api.dicebear.com/7.x/3d-avatar/svg?seed=BelgiumDog&scale=120&backgroundColor=e5ccff",
    country: "Belgium",
    animal: "Saint Bernard Dog",
    keywords: ["belgium", "gaming", "cooperative", "dog", "european"],
    glow: "rgba(168,85,247,0.75)",
  },
  {
    id: "netherlands-tulip-lion",
    name: "Dutch Lion",
    role: "Trading Games",
    image: "https://api.dicebear.com/7.x/3d-avatar/svg?seed=NetherlandsLion&scale=120&backgroundColor=ffccee",
    country: "Netherlands",
    animal: "Lion",
    keywords: ["netherlands", "gaming", "trading", "dutch", "european"],
    glow: "rgba(236,72,153,0.75)",
  },
  {
    id: "usa-eagle",
    name: "American Eagle",
    role: "Action Games",
    image: "https://api.dicebear.com/7.x/3d-avatar/svg?seed=USAEagle&scale=120&backgroundColor=ccffcc",
    country: "USA",
    animal: "Eagle",
    keywords: ["usa", "gaming", "action", "eagle", "esports"],
    glow: "rgba(34,197,94,0.75)",
  },
  {
    id: "mexico-hawk",
    name: "Mexican Hawk",
    role: "Adventure Gaming",
    image: "https://api.dicebear.com/7.x/3d-avatar/svg?seed=MexicoHawk&scale=120&backgroundColor=ffccdd",
    country: "Mexico",
    animal: "Hawk",
    keywords: ["mexico", "gaming", "adventure", "hawk", "americas"],
    glow: "rgba(176,90,255,0.75)",
  }
];

function selectMascots() {
  return MASCOTS;
}

export default function MascotShowcase({ compact = false }) {
  const mascots = selectMascots();

  const generate3DMascotSVG = (mascot) => {
    const styles = {
      "france-chicken": {
        primaryColor: "#E74C3C",
        secondaryColor: "#C0392B",
        accentColor: "#FFD700",
      },
      "germany-eagle": {
        primaryColor: "#8B4513",
        secondaryColor: "#654321",
        accentColor: "#DAA520",
      },
      "portugal-tiger": {
        primaryColor: "#FF6B35",
        secondaryColor: "#F7931E",
        accentColor: "#FFD700",
      },
      "spain-bull": {
        primaryColor: "#8B0000",
        secondaryColor: "#600000",
        accentColor: "#FFD700",
      },
      "belgium-dog": {
        primaryColor: "#8B4513",
        secondaryColor: "#A0522D",
        accentColor: "#F4A460",
      },
      "netherlands-tulip-lion": {
        primaryColor: "#CD853F",
        secondaryColor: "#8B4513",
        accentColor: "#FFD700",
      },
      "usa-eagle": {
        primaryColor: "#8B4513",
        secondaryColor: "#654321",
        accentColor: "#DAA520",
      },
      "mexico-hawk": {
        primaryColor: "#8B4513",
        secondaryColor: "#654321",
        accentColor: "#DAA520",
      },
    };

    const style = styles[mascot.id] || {
      primaryColor: "#8B5CF6",
      secondaryColor: "#7C3AED",
      accentColor: "#A78BFA",
    };

    // Create a more sophisticated 3D SVG with proper animal shapes
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'%3E%3Cdefs%3E%3ClinearGradient id='bodyGrad' x1='0%' y1='0%' x2='100%' y2='100%'%3E%3Cstop offset='0%' style='stop-color:${encodeURIComponent(style.primaryColor)};stop-opacity:1'/%3E%3Cstop offset='100%' style='stop-color:${encodeURIComponent(style.secondaryColor)};stop-opacity:1'/%3E%3C/linearGradient%3E%3ClinearGradient id='accent' x1='0%' y1='0%' x2='100%' y2='100%'%3E%3Cstop offset='0%' style='stop-color:${encodeURIComponent(style.accentColor)};stop-opacity:0.9'/%3E%3Cstop offset='100%' style='stop-color:${encodeURIComponent(style.accentColor)};stop-opacity:0.6'/%3E%3C/linearGradient%3E%3CfilterBlur id='shadow' x='-50%' y='-50%' width='200%' height='200%'%3E%3CfeGaussianBlur in='SourceGraphic' stdDeviation='2'/%3E%3C/filterBlur%3E%3Cdrop-shadow id='dropShadow' dx='2' dy='4' stdDeviation='3' flood-opacity='0.3' /%3E%3C/defs%3E%3Crect x='10' y='10' width='180' height='230' fill='%23f0f0f0' rx='20' opacity='0.05'/%3E%3Ccircle cx='100' cy='85' r='45' fill='url(%23bodyGrad)' opacity='0.95'/%3E%3Ccircle cx='95' cy='80' r='42' fill='url(%23bodyGrad)' opacity='0.8'/%3E%3Cellipse cx='100' cy='150' rx='50' ry='55' fill='url(%23bodyGrad)' opacity='0.9'/%3E%3Ccircle cx='70' cy='90' r='12' fill='white' opacity='0.6'/%3E%3Ccircle cx='130' cy='90' r='12' fill='white' opacity='0.6'/%3E%3Ccircle cx='72' cy='88' r='8' fill='%23333' opacity='0.8'/%3E%3Ccircle cx='132' cy='88' r='8' fill='%23333' opacity='0.8'/%3E%3Cellipse cx='100' cy='105' rx='8' ry='10' fill='%23333' opacity='0.7'/%3E%3Cpath d='M 85 190 L 80 220 M 95 190 L 92 220 M 105 190 L 108 220 M 115 190 L 120 220' stroke='%23333' stroke-width='4' opacity='0.8' stroke-linecap='round'/%3E%3Crect x='30' y='120' width='20' height='60' fill='url(%23bodyGrad)' opacity='0.7' rx='8'/%3E%3Crect x='150' y='120' width='20' height='60' fill='url(%23bodyGrad)' opacity='0.7' rx='8'/%3E%3C/svg%3E`;
  };

  return (
    <section className={`relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gray-950/80 ${compact ? "px-4 py-4" : "px-5 py-6"} shadow-[0_0_34px_rgba(124,58,237,0.18)]`}>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/25 via-cyan-900/10 to-pink-900/25" />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(34,211,238,.5), transparent 24%), radial-gradient(circle at 80% 40%, rgba(236,72,153,.45), transparent 24%)" }} />
      
      {/* Horizontal scrollable container */}
      <div className="relative overflow-x-auto scroll-smooth pb-2">
        <div className="flex items-end justify-start gap-2 sm:gap-4 flex-nowrap min-w-min px-2">
          {mascots.map((mascot, index) => (
            <motion.div
              key={mascot.id}
              initial={{ opacity: 0, y: 18, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, type: "spring", stiffness: 160 }}
              className="group relative flex flex-col items-center flex-shrink-0"
            >
              {/* Country label above */}
              <div className="text-center mb-1 h-6 flex flex-col justify-end">
                <p className="text-xs font-bold text-white truncate w-20 sm:w-24">{mascot.country}</p>
              </div>

              <div className="absolute bottom-4 h-12 w-12 rounded-full blur-2xl opacity-70" style={{ background: mascot.glow }} />
              
              <img
                src={mascot.image.includes("dicebear") ? mascot.image : generate3DMascotSVG(mascot)}
                alt={mascot.name}
                onError={(e) => {
                  e.target.src = generate3DMascotSVG(mascot);
                }}
                className={`${compact ? "h-20 sm:h-24" : "h-24 sm:h-32 md:h-40"} relative z-10 object-contain drop-shadow-[0_0_22px_rgba(168,85,247,0.5)] transition-transform duration-300 group-hover:scale-110 rounded-lg`}
                loading="lazy"
              />
              
              {/* Animal label below */}
              <p className="text-[9px] text-gray-400 mt-1 text-center w-20 sm:w-24 truncate">{mascot.animal || mascot.role.split("/")[0]}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-950/80 to-transparent pointer-events-none z-20" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-950/80 to-transparent pointer-events-none z-20" />

      <style>{`
        .scroll-smooth {
          scroll-behavior: smooth;
        }
      `}</style>
    </section>
  );
}