import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  HERO_SCENE,
  HERO_STAGES,
  getSceneState,
  getStageIndex,
  getHeroProgressSnapshot,
} from "../src/hero/heroScene.config.js";
import {
  getHeroStageProgress,
  getHeroStageThresholds,
  getHeroScrub,
  getHeroTiming,
  getHeroPinStart,
  getScrollDistance,
  HERO_MOBILE_PRE_PIN,
} from "../src/hero/useSheerScrollTimeline.js";

const mobileView = (height = 742) => ({
  innerWidth: 390,
  innerHeight: height,
  visualViewport: { width: 390, height },
  matchMedia: () => ({ matches: true }),
  navigator: { maxTouchPoints: 5 },
});

const desktopView = (height = 900) => ({
  innerWidth: 1440,
  innerHeight: height,
  visualViewport: { width: 1440, height },
  matchMedia: () => ({ matches: false }),
  navigator: { maxTouchPoints: 0 },
});

function extractCssBlock(source, header, startAt = 0) {
  const headerIndex = source.indexOf(header, startAt);
  assert.ok(headerIndex >= 0, `Missing CSS block: ${header}`);
  const openIndex = source.indexOf("{", headerIndex);
  assert.ok(openIndex >= 0, `Missing opening brace for: ${header}`);
  let depth = 0;
  for (let index = openIndex; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(openIndex + 1, index);
  }
  assert.fail(`Missing closing brace for: ${header}`);
}

function cssRules(source) {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selectors: match[1].split(",").map((item) => item.trim()),
    declarations: match[2],
  }));
}

function cssRule(source, selector) {
  const rules = cssRules(source).filter((rule) => rule.selectors.includes(selector));
  assert.ok(rules.length > 0, `Missing CSS rule: ${selector}`);
  return rules.at(-1).declarations;
}

function optionalCssDeclaration(rule, property) {
  const declaration = rule
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${property}:`));
  return declaration?.slice(declaration.indexOf(":") + 1).trim() ?? null;
}

function cssLengthPx(value) {
  if (value == null || value === "0") return 0;
  const match = value.match(/^(-?\d+(?:\.\d+)?)px$/);
  assert.ok(match, `Expected a fixed px length, received: ${value}`);
  return Number(match[1]);
}

test("terminal progress stays atomically synchronized after a refresh", () => {
  assert.deepEqual(getHeroProgressSnapshot(1, 1), {
    scrollProgress: 1,
    timelineProgress: 1,
    stage: 3,
  });
});

test("ScrollTrigger refresh and update publish complete progress snapshots", async () => {
  const source = await readFile(new URL("../src/hero/useSheerScrollTimeline.js", import.meta.url), "utf8");
  assert.match(source, /onUpdate:\s*\(self\)\s*=>\s*publishProgress\(animation\.progress\(\), self\.progress, self\)/);
  assert.match(source, /onRefresh:[\s\S]*?animation\.pause\(\)\.progress\(self\.progress\);[\s\S]*?publishProgress\(self\.progress, self\.progress, self\)/);
  assert.match(source, /ScrollTrigger\.config\(\{ ignoreMobileResize: true \}\)/);
  assert.match(source, /start:\s*\(\)\s*=>\s*getHeroPinStart\(\)/);
  assert.match(source, /scrub:\s*getHeroScrub\(\)/);
  assert.ok(getHeroScrub(desktopView()) >= 1 && getHeroScrub(desktopView()) <= 1.2);
  assert.equal(getHeroScrub(mobileView()), 0.8);
  assert.equal(HERO_SCENE.scroll.scrub, 0.8);
});

test("desktop holds the final ambient state for 28–32% while mobile timing stays approved", () => {
  const desktop = getHeroTiming(desktopView());
  const mobile = getHeroTiming(mobileView());
  const dwell = desktop.timeline.restEnd - desktop.timeline.lampEnd;

  assert.ok(dwell >= 0.28 && dwell <= 0.32, `desktop ambient dwell was ${dwell}`);
  assert.ok(desktop.timeline.lampEnd < desktop.handoff.navFadeStart);
  assert.ok(desktop.handoff.navFadeStart < desktop.handoff.navFadeEnd);
  assert.ok(desktop.handoff.navFadeEnd <= desktop.timeline.restEnd);
  assert.deepEqual(mobile, {
    timeline: HERO_SCENE.timeline,
    handoff: HERO_SCENE.handoff,
  });
});

test("stage controls use the matching desktop profile without changing mobile targets", () => {
  const desktopThresholds = getHeroStageThresholds(desktopView());

  HERO_STAGES.forEach((stage, index) => {
    assert.equal(getHeroStageProgress(index, mobileView()), stage.progress);
    assert.equal(
      getStageIndex(getHeroStageProgress(index, desktopView()), desktopThresholds),
      index,
    );
  });
  assert.deepEqual(HERO_SCENE.desktopStageProgress, [0, 0.38, 0.56, 0.7]);
});

test("numeric scrub settles naturally after leave without intercepting physical input", async () => {
  const source = await readFile(new URL("../src/hero/useSheerScrollTimeline.js", import.meta.url), "utf8");
  const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const supportSource = await readFile(new URL("../src/motionSupport.js", import.meta.url), "utf8");
  const visualStyles = await readFile(new URL("../src/visual-qa-fixes.css", import.meta.url), "utf8");
  const onLeaveStart = source.indexOf("onLeave:");
  const onLeaveBackStart = source.indexOf("onLeaveBack:");
  const onScrubCompleteStart = source.indexOf("onScrubComplete:");
  assert.ok(onScrubCompleteStart >= 0, "terminal synchronization must wait for numeric scrub completion");
  const onLeave = onLeaveStart >= 0
    ? source.slice(onLeaveStart, onLeaveBackStart > onLeaveStart ? onLeaveBackStart : onScrubCompleteStart)
    : "";
  const onLeaveBack = onLeaveBackStart >= 0
    ? source.slice(onLeaveBackStart, onScrubCompleteStart)
    : "";
  const onScrubComplete = source.slice(onScrubCompleteStart, onScrubCompleteStart + 360);

  for (const leaveHook of [onLeave, onLeaveBack]) {
    assert.doesNotMatch(leaveHook, /settleEndpoint|\.progress\(\s*[01]\s*\)|getTween\(\)/);
  }
  const forcedTweenFinishes = source.match(/getTween\(\)\?\.progress\(1\)/g) ?? [];
  if (forcedTweenFinishes.length > 0) {
    const mobileSyncStart = source.indexOf("const synchronizeLeaveEndpoint");
    assert.ok(mobileSyncStart >= 0, "only the approved mobile path may finish its scrub on leave");
    const mobileSync = source.slice(mobileSyncStart, mobileSyncStart + 520);
    assert.equal(forcedTweenFinishes.length, 1);
    assert.match(mobileSync, /if \(!stableMobile\) return;[\s\S]*?getTween\(\)\?\.progress\(1\)/);
  }
  assert.match(onScrubComplete, /self\.progress\s*>=\s*0\.9999[\s\S]*?settleEndpoint\(self,\s*1\)/);
  assert.match(onScrubComplete, /self\.progress\s*<=\s*0\.0001[\s\S]*?settleEndpoint\(self,\s*0\)/);

  const interactionSource = `${source}\n${appSource}\n${supportSource}`;
  assert.doesNotMatch(interactionSource, /addEventListener\(\s*["'`](?:wheel|touchmove)["'`]/);
  assert.doesNotMatch(source, /(?:window|document|document\.documentElement|document\.body)\.scrollTop\s*=/);
  assert.match(visualStyles, /:root\s*\{\s*scroll-behavior:\s*auto\s*;?\s*\}/);
});

