export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function getViewportHeight(view = typeof window !== "undefined" ? window : undefined) {
  const visualHeight = Number(view?.visualViewport?.height);
  if (Number.isFinite(visualHeight) && visualHeight > 0) return visualHeight;
  const innerHeight = Number(view?.innerHeight);
  return Number.isFinite(innerHeight) && innerHeight > 0 ? innerHeight : 0;
}

export function getViewportWidth(view = typeof window !== "undefined" ? window : undefined) {
  const visualWidth = Number(view?.visualViewport?.width);
  if (Number.isFinite(visualWidth) && visualWidth > 0) return visualWidth;
  const innerWidth = Number(view?.innerWidth);
  return Number.isFinite(innerWidth) && innerWidth > 0 ? innerWidth : 0;
}

export function getViewportMode(view = typeof window !== "undefined" ? window : undefined) {
  const width = getViewportWidth(view);
  if (width <= 760) return "mobile";
  if (width <= 1050) return "tablet";
  return "desktop";
}

export function isTouchViewport(view = typeof window !== "undefined" ? window : undefined) {
  const pointerQuery = view?.matchMedia?.("(hover: none) and (pointer: coarse)");
  if (typeof pointerQuery?.matches === "boolean") return pointerQuery.matches;
  return Number(view?.navigator?.maxTouchPoints) > 0;
}

export function listenForMediaQueryChange(query, listener) {
  if (!query || typeof listener !== "function") return () => undefined;
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", listener);
    return () => query.removeEventListener?.("change", listener);
  }
  if (typeof query.addListener === "function") {
    query.addListener(listener);
    return () => query.removeListener?.(listener);
  }
  return () => undefined;
}

export function createDebouncedCallback(callback, delay = 120, scheduler = globalThis) {
  let timer = null;
  const debounced = (...args) => {
    if (timer !== null) scheduler.clearTimeout(timer);
    timer = scheduler.setTimeout(() => {
      timer = null;
      callback(...args);
    }, delay);
  };
  debounced.cancel = () => {
    if (timer !== null) scheduler.clearTimeout(timer);
    timer = null;
  };
  return debounced;
}

export function attachViewportRefreshHandlers(refresh, {
  view = typeof window !== "undefined" ? window : undefined,
  delay = 120,
  ignoreHeightOnlyResize = false,
} = {}) {
  if (!view?.addEventListener || typeof refresh !== "function") return () => undefined;
  const debouncedRefresh = createDebouncedCallback(refresh, delay, view);
  let lastWidth = getViewportWidth(view);
  const requestRefresh = (event) => {
    const currentWidth = getViewportWidth(view);
    const isHeightOnlyResize = event?.type === "resize"
      && Math.abs(currentWidth - lastWidth) < 1;

    if (ignoreHeightOnlyResize && isTouchViewport(view) && isHeightOnlyResize) return;

    lastWidth = currentWidth;
    debouncedRefresh(event);
  };
  const windowEvents = ["resize", "orientationchange", "pageshow", "load"];
  windowEvents.forEach((eventName) => view.addEventListener(eventName, requestRefresh, { passive: true }));
  view.visualViewport?.addEventListener?.("resize", requestRefresh, { passive: true });

  return () => {
    debouncedRefresh.cancel();
    windowEvents.forEach((eventName) => view.removeEventListener(eventName, requestRefresh));
    view.visualViewport?.removeEventListener?.("resize", requestRefresh);
  };
}
