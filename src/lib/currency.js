export const CURRENCY_OPTIONS = [
  { code: "PHP", label: "PHP — ₱ Peso", symbol: "₱" },
  { code: "USD", label: "USD — $ Dollar", symbol: "$" },
  { code: "EUR", label: "EUR — € Euro", symbol: "€" },
];

export function getCurrencySymbol(currency = "PHP") {
  return CURRENCY_OPTIONS.find(option => option.code === currency)?.symbol || "₱";
}

export function formatListingPrice(price) {
  // All listings are standardized to Philippine Peso (₱), so always render ₱
  // regardless of any legacy currency value stored on older listings.
  return `₱${Number(price || 0).toLocaleString()}`;
}