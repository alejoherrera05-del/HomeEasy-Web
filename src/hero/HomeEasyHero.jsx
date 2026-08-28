import { useCallback, useRef, useState } from "react";
import { HERO_SCENE } from "./heroScene.config.js";
import { SheerEleganceScene } from "./SheerEleganceScene.jsx";
import { HeroStageIndicator } from "./HeroStageIndicator.jsx";
import { HeroDebugPanel } from "./HeroDebugPanel.jsx";
import { useSheerScrollTimeline } from "./useSheerScrollTimeline.js";

export function HomeEasyHero({ openAdvisorFor }) {
  const sectionRef = useRef(null);
  const pinRef = useRef(null);
  const sceneRef = useRef(null);
  const hommyEyeGlowRef = useRef(null);
  const [stage, setStage] = useState(0);
  const updateStage = useCallback((nextStage) => setStage(nextStage), []);
  const { setProgress } = useSheerScrollTimeline({
    sectionRef,
    pinRef,
    sceneRef,
    hommyEyeGlowRef,
    onStageChange: updateStage,
  });

  return (
    <section className="hero-scroll" id="inicio" ref={sectionRef}>
      <div className="hero-sticky" ref={pinRef}>
        <SheerEleganceScene ref={sceneRef} />

        <div className="hero-content">
          <h1>Persianas y papel de colgadura <span>en Popayán</span></h1>
          <p className="hero-copy">Asesoramos, cotizamos, agendamos visita sin costo y realizamos medición e instalación para tu proyecto.</p>
          <div className="hero-actions">
            <button className="button" onClick={() => openAdvisorFor("Cotización de proyecto")}>Cotizar proyecto</button>
            <button className="button secondary" onClick={() => openAdvisorFor("Agendar visita sin costo")}>Agendar visita sin costo</button>
          </div>
        </div>

        <div className="hommy-hero-shell">
          <img
            className="hommy-hero"
            src={HERO_SCENE.assets.hommy}
            alt="Hommy, asesor de HomeEasy para persianas y papel de colgadura en Popayán"
            width="1024"
            height="1280"
            fetchPriority="high"
            decoding="async"
          />
          <span ref={hommyEyeGlowRef} className="hommy-eye-glow" aria-hidden="true" />
        </div>

        <HeroStageIndicator stage={stage} onSelect={setProgress} />
        <HeroDebugPanel sceneRef={sceneRef} />
      </div>
    </section>
  );
}
