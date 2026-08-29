import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import {
  getHommyInteractionTiming,
  scheduleHommyAnswer,
} from "../src/components/hommyInteraction.js";

const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
const guide = await readFile(new URL("../src/components/HommyLayered.jsx", import.meta.url), "utf8");
const assets = await readFile(new URL("../src/components/hommyAssets.js", import.meta.url), "utf8");
const animation = await readFile(new URL("../src/components/hommyAnimation.js", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/components/hommy-layered.css", import.meta.url), "utf8");
const visualStyles = await readFile(new URL("../src/visual-qa-fixes.css", import.meta.url), "utf8");
const packageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");

test("the fallback is the new immutable official PNG", async () => {
  const bytes = await readFile(new URL("../public/assets/hommy/hommy-official.png", import.meta.url));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), "3df14ad330c2ad7e31dfe4c04d70218c09b5c59a8d074281e78678d426beca63");
  assert.match(guide, /HOMMY_OFFICIAL_SOURCE/);
  assert.match(guide, /data-hommy-renderer=.*official-fallback/);
  assert.match(styles, /\.hommy-official-fallback[\s\S]*?transform:\s*none/);
  assert.match(styles, /\.hommy-official-fallback[\s\S]*?filter:\s*none/);
});

test("Rive, video, GIF and generated pose sequences are not part of the solution", () => {
  assert.doesNotMatch(packageJson, /rive/i);
  assert.doesNotMatch(`${guide}\n${animation}`, /\.riv|<video|\.gif|hommy-(reach|writing|thinking|think-bridge|eyes-off)/i);
});

