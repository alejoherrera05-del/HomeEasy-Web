import { ArrowRight } from "@phosphor-icons/react";
import part00 from "../assets/process-v7/part00.txt?raw";
import part01 from "../assets/process-v7/part01.txt?raw";
import part02 from "../assets/process-v7/part02.txt?raw";

const PROCESS_IMAGE = `data:image/jpeg;base64,${part00}${part01}${part02}`;

const processSteps = [
  {
    title: "Asesoría",
    copy: "Partimos de tu ventana, la luz que quieres controlar, la privacidad y la forma en que usas el espacio.",
  },
  {
    title: "Cotización",
    copy: "Con lo que ya sabemos, preparamos una propuesta para que tengas un punto claro de decisión.",
  },
  {
    title: "Visita sin costo",
    copy: "Si el proyecto lo requiere, vamos a tu espacio en Popayán para revisar la ventana y comparar opciones con la luz real.",
  },
  {
    title: "Medición",
    copy: "Tomamos las medidas finales y revisamos dónde se instalará el sistema, el vano y las condiciones del espacio.",
  },
  {
    title: "Definición de sistema y material",
    copy: "Comparamos tejidos, privacidad, accionamiento y acabado antes de confirmar qué se fabrica.",
  },
  {
    title: "Instalación",
    copy: "Instalamos, nivelamos y verificamos contigo que cada persiana o cortina funcione como debe.",
  },
];

export function ProcessSection({ openAdvisorFor }) {
  return (
    <section className="process-v5" id="proceso">
      <div className="process-v5-shell">
        <header className="process-v5-intro">
          <p className="process-v5-kicker">CÓMO TRABAJAMOS · POPAYÁN</p>
          <div className="process-v5-intro-grid">
            <h2>Del primer mensaje a la instalación, sabes qué sigue.</h2>
            <div className="process-v5-intro-action">
              <p>
                Te acompañamos para que la decisión se tome con medidas, muestras y condiciones reales de tu espacio.
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
              src={PROCESS_IMAGE}
              alt="Muestrarios de Sheer Elegance, velos, Screen y Blackout de HomeEasy junto a cinta métrica, herrajes y un plano de ventana"
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <span>ANTES DE FABRICAR</span>
              <p>Muestras, medición y una definición clara del sistema para tu espacio.</p>
            </figcaption>
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
