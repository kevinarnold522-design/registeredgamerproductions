import React, { useId, useMemo } from "react";

/**
 * Meta-style Rosette/Starburst Verified Badge
 * Features: multi-point starburst shape, rotating glow ring, purple gradient fill, bold white checkmark
 * size: "sm" | "md" | "lg"
 */
export default function VerifiedCheckmark({ size = "sm", showLabel = false, showTooltip = true, label = "Verified Partner" }) {
  const dims = { sm: 20, md: 26, lg: 36 };
  const px = dims[size] || 20;
  const glowSize = px * 3.2;
  const rawId = useId();
  const uid = useMemo(() => rawId.replace(/:/g, ""), [rawId]);

  // Starburst polygon points (16-point rosette)
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

  return (
    <span className="relative inline-flex items-center gap-1 group" style={{ verticalAlign: "middle" }}>
      {/* Radiant rotating ambient glow — single arc sweeping around badge */}
      <span
        style={{
          position: "absolute",
          width: glowSize,
          height: glowSize,
          borderRadius: "50%",
          top: "50%",
          left: px / 2,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 0,
          background: "conic-gradient(from 0deg, #ff00cc99, #7c3aed99, #00ccff99, #ffcc0099, #ff00cc99)",
          animation: "verified-ring-spin 2.4s linear infinite",
          filter: `blur(${px * 0.35}px)`,
          opacity: 0.85,
        }}
      />
      {/* Inner tighter bright ring */}
      <span
        style={{
          position: "absolute",
          width: px * 1.8,
          height: px * 1.8,
          borderRadius: "50%",
          top: "50%",
          left: px / 2,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 0,
          background: "conic-gradient(from 180deg, #ec489900, #a855f7ff, #ec489900)",
          animation: "verified-ring-spin 1.8s linear infinite reverse",
          filter: `blur(${px * 0.18}px)`,
          opacity: 0.9,
        }}
      />

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

        {/* Starburst / Rosette shape */}
        <path
          d={starPath}
          fill={`url(#starGrad-${uid})`}
          filter="drop-shadow(0 0 4px rgba(168,85,247,0.9)) drop-shadow(0 0 8px rgba(236,72,153,0.5))"
        />
        {/* Shine overlay */}
        <path d={starPath} fill={`url(#shineGrad-${uid})`} />

        {/* Bold white checkmark */}
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
    </span>
  );
}