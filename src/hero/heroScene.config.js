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
    copy: "Persiana recogida: máxima apertura, más luz y la vista completamente libre.",
    progress: 0,
  },
  {
    id: "filtered",
    label: "Luz filtrada",
    copy: "Las franjas empiezan a filtrar el sol sin cerrar la relación con el exterior.",
    progress: 0.42,
  },
  {
    id: "privacy",
    label: "Privacidad",
    copy: "Las franjas opacas cubren la vista desde afuera mientras el espacio conserva claridad.",
    progress: 0.72,
  },
  {
    id: "ambient",
    label: "Luz ambiente",
    copy: "Con la persiana cerrada, la luz interior toma protagonismo y el ambiente se vuelve más íntimo.",
    progress: 0.96,
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
    hommy: "/assets/hommy-hero-approved.png",
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
    privacyRoomDim: 0.16,
    ambientRoomDim: 0.5,
    privacyWindowExposure: 0.22,
    ambientWindowExposure: 0.48,
    haloMax: 0.92,
  },
  timeline: {
    introEnd: 0.08,
    descentEnd: 0.44,
    privacyEnd: 0.74,
    lampEnd: 0.92,
    restEnd: 1,
  },
  stageThresholds: {
    filteredAt: 0.16,
    privacyAt: 0.58,
    ambientAt: 0.82,
  },
  scroll: {
    desktopVh: 3.5,
    tabletVh: 3,
    mobileVh: 2.4,
    scrub: 0.35,
  },
};

export const clamp01 = (value) => Math.max(0, Math.min(1, value));

export function rangeProgress(value, start, end) {
  if (end <= start) return value >= end ? 1 : 0;
  return clamp01((value - start) / (end - start));
}

export function getStageIndex(progress) {
  const { filteredAt, privacyAt, ambientAt } = HERO_SCENE.stageThresholds;
  if (progress < filteredAt) return 0;
  if (progress < privacyAt) return 1;
  if (progress < ambientAt) return 2;
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
