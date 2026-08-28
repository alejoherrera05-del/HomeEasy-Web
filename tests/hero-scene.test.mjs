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
  assert.match(source, /start:\s*0/);
});

test("mobile scroll has a calm opening and a perceptible ambient dwell", () => {
  const initialViewportHeight = 742;
  const mobileDistance = initialViewportHeight * HERO_SCENE.scroll.mobileVh;
  assert.equal(HERO_SCENE.scroll.mobileVh, 3);
  assert.ok(HERO_SCENE.timeline.introEnd * mobileDistance >= 260);
  assert.ok(HERO_SCENE.stageThresholds.filteredAt * mobileDistance >= 400);
  assert.ok((1 - HERO_SCENE.timeline.lampEnd) * mobileDistance >= 260);
  assert.equal(HERO_STAGES.at(-1).progress, HERO_SCENE.timeline.lampEnd);
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
