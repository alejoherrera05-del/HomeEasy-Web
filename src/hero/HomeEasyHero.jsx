import { useCallback, useRef, useState } from "react";
import { HERO_SCENE } from "./heroScene.config.js";
import { SheerEleganceScene } from "./SheerEleganceScene.jsx";
import { HeroStageIndicator } from "./HeroStageIndicator.jsx";
import { HeroDebugPanel } from "./HeroDebugPanel.jsx";
import { useSheerScrollTimeline } from "./useSheerScrollTimeline.js";

export function HomeEasyHero({ openAdvisor }) {
  const sectionRef = useRef(null);
  const pinRef = useRef(null);
  const sceneRef = useRef(null);
  const [stage, setStage] = useState(0);
  const updateStage = useCallback((nextStage) => setStage(nextStage), []);
  const { setProgress } = useSheerScrollTimeline({
    sectionRef,
    pinRef,
    sceneRef,
    onStageChange: updateStage,
  });

  return (
    <section className="hero-scroll" id="inicio" ref={sectionRef}>
      <div className="hero-sticky" ref={pinRef}>
        <SheerEleganceScene ref={sceneRef} />

        <div className="hero-content">
          <h1>Persianas y papel de colgadura para <span>transformar la luz y el ambiente</span> de tu espacio.</h1>
          <p className="hero-copy">Te asesoramos según tu ventana, la entrada de sol, el nivel de privacidad que buscas y el estilo del ambiente. Medimos, fabricamos e instalamos.</p>
          <div className="hero-actions">
            <button className="button" onClick={openAdvisor}>Cotizar proyecto</button>
            <a className="button secondary" href="#productos">Ver sistemas</a>
          </div>
        </div>

        <img
          className="hommy-hero"
          src={HERO_SCENE.assets.hommy}
          alt="Hommy, asesor virtual de HomeEasy, presentando las soluciones"
          width="1024"
          height="1280"
          fetchPriority="high"
          decoding="async"
        />

        <HeroStageIndicator stage={stage} onSelect={setProgress} />
        <HeroDebugPanel sceneRef={sceneRef} />
      </div>
    </section>
  );
}
