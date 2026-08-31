import { useEffect, useRef, useState } from "react";
import {
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

export function ProcessSection() {
  const timelineRef = useRef(null);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [lineProgress, setLineProgress] = useState(0);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline || typeof window === "undefined") return undefined;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduceMotion || typeof window.IntersectionObserver !== "function") {
      setVisibleSteps(processSteps.length);
      setLineProgress(1);
      return undefined;
    }

    let started = false;
    const timers = [];

    const startSequence = () => {
      if (started) return;
      started = true;
      setVisibleSteps(1);

      for (let connector = 1; connector < processSteps.length; connector += 1) {
        const lineDelay = 300 + ((connector - 1) * 520);
        const nodeDelay = 560 + ((connector - 1) * 520);

        timers.push(window.setTimeout(() => {
          setLineProgress(connector / (processSteps.length - 1));
        }, lineDelay));

        timers.push(window.setTimeout(() => {
          setVisibleSteps(connector + 1);
        }, nodeDelay));
      }
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        startSequence();
        observer.disconnect();
      });
    }, {
      rootMargin: "0px 0px -10%",
      threshold: 0.18,
    });

    observer.observe(timeline);

    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

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

        <div
          ref={timelineRef}
          className="process-v5-timeline"
          aria-label="Proceso de servicio de HomeEasy"
          style={{ "--process-progress": lineProgress }}
        >
          <ol className="process-v5-steps">
            {processSteps.map(({ title, copy, icon: Icon }, index) => {
              const isVisible = index < visibleSteps;
              return (
                <li
                  className={`process-v5-step${isVisible ? " is-process-visible" : ""}`}
                  key={title}
                >
                  <div className="process-v5-node" aria-hidden="true">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <Icon size={25} weight="regular" />
                  </div>
                  <div className="process-v5-step-copy">
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
