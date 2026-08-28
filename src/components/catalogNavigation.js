export function getAdjacentProductId(visibleProducts, selectedId, direction) {
  if (!visibleProducts.length) return null;
  const selectedIndex = visibleProducts.findIndex((product) => product.id === selectedId);
  const origin = selectedIndex >= 0 ? selectedIndex : 0;
  const nextIndex = (origin + direction + visibleProducts.length) % visibleProducts.length;
  return visibleProducts[nextIndex].id;
}
