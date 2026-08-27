import { useCallback, useRef, useState } from "react";
import { WhatsappLogo } from "@phosphor-icons/react";
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
          <h1>Persianas a la medida para controlar <span>luz, privacidad y calor.</span></h1>
          <p className="hero-copy">Te ayudamos a elegir el sistema según el tipo de ventana, su tamaño y la entrada de sol. Medimos, fabricamos e instalamos.</p>
          <div className="hero-actions">
            <a className="button" href="#productos">Ver sistemas</a>
            <button className="button secondary" onClick={openAdvisor}><WhatsappLogo size={18} /> Cotizar proyecto</button>
          </div>
        </div>

        <img
          className="hommy-hero"
          src={HERO_SCENE.assets.hommy}
          alt="Hommy, guía de HomeEasy"
          width="1122"
          height="1402"
          decoding="async"
        />

        <HeroStageIndicator stage={stage} onSelect={setProgress} />
        <HeroDebugPanel sceneRef={sceneRef} />
      </div>
    </section>
  );
}
