import { ArrowRight } from "@phosphor-icons/react";

const processStories = [
  {
    eyebrow: "REALIDAD MIXTA",
    title: "Verlo antes de fabricarlo.",
    copy: "Cuando el proyecto lo permite, llevamos la propuesta a tu propia ventana para revisar proporción, presencia y cómo convive el sistema con el espacio antes de fabricar.",
  },
  {
    eyebrow: "MUESTRAS REALES",
    title: "Tocar los materiales cambia la decisión.",
    copy: "Sheer Elegance, velos, Screen y Blackout se comparan con la luz real del ambiente. Transparencia, textura y color se entienden mejor delante de la ventana que en una miniatura.",
  },
  {
    eyebrow: "MEDICIÓN + INSTALACIÓN",
    title: "Lo dejamos listo para usar.",
    copy: "Tomamos las medidas finales, definimos sistema y accionamiento, coordinamos fabricación e instalamos. Antes de entregar, revisamos el recorrido y el funcionamiento.",
  },
];

export function ProcessSection({ openAdvisorFor }) {
  return (
    <section className="process-v5" id="proceso">
      <div className="process-v5-shell">
        <header className="process-v5-intro">
          <p className="process-v5-kicker">HOMEEASY · EN TU ESPACIO</p>
          <div className="process-v5-intro-grid">
            <h2>La decisión no empieza en un catálogo. Empieza frente a tu ventana.</h2>
            <div>
              <p>
                Agendamos una visita sin costo en Popayán para ver el espacio real, comparar materiales
                y definir contigo la solución antes de fabricar.
              </p>
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
              src="/assets/process-materials-approved.webp"
              alt="Muestrarios de Sheer Elegance, velos, Screen y Blackout de HomeEasy junto a cinta métrica, herrajes y un plano de ventana"
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <span>Sheer Elegance · velos · Screen · Blackout · medición</span>
              <p>Materiales y decisiones que llevamos al espacio real antes de fabricar.</p>
            </figcaption>
          </figure>

          <div className="process-v5-stories" aria-label="Así acompaña HomeEasy un proyecto">
            {processStories.map(({ eyebrow, title, copy }) => (
              <article key={title}>
                <p className="process-v5-story-kicker">{eyebrow}</p>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}

            <div className="process-v5-closing">
              <strong>Una visita. Una decisión mejor informada.</strong>
              <p>Sin elegir a ciegas y sin convertir el proceso en una lista de productos.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
