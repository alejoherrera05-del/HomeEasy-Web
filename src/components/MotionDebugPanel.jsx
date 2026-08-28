import { useEffect, useState } from "react";
import { isMotionDebugEnabled, MOTION_DEBUG_EVENT, publishMotionDebug } from "../motionDebug.js";
import {
  attachViewportRefreshHandlers,
  getViewportMode,
  listenForMediaQueryChange,
  REDUCED_MOTION_QUERY,
} from "../motionSupport.js";

const enabled = isMotionDebugEnabled();

function readBrowserState() {
  const reducedQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  return {
    device: {
      userAgent: navigator.userAgent,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      visualViewportWidth: window.visualViewport?.width ?? "n/a",
      visualViewportHeight: window.visualViewport?.height ?? "n/a",
      devicePixelRatio: window.devicePixelRatio,
      viewportMode: getViewportMode(),
    },
    motion: {
      prefersReducedMotion: reducedQuery.matches ? "reduce" : "no-preference",
      visibilityState: document.visibilityState,
      webAnimationsApi: typeof Element !== "undefined" && typeof Element.prototype.animate === "function",
      matchMediaAddEventListener: typeof reducedQuery.addEventListener === "function",
    },
  };
}

const value = (input) => typeof input === "boolean" ? String(input) : (input ?? "—");

function DebugSection({ title, rows }) {
  return (
    <section>
      <h3>{title}</h3>
      <dl>{rows.map(([label, item]) => (
        <div key={label}><dt>{label}</dt><dd>{value(item)}</dd></div>
      ))}</dl>
    </section>
  );
}

export function MotionDebugPanel() {
  const [visible, setVisible] = useState(enabled);
  const [snapshot, setSnapshot] = useState(() => enabled ? (window.__homeEasyMotionDebugState ?? {}) : {});

  useEffect(() => {
    if (!enabled) return undefined;
    const updateBrowserState = () => {
      const browser = readBrowserState();
      publishMotionDebug("device", browser.device);
      publishMotionDebug("motion", browser.motion);
    };
    const handleDebug = () => setSnapshot({ ...window.__homeEasyMotionDebugState });
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    const removeMediaListener = listenForMediaQueryChange(query, updateBrowserState);
    const removeViewportListeners = attachViewportRefreshHandlers(updateBrowserState, { delay: 60 });
    document.addEventListener("visibilitychange", updateBrowserState);
    window.addEventListener(MOTION_DEBUG_EVENT, handleDebug);
    updateBrowserState();
    handleDebug();
    return () => {
      removeMediaListener();
      removeViewportListeners();
      document.removeEventListener("visibilitychange", updateBrowserState);
      window.removeEventListener(MOTION_DEBUG_EVENT, handleDebug);
    };
  }, []);

  if (!enabled || !visible) return null;
  const device = snapshot.device ?? {};
  const motion = snapshot.motion ?? {};
  const hero = snapshot.hero ?? {};
  const hommy = snapshot.hommy ?? {};

  return (
    <aside className="motion-debug-panel" aria-label="Diagnóstico de movimiento">
      <header><strong>MOTION DEBUG</strong><button type="button" onClick={() => setVisible(false)} aria-label="Cerrar diagnóstico">×</button></header>
      <DebugSection title="DEVICE / VIEWPORT" rows={[
        ["userAgent", device.userAgent],
        ["inner", `${value(device.innerWidth)} × ${value(device.innerHeight)}`],
        ["visualViewport", `${value(device.visualViewportWidth)} × ${value(device.visualViewportHeight)}`],
        ["devicePixelRatio", device.devicePixelRatio],
        ["viewport mode", device.viewportMode],
      ]} />
      <DebugSection title="MOTION" rows={[
        ["reduced motion", motion.prefersReducedMotion],
        ["visibility", motion.visibilityState],
        ["WAAPI", motion.webAnimationsApi],
        ["matchMedia.addEventListener", motion.matchMediaAddEventListener],
      ]} />
      <DebugSection title="HERO" rows={[
        ["ScrollTrigger", hero.scrollTriggerAvailable],
        ["created", hero.scrollTriggerCreated],
        ["start / end", `${value(hero.start)} / ${value(hero.end)}`],
        ["scroll / timeline", `${value(hero.scrollProgress)} / ${value(hero.timelineProgress)}`],
        ["stage", hero.stage],
        ["viewport mode", hero.viewportMode],
        ["last refresh", hero.lastRefresh],
      ]} />
      <DebugSection title="HOMMY" rows={[
        ["renderer / preload", `${value(hommy.renderer)} / ${value(hommy.preloadStatus)}`],
        ["layers loaded / failed", `${value(hommy.layersLoaded)} / ${value(hommy.layersFailed)}`],
        ["sequence received", hommy.reactionSequenceReceived],
        ["sequence executed", hommy.reactionSequenceExecuted],
        ["motion state", hommy.motionState],
        ["reduced fallback", hommy.reducedMotionFallback],
        ["last error", hommy.lastAnimationError || "none"],
      ]} />
    </aside>
  );
}
