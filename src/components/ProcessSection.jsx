import { ArrowRight } from "@phosphor-icons/react";

const PROCESS_IMAGE = "/assets/process-materials-final.webp";

const processSteps = [
  {
    title: "Asesoría",
    copy: "Entendemos tu espacio, la luz y la privacidad que buscas.",
  },
  {
    title: "Cotización",
    copy: "Te presentamos una propuesta clara para decidir.",
  },
  {
    title: "Visita sin costo",
    copy: "Revisamos la ventana y las muestras en tu espacio.",
  },
  {
    title: "Medición",
    copy: "Tomamos las medidas finales para fabricar.",
  },
  {
    title: "Sistema y material",
    copy: "Definimos tejido, accionamiento y acabado.",
  },
  {
    title: "Instalación",
    copy: "Instalamos y comprobamos el funcionamiento.",
  },
];

export function ProcessSection({ openAdvisorFor }) {
  return (
    <section className="process-v5" id="proceso">
      <div className="process-v5-shell">
        <header className="process-v5-intro">
          <p className="process-v5-kicker">CÓMO TRABAJAMOS · POPAYÁN</p>
          <div className="process-v5-intro-grid">
            <h2>Así llevamos tu proyecto.</h2>
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
              alt="Muestrarios de persianas, cinta métrica, herrajes y un plano de ventana de HomeEasy"
              width="1100"
              height="825"
              loading="lazy"
              decoding="async"
            />
          </figure>

          <ol className="process-v5-steps" aria-label="Proceso de servicio de HomeEasy">
            {processSteps.map(({ title, copy }, index) => (
              <li key={title}>
                <span className="process-v5-step-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
