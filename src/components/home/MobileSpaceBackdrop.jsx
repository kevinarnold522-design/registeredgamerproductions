import React from "react";

const stars = [
  { top: "10%", left: "14%", size: 1.5 },
  { top: "18%", left: "76%", size: 1.5 },
  { top: "52%", left: "22%", size: 1.5 },
  { top: "76%", left: "72%", size: 1.5 },
];

export default function MobileSpaceBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 22% 18%, rgba(56,189,248,0.18), transparent 20%), radial-gradient(circle at 78% 24%, rgba(168,85,247,0.18), transparent 22%), radial-gradient(circle at 50% 74%, rgba(236,72,153,0.12), transparent 24%), linear-gradient(180deg, #030712 0%, #09101f 52%, #130a28 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-32 opacity-55"
        style={{
          background: "radial-gradient(circle at top, rgba(125,211,252,0.14), transparent 56%)",
          filter: "blur(12px)",
        }}
      />
      {stars.map((star, index) => (
        <span
          key={index}
          className="absolute rounded-full bg-white/90"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            boxShadow: "0 0 5px rgba(255,255,255,0.28)",
          }}
        />
      ))}
      <div
        className="absolute right-[-10%] top-[18%] h-24 w-24 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.22), transparent 70%)", filter: "blur(8px)" }}
      />
    </div>
  );
}