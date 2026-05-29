import React from "react";

/**
 * Meta-style Rosette/Starburst Verified Badge
 * Features: multi-point starburst shape, rotating glow ring, purple gradient fill, bold white checkmark
 * size: "sm" | "md" | "lg"
 */
export default function VerifiedCheckmark({ size = "sm", showLabel = false, showTooltip = true, label = "Verified Partner" }) {
  const dims = { sm: 20, md: 26, lg: 36 };
  const px = dims[size] || 20;
  const glowSize = px * 2.2;
  const ringId = `ring-${size}-${Math.random().toString(36).slice(2, 7)}`;

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
      {/* Outer ambient glow */}
      <span
        style={{
          position: "absolute",
          width: glowSize,
          height: glowSize,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(167,85,247,0.55) 0%, rgba(236,72,153,0.25) 50%, transparent 70%)",
          filter: "blur(8px)",
          top: "50%",
          left: px / 2,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "verified-ring-spin 4s linear infinite",
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
          {/* Purple-to-pink gradient fill */}
          <linearGradient id={`starGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          {/* Inner shine */}
          <radialGradient id={`shineGrad-${size}`} cx="35%" cy="28%" r="55%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          {/* Rotating glow ring */}
          <linearGradient id={`glowRing-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#ff00cc" stopOpacity="0.9" />
            <stop offset="33%"  stopColor="#7c3aed" stopOpacity="0.9" />
            <stop offset="66%"  stopColor="#00ccff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ff00cc" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Rotating glow ring behind the badge */}
        <g style={{ animation: "verified-ring-spin 3s linear infinite", transformOrigin: "12px 12px" }}>
          <circle cx="12" cy="12" r="13.5" fill="none" stroke={`url(#glowRing-${size})`} strokeWidth="2" strokeDasharray="6 3" opacity="0.7" filter="url(#blur)" />
        </g>

        {/* Starburst / Rosette shape */}
        <path
          d={starPath}
          fill={`url(#starGrad-${size})`}
          filter="drop-shadow(0 0 3px rgba(124,58,237,0.8))"
        />
        {/* Shine overlay */}
        <path d={starPath} fill={`url(#shineGrad-${size})`} />

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