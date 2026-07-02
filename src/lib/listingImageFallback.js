function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildListingFallbackImage({
  title = "Listing",
  category = "Gamer.Productions",
  subtitle = "Image unavailable",
} = {}) {
  const safeTitle = escapeXml(String(title || "Listing").slice(0, 56));
  const safeCategory = escapeXml(String(category || "Gamer.Productions").slice(0, 28));
  const safeSubtitle = escapeXml(String(subtitle || "Image unavailable").slice(0, 28));

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#12091f"/>
          <stop offset="55%" stop-color="#22103c"/>
          <stop offset="100%" stop-color="#050816"/>
        </linearGradient>
        <linearGradient id="glow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#7c3aed"/>
          <stop offset="50%" stop-color="#d946ef"/>
          <stop offset="100%" stop-color="#22d3ee"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="1200" fill="url(#bg)"/>
      <circle cx="930" cy="220" r="180" fill="#7c3aed" opacity="0.18"/>
      <circle cx="260" cy="980" r="220" fill="#22d3ee" opacity="0.12"/>
      <rect x="82" y="82" width="1036" height="1036" rx="46" fill="none" stroke="url(#glow)" stroke-opacity="0.5" stroke-width="4"/>
      <text x="110" y="164" fill="#c084fc" font-family="Arial, sans-serif" font-size="42" font-weight="700" letter-spacing="5">GAMER.PRODUCTIONS</text>
      <text x="110" y="232" fill="#f5d0fe" font-family="Arial, sans-serif" font-size="56" font-weight="800">${safeCategory.toUpperCase()}</text>
      <g transform="translate(110 330)">
        <rect width="980" height="420" rx="38" fill="#0f172a" fill-opacity="0.5" stroke="#ffffff" stroke-opacity="0.08"/>
        <text x="62" y="128" fill="#ffffff" font-family="Arial, sans-serif" font-size="78" font-weight="800">${safeTitle}</text>
        <text x="62" y="214" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="36">${safeSubtitle}</text>
        <text x="62" y="340" fill="#a78bfa" font-family="Arial, sans-serif" font-size="180">🎮</text>
      </g>
      <text x="110" y="1050" fill="#94a3b8" font-family="Arial, sans-serif" font-size="34">Permanent fallback cover</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