test("desktop has one CSS-only Hommy checkpoint with exact header clearance", async () => {
  const [baseStyles, heroStyles, visualStyles, hommyStyles] = await Promise.all([
    readFile(new URL("../src/styles.css", import.meta.url), "utf8"),
    readFile(new URL("../src/hero/heroScene.css", import.meta.url), "utf8"),
    readFile(new URL("../src/visual-qa-fixes.css", import.meta.url), "utf8"),
    readFile(new URL("../src/components/hommy-layered.css", import.meta.url), "utf8"),
  ]);
  const desktopQuery = "@media (min-width: 761px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
  const desktopSnap = extractCssBlock(visualStyles, desktopQuery);
  const rootRule = cssRule(desktopSnap, "html");
  const recommenderRule = cssRule(desktopSnap, "#recomendador");

  assert.equal(optionalCssDeclaration(rootRule, "scroll-snap-type"), "y proximity");
  assert.equal(optionalCssDeclaration(recommenderRule, "scroll-snap-align"), "start");
  assert.equal(optionalCssDeclaration(recommenderRule, "scroll-snap-stop"), "always");

  const globalVisualStyles = visualStyles.slice(0, visualStyles.indexOf("@media"));
  const headerHeight = cssLengthPx(optionalCssDeclaration(cssRule(globalVisualStyles, ".site-header"), "height"));
  const scrollPadding = cssLengthPx(optionalCssDeclaration(rootRule, "scroll-padding-top"));
  const scrollMargin = cssLengthPx(optionalCssDeclaration(recommenderRule, "scroll-margin-top"));
  assert.equal(headerHeight, 82);
  assert.equal(scrollPadding + scrollMargin, headerHeight);

  const allStyles = [baseStyles, heroStyles, visualStyles, hommyStyles].join("\n");
  const stopRules = cssRules(allStyles).filter(({ declarations }) => (
    optionalCssDeclaration(declarations, "scroll-snap-stop") === "always"
  ));
  assert.equal(stopRules.length, 1);
  assert.deepEqual(stopRules[0].selectors, ["#recomendador"]);
  assert.equal((allStyles.match(/scroll-snap-type\s*:\s*y proximity/g) ?? []).length, 1);
  assert.doesNotMatch(allStyles, /scroll-snap-type\s*:\s*y mandatory/);

  // The only vertical snap rule is gated by desktop width and no-preference,
  // so neither iPhone nor Reduced Motion can become a navigation trap.
  assert.match(visualStyles, /@media \(min-width: 761px\) and \(hover: hover\) and \(pointer: fine\) and \(prefers-reduced-motion: no-preference\)/);
  const reducedMotion = extractCssBlock(visualStyles, "@media (prefers-reduced-motion: reduce)");
  assert.doesNotMatch(reducedMotion, /scroll-snap-stop\s*:\s*always|scroll-snap-type\s*:\s*y/);
});

