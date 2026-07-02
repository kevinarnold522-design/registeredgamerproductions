const PUBLIC_SITE_ORIGIN = "https://gamer.productions";

export function getPublicSiteUrl(path = "/") {
  const normalizedPath = String(path || "/").startsWith("/") ? String(path || "/") : `/${path}`;
  return `${PUBLIC_SITE_ORIGIN}${normalizedPath}`;
}

