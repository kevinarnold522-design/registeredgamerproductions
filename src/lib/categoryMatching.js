function normalizeCategoryTokens(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .split(/[^a-z0-9]+/g)
    .filter(Boolean);
}

function normalizeCategoryToken(value) {
  return normalizeCategoryTokens(value).join("");
}

function addVariants(variants, token) {
  const normalized = String(token || "").trim();
  if (!normalized) return;

  variants.add(normalized);

  // Simple plural/singular helpers (avoid messing with very short tokens like "ps")
  if (normalized.endsWith("s") && normalized.length > 3) {
    variants.add(normalized.slice(0, -1));
  } else if (normalized.length > 2) {
    variants.add(`${normalized}s`);
  }
}

function buildCategoryVariants(value) {
  const tokens = normalizeCategoryTokens(value);
  const normalized = tokens.join("");
  const variants = new Set();

  if (!normalized) return variants;

  // Full normalized (e.g. "premium mods - gta 5" => "premiummodsgta5")
  addVariants(variants, normalized);

  // Also include individual tokens (e.g. "PPSSPP/PSP" => "ppsspp", "psp")
  tokens.forEach((t) => addVariants(variants, t));

  // Content category aliases
  if (variants.has("content")) variants.add("contentstreaming");
  if (variants.has("contentstreaming")) variants.add("content");

  // Premium Mods labels often include a "Premium Mods -" prefix; strip it so
  // "Premium Mods - GTA 5" still matches a listing with just "GTA 5".
  if (normalized.startsWith("premiummods")) {
    addVariants(variants, normalized.replace(/^premiummods/, ""));
  }
  if (normalized.startsWith("premium")) {
    addVariants(variants, normalized.replace(/^premium/, ""));
  }

  // Platform synonym groups (helps "PlayStation" match "PS5", etc.)
  const synonymGroups = [
    ["playstation", "ps", "ps4", "ps5", "psn"],
    ["xbox", "xb", "xboxone", "seriesx", "seriess", "xboxseriesx", "xboxseriess"],
    ["nintendo", "switch", "nintendoswitch", "ns"],
    ["mobile", "android", "ios"],
    ["pc", "windows"],
  ];

  for (const group of synonymGroups) {
    if (group.some((t) => variants.has(t))) {
      group.forEach((t) => variants.add(t));
    }
  }

  return variants;
}

export function findCanonicalCategoryValue(selectedValue, candidates = []) {
  if (!selectedValue) return "";

  const selectedVariants = buildCategoryVariants(selectedValue);
  return (
    candidates.find((candidate) => {
      const candidateVariants = buildCategoryVariants(candidate);
      return [...selectedVariants].some((value) => candidateVariants.has(value));
    }) || ""
  );
}

export function collectListingCategoryValues(listing) {
  return [
    ...(Array.isArray(listing?.subcategories) ? listing.subcategories : []),
    listing?.subcategory,
    listing?.digital_subcategory,
    listing?.physical_subcategory,
    listing?.modding_subcategory,
    listing?.tool_target_game,
    listing?.game_name,
    listing?.game_platform,
    ...(Array.isArray(listing?.platforms) ? listing.platforms : []),
    ...(Array.isArray(listing?.store_platforms) ? listing.store_platforms : []),
    ...(Array.isArray(listing?.tags) ? listing.tags : []),
  ].filter(Boolean);
}

export function listingMatchesSubcategory(listing, selectedValue, options = {}) {
  if (!selectedValue || selectedValue === "all") return true;

  const selectedVariants = buildCategoryVariants(selectedValue);
  const listingValues = collectListingCategoryValues(listing);

  return listingValues.some((value) => {
    const listingVariants = buildCategoryVariants(value);

    if ([...selectedVariants].some((variant) => listingVariants.has(variant))) {
      return true;
    }

    if (options.allowPrefixMatch) {
      return [...selectedVariants].some((variant) =>
        [...listingVariants].some(
          (listingVariant) =>
            listingVariant.startsWith(variant) || variant.startsWith(listingVariant)
        )
      );
    }

    return false;
  });
}
