import { ArrowRight } from "@phosphor-icons/react";
import part00 from "../assets/process-v7/part00.txt?raw";
import part01 from "../assets/process-v7/part01.txt?raw";
import part02 from "../assets/process-v7/part02.txt?raw";

const PROCESS_IMAGE = `data:image/jpeg;base64,${part00}${part01}${part02}`;

const processStories = [
  {
    eyebrow: "REALIDAD MIXTA",
    title: "Míralo en tu ventana.",
    copy: "Antes de fabricar, revisamos cómo se siente la solución en tu propio espacio.",
  },
  {
    eyebrow: "MUESTRAS REALES",
    title: "Toca. Compara. Decide.",
    copy: "Sheer Elegance, velos, Screen y Blackout con la luz real del ambiente.",
  },
  {
    eyebrow: "MEDICIÓN + INSTALACIÓN",
    title: "Lo dejamos listo.",
    copy: "Medimos, fabricamos, instalamos y comprobamos el funcionamiento.",
  },
];

export function ProcessSection({ openAdvisorFor }) {
  return (
    <section className="process-v5" id="proceso">
      <div className="process-v5-shell">
        <header className="process-v5-intro">
          <p className="process-v5-kicker">HOMEEASY · EN TU ESPACIO</p>
          <div className="process-v5-intro-grid">
            <h2>Antes de fabricar, lo llevamos a tu ventana.</h2>
            <div className="process-v5-intro-action">
              <button
                type="button"
                className="button process-v5-cta"
                onClick={() => openAdvisorFor("Agendar visita sin costo")}
              >
                Agendar visita sin costo <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="process-v5-editorial">
          <figure className="process-v5-visual">
            <img
              src={PROCESS_IMAGE}
              alt="Muestrarios de Sheer Elegance, velos, Screen y Blackout de HomeEasy junto a cinta métrica, herrajes y un plano de ventana"
              loading="lazy"
              decoding="async"
            />
          </figure>

          <div className="process-v5-stories" aria-label="Así acompaña HomeEasy un proyecto">
            {processStories.map(({ eyebrow, title, copy }) => (
              <article key={title}>
                <p className="process-v5-story-kicker">{eyebrow}</p>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
