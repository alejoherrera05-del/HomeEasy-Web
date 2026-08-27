import test from "node:test";
import assert from "node:assert/strict";
import {
  HERO_SCENE,
  HERO_STAGES,
  getSceneState,
  getStageIndex,
} from "../src/hero/heroScene.config.js";

test("the four milestones map to the required physical states", () => {
  assert.deepEqual(getSceneState(0), {
    progress: 0,
    stage: 0,
    descendProgress: 0,
    closeProgress: 0,
    lampProgress: 0,
  });

  assert.deepEqual(getSceneState(0.48), {
    progress: 0.48,
    stage: 2,
    descendProgress: 1,
    closeProgress: 0,
    lampProgress: 0,
  });

  assert.deepEqual(getSceneState(0.76), {
    progress: 0.76,
    stage: 3,
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

test("stage boundaries derive from the same timeline", () => {
  assert.equal(HERO_STAGES.length, 4);
  assert.equal(getStageIndex(0.0799), 0);
  assert.equal(getStageIndex(0.08), 1);
  assert.equal(getStageIndex(0.4799), 1);
  assert.equal(getStageIndex(0.48), 2);
  assert.equal(getStageIndex(0.7599), 2);
  assert.equal(getStageIndex(0.76), 3);
});

test("each stage control lands inside its own visual state", () => {
  HERO_STAGES.forEach((stage, index) => {
    assert.equal(
      getStageIndex(stage.progress),
      index,
      `${stage.label} must not land on an adjacent stage boundary`,
    );
  });
});
