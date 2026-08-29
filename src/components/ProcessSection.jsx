import {
  ArrowRight,
  CalendarCheck,
  CubeTransparent,
  Ruler,
  Swatches,
  Wrench,
} from "@phosphor-icons/react";

const processSteps = [
  {
    n: "01",
    icon: CalendarCheck,
    title: "Visitamos tu espacio",
    copy: "Agendamos una visita sin costo en Popayán para entender la ventana, la entrada de luz, la apertura y lo que realmente quieres controlar.",
  },
  {
    n: "02",
    icon: CubeTransparent,
    title: "La ves en tu ventana antes de fabricarla",
    copy: "Cuando el proyecto lo permite, usamos realidad mixta para revisar proporción y presencia de la persiana o cortina directamente sobre tu propia ventana.",
  },
  {
    n: "03",
    icon: Swatches,
    title: "Comparamos con muestras reales",
    copy: "Llevamos Sheer Elegance, velos, Screen y Blackout para comparar transparencia, textura y color con la luz real del ambiente.",
  },
  {
    n: "04",
    icon: Ruler,
    title: "Medimos, fabricamos e instalamos",
    copy: "Tomamos las medidas finales, definimos el sistema y accionamiento, coordinamos fabricación e instalamos dejando el recorrido probado.",
  },
];

export function ProcessSection({ openAdvisorFor }) {
  return (
    <section className="process-v4" id="proceso">
      <div className="process-v4-shell">
        <header className="process-v4-heading">
          <p className="process-v4-kicker">CÓMO TRABAJAMOS · HOMEEASY POPAYÁN</p>
          <div className="process-v4-heading-grid">
            <h2>Tu ventana primero. La solución después.</h2>
            <div>
              <p>
                No elegimos una persiana desde una lista. Vemos el espacio, probamos materiales,
                medimos y definimos contigo lo que mejor funciona antes de fabricar.
              </p>
              <button
                type="button"
                className="button process-v4-main-cta"
                onClick={() => openAdvisorFor("Agendar visita sin costo")}
              >
                Agendar visita sin costo <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="process-v4-story">
          <figure className="process-v4-board">
            <img
              src="/assets/process-materials-approved.webp"
              alt="Muestrarios de Sheer Elegance, velos, Screen y Blackout junto a cinta métrica, herrajes y plano de ventana de HomeEasy"
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <span>MUESTRAS REALES · MEDICIÓN · SISTEMAS</span>
              <p>La decisión se toma con la ventana y los materiales delante, no desde una miniatura.</p>
            </figcaption>
          </figure>

          <div className="process-v4-rail" aria-label="Proceso de asesoría e instalación de HomeEasy">
            {processSteps.map(({ n, icon: Icon, title, copy }) => (
              <article key={n}>
                <div className="process-v4-number">{n}</div>
                <Icon className="process-v4-icon" size={23} weight="regular" aria-hidden="true" />
                <div className="process-v4-step-copy">
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </article>
            ))}

            <div className="process-v4-proof">
              <Wrench size={18} weight="regular" aria-hidden="true" />
              <p><strong>Instalación incluida en el proceso.</strong> Revisamos el funcionamiento antes de entregar.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
