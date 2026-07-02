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

function uniqueValues(values = []) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))];
}

function looksLikeGameCategoryValue(value) {
  const normalized = normalizeCategoryTokens(value).join("");
  return ["pc", "playstation", "ps4", "ps5", "xbox", "nintendoswitch", "switch", "mobile", "ios", "android"].includes(normalized);
}

function inferListingCategory(record = {}, normalized = {}) {
  const explicit = normalizeCategoryId(record.category);
  const hasPaidPrice = Number(record?.price || 0) > 0;
  if (explicit === "premium_mods") {
    return hasPaidPrice ? "premium_mods" : "modding";
  }
  if (explicit) return explicit;

  const newsfeedCategories = toValueArray(normalized.newsfeed_categories).map(normalizeCategoryId).filter(Boolean);
  if (newsfeedCategories.includes("premium_mods")) return "premium_mods";
  if (newsfeedCategories.includes("modding")) return "modding";
  if (newsfeedCategories.includes("games")) return "games";
  if (newsfeedCategories.includes("paid_tools")) return "paid_tools";
  if (newsfeedCategories.includes("content_streaming")) return "content_streaming";

  const textSignals = [
    normalized.digital_subcategory,
    normalized.physical_subcategory,
    normalized.card_category_label,
    ...toValueArray(normalized.subcategories),
    ...toValueArray(normalized.tags),
  ].join(" ").toLowerCase();

  const inferredModding = Boolean(
    normalized.modding_subcategory ||
    normalized.community_franchise_id ||
    /\bmod|mods|modding|cyberface|facepack|roster|patch|trainer|script|textures?\b/.test(textSignals)
  );

  if (inferredModding) {
    return hasPaidPrice ? "premium_mods" : "modding";
  }

  const inferredTools = /\btool|tools|utility|utilities|automation|software|launcher\b/.test(textSignals);
  if (inferredTools) return "paid_tools";

  const inferredGames = [
    normalized.game_platform,
    normalized.game_name,
    ...toValueArray(normalized.subcategories),
    ...toValueArray(normalized.store_platforms),
    ...toValueArray(normalized.platforms),
  ].some(looksLikeGameCategoryValue);
  if (inferredGames) return "games";

  return "";
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

  if (!rawCategory) {
    addCategory(inferListingCategory(listing, listing));
    if (options.includeNewsfeed !== false) {
      toValueArray(listing?.newsfeed_categories).forEach(addCategory);
    }
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

export function collectListingCommunityValues(listing) {
  return uniqueValues([
    listing?.community_franchise_id,
    listing?.game_name,
    listing?.modding_subcategory,
    listing?.digital_subcategory,
    listing?.tool_target_game,
    listing?.card_category_label,
    ...toValueArray(listing?.subcategories),
    ...toValueArray(listing?.tags),
    ...toValueArray(listing?.keywords),
  ]);
}

export function normalizeListingRecord(record) {
  if (!record || typeof record !== "object") return record;

  const normalized = { ...record };
  normalized.subcategories = toValueArray(record.subcategories);
  if (!normalized.subcategories.length && record.subcategory) {
    normalized.subcategories = toValueArray(record.subcategory);
  }

  normalized.newsfeed_categories = toValueArray(record.newsfeed_categories).map(normalizeCategoryId);
  normalized.platforms = toValueArray(record.platforms);
  normalized.store_platforms = toValueArray(record.store_platforms);
  normalized.tags = toValueArray(record.tags);
  normalized.keywords = toValueArray(record.keywords);
  normalized.images = uniqueValues([
    ...toValueArray(record.images),
    ...toValueArray(record.image_urls),
    ...toValueArray(record.gallery_images),
    record.image_url,
    record.cover_image,
    record.thumbnail_url,
    record.banner_image,
    record.poster_url,
  ]);

  if (!normalized.digital_subcategory && normalized.subcategories.length) {
    normalized.digital_subcategory = normalized.subcategories[0];
  }

  normalized.category = inferListingCategory(record, normalized);

  return normalized;
}

export function listingMatchesCommunity(listing, selectedCommunity, options = {}) {
  if (!selectedCommunity) return false;

  const communityValues = collectListingCommunityValues(listing);
  if (!communityValues.length) {
    return false;
  }

  if (findCanonicalCategoryValue(selectedCommunity, communityValues)) {
    return true;
  }

  if (options.allowPrefixMatch === false) {
    return false;
  }

  const selectedVariants = buildCategoryVariants(selectedCommunity);
  return communityValues.some((value) => {
    const listingVariants = buildCategoryVariants(value);
    return [...selectedVariants].some((variant) =>
      [...listingVariants].some(
        (listingVariant) =>
          listingVariant.startsWith(variant) || variant.startsWith(listingVariant)
      )
    );
  });
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
