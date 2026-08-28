import assert from "node:assert/strict";
import test from "node:test";
import { playHommyTapTablet, supportsWebAnimations } from "../src/components/hommyAnimation.js";
import { createLatestReactionQueue, preloadHommyLayers } from "../src/components/hommyRuntime.js";
import { isMotionDebugEnabled } from "../src/motionDebug.js";
import { readFile } from "node:fs/promises";
import {
  attachViewportRefreshHandlers,
  getViewportHeight,
  getViewportMode,
  listenForMediaQueryChange,
} from "../src/motionSupport.js";

test("viewport height prefers visualViewport and safely falls back to innerHeight", () => {
  assert.equal(getViewportHeight({ innerHeight: 844, visualViewport: { height: 721.5 } }), 721.5);
  assert.equal(getViewportHeight({ innerHeight: 844 }), 844);
  assert.equal(getViewportHeight({ innerHeight: 844, visualViewport: { height: 0 } }), 844);
  assert.equal(getViewportMode({ innerWidth: 1200 }), "desktop");
  assert.equal(getViewportMode({ innerWidth: 900 }), "tablet");
  assert.equal(getViewportMode({ innerWidth: 390 }), "mobile");
});

test("matchMedia change subscriptions support modern and legacy Safari APIs", () => {
  let modernAdded = 0;
  let modernRemoved = 0;
  const modern = {
    addEventListener(name, listener) { assert.equal(name, "change"); assert.equal(typeof listener, "function"); modernAdded += 1; },
    removeEventListener(name) { assert.equal(name, "change"); modernRemoved += 1; },
  };
  const removeModern = listenForMediaQueryChange(modern, () => undefined);
  removeModern();
  assert.deepEqual([modernAdded, modernRemoved], [1, 1]);

  let legacyListener;
  const legacy = {
    addListener(listener) { legacyListener = listener; },
    removeListener(listener) { assert.equal(listener, legacyListener); legacyListener = null; },
  };
  const removeLegacy = listenForMediaQueryChange(legacy, () => undefined);
  assert.equal(typeof legacyListener, "function");
  removeLegacy();
  assert.equal(legacyListener, null);
});

test("reduced motion keeps a short visible feedback without invoking WAAPI", async () => {
  let animateCalls = 0;
  const motion = playHommyTapTablet({ head: { animate() { animateCalls += 1; } } }, true);
  assert.equal(motion.mode, "reduced-motion");
  assert.equal(animateCalls, 0);
  motion.cancel();
  await motion.finished;
});

test("reduced-motion CSS preserves a perceptible 240ms facial feedback", async () => {
  const styles = await readFile(new URL("../src/components/hommy-layered.css", import.meta.url), "utf8");
  assert.match(styles, /data-hommy-feedback="reduced-motion"[\s\S]*?animation-duration:\s*240ms\s*!important/);
});

test("motion diagnostics activate only for the explicit motionDebug query", () => {
  assert.equal(isMotionDebugEnabled({ location: { search: "?motionDebug=1" } }), true);
  assert.equal(isMotionDebugEnabled({ location: { search: "?motionDebug=0" } }), false);
  assert.equal(isMotionDebugEnabled({ location: { search: "?heroDebug=1" } }), false);
});

test("WAAPI unavailable never throws and returns the accessible fallback", async () => {
  const errors = [];
  assert.equal(supportsWebAnimations({}), false);
  const motion = playHommyTapTablet({ head: {} }, false, (error) => errors.push(error));
  assert.equal(motion.mode, "accessible-fallback");
  assert.match(motion.error, /Web Animations API/);
  assert.deepEqual(errors, ["Web Animations API no disponible"]);
  motion.cancel();
  await motion.finished;
});

test("reaction received before preload executes once when renderer becomes ready", () => {
  const executed = [];
  const queue = createLatestReactionQueue((reaction) => executed.push(reaction.sequence));
  assert.equal(queue.receive({ sequence: 1 }), false);
  assert.equal(queue.getSnapshot().pendingSequence, 1);
  assert.equal(queue.setRendererStatus("ready"), true);
  assert.deepEqual(executed, [1]);
  assert.equal(queue.getSnapshot().pendingSequence, 0);
});

