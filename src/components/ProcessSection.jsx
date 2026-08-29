import { ArrowRight } from "@phosphor-icons/react";

const processStories = [
  {
    eyebrow: "REALIDAD MIXTA",
    title: "Verlo antes de fabricarlo.",
    copy: "Probamos la propuesta sobre tu ventana para decidir proporción y presencia.",
  },
  {
    eyebrow: "MUESTRAS REALES",
    title: "La luz decide el material.",
    copy: "Comparamos Sheer Elegance, velos, Screen y Blackout directamente en tu espacio.",
  },
  {
    eyebrow: "MEDICIÓN + INSTALACIÓN",
    title: "Medimos. Fabricamos. Instalamos.",
    copy: "Dejamos el sistema probado y listo para usar.",
  },
];

export function ProcessSection({ openAdvisorFor }) {
  return (
    <section className="process-v5" id="proceso">
      <div className="process-v5-shell">
        <header className="process-v5-intro">
          <p className="process-v5-kicker">HOMEEASY · EN TU ESPACIO</p>
          <div className="process-v5-intro-grid">
            <h2>Antes de fabricar, lo vemos contigo.</h2>
            <div>
              <p>Visita sin costo en Popayán. Miramos la ventana, la luz y los materiales antes de decidir.</p>
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
          <figure className="process-v5-visual" data-reveal>
            <img
              src="/assets/process-materials-approved.jpg"
              alt="Muestrarios de Sheer Elegance, velos, Screen y Blackout de HomeEasy junto a cinta métrica, herrajes y un plano de ventana"
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <span>Sheer Elegance · velos · Screen · Blackout</span>
              <p>Lo llevamos al espacio real antes de fabricar.</p>
            </figcaption>
          </figure>

          <div className="process-v5-stories" aria-label="Así acompaña HomeEasy un proyecto">
            {processStories.map(({ eyebrow, title, copy }) => (
              <article key={title} data-reveal>
                <p className="process-v5-story-kicker">{eyebrow}</p>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}

            <div className="process-v5-closing" data-reveal>
              <strong>Menos suposiciones. Una decisión más clara.</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
