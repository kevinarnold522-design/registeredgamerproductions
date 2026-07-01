function normalizeCategoryToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "");
}

function buildCategoryVariants(value) {
  const normalized = normalizeCategoryToken(value);
  const variants = new Set();

  if (!normalized) return variants;

  variants.add(normalized);

  if (normalized.endsWith("s") && normalized.length > 3) {
    variants.add(normalized.slice(0, -1));
  } else if (normalized.length > 2) {
    variants.add(`${normalized}s`);
  }

  if (normalized === "content") variants.add("contentstreaming");
  if (normalized === "contentstreaming") variants.add("content");

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
