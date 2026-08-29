import {
  ArrowUpRight,
  CalendarCheck,
  FacebookLogo,
  InstagramLogo,
  MapPin,
  WhatsappLogo,
} from "@phosphor-icons/react";

const WHATSAPP_NUMBER = "573334319374";
const WHATSAPP_DISPLAY = "+57 333 431 9374";
const whatsappUrl = (message) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
const mapsUrl = "https://www.google.com/maps/search/?api=1&query=Transversal+9+%23+6N-26+Popay%C3%A1n+Colombia";

export function ContactSection({ openAdvisorFor }) {
  return (
    <footer className="contact-v3" id="contacto">
      <div className="contact-v3-grid">
        <section className="contact-v3-brand" aria-labelledby="contact-v3-title">
          <img className="contact-v3-mark" src="/assets/brand/triangulogold.png" alt="" aria-hidden="true" />
          <span className="contact-v3-kicker">HOMEEASY · POPAYÁN</span>
          <h2 id="contact-v3-title">Tu proyecto puede empezar hoy.</h2>
          <p>
            Cuéntanos qué quieres resolver. Te orientamos, cotizamos y, si hace falta,
            visitamos tu espacio sin costo para medir y definir la solución correcta.
          </p>
          <div className="contact-v3-actions">
            <a
              className="contact-v3-primary"
              href={whatsappUrl("Hola HomeEasy, quiero cotizar un proyecto de persianas.")}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsappLogo size={20} weight="fill" /> Cotizar por WhatsApp
            </a>
            <button
              type="button"
              className="contact-v3-secondary"
              onClick={() => openAdvisorFor("Agendar visita sin costo")}
            >
              <CalendarCheck size={19} weight="bold" /> Agendar visita sin costo
            </button>
          </div>
          <small>Visita sin costo en Popayán · Medición, fabricación e instalación.</small>
        </section>

        <section className="contact-v3-directory" aria-label="Dónde encontrar y contactar a HomeEasy">
          <div className="contact-v3-heading">
            <span>VISÍTANOS</span>
            <strong>Transversal 9 # 6N-26</strong>
            <p>Popayán, Cauca</p>
          </div>

          <a className="contact-v3-route" href={mapsUrl} target="_blank" rel="noreferrer">
            <MapPin size={26} weight="fill" />
            <span><small>UBICACIÓN</small><strong>Cómo llegar a HomeEasy</strong></span>
            <ArrowUpRight size={20} />
          </a>

          <div className="contact-v3-links">
            <a href={whatsappUrl("Hola HomeEasy, quiero hacer una consulta.")} target="_blank" rel="noreferrer">
              <WhatsappLogo size={23} weight="fill" />
              <span><small>WHATSAPP</small><strong>{WHATSAPP_DISPLAY}</strong></span>
              <ArrowUpRight size={18} />
            </a>
            <a href="https://www.instagram.com/homeeasypopayan/" target="_blank" rel="noreferrer">
              <InstagramLogo size={23} weight="bold" />
              <span><small>INSTAGRAM</small><strong>@homeeasypopayan</strong></span>
              <ArrowUpRight size={18} />
            </a>
            <a href="https://www.facebook.com/homeeasypopayan/" target="_blank" rel="noreferrer">
              <FacebookLogo size={23} weight="fill" />
              <span><small>FACEBOOK</small><strong>@homeeasypopayan</strong></span>
              <ArrowUpRight size={18} />
            </a>
          </div>
        </section>
      </div>

      <div className="contact-v3-bottom">
        <div className="contact-v3-wordmark">
          <img src="/assets/brand/triangulo.png" alt="" aria-hidden="true" />
          <span><strong>HomeEasy</strong><small>PERSIANAS & PAPEL DE COLGADURA</small></span>
        </div>
        <p>Persianas y papel de colgadura en Popayán, Cauca.</p>
        <small>© 2026 HomeEasy. Todos los derechos reservados.</small>
      </div>
    </footer>
  );
}
