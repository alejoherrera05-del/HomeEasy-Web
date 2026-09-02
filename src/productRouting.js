export function productPath(productId) {
  return `/productos/${encodeURIComponent(productId)}/`;
}

export function getCatalogProductId(locationLike, validProductIds) {
  if (!locationLike) return null;

  const pathname = String(locationLike.pathname || "");
  const pathMatch = pathname.match(/^\/productos\/([^/]+)\/?$/i);
  let pathProductId = null;

  if (pathMatch) {
    try {
      pathProductId = decodeURIComponent(pathMatch[1]);
    } catch {
      pathProductId = pathMatch[1];
    }
  }

  const queryProductId = new URLSearchParams(String(locationLike.search || "")).get("producto");
  const candidate = pathProductId || queryProductId;
  return candidate && validProductIds.includes(candidate) ? candidate : null;
}

export function replaceCatalogProductUrl(windowLike, productId) {
  if (!windowLike?.location || !windowLike?.history) return;

  const nextUrl = new URL(windowLike.location.href);
  nextUrl.pathname = productPath(productId);
  nextUrl.searchParams.delete("producto");
  nextUrl.hash = "";
  const relativeUrl = `${nextUrl.pathname}${nextUrl.search}`;

  if (`${windowLike.location.pathname}${windowLike.location.search}${windowLike.location.hash}` !== relativeUrl) {
    windowLike.history.replaceState(windowLike.history.state, "", relativeUrl);
  }
}
