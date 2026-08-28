export const MOTION_DEBUG_EVENT = "homeeasy:motion-debug";

export function isMotionDebugEnabled(view = typeof window !== "undefined" ? window : undefined) {
  if (!view?.location) return false;
  return new URLSearchParams(view.location.search).get("motionDebug") === "1";
}

export function publishMotionDebug(section, values, view = typeof window !== "undefined" ? window : undefined) {
  if (!isMotionDebugEnabled(view) || !section || !values) return;
  const current = view.__homeEasyMotionDebugState ?? {};
  view.__homeEasyMotionDebugState = {
    ...current,
    [section]: { ...(current[section] ?? {}), ...values },
  };
  if (typeof view.dispatchEvent === "function" && typeof CustomEvent === "function") {
    view.dispatchEvent(new CustomEvent(MOTION_DEBUG_EVENT, {
      detail: { section, values: view.__homeEasyMotionDebugState[section] },
    }));
  }
}