test("reaction received after preload executes immediately without duplicates", () => {
  const executed = [];
  const queue = createLatestReactionQueue((reaction) => executed.push(reaction.sequence));
  queue.setRendererStatus("ready");
  assert.equal(queue.receive({ sequence: 7 }), true);
  assert.equal(queue.receive({ sequence: 7 }), false);
  assert.deepEqual(executed, [7]);
});

test("two rapid reactions during preload retain only the latest sequence", () => {
  const executed = [];
  const queue = createLatestReactionQueue((reaction) => executed.push(reaction.sequence));
  queue.receive({ sequence: 8 });
  queue.receive({ sequence: 9 });
  assert.equal(queue.getSnapshot().pendingSequence, 9);
  queue.setRendererStatus("ready");
  assert.deepEqual(executed, [9]);
});

test("optional preload failure degrades while critical failure selects official fallback", async () => {
  const layers = {
    body: "body.png",
    head: "head.png",
    pointingHand: "pointing-hand.png",
    headBlink: "head-blink.png",
    headGaze: "head-gaze.png",
  };
  const criticalLayers = ["body", "head", "pointingHand"];
  for (const optionalName of ["headBlink", "headGaze"]) {
    const optionalFailure = await preloadHommyLayers({
      layers,
      criticalLayers,
      loadImage: async (_source, name) => {
        if (name === optionalName) throw new Error("optional missing");
      },
    });
    assert.equal(optionalFailure.status, "ready");
    assert.deepEqual(optionalFailure.optionalFailed.map(({ name }) => name), [optionalName]);
  }

  const criticalFailure = await preloadHommyLayers({
    layers,
    criticalLayers,
    loadImage: async (_source, name) => {
      if (name === "pointingHand") throw new Error("critical missing");
    },
  });
  assert.equal(criticalFailure.status, "fallback");
  assert.deepEqual(criticalFailure.criticalFailed.map(({ name }) => name), ["pointingHand"]);

  const executed = [];
  const queue = createLatestReactionQueue((reaction) => executed.push(reaction.sequence));
  queue.receive({ sequence: 11 });
  assert.equal(queue.getSnapshot().pendingSequence, 11);
  queue.setRendererStatus("fallback");
  assert.equal(queue.getSnapshot().pendingSequence, 0);
  queue.setRendererStatus("ready");
  assert.deepEqual(executed, []);
});

test("unmount during preload marks the result cancelled and a disposed queue stays inert", async () => {
  const controller = new AbortController();
  let release;
  const deferred = new Promise((resolve) => { release = resolve; });
  const preload = preloadHommyLayers({
    layers: { body: "body.png" },
    criticalLayers: ["body"],
    loadImage: () => deferred,
    signal: controller.signal,
  });
  const executed = [];
  const queue = createLatestReactionQueue((reaction) => executed.push(reaction.sequence));
  queue.receive({ sequence: 3 });
  controller.abort();
  queue.dispose();
  release();
  const result = await preload;
  assert.equal(result.cancelled, true);
  assert.equal(queue.setRendererStatus("ready"), false);
  assert.deepEqual(executed, []);
});

test("hero refresh handlers debounce Safari viewport events and clean up", () => {
  const listeners = new Map();
  const visualListeners = new Map();
  const scheduled = [];
  const view = {
    addEventListener(name, listener) { listeners.set(name, listener); },
    removeEventListener(name, listener) { if (listeners.get(name) === listener) listeners.delete(name); },
    visualViewport: {
      addEventListener(name, listener) { visualListeners.set(name, listener); },
      removeEventListener(name, listener) { if (visualListeners.get(name) === listener) visualListeners.delete(name); },
    },
    setTimeout(callback) { scheduled.push(callback); return scheduled.length; },
    clearTimeout(id) { scheduled[id - 1] = null; },
  };
  let refreshes = 0;
  const cleanup = attachViewportRefreshHandlers(() => { refreshes += 1; }, { view, delay: 50 });
  for (const eventName of ["resize", "orientationchange", "pageshow", "load"]) assert.equal(typeof listeners.get(eventName), "function");
  assert.equal(typeof visualListeners.get("resize"), "function");
  listeners.get("resize")();
  visualListeners.get("resize")();
  listeners.get("orientationchange")();
  scheduled.filter(Boolean).at(-1)();
  assert.equal(refreshes, 1);
  cleanup();
  assert.equal(listeners.size, 0);
  assert.equal(visualListeners.size, 0);
});
