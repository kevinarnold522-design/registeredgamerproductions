export const CURRENCY_OPTIONS = [
  { code: "PHP", label: "PHP — ₱ Peso", symbol: "₱" },
  { code: "USD", label: "USD — $ Dollar", symbol: "$" },
  { code: "EUR", label: "EUR — € Euro", symbol: "€" },
];

export function getCurrencySymbol(currency = "PHP") {
  return CURRENCY_OPTIONS.find(option => option.code === currency)?.symbol || "₱";
}

export function formatListingPrice(price, currency = "PHP") {
  // Render the listing's chosen currency symbol (₱ / $ / €). Falls back to ₱.
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${Number(price || 0).toLocaleString()}`;
}