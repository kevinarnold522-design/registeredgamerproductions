import React from "react";
import { motion } from "framer-motion";

export const MASCOTS = [
  {
    id: "argentina-penguin",
    name: "Football Life Penguin",
    role: "Football Life / PES",
    image: "https://media.base44.com/images/public/6a126acdde36b8358b1010f3/bcc42761a_0A6C238E-59C1-48B0-9714-0037484B4EC3.png",
    keywords: ["football life", "pes", "efootball", "argentina", "soccer", "football"],
    glow: "rgba(56,189,248,0.75)",
  },
  {
    id: "pafc-moose",
    name: "PAFC Moose",
    role: "PAFC Groups",
    image: "https://media.base44.com/images/public/6a126acdde36b8358b1010f3/a08f62096_F0158797-6390-4E4A-B980-CCEC50A1F046.png",
    keywords: ["pafc", "england", "premier", "football"],
    glow: "rgba(96,165,250,0.75)",
  },
  {
    id: "brazil-bird",
    name: "Brazil Gaming Bird",
    role: "Gaming Community",
    image: "https://media.base44.com/images/public/6a126acdde36b8358b1010f3/d9fd35df5_ACF6986D-0934-45F4-9DF6-0790BEA31D17.png",
    keywords: ["brazil", "gaming", "community", "modding", "football", "soccer"],
    glow: "rgba(250,204,21,0.75)",
  },
];

function selectMascots(contextName = "", mode = "default") {
  const text = String(contextName || "").toLowerCase();
  if (mode === "all" || !text) return MASCOTS;
  const matched = MASCOTS.filter((mascot) => mascot.keywords.some((keyword) => text.includes(keyword)));
  return matched.length > 0 ? matched : MASCOTS;
}

export default function MascotShowcase({ contextName = "", title = "Official GAMER Mascots", subtitle = "Football Life, PAFC, PES, gaming and modding community mascots", compact = false, mode = "default" }) {
  const mascots = selectMascots(contextName, mode);

  return (
    <section className={`relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gray-950/80 ${compact ? "px-4 py-4" : "px-5 py-6"} shadow-[0_0_34px_rgba(124,58,237,0.18)]`}>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/25 via-cyan-900/10 to-pink-900/25" />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(34,211,238,.5), transparent 24%), radial-gradient(circle at 80% 40%, rgba(236,72,153,.45), transparent 24%)" }} />
      <div className="relative flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="text-center lg:text-left">
          <p className="text-cyan-300 text-[10px] font-black uppercase tracking-[0.28em]">Mascot Squad Live</p>
          <h2 className={`${compact ? "text-xl" : "text-2xl md:text-3xl"} font-black text-white mt-1`}>{title}</h2>
          <p className="text-gray-400 text-sm mt-1 max-w-xl">{subtitle}</p>
        </div>
        <div className="flex items-end justify-center gap-2 sm:gap-4 flex-wrap">
          {mascots.map((mascot, index) => (
            <motion.div
              key={mascot.id}
              initial={{ opacity: 0, y: 18, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, type: "spring", stiffness: 160 }}
              className="group relative flex flex-col items-center"
            >
              <div className="absolute bottom-6 h-16 w-16 rounded-full blur-2xl opacity-70" style={{ background: mascot.glow }} />
              <img
                src={mascot.image}
                alt={mascot.name}
                className={`${compact ? "h-24 sm:h-28" : "h-28 sm:h-36 md:h-44"} relative z-10 object-contain drop-shadow-[0_0_22px_rgba(168,85,247,0.5)] transition-transform duration-300 group-hover:scale-110`}
                loading="lazy"
              />
              {!compact && <span className="relative z-10 -mt-1 rounded-full border border-white/10 bg-black/50 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white/80">{mascot.role}</span>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}