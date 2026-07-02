export function isLikelyExternalUrl(value = "") {
  return /^(https?:)?\/\//i.test(String(value || "").trim());
}

export function getListingDisplayCategoryLabel(listing = {}, fallback = "Listing") {
  const candidates = [
    listing.card_category_label,
    listing.modding_subcategory,
    listing.digital_subcategory,
    listing.game_name,
    fallback,
  ];

  const picked = candidates.find((value) => {
    const text = String(value || "").trim();
    return text && !isLikelyExternalUrl(text);
  });

  return picked || "Listing";
}

