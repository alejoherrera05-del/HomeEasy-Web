// This is a rare explanatory character gesture rather than a high-frequency UI
// transition.  The longer arc lets the shoulder, elbow and wrist read as one
// mechanical chain instead of a fast hand swap.
export const HOMMY_TAP_DURATION = 1680;

const arriveEase = "cubic-bezier(.23,1,.32,1)";
const moveEase = "cubic-bezier(.77,0,.175,1)";
const touchEase = "cubic-bezier(.33,1,.68,1)";
const returnEase = "cubic-bezier(.23,1,.32,1)";

export function supportsWebAnimations(element) {
  return Boolean(element && typeof element.animate === "function");
}

function animatePart(element, keyframes, duration = HOMMY_TAP_DURATION) {
  if (!element) return null;
  if (!supportsWebAnimations(element)) {
    animatePart.lastError = "Web Animations API no disponible";
    return null;
  }
  try {
    return element.animate(keyframes, { duration, fill: "none" });
  } catch (error) {
    animatePart.lastError = error instanceof Error ? error.message : String(error);
    return null;
  }
}

function createTimedFeedbackMotion(mode, error = null, duration = 240) {
  let timer;
  let resolveFinished;
  const finished = new Promise((resolve) => {
    resolveFinished = resolve;
    timer = setTimeout(resolve, duration);
  });
  return {
    animations: [],
    mode,
    error,
    finished,
    cancel: () => {
      clearTimeout(timer);
      resolveFinished?.();
    },
  };
}

