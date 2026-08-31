import {
  ArrowRight,
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

const channels = [
  {
    label: "WHATSAPP",
    value: WHATSAPP_DISPLAY,
    href: whatsappUrl("Hola HomeEasy, quiero hacer una consulta."),
    icon: WhatsappLogo,
    weight: "fill",
  },
  {
    label: "INSTAGRAM",
    value: "@homeeasypopayan",
    href: "https://www.instagram.com/homeeasypopayan/",
    icon: InstagramLogo,
    weight: "regular",
  },
  {
    label: "FACEBOOK",
    value: "@homeeasypopayan",
    href: "https://www.facebook.com/homeeasypopayan/",
    icon: FacebookLogo,
    weight: "fill",
  },
];

export function ContactSection({ openAdvisorFor }) {
  return (
    <footer className="contact-v4" id="contacto">
      <div className="contact-v4-shell">
        <header className="contact-v4-heading">
          <div className="contact-v4-brandline">
            <img src="/assets/brand/triangulo.png" alt="" aria-hidden="true" />
            <span>HOMEEASY · PERSIANAS EN POPAYÁN</span>
          </div>
          <div className="contact-v4-heading-grid">
            <h2>Cuéntanos qué ventana o pared quieres resolver.</h2>
            <div className="contact-v4-heading-copy">
              <p>
                Cotizamos persianas a medida y papel de colgadura en Popayán. Puedes empezar desde aquí,
                agendar una visita sin costo o escribirnos directamente.
              </p>
              <div className="contact-v4-actions">
                <button
                  type="button"
                  className="button"
                  onClick={() => openAdvisorFor("Cotizar proyecto")}
                >
                  Cotizar proyecto <ArrowRight size={18} weight="bold" />
                </button>
                <button
                  type="button"
                  className="button secondary contact-v4-visit-cta"
                  onClick={() => openAdvisorFor("Agendar visita sin costo")}
                >
                  <CalendarCheck size={18} weight="bold" /> Agendar visita sin costo
                </button>
                <a
                  className="contact-v4-whatsapp-cta"
                  href={whatsappUrl("Hola HomeEasy, quiero hablar sobre un proyecto.")}
                  target="_blank"
                  rel="noreferrer"
                >
                  <WhatsappLogo size={19} weight="fill" /> Hablar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </header>

        <div className="contact-v4-directory">
          <a className="contact-v4-location" href={mapsUrl} target="_blank" rel="noreferrer">
            <div className="contact-v4-location-icon"><MapPin size={28} weight="fill" /></div>
            <div>
              <span>VISÍTANOS</span>
              <strong>Transversal 9 # 6N-26</strong>
              <p>Popayán, Cauca</p>
            </div>
            <div className="contact-v4-route">
              <span>CÓMO LLEGAR</span>
              <ArrowUpRight size={22} />
            </div>
          </a>

          <nav className="contact-v4-channels" aria-label="Canales de contacto de HomeEasy">
            {channels.map(({ label, value, href, icon: Icon, weight }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer">
                <Icon size={24} weight={weight} aria-hidden="true" />
                <span><small>{label}</small><strong>{value}</strong></span>
                <ArrowUpRight size={18} />
              </a>
            ))}
          </nav>
        </div>

        <div className="contact-v4-foot">
          <div className="contact-v4-wordmark">
            <img src="/assets/brand/triangulo.png" alt="" aria-hidden="true" />
            <span><strong>HomeEasy</strong><small>PERSIANAS & PAPEL DE COLGADURA</small></span>
          </div>
          <p>Persianas a medida · Papel de colgadura · Medición e instalación</p>
          <small>© 2026 HomeEasy</small>
        </div>
      </div>
    </footer>
  );
}