test("mobile has a stable native pre-pin before the blind timeline begins", async () => {
  const source = await readFile(new URL("../src/hero/useSheerScrollTimeline.js", import.meta.url), "utf8");
  const heroStyles = await readFile(new URL("../src/hero/heroScene.css", import.meta.url), "utf8");
  const visualStyles = await readFile(new URL("../src/visual-qa-fixes.css", import.meta.url), "utf8");
  assert.equal(HERO_MOBILE_PRE_PIN, 112);
  assert.ok(HERO_MOBILE_PRE_PIN >= 90 && HERO_MOBILE_PRE_PIN <= 140);
  assert.equal(getHeroPinStart(mobileView(742)), 112);
  assert.equal(getHeroPinStart({ ...mobileView(742), innerWidth: 1200, visualViewport: { width: 1200, height: 742 } }), 0);
  assert.equal(getScrollDistance(mobileView(742), 672), getScrollDistance(mobileView(650), 672));
  assert.match(source, /removeProperty\("--hero-viewport-height"\)/);
  assert.match(source, /pin:\s*stableMobile\s*\?\s*false\s*:\s*pinRef\.current/);
  assert.match(source, /--hero-scroll-distance/);
  assert.match(heroStyles, /min-height:\s*calc\(100svh \+ var\(--hero-scroll-distance, 0px\) \+ 112px\)/);
  assert.match(heroStyles, /@media \(max-width: 760px\)[\s\S]*?\.hero-sticky\s*\{[\s\S]*?position:\s*sticky;[\s\S]*?top:\s*0;[\s\S]*?height:\s*100svh/);
  assert.match(visualStyles, /@media \(max-width: 760px\)[\s\S]*?\.site-header\s*\{[\s\S]*?position:\s*sticky;[\s\S]*?top:\s*0[\s\S]*?main\s*\{\s*margin-top:\s*-70px/);
  assert.doesNotMatch(visualStyles, /\.hero-scroll,\s*\n\s*\.hero-sticky\s*\{[\s\S]{0,120}?min-height:\s*0/);
  assert.match(heroStyles, /prefers-reduced-motion:\s*reduce[\s\S]*?\.hero-sticky\s*\{\s*position:\s*relative\s*!important/);
});

test("the blind reads as fabric without becoming blackout", async () => {
  const styles = await readFile(new URL("../src/hero/heroScene.css", import.meta.url), "utf8");
  assert.match(styles, /rgba\(184, 177, 168, \.88\)/);
  assert.match(styles, /rgba\(250, 248, 244, \.06\)/);
  assert.match(styles, /\.sheer-back-layer\s*\{\s*opacity:\s*\.84/);
  assert.match(styles, /\.sheer-front-layer\s*\{\s*opacity:\s*\.7/);
  assert.ok(HERO_SCENE.lighting.privacyWindowExposure <= 0.14);
  assert.ok(HERO_SCENE.lighting.ambientWindowExposure <= 0.38);
  assert.equal(HERO_SCENE.fabric.closedPhaseOffset, HERO_SCENE.fabric.bandPitch / 2);
});

test("Hommy LED uses the approved canvas as its responsive mask", async () => {
  const component = await readFile(new URL("../src/hero/HomeEasyHero.jsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/visual-qa-fixes.css", import.meta.url), "utf8");
  assert.equal((component.match(/src=\{HERO_SCENE\.assets\.hommy\}/g) ?? []).length, 2);
  assert.match(component, /hommy-hero hommy-face-led-overlay/);
  assert.match(styles, /\.hommy-face-led-overlay\s*\{[\s\S]*?mask-image:\s*radial-gradient/);
  assert.doesNotMatch(styles, /\.hommy-eye-glow\s*\{/);
});

test("mobile scroll has a calm opening and a perceptible ambient dwell", () => {
  const initialViewportHeight = 742;
  const mobileDistance = initialViewportHeight * HERO_SCENE.scroll.mobileVh;
  assert.equal(HERO_SCENE.scroll.desktopVh, 2.9);
  assert.equal(HERO_SCENE.scroll.mobileVh, 2.1);
  assert.ok(HERO_SCENE.timeline.introEnd * mobileDistance >= 180);
  assert.ok(HERO_SCENE.stageThresholds.filteredAt * mobileDistance >= 275);
  assert.ok((1 - HERO_SCENE.timeline.lampEnd) * mobileDistance >= 180);
  assert.equal(HERO_STAGES.at(-1).progress, HERO_SCENE.timeline.lampEnd);
});

test("the single hero timeline owns the restrained final handoff", async () => {
  const source = await readFile(new URL("../src/hero/useSheerScrollTimeline.js", import.meta.url), "utf8");
  const { navFadeStart, navFadeEnd } = HERO_SCENE.handoff;
  assert.ok(HERO_SCENE.timeline.lampEnd <= navFadeStart);
  assert.ok(navFadeStart < navFadeEnd);
  assert.ok(navFadeEnd <= 1);
  assert.match(source, /animation\.to\(stageTrack,[\s\S]*?autoAlpha:\s*0[\s\S]*?duration:\s*handoff\.navFadeEnd\s*-\s*handoff\.navFadeStart[\s\S]*?handoff\.navFadeStart/);
  assert.equal((source.match(/ScrollTrigger\.create\(/g) ?? []).length, 1);
});

test("timeline milestones remain ordered and expose stable boundary states", () => {
  const { introEnd, descentEnd, privacyEnd, lampEnd, restEnd } = HERO_SCENE.timeline;
  assert.ok(0 < introEnd);
  assert.ok(introEnd < descentEnd);
  assert.ok(descentEnd < privacyEnd);
  assert.ok(privacyEnd < lampEnd);
  assert.ok(lampEnd < restEnd);
  assert.equal(getSceneState(introEnd - 0.0001).descendProgress, 0);
  assert.ok(getSceneState(introEnd + 0.0001).descendProgress > 0);
  assert.equal(getSceneState(lampEnd).lampProgress, 1);
  assert.equal(getSceneState(lampEnd).stage, 3);
});

test("the four milestones map to the required physical states", () => {
  assert.deepEqual(getSceneState(0), {
    progress: 0,
    stage: 0,
    descendProgress: 0,
    closeProgress: 0,
    lampProgress: 0,
  });

  assert.deepEqual(getSceneState(0.44), {
    progress: 0.44,
    stage: 1,
    descendProgress: 1,
    closeProgress: 0,
    lampProgress: 0,
  });

  assert.deepEqual(getSceneState(0.74), {
    progress: 0.74,
    stage: 2,
    descendProgress: 1,
    closeProgress: 1,
    lampProgress: 0,
  });

  assert.deepEqual(getSceneState(1), {
    progress: 1,
    stage: 3,
    descendProgress: 1,
    closeProgress: 1,
    lampProgress: 1,
  });
});

test("the scene uses one continuous normalized blind mask", () => {
  assert.equal(HERO_SCENE.windows.length, 1);
  for (const windowConfig of HERO_SCENE.windows) {
    const { left, top, width, height } = windowConfig.frame;
    assert.ok(left >= 0 && top >= 0);
    assert.ok(width > 0 && height > 0);
    assert.ok(left + width <= 1);
    assert.ok(top + height <= 1);
    assert.equal(windowConfig.clipPath, "inset(0)");
  }
});

test("front and back fabric share one immutable pitch", () => {
  const { bandPitch, opaqueBandHeight, sheerBandHeight, closedPhaseOffset } = HERO_SCENE.fabric;
  assert.equal(opaqueBandHeight + sheerBandHeight, bandPitch);
  assert.equal(closedPhaseOffset, bandPitch / 2);
  assert.equal(HERO_SCENE.fabric.overscanCycles, 1);
});

test("stage labels change only after each physical state is visually established", () => {
  assert.equal(HERO_STAGES.length, 4);
  assert.equal(getStageIndex(0.1799), 0);
  assert.equal(getStageIndex(0.18), 1);
  assert.equal(getStageIndex(0.5799), 1);
  assert.equal(getStageIndex(0.58), 2);
  assert.equal(getStageIndex(0.8199), 2);
  assert.equal(getStageIndex(0.82), 3);
});

test("each stage control lands inside its own visual state", () => {
  HERO_STAGES.forEach((stage, index) => {
    const state = getSceneState(stage.progress);
    assert.equal(
      state.stage,
      index,
      `${stage.label} must not land on an adjacent stage boundary`,
    );
    if (stage.id === "ambient") assert.equal(state.lampProgress, 1);
  });
});
