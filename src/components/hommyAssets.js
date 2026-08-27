export const HOMMY_OFFICIAL_SOURCE = "/assets/hommy/hommy-official.png";

// The official image remains the immutable loading fallback. Once every layer
// is ready, the permanent rig reconstructs the same pose with articulated joints.
export const HOMMY_RIG_AVAILABLE = true;

export const HOMMY_LAYERS = {
  body: "/assets/hommy-rig/body-clean-contact.png",
  torso: "/assets/hommy-rig/torso-shell.png",
  head: "/assets/hommy-rig/head.png",
  headGaze: "/assets/hommy-rig/head-gaze.png",
  headBlink: "/assets/hommy-rig/head-blink.png",
  shoulderSocket: "/assets/hommy-rig/shoulder-fixed.png",
  upperArm: "/assets/hommy-rig/upper-arm-clean-v2.png",
  elbowRotor: "/assets/hommy-rig/elbow-rotor-official-v3.png",
  forearm: "/assets/hommy-rig/forearm-clean-v2.png",
  hand: "/assets/hommy-rig/free-hand-tap.png",
  transitionHand: "/assets/hommy-rig/transition-hand-half-curled-matched-v1.png",
  bridgeHand: "/assets/hommy-rig/bridge-hand-matched.png",
  pointingHand: "/assets/hommy-rig/pointing-hand-matched.png",
  shoulderRotor: "/assets/hommy-rig/shoulder-rotor-official-v4.png",
  tabletForeground: "/assets/hommy-rig/tablet-contact-edge.png",
};

export const HOMMY_PIVOTS = {
  head: "50% 43.5%",
  shoulder: "28.3% 54.1%",
  elbow: "23% 72.25%",
  wrist: "23% 88.7%",
  pointingWrist: "24.9% 88.7%",
};
