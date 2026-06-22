import React from "react";

const BRAND_SLUGS = {
  kofi: "kofi",
  ko_fi: "kofi",
  buymeacoffee: "buymeacoffee",
  patreon: "patreon",
  playstation: "playstation",
  nintendo: "nintendo",
  steam: "steam",
  epic: "epicgames",
  epicgames: "epicgames",
  xbox: "xbox",
  gog: "gogdotcom",
  ubisoft: "ubisoft",
  googleplay: "googleplay",
  playstore: "googleplay",
  appstore: "appstore",
  apple: "apple",
  youtube: "youtube",
  facebook: "facebook",
  instagram: "instagram",
  x: "x",
  twitter: "x",
  twitch: "twitch",
  tiktok: "tiktok",
  whatsapp: "whatsapp",
  telegram: "telegram",
  discord: "discord",
  mediafire: "mediafire",
  mega: "mega",
};

export default function BrandLogo({ brand, label, className = "w-4 h-4", invert = true }) {
  const slug = BRAND_SLUGS[String(brand || "").toLowerCase()];
  if (!slug) return null;

  return (
    <img
      src={`https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${slug}.svg`}
      alt=""
      className={className}
      style={invert ? { filter: "invert(1)", display: "inline-block" } : { display: "inline-block" }}
      loading="lazy"
    />
  );
}