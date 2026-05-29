import React, { useId, useMemo, useState } from "react";

export default function VerifiedCheckmark({ size = "sm", showLabel = false, showTooltip = true, label = "Verified Partner" }) {
  const dims = { sm: 20, md: 26, lg: 36 };
  const px = dims[size] || 20;
  const rawId = useId();
  const uid = useMemo(() => rawId.replace(/:/g, ""), [rawId]);
  const [hovered, setHovered] = useState(false);

  const generateStarburst = (cx, cy, outerR, innerR, points) => {
    let path = "";
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      path += (i === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2);
    }
    return path + "Z";
  };
  const starPath = generateStarburst(12, 12, 11.5, 8.5, 16);

  // Orbit very tight — just 1–2px outside the badge edge
  const orbitR = px * 0.56;
  const dotSize = Math.max(2.5, px * 0.18);

  return (
    <span
      className="relative inline-flex items-center gap-1 group"
      style={{ verticalAlign: "middle" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Always-on subtle ambient glow */}
      <span
        style={{
          position: "absolute",
          width: px * 1.6,
          height: px * 1.6,
          borderRadius: "50%",
          top: "50%",
          left: px / 2,
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
          filter: `blur(${px * 0.2}px)`,
        }}
      />

      {/* Always-on tight orbiting dot */}
      <span
        style={{
          position: "absolute",
          width: orbitR * 2 + dotSize,
          height: orbitR * 2 + dotSize,
          top: "50%",
          left: px / 2,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <span
          style={{
            position: "absolute",
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            background: "radial-gradient(circle, #ffffff 0%, #c084fc 45%, #7c3aed 100%)",
            boxShadow: `0 0 ${dotSize * 1.5}px ${dotSize * 0.8}px #a855f7aa`,
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            animation: "dot-orbit 2.5s linear infinite",
            transformOrigin: `0 ${orbitR + dotSize / 2}px`,
          }}
        />
      </span>

      {/* Hover: brighter glow burst */}
      {hovered && (
        <span
          style={{
            position: "absolute",
            width: px * 2.4,
            height: px * 2.4,
            borderRadius: "50%",
            top: "50%",
            left: px / 2,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(168,85,247,0.55) 0%, rgba(236,72,153,0.2) 50%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
            filter: `blur(${px * 0.3}px)`,
            animation: "glow-burst 0.4s ease-out",
          }}
        />
      )}

      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, position: "relative", zIndex: 1, overflow: "visible" }}
      >
        <defs>
          <linearGradient id={`starGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <radialGradient id={`shineGrad-${uid}`} cx="35%" cy="28%" r="55%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <path
          d={starPath}
          fill={`url(#starGrad-${uid})`}
          filter="drop-shadow(0 0 3px rgba(168,85,247,0.8)) drop-shadow(0 0 6px rgba(236,72,153,0.4))"
        />
        <path d={starPath} fill={`url(#shineGrad-${uid})`} />
        <path
          d="M7 12.5L10.5 16L17 8.5"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {showLabel && (
        <span className="font-bold text-xs text-purple-300 whitespace-nowrap" style={{ position: "relative", zIndex: 1 }}>
          {label}
        </span>
      )}

      {showTooltip && !showLabel && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-white text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl"
          style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 4px 16px rgba(124,58,237,0.7)" }}
        >
          ✓ {label}
        </span>
      )}

      <style>{`
        @keyframes dot-orbit {
          0%   { transform: translateX(-50%) rotate(0deg)   translateY(-${orbitR}px); }
          100% { transform: translateX(-50%) rotate(360deg) translateY(-${orbitR}px); }
        }
        @keyframes glow-burst {
          0%   { opacity: 0; transform: translate(-50%,-50%) scale(0.6); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
        }
      `}</style>
    </span>
  );
}