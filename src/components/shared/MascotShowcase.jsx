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
    id: "france-lion",
    name: "French Lion",
    role: "European Gaming",
    image: "https://media.base44.com/images/public/6a126acdde36b8358b1010f3/france_lion_3d.png",
    country: "France",
    animal: "Lion",
    keywords: ["france", "gaming", "european", "lion", "esports"],
    glow: "rgba(59,130,246,0.75)",
  },
  {
    id: "germany-bear",
    name: "German Bear",
    role: "Strategy Gaming",
    image: "https://media.base44.com/images/public/6a126acdde36b8358b1010f3/germany_bear_3d.png",
    country: "Germany",
    animal: "Bear",
    keywords: ["germany", "gaming", "strategy", "bear", "european"],
    glow: "rgba(239,68,68,0.75)",
  },
  {
    id: "portugal-rooster",
    name: "Portuguese Rooster",
    role: "Community Hub",
    image: "https://media.base44.com/images/public/6a126acdde36b8358b1010f3/portugal_rooster_3d.png",
    country: "Portugal",
    animal: "Rooster",
    keywords: ["portugal", "gaming", "community", "rooster", "iberian"],
    glow: "rgba(234,179,8,0.75)",
  },
  {
    id: "spain-bull",
    name: "Spanish Bull",
    role: "Combat Games",
    image: "https://media.base44.com/images/public/6a126acdde36b8358b1010f3/spain_bull_3d.png",
    country: "Spain",
    animal: "Bull",
    keywords: ["spain", "gaming", "combat", "bull", "iberian"],
    glow: "rgba(249,115,22,0.75)",
  },
  {
    id: "belgium-dog",
    name: "Belgian Saint Bernard",
    role: "Cooperative Gaming",
    image: "https://media.base44.com/images/public/6a126acdde36b8358b1010f3/belgium_dog_3d.png",
    country: "Belgium",
    animal: "Saint Bernard Dog",
    keywords: ["belgium", "gaming", "cooperative", "dog", "european"],
    glow: "rgba(168,85,247,0.75)",
  },
  {
    id: "netherlands-tulip-lion",
    name: "Dutch Lion",
    role: "Trading Games",
    image: "https://media.base44.com/images/public/6a126acdde36b8358b1010f3/netherlands_lion_3d.png",
    country: "Netherlands",
    animal: "Lion",
    keywords: ["netherlands", "gaming", "trading", "dutch", "european"],
    glow: "rgba(236,72,153,0.75)",
  },
  {
    id: "usa-eagle",
    name: "American Eagle",
    role: "Action Games",
    image: "https://media.base44.com/images/public/6a126acdde36b8358b1010f3/usa_eagle_3d.png",
    country: "USA",
    animal: "Eagle",
    keywords: ["usa", "gaming", "action", "eagle", "esports"],
    glow: "rgba(34,197,94,0.75)",
  },
  {
    id: "mexico-jaguar",
    name: "Mexican Jaguar",
    role: "Adventure Gaming",
    image: "https://media.base44.com/images/public/6a126acdde36b8358b1010f3/mexico_jaguar_3d.png",
    country: "Mexico",
    animal: "Jaguar",
    keywords: ["mexico", "gaming", "adventure", "jaguar", "americas"],
    glow: "rgba(176,90,255,0.75)",
  },
];

function selectMascots() {
  return MASCOTS;
}

export default function MascotShowcase({ compact = false }) {
  const mascots = selectMascots();

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
              <div className="absolute bottom-4 h-12 w-12 rounded-full blur-2xl opacity-70" style={{ background: mascot.glow }} />
              <img
                src={mascot.image}
                alt={mascot.name}
                className={`${compact ? "h-20 sm:h-24" : "h-24 sm:h-32 md:h-40"} relative z-10 object-contain drop-shadow-[0_0_22px_rgba(168,85,247,0.5)] transition-transform duration-300 group-hover:scale-110`}
                loading="lazy"
              />
              <div className="mt-1 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="text-xs font-bold text-white truncate">{mascot.country}</p>
                <p className="text-[9px] text-gray-400">{mascot.animal || mascot.role.split("/")[0]}</p>
              </div>
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