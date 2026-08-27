from pathlib import Path

app = Path('src/App.jsx')
s = app.read_text()

replacements = {
'''        <button className="button small" onClick={() => { setOpen(false); openAdvisor(); }}>Enviar una foto</button>''': '''        <button className="button small" onClick={() => { setOpen(false); openAdvisor(); }}>Cotizar proyecto</button>''',
'''        <span className="section-label">Recomendador de producto</span>
        <h2>Hommy no empieza por una persiana. Empieza por cómo funciona tu ventana.</h2>
        <p>Responde cómo abre, qué tamaño tiene y qué quieres resolver. El recomendador cruza eso con la mecánica y los tejidos de cada sistema.</p>''': '''        <span className="section-label">Encuentra tu sistema</span>
        <h2>Cuéntale a Hommy cómo es tu ventana y qué necesitas.</h2>
        <p>En menos de 2 minutos compara apertura, tamaño, luz y privacidad para mostrarte las opciones que mejor encajan.</p>''',
'''        <div><span className="section-label">12 sistemas · catálogo Pentagrama</span><h2>Primero decide qué quieres resolver. Después miramos el sistema.</h2></div>
        <p>Filtra por luz, oscuridad, tamaño o control solar. La ficha te muestra cómo se mueve, qué tejido usa y dónde funciona mejor.</p>''': '''        <div><span className="section-label">12 sistemas · catálogo Pentagrama</span><h2>Explora las persianas según lo que necesitas controlar.</h2></div>
        <p>Compara luz, privacidad, tamaño, tejido y accionamiento para entender rápidamente qué sistema puede funcionar mejor.</p>''',
'''        <h2>El papel no se elige mirando una muestra de diez centímetros.</h2>
        <p>Lo decidimos dentro del ambiente, con la luz real y los materiales que ya están ahí. Así la pared se integra en vez de parecer añadida después.</p>''': '''        <h2>El papel tapiz cambia con la escala, la luz y los materiales del espacio.</h2>
        <p>Por eso lo elegimos pensando en el ambiente completo: muro, iluminación, piso y mobiliario.</p>''',
'''    { n: "01", title: "Vemos la ventana", copy: "Una foto nos permite revisar apertura, paso, orientación y qué está pasando hoy con la luz." },
    { n: "02", title: "Medimos en sitio", copy: "Confirmamos dimensiones y puntos de instalación antes de cerrar sistema, tejido y recogida." },
    { n: "03", title: "Definimos la solución", copy: "Elegimos mecanismo y acabado por uso real: privacidad, oscuridad, vista, calor o mantenimiento." },
    { n: "04", title: "Instalamos y probamos", copy: "Revisamos recorrido, accionamiento y terminación para que la ventana quede lista para usar." },''': '''    { n: "01", title: "Entendemos tu espacio", copy: "Revisamos el tipo de ventana, la entrada de luz, la privacidad y cómo usas el ambiente." },
    { n: "02", title: "Tomamos medidas", copy: "Confirmamos dimensiones y condiciones de instalación directamente en sitio." },
    { n: "03", title: "Elegimos sistema y tejido", copy: "Definimos mecanismo, recogida, tejido y accionamiento según lo que necesitas controlar." },
    { n: "04", title: "Instalamos y comprobamos", copy: "Dejamos el sistema instalado y revisamos recorrido, accionamiento y terminación." },''',
'''        <div><h2>No cotizamos una persiana antes de entender cómo abre la ventana.</h2></div>
        <p>La foto da contexto. La visita confirma la medida. La recomendación sale de esas dos cosas, no de escoger un producto por nombre.</p>''': '''        <div><h2>De la asesoría a la instalación, te acompañamos en todo el proceso.</h2></div>
        <p>Primero entendemos lo que necesitas; después medimos, definimos la solución y dejamos todo instalado.</p>''',
'''          <span className="contact-line">WhatsApp · {HOMEEASY_WHATSAPP_DISPLAY}</span>
          <h2>Mándanos una foto de la ventana. Con eso empezamos.</h2>
          <p>Que se vea completa y, si puedes, cómo abre. No hace falta que sepas las medidas ni el nombre del sistema.</p>
          <div className="contact-actions">
            <a className="button contact-whatsapp" href={whatsappUrl("Hola HomeEasy, quiero enviarles una foto de mi ventana para que me orienten.")} target="_blank" rel="noreferrer"><WhatsappLogo size={19} /> Abrir WhatsApp</a>
            <button type="button" className="contact-secondary" onClick={openAdvisor}>Preparar la consulta <ArrowRight size={16} /></button>
          </div>''': '''          <span className="contact-line">Asesoría personalizada · {HOMEEASY_WHATSAPP_DISPLAY}</span>
          <h2>Cotiza tu proyecto con un asesor de HomeEasy.</h2>
          <p>Cuéntanos qué espacio quieres intervenir y qué necesitas controlar. Te orientamos en sistema, tejido, medida e instalación.</p>
          <div className="contact-actions">
            <a className="button contact-whatsapp" href={whatsappUrl("Hola HomeEasy, quiero cotizar un proyecto de persianas.")} target="_blank" rel="noreferrer"><WhatsappLogo size={19} /> Hablar con un asesor</a>
            <button type="button" className="contact-secondary" onClick={openAdvisor}>Solicitar cotización <ArrowRight size={16} /></button>
          </div>''',
'''        <div className="contact-notes" aria-label="Qué ayuda a revisar tu ventana">
          <div><span>01</span><p><strong>Foto completa</strong><small>Ventana y un poco del muro alrededor.</small></p></div>
          <div><span>02</span><p><strong>Cómo abre</strong><small>Fija, corrediza, abatible o salida de paso.</small></p></div>
          <div><span>03</span><p><strong>Qué quieres corregir</strong><small>Luz, privacidad, calor, oscuridad o apariencia.</small></p></div>
        </div>''': '''        <div className="contact-notes" aria-label="Cómo empieza una cotización">
          <div><span>01</span><p><strong>Tu espacio</strong><small>Sala, habitación, oficina, balcón u otro ambiente.</small></p></div>
          <div><span>02</span><p><strong>Lo que necesitas</strong><small>Luz, privacidad, calor, oscuridad, vista o diseño.</small></p></div>
          <div><span>03</span><p><strong>Medición</strong><small>Confirmamos medidas y condiciones antes de fabricar.</small></p></div>
        </div>''',
'''        <h2 id="advisor-title">Cuéntanos qué ventana quieres resolver.</h2>
        <p id="advisor-description">Con estos datos preparamos el mensaje. Después puedes adjuntar la foto directamente en WhatsApp.</p>''': '''        <h2 id="advisor-title">Solicita tu cotización.</h2>
        <p id="advisor-description">Déjanos estos datos básicos y continuamos contigo por WhatsApp con un asesor de HomeEasy.</p>''',
'''      "Hola HomeEasy, quiero revisar una ventana.",''': '''      "Hola HomeEasy, quiero cotizar un proyecto de persianas.",''',
'''      "",
      "Quiero enviarles una foto de la ventana para que me orienten.",''': '''      "",
      "Quisiera recibir asesoría y cotización para este espacio.",''',
'''          <button className="button" type="submit"><WhatsappLogo size={18} /> Preparar mensaje en WhatsApp <ArrowRight size={18} /></button>''': '''          <button className="button" type="submit"><WhatsappLogo size={18} /> Continuar con un asesor <ArrowRight size={18} /></button>''',
'''      <a className="floating-whatsapp" href={whatsappUrl("Hola HomeEasy, quiero enviarles una foto de mi ventana para que me orienten.")} target="_blank" rel="noreferrer" aria-label="Escribir a HomeEasy por WhatsApp"><WhatsappLogo size={26} weight="fill" /></a>''': '''      {/* WhatsApp remains available through clear consultation CTAs; no floating button over the product experience. */}''',
}

