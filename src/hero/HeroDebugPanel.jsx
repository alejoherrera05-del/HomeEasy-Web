import { useEffect, useState } from "react";
import { heroProgressEvents } from "./useSheerScrollTimeline.js";
import { HERO_SCENE, HERO_STAGES } from "./heroScene.config.js";

const debugEnabled = import.meta.env.DEV
  && typeof window !== "undefined"
  && new URLSearchParams(window.location.search).get("heroDebug") === "1";

const editableLayers = [
  ["furnitureGroup", "Conjunto mobiliario"],
  ["sideTable", "Mesa auxiliar"],
  ["lamp", "Lámpara"],
  ["plant", "Planta"],
];

const initialLayouts = Object.fromEntries(editableLayers.map(([id]) => {
  const frame = HERO_SCENE.foreground[id];
  return [id, {
    x: Math.round(frame.left * HERO_SCENE.canvas.width),
    y: Math.round(frame.top * HERO_SCENE.canvas.height),
    scale: 1,
    rotate: 0,
  }];
}));

const controlDefinitions = [
  ["x", "Posición X", -500, HERO_SCENE.canvas.width, 1],
  ["y", "Posición Y", -300, HERO_SCENE.canvas.height, 1],
  ["scale", "Escala", 0.25, 2, 0.01],
  ["rotate", "Rotación", -20, 20, 0.1],
];

export function HeroDebugPanel({ sceneRef }) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [showMasks, setShowMasks] = useState(false);
  const [isolate, setIsolate] = useState("all");
  const [selectedLayer, setSelectedLayer] = useState("furnitureGroup");
  const [layouts, setLayouts] = useState(initialLayouts);

  useEffect(() => {
    if (!debugEnabled) return undefined;
    const handleProgress = (event) => {
      setProgress(event.detail.progress);
      setStage(event.detail.stage);
    };
    window.addEventListener(heroProgressEvents.progress, handleProgress);
    return () => window.removeEventListener(heroProgressEvents.progress, handleProgress);
  }, []);

  useEffect(() => {
    if (!debugEnabled || !sceneRef.current?.root) return;
    sceneRef.current.root.dataset.debugMasks = String(showMasks);
    sceneRef.current.root.dataset.debugIsolate = isolate;
  }, [isolate, sceneRef, showMasks]);

  useEffect(() => {
    if (!debugEnabled || !sceneRef.current?.objects) return;
    Object.entries(layouts).forEach(([id, layout]) => {
      const element = sceneRef.current.objects[id];
      if (!element) return;
      element.style.left = `${(layout.x / HERO_SCENE.canvas.width) * 100}%`;
      element.style.top = `${(layout.y / HERO_SCENE.canvas.height) * 100}%`;
      element.style.transform = `rotate(${layout.rotate}deg) scale(${layout.scale})`;
      element.style.transformOrigin = "50% 100%";
      element.dataset.debugSelected = String(id === selectedLayer);
    });
  }, [layouts, sceneRef, selectedLayer]);

  if (!debugEnabled) return null;

  const changeProgress = (value) => {
    setProgress(value);
    window.dispatchEvent(new CustomEvent(heroProgressEvents.setProgress, { detail: value }));
  };

  const changeLayout = (property, value) => {
    setLayouts((current) => ({
      ...current,
      [selectedLayer]: { ...current[selectedLayer], [property]: value },
    }));
  };

  const resetLayer = () => {
    setLayouts((current) => ({
      ...current,
      [selectedLayer]: { ...initialLayouts[selectedLayer] },
    }));
  };

  const layoutOutput = JSON.stringify(layouts, null, 2);

  return (
    <aside className="hero-debug-panel" aria-label="Depuración de la escena Sheer Elegance">
      <header><strong>Hero scene</strong><span>{HERO_STAGES[stage].label}</span></header>
      <label>
        Progreso <output>{progress.toFixed(3)}</output>
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={progress}
          onChange={(event) => changeProgress(Number(event.target.value))}
        />
      </label>
      <label className="debug-check">
        <input type="checkbox" checked={showMasks} onChange={(event) => setShowMasks(event.target.checked)} />
        Límites y máscaras
      </label>
      <label>
        Aislar capa
        <select value={isolate} onChange={(event) => setIsolate(event.target.value)}>
          <option value="all">Todas</option>
          <option value="back">Tela posterior</option>
          <option value="front">Tela frontal</option>
          <option value="dim">Oscurecimiento</option>
          <option value="lamp">Lámpara</option>
        </select>
      </label>
      <hr />
      <header><strong>Composición</strong><span>1536 × 1024</span></header>
      <label>
        Mueble u objeto
        <select value={selectedLayer} onChange={(event) => setSelectedLayer(event.target.value)}>
          {editableLayers.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
      </label>
      {controlDefinitions.map(([property, label, min, max, step]) => (
        <label key={property} className="debug-composition-control">
          <span>{label}</span>
          <input
            aria-label={`${label} exacta de ${selectedLayer}`}
            className="debug-number-input"
            type="number"
            min={min}
            max={max}
            step={step}
            value={layouts[selectedLayer][property]}
            onChange={(event) => changeLayout(property, Number(event.target.value))}
          />
          <input
            aria-label={`${label} de ${selectedLayer}`}
            type="range"
            min={min}
            max={max}
            step={step}
            value={layouts[selectedLayer][property]}
            onChange={(event) => changeLayout(property, Number(event.target.value))}
          />
        </label>
      ))}
      <button type="button" onClick={resetLayer}>Restablecer objeto</button>
      <details>
        <summary>Valores de composición</summary>
        <textarea readOnly value={layoutOutput} aria-label="Valores de composición" />
      </details>
    </aside>
  );
}
