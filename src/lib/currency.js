export const CURRENCY_OPTIONS = [
  { code: "USD", label: "USD — $ Dollar", symbol: "$" },
  { code: "EUR", label: "EUR — € Euro", symbol: "€" },
];

export function getCurrencySymbol(currency = "USD") {
  // Peso (PHP) has been retired — any listing still set to PHP now shows $.
  if (currency === "PHP") return "$";
  return CURRENCY_OPTIONS.find(option => option.code === currency)?.symbol || "$";
}

export function formatListingPrice(price, currency = "USD") {
  // Render the listing's chosen currency symbol ($ / €). Falls back to $.
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${Number(price || 0).toLocaleString()}`;
}