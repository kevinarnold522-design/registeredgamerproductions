const glowColors = {
  red: "rgba(239,68,68,.85)",
  purple: "rgba(168,85,247,.85)",
  blue: "rgba(59,130,246,.85)",
  green: "rgba(34,197,94,.85)",
  gold: "rgba(250,204,21,.9)",
  multi: "rgba(236,72,153,.9)",
};

export function getListingGlowStyle(listing = {}) {
  return {
    "--listing-glow-color": listing.card_glow_color === "custom"
      ? (listing.card_glow_hex || "#a855f7")
      : glowColors[listing.card_glow_color || "purple"],
  };
}

export function getListingGlowClass(listing = {}) {
  const style = listing.card_glow_style === "solid"
    ? "listing-glow-solid"
    : listing.card_glow_style === "lines"
      ? "listing-glow-lines"
      : "listing-glow-radiant";
  const speed = listing.card_glow_speed === "fast"
    ? "listing-glow-fast"
    : listing.card_glow_speed === "cycle"
      ? "listing-glow-cycle"
      : "";
  return `listing-glow-frame ${style} ${speed}`.trim();
}