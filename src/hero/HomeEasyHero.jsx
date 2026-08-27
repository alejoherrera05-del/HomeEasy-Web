import { useCallback, useRef, useState } from "react";
import { WhatsappLogo } from "@phosphor-icons/react";
import { HERO_SCENE, HERO_STAGES } from "./heroScene.config.js";
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
  const currentStage = HERO_STAGES[stage];

  return (
    <section className="hero-scroll" id="inicio" ref={sectionRef}>
      <div className="hero-sticky" ref={pinRef}>
        <SheerEleganceScene ref={sceneRef} />

        <div className="hero-content">
          <p className="eyebrow">LUZ, PRIVACIDAD Y CONFORT A TU MEDIDA</p>
          <h1>Controla la luz.<br /><span>Vive el confort.</span></h1>
          <p className="hero-copy">Te ayudamos a elegir según cómo entra el sol, cómo se abre tu ventana y la privacidad que necesitas, con soluciones fabricadas a la medida.</p>
          <div className="hero-actions">
            <a className="button" href="#productos">Explorar soluciones</a>
            <button className="button secondary" onClick={openAdvisor}><WhatsappLogo size={18} /> Agendar asesoría</button>
          </div>
        </div>

        <img
          className="hommy-hero"
          src={HERO_SCENE.assets.hommy}
          alt="Hommy, asistente virtual de HomeEasy"
          width="1080"
          height="1080"
          decoding="async"
        />

        <div className="stage-copy" aria-live="polite">
          <span>0{stage + 1}</span>
          <strong>{currentStage.label}</strong>
          <p>{currentStage.copy}</p>
        </div>

        <HeroStageIndicator stage={stage} onSelect={setProgress} />
        <div className="scroll-hint"><span /> TÚ CONTROLAS LA PERSIANA</div>
        <HeroDebugPanel sceneRef={sceneRef} />
      </div>
    </section>
  );
}
