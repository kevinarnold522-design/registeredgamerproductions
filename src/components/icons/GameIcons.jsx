// Custom SVG icon set — replaces all emojis across GAMER Productions
import React from "react";

export const IconController = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="7" width="20" height="12" rx="3" />
    <circle cx="17" cy="13" r="1.2" fill={color} stroke="none" />
    <circle cx="19.5" cy="11" r="1.2" fill={color} stroke="none" />
    <line x1="7" y1="11" x2="7" y2="15" /><line x1="5" y1="13" x2="9" y2="13" />
  </svg>
);

export const IconMod = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L14.5 8H21L15.5 12.5L17.5 19L12 15.5L6.5 19L8.5 12.5L3 8H9.5Z" />
    <circle cx="12" cy="11" r="2" strokeWidth="1.5" />
  </svg>
);

export const IconStream = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3" fill={color} stroke="none" />
    <path d="M6.3 6.3a8 8 0 0 0 0 11.4" /><path d="M17.7 6.3a8 8 0 0 1 0 11.4" />
    <path d="M3.5 3.5a13.5 13.5 0 0 0 0 17" /><path d="M20.5 3.5a13.5 13.5 0 0 1 0 17" />
  </svg>
);

export const IconTrophy = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 2h12v8a6 6 0 0 1-12 0V2z" />
    <path d="M6 6H3a2 2 0 0 0 0 4h3" /><path d="M18 6h3a2 2 0 0 1 0 4h-3" />
    <line x1="12" y1="16" x2="12" y2="20" /><line x1="8" y1="20" x2="16" y2="20" />
  </svg>
);

export const IconStore = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 9l1-6h16l1 6" /><path d="M3 9v11h18V9" />
    <path d="M9 9v11" /><path d="M15 9v11" />
    <path d="M3 9h18" />
    <rect x="9" y="14" width="6" height="6" />
  </svg>
);

export const IconGear = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.07 4.93l-1.42 1.42M4.93 4.93l1.42 1.42M19.07 19.07l-1.42-1.42M4.93 19.07l1.42-1.42M12 2v2M12 20v2M2 12h2M20 12h2" />
  </svg>
);

export const IconPlay = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="10,8 16,12 10,16" fill={color} stroke="none" />
  </svg>
);

export const IconJobs = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
  </svg>
);

export const IconServices = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

export const IconStar = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

export const IconShield = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" />
    <polyline points="9,12 11,14 15,10" />
  </svg>
);

export const IconCamera = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export const IconCommunity = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="9" cy="7" r="3" /><circle cx="17" cy="9" r="2.5" />
    <path d="M1 20c0-3.31 3.58-6 8-6s8 2.69 8 6" />
    <path d="M17 14c2.21 0 4 1.79 4 4" />
  </svg>
);

export const IconDollar = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export const IconZap = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
  </svg>
);

export const IconCheckmark = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="9,12 11,14 15,10" />
  </svg>
);

export const IconVideo = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="5" width="15" height="14" rx="2" />
    <polygon points="17,9 22,6 22,18 17,15" />
  </svg>
);

export const IconImage = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21,15 16,10 5,21" />
  </svg>
);

export const IconMessage = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// Logo mark — animated G symbol for brand use
export const GamerLogo = ({ size = 40, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
    <defs>
      <linearGradient id="gLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="10" fill="url(#gLogoGrad)" />
    {/* Controller shape */}
    <rect x="8" y="15" width="24" height="13" rx="4" fill="none" stroke="white" strokeWidth="1.8" />
    {/* D-pad */}
    <line x1="13" y1="19" x2="13" y2="24" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="10.5" y1="21.5" x2="15.5" y2="21.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    {/* Buttons */}
    <circle cx="25" cy="20" r="1.2" fill="white" />
    <circle cx="27.5" cy="22" r="1.2" fill="white" />
    <circle cx="22.5" cy="22" r="1.2" fill="white" />
    <circle cx="25" cy="24" r="1.2" fill="white" />
    {/* Grips */}
    <path d="M12 28 Q10 33 13 33 Q15 33 16 30" fill="none" stroke="white" strokeWidth="1.5" />
    <path d="M28 28 Q30 33 27 33 Q25 33 24 30" fill="none" stroke="white" strokeWidth="1.5" />
  </svg>
);