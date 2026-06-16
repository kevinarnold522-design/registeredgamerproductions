export function formatCount(value) {
  const n = Number(value) || 0;
  if (n >= 1000000000) return `${(n / 1000000000).toFixed(n >= 10000000000 ? 0 : 1)}B`;
  if (n >= 1000000) return `${(n / 1000000).toFixed(n >= 10000000 ? 0 : 1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return n.toLocaleString();
}

export function exactCount(value) {
  return (Number(value) || 0).toLocaleString();
}