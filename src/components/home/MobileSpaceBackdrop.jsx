import React from "react";

const stars = [
  { top: "8%", left: "12%", size: 2, delay: "0s", duration: "3.8s" },
  { top: "14%", left: "72%", size: 2, delay: "0.6s", duration: "4.2s" },
  { top: "22%", left: "38%", size: 1.5, delay: "1.1s", duration: "3.4s" },
  { top: "31%", left: "84%", size: 2.5, delay: "0.2s", duration: "4.8s" },
  { top: "42%", left: "18%", size: 1.5, delay: "1.8s", duration: "3.6s" },
  { top: "54%", left: "63%", size: 2, delay: "0.9s", duration: "4.4s" },
  { top: "66%", left: "28%", size: 2.5, delay: "1.5s", duration: "5s" },
  { top: "74%", left: "78%", size: 1.5, delay: "0.4s", duration: "3.5s" },
  { top: "85%", left: "48%", size: 2, delay: "1.2s", duration: "4.1s" },
  { top: "90%", left: "88%", size: 1.5, delay: "2s", duration: "3.9s" },
];

export default function MobileSpaceBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 18%, rgba(56,189,248,0.22), transparent 22%), radial-gradient(circle at 78% 24%, rgba(168,85,247,0.24), transparent 24%), radial-gradient(circle at 52% 70%, rgba(236,72,153,0.16), transparent 28%), linear-gradient(180deg, #030712 0%, #0b1120 48%, #140b2d 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-40 opacity-70"
        style={{
          background: "radial-gradient(circle at top, rgba(125,211,252,0.2), transparent 58%)",
          filter: "blur(24px)",
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
            boxShadow: "0 0 10px rgba(255,255,255,0.55)",
            animation: `mobileStarTwinkle ${star.duration} ease-in-out ${star.delay} infinite`,
          }}
        />
      ))}
      <div
        className="absolute right-[-12%] top-[18%] h-40 w-40 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.35), transparent 70%)", filter: "blur(14px)" }}
      />
      <div
        className="absolute left-[-18%] bottom-[14%] h-52 w-52 rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.4), transparent 72%)", filter: "blur(18px)" }}
      />
      <style>{`
        @keyframes mobileStarTwinkle {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.65); }
        }
      `}</style>
    </div>
  );
}