for old, new in replacements.items():
    if old not in s:
        raise SystemExit(f'App anchor not found:\n{old[:120]}')
    s = s.replace(old, new)
app.write_text(s)

hero = Path('src/hero/HomeEasyHero.jsx')
h = hero.read_text()
hero_replacements = {
'''          <h1>La luz cambia durante el día.<br /><span>Tu ventana puede acompañarla.</span></h1>
          <p className="hero-copy">Elegimos el sistema por cómo abre la ventana, cuánto sol recibe y qué necesitas resolver: vista, privacidad, oscuridad o calor.</p>''': '''          <h1>Persianas a la medida para controlar <span>luz, privacidad y calor.</span></h1>
          <p className="hero-copy">Te ayudamos a elegir el sistema según el tipo de ventana, su tamaño y la entrada de sol. Medimos, fabricamos e instalamos.</p>''',
'''            <button className="button secondary" onClick={openAdvisor}><WhatsappLogo size={18} /> Enviar una foto</button>''': '''            <button className="button secondary" onClick={openAdvisor}><WhatsappLogo size={18} /> Cotizar proyecto</button>''',
'''          alt="Hommy, asistente virtual de HomeEasy"''': '''          alt="Hommy, guía de HomeEasy"''',
}
for old, new in hero_replacements.items():
    if old not in h:
        raise SystemExit(f'Hero anchor not found: {old[:100]}')
    h = h.replace(old, new)
hero.write_text(h)

