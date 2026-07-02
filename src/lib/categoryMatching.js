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

const CATEGORY_ALIAS_GROUPS = {
  content: ["content", "content_streaming", "exclusive_content"],
  content_streaming: ["content_streaming", "content", "exclusive_content"],
  exclusive_content: ["exclusive_content", "content_streaming", "content"],
  tools: ["tools", "paid_tools"],
  paid_tools: ["paid_tools", "tools"],
  buy_sell: ["buy_sell", "store"],
  store: ["store", "buy_sell"],
};

function toValueArray(value) {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => toValueArray(item))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (value === undefined || value === null || value === false) {
    return [];
  }

  return [value];
}

export function normalizeCategoryId(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "";
  if (normalized === "content") return "content_streaming";
  if (normalized === "tools") return "paid_tools";
  return normalized;
}

export function getCategoryAliases(value) {
  const normalized = normalizeCategoryId(value);
  return CATEGORY_ALIAS_GROUPS[normalized] || (normalized ? [normalized] : []);
}

export function getListingCategoryBuckets(listing, options = {}) {
  const buckets = new Set();
  const addCategory = (value) => {
    getCategoryAliases(value).forEach((alias) => buckets.add(alias));
  };

  const rawCategory = normalizeCategoryId(listing?.category);
  addCategory(rawCategory);

  const isPaidOrPremiumMod =
    rawCategory === "premium_mods" ||
    ((rawCategory === "modding" || !rawCategory) &&
      (listing?.is_premium || Number(listing?.price || 0) > 0));

  if (rawCategory === "premium_mods") {
    buckets.add("modding");
  }
  if (isPaidOrPremiumMod) {
    buckets.add("premium_mods");
  }

  if (options.includeNewsfeed !== false) {
    toValueArray(listing?.newsfeed_categories).forEach(addCategory);
  }

  return buckets;
}

export function listingMatchesCategory(listing, selectedCategory, options = {}) {
  const selectedAliases = getCategoryAliases(selectedCategory);
  if (!selectedAliases.length) return false;
  const buckets = getListingCategoryBuckets(listing, options);
  return selectedAliases.some((alias) => buckets.has(alias));
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
    ...toValueArray(listing?.subcategories),
    listing?.subcategory,
    listing?.digital_subcategory,
    listing?.physical_subcategory,
    listing?.modding_subcategory,
    listing?.tool_target_game,
    listing?.game_name,
    listing?.game_platform,
    listing?.community_franchise_id,
    listing?.card_category_label,
    ...toValueArray(listing?.newsfeed_categories),
    ...toValueArray(listing?.platforms),
    ...toValueArray(listing?.store_platforms),
    ...toValueArray(listing?.tags),
  ].filter(Boolean);
}

export function normalizeListingRecord(record) {
  if (!record || typeof record !== "object") return record;

  const normalized = { ...record };
  normalized.category = normalizeCategoryId(record.category);

  normalized.subcategories = toValueArray(record.subcategories);
  if (!normalized.subcategories.length && record.subcategory) {
    normalized.subcategories = toValueArray(record.subcategory);
  }

  normalized.newsfeed_categories = toValueArray(record.newsfeed_categories).map(normalizeCategoryId);
  normalized.platforms = toValueArray(record.platforms);
  normalized.store_platforms = toValueArray(record.store_platforms);
  normalized.tags = toValueArray(record.tags);
  normalized.keywords = toValueArray(record.keywords);
  normalized.images = toValueArray(record.images);

  if (!normalized.digital_subcategory && normalized.subcategories.length) {
    normalized.digital_subcategory = normalized.subcategories[0];
  }

  return normalized;
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