export function playHommyTapTablet(parts, reducedMotion = false, onError = () => undefined) {
  if (reducedMotion) {
    return createTimedFeedbackMotion("reduced-motion");
  }

  animatePart.lastError = null;
  const canSwapHands = Boolean(parts.transitionHand && parts.bridgeHand && parts.pointingHand);

  const headKeyframes = [
    { transform: "rotate(0deg)", offset: 0 },
    { transform: "rotate(0deg)", offset: 0.08 },
    { transform: "rotate(2.7deg)", offset: 0.3, easing: moveEase },
    { transform: "rotate(3.15deg)", offset: 0.58, easing: touchEase },
    { transform: "rotate(2.75deg)", offset: 0.7, easing: touchEase },
    { transform: "rotate(0deg)", offset: 0.96, easing: moveEase },
    { transform: "rotate(0deg)", offset: 1 },
  ];

  const animations = [
    animatePart(parts.gaze, [
      { opacity: 0, offset: 0 },
      { opacity: 0, offset: 0.14 },
      { opacity: 1, offset: 0.18, easing: arriveEase },
      { opacity: 1, offset: 0.82 },
      { opacity: 0, offset: 0.96, easing: returnEase },
      { opacity: 0, offset: 1 },
    ]),
    animatePart(parts.head, headKeyframes),
    animatePart(parts.upperArm, [
      { transform: "rotate(0deg)", offset: 0 },
      { transform: "rotate(0deg)", offset: 0.1 },
      { transform: "rotate(-8deg)", offset: 0.18, easing: moveEase },
      { transform: "rotate(-20deg)", offset: 0.3, easing: moveEase },
      { transform: "rotate(-34deg)", offset: 0.42, easing: moveEase },
      { transform: "rotate(-44deg)", offset: 0.54, easing: moveEase },
      { transform: "rotate(-48deg)", offset: 0.64, easing: touchEase },
      { transform: "rotate(-46deg)", offset: 0.7, easing: touchEase },
      { transform: "rotate(-38deg)", offset: 0.78, easing: moveEase },
      { transform: "rotate(-18deg)", offset: 0.88, easing: moveEase },
      { transform: "rotate(0deg)", offset: 0.98, easing: returnEase },
      { transform: "rotate(0deg)", offset: 1 },
    ]),
    animatePart(parts.shoulderRotor, [
      { transform: "rotate(0deg)", offset: 0 },
      { transform: "rotate(0deg)", offset: 0.1 },
      { transform: "rotate(2deg)", offset: 0.18, easing: moveEase },
      { transform: "rotate(5deg)", offset: 0.3, easing: moveEase },
      { transform: "rotate(8deg)", offset: 0.42, easing: moveEase },
      { transform: "rotate(11deg)", offset: 0.54, easing: moveEase },
      { transform: "rotate(13deg)", offset: 0.64, easing: touchEase },
      { transform: "rotate(11deg)", offset: 0.7, easing: touchEase },
      { transform: "rotate(7deg)", offset: 0.78, easing: moveEase },
      { transform: "rotate(3deg)", offset: 0.88, easing: moveEase },
      { transform: "rotate(0deg)", offset: 0.98, easing: returnEase },
      { transform: "rotate(0deg)", offset: 1 },
    ]),
    animatePart(parts.elbowRotor, [
      { transform: "rotate(0deg)", offset: 0 },
      { transform: "rotate(0deg)", offset: 0.12 },
      { transform: "rotate(-3deg)", offset: 0.2, easing: moveEase },
      { transform: "rotate(-8deg)", offset: 0.3, easing: moveEase },
      { transform: "rotate(-15deg)", offset: 0.42, easing: moveEase },
      { transform: "rotate(-23deg)", offset: 0.54, easing: moveEase },
      { transform: "rotate(-27deg)", offset: 0.64, easing: touchEase },
      { transform: "rotate(-24deg)", offset: 0.7, easing: touchEase },
      { transform: "rotate(-17deg)", offset: 0.78, easing: moveEase },
      { transform: "rotate(-6deg)", offset: 0.88, easing: moveEase },
      { transform: "rotate(0deg)", offset: 0.98, easing: returnEase },
      { transform: "rotate(0deg)", offset: 1 },
    ]),
    animatePart(parts.forearm, [
      { transform: "rotate(0deg)", offset: 0 },
      { transform: "rotate(0deg)", offset: 0.12 },
      { transform: "rotate(-5deg)", offset: 0.2, easing: moveEase },
      { transform: "rotate(-14deg)", offset: 0.3, easing: moveEase },
      { transform: "rotate(-29deg)", offset: 0.42, easing: moveEase },
      { transform: "rotate(-43deg)", offset: 0.54, easing: moveEase },
      { transform: "rotate(-48deg)", offset: 0.64, easing: touchEase },
      { transform: "rotate(-45deg)", offset: 0.7, easing: touchEase },
      { transform: "rotate(-33deg)", offset: 0.78, easing: moveEase },
      { transform: "rotate(-12deg)", offset: 0.88, easing: moveEase },
      { transform: "rotate(0deg)", offset: 0.98, easing: returnEase },
      { transform: "rotate(0deg)", offset: 1 },
    ]),
    animatePart(parts.hand, [
      { transform: "rotate(0deg)", offset: 0 },
      { transform: "rotate(0deg)", offset: 0.2 },
      { transform: "rotate(3deg)", offset: 0.39, easing: moveEase },
      { transform: "rotate(0deg)", offset: 0.98, easing: returnEase },
      { transform: "rotate(0deg)", offset: 1 },
    ]),
    animatePart(canSwapHands ? parts.hand : null, [
      { opacity: 1, offset: 0 },
      { opacity: 1, offset: 0.395 },
      { opacity: 0, offset: 0.396 },
      { opacity: 0, offset: 0.854 },
      { opacity: 1, offset: 0.855 },
      { opacity: 1, offset: 1 },
    ]),
    animatePart(canSwapHands ? parts.transitionHand : null, [
      { transform: "rotate(84deg)", offset: 0 },
      { transform: "rotate(84deg)", offset: 0.396 },
      { transform: "rotate(84deg)", offset: 0.475, easing: moveEase },
      { transform: "rotate(84deg)", offset: 0.826 },
      { transform: "rotate(84deg)", offset: 0.84, easing: returnEase },
      { transform: "rotate(84deg)", offset: 0.855, easing: returnEase },
      { transform: "rotate(84deg)", offset: 1 },
    ]),
    animatePart(canSwapHands ? parts.transitionHand : null, [
      { opacity: 0, offset: 0 },
      { opacity: 0, offset: 0.395 },
      { opacity: 1, offset: 0.396 },
      { opacity: 1, offset: 0.475 },
      { opacity: 0, offset: 0.476 },
      { opacity: 0, offset: 0.825 },
      { opacity: 1, offset: 0.826 },
      { opacity: 1, offset: 0.854 },
      { opacity: 0, offset: 0.855 },
      { opacity: 0, offset: 1 },
    ]),
    animatePart(canSwapHands ? parts.bridgeHand : null, [
      { transform: "rotate(84deg)", offset: 0 },
      { transform: "rotate(84deg)", offset: 0.476 },
      { transform: "rotate(84deg)", offset: 0.505, easing: moveEase },
      { transform: "rotate(84deg)", offset: 0.53, easing: moveEase },
      { transform: "rotate(84deg)", offset: 0.555, easing: touchEase },
      { transform: "rotate(84deg)", offset: 0.746 },
      { transform: "rotate(84deg)", offset: 0.775, easing: returnEase },
      { transform: "rotate(84deg)", offset: 0.8, easing: returnEase },
      { transform: "rotate(84deg)", offset: 0.825, easing: returnEase },
      { transform: "rotate(84deg)", offset: 1 },
    ]),
    animatePart(canSwapHands ? parts.bridgeHand : null, [
      { opacity: 0, offset: 0 },
      { opacity: 0, offset: 0.475 },
      { opacity: 1, offset: 0.476 },
      { opacity: 1, offset: 0.555 },
      { opacity: 0, offset: 0.556 },
      { opacity: 0, offset: 0.745 },
      { opacity: 1, offset: 0.746 },
      { opacity: 1, offset: 0.825 },
      { opacity: 0, offset: 0.826 },
      { opacity: 0, offset: 1 },
    ]),
    animatePart(canSwapHands ? parts.pointingHand : null, [
      { transform: "rotate(92deg)", offset: 0 },
      { transform: "rotate(92deg)", offset: 0.555 },
      { transform: "rotate(92deg)", offset: 0.556, easing: arriveEase },
      { transform: "rotate(96deg)", offset: 0.6, easing: touchEase },
      { transform: "rotate(108deg)", offset: 0.64, easing: touchEase },
      { transform: "rotate(104deg)", offset: 0.68, easing: touchEase },
      { transform: "rotate(98deg)", offset: 0.71, easing: touchEase },
      { transform: "rotate(92deg)", offset: 0.745, easing: touchEase },
      { transform: "rotate(92deg)", offset: 1 },
    ]),
    animatePart(canSwapHands ? parts.pointingHand : null, [
      { opacity: 0, offset: 0 },
      { opacity: 0, offset: 0.555 },
      { opacity: 1, offset: 0.556 },
      { opacity: 1, offset: 0.745 },
      { opacity: 0, offset: 0.746 },
      { opacity: 0, offset: 1 },
    ]),
  ].filter(Boolean);

  const error = animatePart.lastError;
  if (error) onError(error);
  if (!animations.length) return createTimedFeedbackMotion("accessible-fallback", error);

  return {
    animations,
    mode: error ? "partial-waapi" : "waapi",
    error,
    finished: Promise.allSettled(animations.map((animation) => animation.finished)),
    cancel: () => animations.forEach((animation) => {
      try {
        animation.cancel();
      } catch (cancelError) {
        onError(cancelError instanceof Error ? cancelError.message : String(cancelError));
      }
    }),
  };
}
