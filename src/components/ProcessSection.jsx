import { CalendarCheck } from "@phosphor-icons/react";

const steps = [
  {
    n: "01",
    title: "Cuéntanos qué quieres resolver",
    copy: "Luz, privacidad, calor, oscuridad, paso o simplemente cómo quieres que se vea el espacio.",
  },
  {
    n: "02",
    title: "Te orientamos antes de venderte nada",
    copy: "Comparamos únicamente los sistemas y materiales que tienen sentido para esa ventana.",
  },
  {
    n: "03",
    title: "Agendamos visita sin costo",
    copy: "Vamos a tu espacio en Popayán para revisar apertura, fijaciones y condiciones reales de instalación.",
    highlight: true,
  },
  {
    n: "04",
    title: "Medimos",
    copy: "Tomamos ancho, alto, recorrido y los puntos donde realmente debe quedar instalado el sistema.",
  },
  {
    n: "05",
    title: "Definimos y cotizamos",
    copy: "Recibes una propuesta clara con sistema, material, accionamiento e instalación incluidos según tu proyecto.",
  },
  {
    n: "06",
    title: "Fabricamos e instalamos",
    copy: "Montamos, probamos el recorrido y dejamos la persiana lista para usar.",
  },
];

export function ProcessSection({ openAdvisorFor }) {
  return (
    <section className="process-v3" id="proceso">
      <div className="process-v3-shell">
        <div className="process-v3-copy">
          <span className="process-v3-kicker">CÓMO TRABAJAMOS · POPAYÁN</span>
          <h2>No empezamos por un catálogo. Empezamos por tu ventana.</h2>
          <p>
            Antes de fabricar, entendemos qué quieres resolver y cómo funciona el espacio.
            Eso nos permite recomendar con criterio y medir una sola vez, bien.
          </p>
          <button
            type="button"
            className="button process-v3-cta"
            onClick={() => openAdvisorFor("Agendar visita sin costo")}
          >
            <CalendarCheck size={19} weight="bold" /> Agendar visita sin costo
          </button>
        </div>

        <figure className="process-v3-visual">
          <img
            src="/assets/pentagrama/sheer-elegance-room-official.jpg"
            alt="Ambiente con persianas Sheer Elegance como referencia de una solución instalada"
            loading="lazy"
            decoding="async"
          />
          <figcaption>
            <span>VISITA SIN COSTO</span>
            <strong>Vemos la ventana, la luz y el recorrido en el espacio real.</strong>
          </figcaption>
        </figure>

        <div className="process-v3-list" aria-label="Proceso de asesoría, medición e instalación de HomeEasy">
          {steps.map(({ n, title, copy, highlight }) => (
            <article key={n} className={highlight ? "is-highlight" : undefined}>
              <span>{n}</span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
