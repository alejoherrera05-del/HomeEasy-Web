import {
  ArrowRight,
  ChatCircleText,
  FileText,
  HouseLine,
  Ruler,
  Swatches,
  Wrench,
} from "@phosphor-icons/react";

const processSteps = [
  {
    title: "Asesoría",
    copy: "Entendemos tu espacio, la luz y la privacidad que buscas.",
    icon: ChatCircleText,
  },
  {
    title: "Cotización",
    copy: "Te presentamos una propuesta clara y fácil de comparar.",
    icon: FileText,
  },
  {
    title: "Visita sin costo",
    copy: "Vamos a tu espacio con muestras y revisamos la ventana.",
    icon: HouseLine,
  },
  {
    title: "Medición",
    copy: "Tomamos las medidas finales para fabricar con precisión.",
    icon: Ruler,
  },
  {
    title: "Sistema y material",
    copy: "Definimos tejido, accionamiento y acabado.",
    icon: Swatches,
  },
  {
    title: "Instalación",
    copy: "Instalamos y verificamos que todo funcione correctamente.",
    icon: Wrench,
  },
];

export function ProcessSection({ openAdvisorFor }) {
  return (
    <section className="process-v5" id="proceso">
      <div className="process-v5-shell">
        <header className="process-v5-intro">
          <p className="process-v5-kicker">CÓMO TRABAJAMOS · POPAYÁN</p>
          <div className="process-v5-intro-grid">
            <h2>De la asesoría a la instalación.</h2>
            <p>Un proceso claro, acompañado y sin pasos innecesarios.</p>
          </div>
        </header>

        <div className="process-v5-timeline" aria-label="Proceso de servicio de HomeEasy">
          <ol className="process-v5-steps">
            {processSteps.map(({ title, copy, icon: Icon }, index) => (
              <li className="process-v5-step" key={title}>
                <div className="process-v5-node" aria-hidden="true">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <Icon size={25} weight="regular" />
                </div>
                <div className="process-v5-step-copy">
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="process-v5-closing">
          <p>¿Quieres verlo en tu espacio?</p>
          <button
            type="button"
            className="button process-v5-cta"
            onClick={() => openAdvisorFor("Agendar visita sin costo")}
          >
            Agendar visita sin costo <ArrowRight size={18} weight="bold" />
          </button>
        </div>
      </div>
    </section>
  );
}