styles = Path('src/styles.css')
css = styles.read_text()
marker = '/* HOMEEASY_USER_VIEW_CORRECTION_2026 */'
if marker not in css:
    css += r'''

/* HOMEEASY_USER_VIEW_CORRECTION_2026 */
.hero-sticky::after {
  content: "";
  position: absolute;
  z-index: 2;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(242,243,244,.95) 0%, rgba(242,243,244,.84) 24%, rgba(242,243,244,.42) 43%, rgba(242,243,244,0) 62%);
}
.hero-sticky::before {
  content: "";
  position: absolute;
  z-index: 2;
  right: 7vw;
  bottom: 2.2vh;
  width: min(27vw, 420px);
  height: 44px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(34,27,24,.30) 0%, rgba(34,27,24,.12) 46%, rgba(34,27,24,0) 76%);
  filter: blur(9px);
  pointer-events: none;
}
.hero-content {
  top: 21%;
  width: min(500px, 40vw);
  padding: 0;
  background: transparent;
  border-radius: 0;
  backdrop-filter: none;
}
.hero-content h1 {
  max-width: 500px;
  margin-bottom: 20px;
  font-size: clamp(42px, 3.6vw, 54px);
  line-height: 1.03;
  text-shadow: none;
}
.hero-copy {
  max-width: 470px;
  color: #2c2927;
  font-size: clamp(13px, 1.05vw, 15px);
  line-height: 1.58;
  text-shadow: none;
}
.hero-actions { margin-top: 24px; }
.hommy-hero {
  right: 1.6vw;
  bottom: -3%;
  width: min(41vw, 640px);
  max-height: 88vh;
  filter: drop-shadow(0 30px 28px rgba(24,18,15,.34));
}
.stage-copy {
  right: 3vw;
  top: 14.5%;
  width: 236px;
  padding: 15px 17px;
  border: 0;
  border-left: 2px solid #b48745;
  border-radius: 2px;
  color: #272321;
  background: rgba(248,248,246,.87);
  text-shadow: none;
  backdrop-filter: blur(10px);
}
.stage-copy span { color: #9d7233; }
.stage-copy strong { color: #272321; }
.stage-copy p { color: #625c58; }
.stage-track {
  bottom: 20px;
  width: min(680px, 54vw);
  gap: 16px;
  padding: 0 14px;
  overflow: visible;
  border-radius: 2px;
  background: rgba(24,23,22,.58);
  box-shadow: 0 10px 28px rgba(0,0,0,.14);
  backdrop-filter: blur(7px);
}
.stage-track button {
  padding: 11px 0 9px;
  border-top: 2px solid transparent;
  color: rgba(255,255,255,.84);
  background: transparent;
  font-size: 9px;
  text-align: center;
}
.stage-track button.active { color: #fff; border-top-color: #d36c85; }
.scroll-hint { right: 76px; color: rgba(255,255,255,.92); text-shadow: 0 1px 8px rgba(0,0,0,.55); }

.contact-copy h2 { max-width: 800px; font-size: clamp(40px, 4.6vw, 66px); }
.contact-copy > p { max-width: 700px; }

@media (max-width: 760px) {
  .hero-sticky::after {
    background: linear-gradient(180deg, rgba(242,243,244,.96) 0%, rgba(242,243,244,.90) 37%, rgba(242,243,244,.48) 54%, rgba(242,243,244,0) 70%);
  }
  .hero-sticky::before {
    right: 4vw;
    bottom: 2.4vh;
    width: 52vw;
    height: 32px;
  }
  .hero-content {
    left: 20px;
    right: 20px;
    top: 92px;
    width: auto;
    padding: 0;
    border: 0;
    background: transparent;
    backdrop-filter: none;
  }
  .hero-content h1 {
    max-width: 350px;
    font-size: clamp(37px, 10.4vw, 43px);
    line-height: 1.02;
  }
  .hero-copy {
    max-width: 340px;
    font-size: 12.5px;
    line-height: 1.55;
  }
  .hero-actions { gap: 9px; margin-top: 18px; }
  .hero-actions .button { min-height: 42px; padding: 10px 14px; font-size: 11px; }
  .hommy-hero {
    right: -5%;
    bottom: 2px;
    width: 78vw;
    max-height: 55vh;
  }
  .stage-copy { display: none; }
  .stage-track {
    left: 16px;
    right: 16px;
    bottom: 10px;
    width: auto;
    transform: none;
    gap: 7px;
    padding: 0 9px;
    background: rgba(24,23,22,.60);
  }
  .stage-track button { min-height: 40px; padding: 8px 0 6px; font-size: 7px; }
  .scroll-hint { display: none; }
  .contact-copy h2 { font-size: clamp(38px, 11vw, 52px); }
}
'''
styles.write_text(css)

# Current heroScene.css contains mobile positioning that styles.css overrides later.
# Keep the dedicated motion file untouched so the scene mechanics remain stable.

final_app = app.read_text()
final_hero = hero.read_text()
assert 'Enviar una foto' not in final_app
assert 'Mándanos una foto de la ventana' not in final_app
assert 'No cotizamos una persiana' not in final_app
assert 'La luz cambia durante el día' not in final_hero
assert 'Cotizar proyecto' in final_hero
assert 'Persianas a la medida para controlar' in final_hero
