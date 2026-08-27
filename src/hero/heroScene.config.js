const CANVAS_WIDTH = 1536;
const CANVAS_HEIGHT = 1024;

const normalizedFrame = ({ x, y, width, height }) => ({
  left: x / CANVAS_WIDTH,
  top: y / CANVAS_HEIGHT,
  width: width / CANVAS_WIDTH,
  height: height / CANVAS_HEIGHT,
});

export const HERO_STAGES = [
  {
    id: "natural",
    label: "Luz natural",
    copy: "Sheer Elegance recogida: el espacio recibe toda la luz.",
    progress: 0,
  },
  {
    id: "filtered",
    label: "Luz filtrada",
    copy: "La Sheer desciende sin deformarse y suaviza el sol conservando la vista.",
    progress: 0.3,
  },
  {
    id: "privacy",
    label: "Privacidad",
    copy: "La capa frontal cambia de fase y cubre los vanos transparentes sin convertirse en blackout.",
    progress: 0.68,
  },
  {
    id: "ambient",
    label: "Luz ambiente",
    copy: "La persiana permanece cerrada y la lámpara aporta una luz cálida localizada.",
    progress: 0.94,
  },
];

export const HERO_SCENE = {
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    aspectRatio: CANVAS_WIDTH / CANVAS_HEIGHT,
  },
  assets: {
    roomBase: "/assets/hero-scene-v2/room-empty-straight.webp",
    furnitureGroup: "/assets/hero-scene-v6/furniture-original.png",
    sideTable: "/assets/hero-scene-v6/side-table-original.png",
    plant: "/assets/hero-scene-v6/plant-original.png",
    lamp: "/assets/hero-scene-v2/lamp-complete.webp",
    lampOn: "/assets/hero-scene-v2/lamp-on.webp",
    hommy: "/assets/hommy.png",
  },
  windows: [
    {
      id: "panorama",
      frame: normalizedFrame({ x: 497, y: 158, width: 1023, height: 578 }),
      clipPath: "inset(0)",
    },
  ],
  foreground: {
    plant: normalizedFrame({ x: 405, y: 300, width: 196, height: 449 }),
    sideTable: normalizedFrame({ x: 613, y: 707, width: 175, height: 110 }),
    lamp: normalizedFrame({ x: 651, y: 398, width: 135, height: 399 }),
    furnitureGroup: normalizedFrame({ x: 0, y: 532, width: 916, height: 442 }),
  },
  fabric: {
    bandPitch: 39,
    opaqueBandHeight: 19.5,
    sheerBandHeight: 19.5,
    closedPhaseOffset: 19.5,
    overscanCycles: 1,
  },
  lamp: {
    x: 0.468,
    y: 0.46,
    coreRadiusX: 0.05,
    coreRadiusY: 0.045,
    haloRadiusX: 0.13,
    haloRadiusY: 0.18,
  },
  lighting: {
    roomDimMax: 0.18,
    windowExposureMax: 0.22,
    haloMax: 0.76,
  },
  timeline: {
    introEnd: 0.08,
    descentEnd: 0.48,
    privacyEnd: 0.76,
    lampEnd: 0.92,
    restEnd: 1,
  },
  scroll: {
    desktopVh: 3.5,
    tabletVh: 3,
    mobileVh: 2.4,
    scrub: 0.75,
  },
};

export const clamp01 = (value) => Math.max(0, Math.min(1, value));

export function rangeProgress(value, start, end) {
  if (end <= start) return value >= end ? 1 : 0;
  return clamp01((value - start) / (end - start));
}

export function getStageIndex(progress) {
  const { introEnd, descentEnd, privacyEnd } = HERO_SCENE.timeline;
  if (progress < introEnd) return 0;
  if (progress < descentEnd) return 1;
  if (progress < privacyEnd) return 2;
  return 3;
}

export function getSceneState(progress) {
  const value = clamp01(progress);
  const { introEnd, descentEnd, privacyEnd, lampEnd } = HERO_SCENE.timeline;
  return {
    progress: value,
    stage: getStageIndex(value),
    descendProgress: rangeProgress(value, introEnd, descentEnd),
    closeProgress: rangeProgress(value, descentEnd, privacyEnd),
    lampProgress: rangeProgress(value, privacyEnd, lampEnd),
  };
}
