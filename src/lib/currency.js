export const CURRENCY_OPTIONS = [
  { code: "USD", label: "USD - Dollar", symbol: "$" },
  { code: "EUR", label: "EUR - Euro", symbol: "\u20ac" },
];

export function getCurrencySymbol(currency = "USD") {
  return CURRENCY_OPTIONS.find(option => option.code === currency)?.symbol || "$";
}

export function formatListingPrice(price, currency = "USD") {
  const symbol = getCurrencySymbol(currency);
  return symbol + Number(price || 0).toLocaleString();
}