test("the component declares every required aligned layer", () => {
  for (const file of [
    "body-clean-contact.png",
    "torso-shell.png",
    "head.png",
    "head-gaze.png",
    "head-blink.png",
    "shoulder-fixed.png",
    "upper-arm-clean-v2.png",
    "elbow-rotor-official-v3.png",
    "forearm-clean-v2.png",
    "free-hand-tap.png",
    "transition-hand-half-curled-matched-v1.png",
    "bridge-hand-matched.png",
    "pointing-hand-matched.png",
    "shoulder-rotor-official-v4.png",
    "tablet-contact-edge.png",
  ]) assert.match(assets, new RegExp(file.replace(".", "\\.")));
  assert.match(guide, /preloadHommyLayers\(/);
  assert.match(guide, /HOMMY_CRITICAL_LAYERS/);
  assert.match(guide, /setRigStatus\(result\.status\)/);
  assert.match(assets, /HOMMY_CRITICAL_LAYERS[\s\S]*?"pointingHand"/);
});

test("unmount invalidates active motion before cancellation and ignores late completion", () => {
  assert.match(guide, /mountedRef\.current\s*&&\s*activeMotion\.current\s*===\s*motion/);
  assert.match(guide, /mountedRef\.current\s*=\s*false;[\s\S]*?const motion = activeMotion\.current;[\s\S]*?activeMotion\.current\s*=\s*null;[\s\S]*?motion\?\.cancel\(\)/);
});

test("the motion looks first, taps once, and returns every layer to idle", () => {
  assert.match(animation, /HOMMY_TAP_DURATION\s*=\s*1680/);
  assert.match(animation, /parts\.gaze/);
  assert.match(animation, /parts\.head/);
  assert.match(animation, /parts\.upperArm/);
  assert.match(animation, /parts\.shoulderRotor/);
  assert.match(animation, /parts\.elbowRotor/);
  assert.match(animation, /parts\.forearm/);
  assert.match(animation, /parts\.hand/);
  assert.match(animation, /parts\.transitionHand/);
  assert.match(animation, /parts\.bridgeHand/);
  assert.match(animation, /parts\.pointingHand/);
  assert.doesNotMatch(`${guide}\n${animation}`, /parts\.(official|contactPose|eyes|faceOverlay)/);
  assert.doesNotMatch(animation, /translate3d/);
  assert.match(animation, /rotate\(0deg\).*offset:\s*1/);
  assert.doesNotMatch(animation, /parts\.(tablet|body)/);
  assert.match(animation, /finished:\s*Promise\.allSettled/);
  assert.match(guide, /activeMotion\.current\?\.cancel\(\)/);
  assert.match(styles, /transform-origin:\s*var\(--hommy-shoulder-pivot\)/);
  assert.match(styles, /transform-origin:\s*var\(--hommy-elbow-pivot\)/);
  assert.match(styles, /transform-origin:\s*var\(--hommy-wrist-pivot\)/);
  assert.match(styles, /transform-origin:\s*var\(--hommy-pointing-wrist-pivot\)/);
});

test("the fixed torso and articulated elbow eliminate socket and colour jumps", () => {
  assert.match(assets, /torso:\s*"\/assets\/hommy-rig\/torso-shell\.png"/);
  assert.match(assets, /pointingHand:\s*"\/assets\/hommy-rig\/pointing-hand-matched\.png"/);
  assert.match(assets, /transitionHand:\s*"\/assets\/hommy-rig\/transition-hand-half-curled-matched-v1\.png"/);
  assert.match(assets, /bridgeHand:\s*"\/assets\/hommy-rig\/bridge-hand-matched\.png"/);
  assert.match(assets, /elbowRotor:\s*"\/assets\/hommy-rig\/elbow-rotor-official-v3\.png"/);
  assert.match(assets, /tabletForeground:\s*"\/assets\/hommy-rig\/tablet-contact-edge\.png"/);
  assert.doesNotMatch(assets, /contactArm|free-arm-tap\.png/);
  assert.match(guide, /hommy-rig-torso/);
  assert.match(guide, /hommy-rig-shoulder-socket/);
  assert.match(guide, /hommy-rig-pointing-hand/);
  assert.match(styles, /\.hommy-rig-torso\s*\{\s*z-index:\s*2/);
  assert.match(styles, /\.hommy-rig-pointing-hand[\s\S]*?opacity:\s*0[\s\S]*?transform-origin:\s*var\(--hommy-pointing-wrist-pivot\)/);
  assert.match(styles, /\.hommy-rig-tablet\s*\{\s*z-index:\s*5/);
  const upperStart = animation.indexOf("animatePart(parts.upperArm");
  const upperEnd = animation.indexOf("    ]),", upperStart);
  assert.doesNotMatch(animation.slice(upperStart, upperEnd), /opacity/);
  assert.match(animation, /animatePart\(parts\.shoulderRotor/);
  assert.match(animation, /animatePart\(parts\.elbowRotor/);
  assert.doesNotMatch(animation.slice(animation.indexOf("animatePart(parts.forearm"), animation.indexOf("    ]),", animation.indexOf("animatePart(parts.forearm"))), /opacity/);
  assert.match(animation, /animatePart\([^[]*parts\.hand[^[]*,\s*\[[\s\S]*?opacity:\s*1,\s*offset:\s*0\.395[\s\S]*?opacity:\s*0,\s*offset:\s*0\.396/);
  assert.match(animation, /animatePart\([^[]*parts\.transitionHand[^[]*,\s*\[[\s\S]*?opacity:\s*0,\s*offset:\s*0\.395[\s\S]*?opacity:\s*1,\s*offset:\s*0\.396[\s\S]*?opacity:\s*0,\s*offset:\s*0\.476/);
  assert.match(animation, /animatePart\([^[]*parts\.bridgeHand[^[]*,\s*\[[\s\S]*?opacity:\s*0,\s*offset:\s*0\.475[\s\S]*?opacity:\s*1,\s*offset:\s*0\.476[\s\S]*?opacity:\s*0,\s*offset:\s*0\.556/);
  assert.match(animation, /animatePart\([^[]*parts\.pointingHand[^[]*,\s*\[[\s\S]*?opacity:\s*0,\s*offset:\s*0\.555[\s\S]*?opacity:\s*1,\s*offset:\s*0\.556/);
  assert.doesNotMatch(guide, /hommy-rig-elbow-cap/);
  assert.doesNotMatch(assets, /elbowCap|elbow-cap-fixed/);
  assert.match(guide, /hommy-rig-shoulder-rotor/);
  assert.ok(
    guide.indexOf("hommy-rig-shoulder-rotor") > guide.indexOf("hommy-rig-upper-arm"),
    "the shoulder rotor must live inside the articulated upper-arm container",
  );
});

test("the arm is a permanent articulated chain with no opacity gaps or detached translations", () => {
  assert.match(guide, /hommy-rig-upper-arm[\s\S]*?hommy-rig-shoulder-rotor[\s\S]*?hommy-rig-elbow-rotor[\s\S]*?hommy-rig-forearm[\s\S]*?hommy-rig-hand[\s\S]*?hommy-rig-transition-hand/);
  assert.match(assets, /shoulder:[\s\S]*?elbow:[\s\S]*?wrist:[\s\S]*?pointingWrist:/);
  for (const part of ["upperArm", "shoulderRotor", "elbowRotor", "forearm", "hand", "transitionHand", "bridgeHand", "pointingHand"]) {
    const optionalHand = new Set(["transitionHand", "bridgeHand", "pointingHand"]).has(part);
    const start = animation.indexOf(optionalHand
      ? `animatePart(canSwapHands ? parts.${part}`
      : `animatePart(parts.${part}`);
    const end = animation.indexOf("    ]),", start);
    const keyframes = animation.slice(start, end);
    assert.ok(start >= 0 && end > start);
    assert.doesNotMatch(keyframes, /opacity|translate|scale/);
    if (!optionalHand) {
      assert.match(keyframes, /rotate\(0deg\).*offset:\s*0/);
      assert.match(keyframes, /rotate\(0deg\).*offset:\s*1/);
    }
  }
});

test("the elbow visibly bends and the fingertip performs hover, press, and release", () => {
  const forearmStart = animation.indexOf("animatePart(parts.forearm");
  const forearmEnd = animation.indexOf("    ]),", forearmStart);
  const forearmKeyframes = animation.slice(forearmStart, forearmEnd);
  assert.match(forearmKeyframes, /rotate\(-48deg\).*offset:\s*0\.64/);
  assert.doesNotMatch(`${guide}\n${styles}`, /elbow-cap-fixed|hommy-rig-elbow-cap/);

  const pointerStart = animation.indexOf("animatePart(canSwapHands ? parts.pointingHand");
  const pointerEnd = animation.indexOf("    ]),", pointerStart);
  const pointerKeyframes = animation.slice(pointerStart, pointerEnd);
  assert.match(pointerKeyframes, /rotate\(96deg\).*offset:\s*0\.6/);
  assert.match(pointerKeyframes, /rotate\(108deg\).*offset:\s*0\.64/);
  assert.match(pointerKeyframes, /rotate\(98deg\).*offset:\s*0\.71/);
});

test("the permanent blink holds the clean black-eye head long enough to read", () => {
  assert.match(styles, /animation:\s*hommy-natural-blink\s+4\.2s\s+linear\s+1\.6s\s+infinite\s+both/);
  assert.match(styles, /@keyframes\s+hommy-natural-blink/);
  assert.match(styles, /53%,\s*56\.5%\s*\{\s*opacity:\s*1/);
  assert.match(styles, /59%,\s*100%\s*\{\s*opacity:\s*0/);
  assert.doesNotMatch(guide, /scheduleBlink|blinkTimeout|blinkAnimation/);
  assert.match(guide, /hommy-rig-head-blink/);
  assert.doesNotMatch(guide, /hommy-rig-face-overlay|hommy-rig-eyes/);
});

test("answers save first, lock rapid clicks, and allow the same answer after going back", () => {
  const lockIndex = app.indexOf("if (interactionLocked.current) return;");
  const saveIndex = app.indexOf("setAnswers(next);");
  const triggerIndex = app.indexOf("requestHommyReaction(isFinalAnswer");
  assert.ok(lockIndex >= 0);
  assert.ok(saveIndex > lockIndex);
  assert.ok(triggerIndex > saveIndex);
  assert.doesNotMatch(app, /answers\[current\.key\] === value\) return/);
  assert.match(app, /scheduleHommyAnswer\(\{/);
  assert.match(app, /setStep\(\(currentStep\) => currentStep \+ 1\)/);
  assert.match(app, /disabled=\{answerPending\}/);
  assert.match(app, /aria-pressed=\{answers\[current\.key\] === choice\.value\}/);
  assert.match(app, /const goBack = \(\) => \{\s*if \(interactionLocked\.current\) return;/);
  assert.doesNotMatch(app, /setInterval\(/);
});

test("mobile answer scheduling reveals the next question only when it is unlocked", () => {
  const timing = getHommyInteractionTiming({ reducedMotion: false, mobile: true });
  assert.deepEqual(timing, {
    reactionDuration: 1680,
    answerDwell: 1680,
    interactionDuration: 1680,
  });
  const scheduled = [];
  const events = [];
  scheduleHommyAnswer({
    isFinalAnswer: false,
    timing,
    onAdvance: () => events.push("advance"),
    onUnlock: () => events.push("unlock"),
    onReactionComplete: () => events.push("complete"),
    schedule: (callback, delay) => scheduled.push({ callback, delay }),
  });
  assert.deepEqual(scheduled.map(({ delay }) => delay), [1680]);
  scheduled[0].callback();
  assert.deepEqual(events, ["advance", "unlock", "complete"]);
});

test("desktop timing stays unchanged and reduced motion finishes in 240 ms", () => {
  assert.deepEqual(getHommyInteractionTiming({ reducedMotion: false, mobile: false }), {
    reactionDuration: 1100,
    answerDwell: 480,
    interactionDuration: 480,
  });
  const reduced = getHommyInteractionTiming({ reducedMotion: true, mobile: true });
  assert.deepEqual(reduced, {
    reactionDuration: 240,
    answerDwell: 240,
    interactionDuration: 240,
  });
  const scheduled = [];
  const events = [];
  scheduleHommyAnswer({
    isFinalAnswer: true,
    timing: reduced,
    onAdvance: () => events.push("advance"),
    onUnlock: () => events.push("unlock"),
    onReactionComplete: () => events.push("complete"),
    schedule: (callback, delay) => scheduled.push({ callback, delay }),
  });
  assert.deepEqual(scheduled.map(({ delay }) => delay), [240]);
  scheduled[0].callback();
  assert.deepEqual(events, ["advance", "unlock", "complete"]);
});

test("mobile question changes preserve focus without moving the document", () => {
  const recommenderStart = app.indexOf("function Recommender()");
  const answerFlowSource = app.slice(recommenderStart, app.indexOf("const openProduct", recommenderStart));
  assert.doesNotMatch(answerFlowSource, /scrollIntoView|scrollHommyTargetIntoViewIfNeeded|shouldScrollHommyTarget/);
  assert.match(answerFlowSource, /resultRef\.current\.focus\(\{ preventScroll: true \}\)/);
  assert.match(answerFlowSource, /heading\.focus\(\{ preventScroll: true \}\)/);
  assert.match(app, /HOMMY_MOBILE_VIEWPORT_QUERY[\s\S]*?pointer:\s*coarse/);
});

test("mobile frames the complete official Hommy gesture in one non-sticky quiz scene", () => {
  const mobileScene = visualStyles.slice(
    visualStyles.indexOf("/* Mobile recommender foundation"),
    visualStyles.indexOf(".product-filters", visualStyles.indexOf("/* HERO → HOMMY")),
  );
  assert.match(mobileScene, /\.recommender-card\s*\{[\s\S]*?overflow:\s*hidden/);
  assert.match(mobileScene, /\.recommender-card\s*\{[\s\S]*?overflow-anchor:\s*none/);
  assert.match(mobileScene, /\.hommy-test-guide\s*\{[\s\S]*?position:\s*relative;[\s\S]*?top:\s*auto/);
  assert.doesNotMatch(mobileScene, /\.hommy-test-guide\s*\{[\s\S]{0,180}?position:\s*sticky/);
  assert.match(visualStyles, /\.hommy-character\s*\{[\s\S]*?aspect-ratio:\s*1/);
  assert.match(visualStyles, /--hommy-stage-h:\s*clamp\(210px,\s*27svh,\s*224px\)/);
  assert.match(visualStyles, /--hommy-stage-h:\s*200px/);
  assert.match(visualStyles, /width:\s*clamp\(248px,\s*68vw,\s*270px\)/);
  assert.match(visualStyles, /\.hommy-motion-status\s*\{[\s\S]*?z-index:\s*14/);
  assert.match(visualStyles, /-webkit-line-clamp:\s*3/);
  assert.doesNotMatch(mobileScene, /scroll-margin-top/);
  assert.match(app, /data-question=\{current\.key\}/);
  assert.match(app, /className="choice-grid choice-grid--compact-mobile"/);
  assert.match(app, /const hommyMobileReplies = \{[\s\S]*?space:[\s\S]*?opening:[\s\S]*?passage:[\s\S]*?size:[\s\S]*?need:[\s\S]*?privacyMode:[\s\S]*?style:[\s\S]*?budget:[\s\S]*?control:/);
  assert.match(app, /HOMMY_MOBILE_INITIAL_MESSAGE\s*=\s*"Soy Hommy\. Elijamos juntos\."/);
  assert.match(visualStyles, /@media \(max-width: 359px\)[\s\S]*?choice-grid--compact-mobile\s*\{\s*grid-template-columns:\s*1fr/);
  assert.match(visualStyles, /\.question-nav \.text-button,[\s\S]*?\.result-actions \.text-button\s*\{\s*min-height:\s*44px/);
  assert.match(visualStyles, /\.choice-grid--compact-mobile > button\s*\{[\s\S]*?min-height:\s*56px/);
  assert.doesNotMatch(app, /hommy-test-guide[^>]*role="img"/);
  assert.match(app, /role="status" aria-live="polite" aria-atomic="true"/);
});

test("the next question fades into the same space without extending the lock", () => {
  const keyframes = visualStyles.match(/@keyframes hommyQuestionSwapIn\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
  assert.match(visualStyles, /\.question-step,[\s\S]*?\.recommendation-result\s*\{[\s\S]*?animation:\s*hommyQuestionSwapIn 190ms/);
  assert.match(keyframes, /from\s*\{\s*opacity:\s*0/);
  assert.match(keyframes, /to\s*\{\s*opacity:\s*1/);
  assert.doesNotMatch(keyframes, /transform|height|translate/);
  assert.match(visualStyles, /prefers-reduced-motion:\s*reduce[\s\S]*?\.question-step,[\s\S]*?animation:\s*none\s*!important/);
});

test("the real rig is enabled and every production layer exists", async () => {
  assert.match(assets, /HOMMY_RIG_AVAILABLE\s*=\s*true/);
  for (const file of [
    "body-clean-contact.png",
    "torso-shell.png",
    "head.png",
    "head-gaze.png",
    "head-blink.png",
    "shoulder-fixed.png",
    "upper-arm-clean-v2.png",
    "elbow-rotor-official-v3.png",
    "forearm-clean-v2.png",
    "free-hand-tap.png",
    "transition-hand-half-curled-matched-v1.png",
    "bridge-hand-matched.png",
    "pointing-hand-matched.png",
    "shoulder-rotor-official-v4.png",
    "tablet-foreground.png",
  ]) {
    const info = await stat(new URL(`../public/assets/hommy-rig/${file}`, import.meta.url));
    assert.ok(info.size > 1000, `${file} should not be an empty placeholder`);
  }
});
