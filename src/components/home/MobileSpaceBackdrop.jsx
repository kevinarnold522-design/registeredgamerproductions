import React from "react";

const stars = [
  { top: "10%", left: "14%", size: 1.5 },
  { top: "20%", left: "76%", size: 1.5 },
];

export default function MobileSpaceBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 22% 18%, rgba(56,189,248,0.12), transparent 18%), radial-gradient(circle at 78% 24%, rgba(168,85,247,0.12), transparent 20%), linear-gradient(180deg, #030712 0%, #09101f 58%, #130a28 100%)",
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
    </div>
  );
}