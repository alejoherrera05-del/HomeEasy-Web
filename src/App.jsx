import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CaretRight,
  CheckCircle,
  List,
  PlayCircle,
  WhatsappLogo,
  X,
} from "@phosphor-icons/react";
import { HomeEasyHero } from "./hero/HomeEasyHero.jsx";
import HommyLayered from "./components/HommyLayered.jsx";

const HOMEEASY_WHATSAPP_NUMBER = "573334319374";
const HOMEEASY_WHATSAPP_DISPLAY = "+57 333 431 9374";
const whatsappUrl = (message) => `https://wa.me/${HOMEEASY_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const photo = (src, label, alt) => ({ type: "image", src, label, alt });
const officialVideo = (id, title, duration) => ({ type: "video", id, title, duration, label: "Video oficial" });
const products = [
  {
    id: "sheer-elegance",
    name: "Sheer Elegance",
    short: "Dos planos de tejido alternan franjas transparentes y opacas para graduar la luz sin subir la cortina.",
    media: [
      photo("/assets/pentagrama/sheer-elegance-room-official.jpg", "Ambiente", "Sheer Elegance instalada en un ambiente contemporáneo"),
      photo("/assets/pentagrama/sheer-elegance-1-p8.jpg", "Franjas abiertas", "Sheer Elegance graduando la entrada de luz"),
      photo("/assets/pentagrama/sheer-elegance-3-p9.jpg", "Detalle del tejido", "Detalle de las franjas transparentes y opacas"),
      officialVideo("zAzVjkM23tc", "Instalación Sheer Elegance Penta13 con Kit Duo", "5:11"),
    ],
    tag: "Luz graduable",
    filters: ["luz", "decorar"],
    ideal: "Salas, estudios y habitaciones donde quieres luz suave y privacidad flexible.",
    material: "Tejido doble con franjas traslúcidas y opacas.",
    control: "Cadena, sistema PULL o motorización.",
    system: "Standard, Binovo, Versátil o Trishade Día y Noche.",
    facts: ["Gradúa la luz alineando sus franjas", "Opción manual o motorizada", "Cuatro sistemas según tamaño y uso"],
  },
  {
    id: "vertesse",
    name: "Sheer Vertesse",
    short: "Velo vertical ondulado cuyas lamas giran para abrir la vista o crear privacidad.",
    media: [
      photo("/assets/pentagrama/vertesse-bedroom-official.jpg", "Ambiente", "Sheer Vertesse instalada en una habitación"),
      photo("/assets/pentagrama/vertesse-study-official.jpg", "Vista abierta", "Sheer Vertesse en un estudio con sus ondas abiertas"),
      photo("/assets/pentagrama/vertesse-fabric-official.jpg", "Detalle del velo", "Detalle oficial del velo vertical Sheer Vertesse"),
      officialVideo("yop8WvPO9gY", "Modelo 3D Sheer Vertesse", "0:39"),
    ],
    tag: "Velo vertical", filters: ["luz", "grandes", "decorar"],
    ideal: "Puertaventanas y ventanales de piso a techo con una caída ligera.",
    material: "Velo 100% poliéster con ondas verticales.",
    control: "Cordel y cadena, bastón o motor Motion.",
    system: "Recoge a un lado, al centro o a los extremos; hasta 5,80 m de ancho.",
    facts: ["Lamas que giran como una vertical", "Riel de aluminio de bajo perfil", "Instalación a muro o techo"],
  },
  {
    id: "enrollable-screen",
    name: "Enrollable Screen",
    short: "Filtra resplandor y calor mientras conserva la relación visual con el exterior.",
    media: [
      photo("/assets/pentagrama/screen-office-official.jpg", "Ambiente", "Persianas Screen instaladas en una oficina contemporánea"),
      photo("/assets/pentagrama/screen-corner-official.jpg", "Control solar", "Enrollables Screen filtrando el sol en un ventanal esquinero"),
      photo("/assets/pentagrama/screen-weave-official.jpg", "Tejido técnico", "Detalle de la trama del tejido Screen"),
      officialVideo("7uVuFEMrZDY", "Persianas Enrollables Pentagrama", "0:13"),
    ],
    tag: "Vista + protección", filters: ["luz", "termico", "grandes"],
    ideal: "Salas, oficinas y fachadas expuestas al sol.",
    material: "Tejido técnico Screen en distintos niveles de apertura.",
    control: "Cadena o motor; integración con control y app.",
    system: "Rollo visible o cabezal de 3, 4 o 5 pulgadas; seis perfiles inferiores.",
    facts: ["Reduce el deslumbramiento", "Conserva vista según apertura", "Cabezal opcional para ocultar el rollo"],
  },
  {
    id: "enrollable-blackout",
    name: "Enrollable Blackout",
    short: "Tejido opaco para reducir intensamente la entrada de luz con una apariencia limpia y precisa.",
    media: [
      photo("/assets/pentagrama/blackout-bedroom-official.jpg", "Habitación", "Enrollables Blackout oscuras instaladas en una habitación"),
      photo("/assets/pentagrama/blackout-texture-official.jpg", "Textura", "Blackout texturizado en un ambiente interior"),
      photo("/assets/pentagrama/blackout-living-official.jpg", "Ambiente", "Enrollables Blackout grises instaladas en una sala"),
      officialVideo("qCX6yIyBl-E", "Enrollables: sistema de inserto", "1:05"),
    ],
    tag: "Oscuridad", filters: ["oscuridad", "termico"],
    ideal: "Habitaciones, salas de TV y espacios de descanso.",
    material: "Tejido Blackout opaco; variedad de colores y acabados.",
    control: "Cadena o motor; control remoto y automatización.",
    system: "Compatible con cabezales y perfiles que mejoran el cierre visual.",
    facts: ["Alto control de luz con tejido opaco", "Acabado minimalista", "Compatible con automatización"],
  },
  {
    id: "onda-serena", name: "Onda Serena", tag: "Caída textil",
    short: "La suavidad de una cortina tradicional con ondas uniformes, ligeras y contemporáneas.",
    media: [
      photo("/assets/pentagrama/onda-serena-1-p15.jpg", "Ambiente", "Onda Serena con velo y tejido decorativo en una sala"),
      photo("/assets/pentagrama/onda-serena-2-p16.jpg", "Velo", "Onda Serena en velo blanco instalada en un comedor"),
      photo("/assets/pentagrama/onda-serena-3-p15.jpg", "Detalle de onda", "Detalle del riel y la caída uniforme Onda Serena"),
      officialVideo("_UUP5FuwZoI", "Spot Cortina Onda Serena", "1:05"),
    ],
    filters: ["luz", "grandes", "decorar"],
    ideal: "Salas, alcobas, esquinas y ventanas curvas que buscan calidez.",
    material: "Velos, traslúcidos, decorativos y opciones Blackout.",
    control: "Manual o motorizada con control remoto o app.",
    system: "Una reata técnica mantiene ondas tipo ola sobre un riel moderno.",
    facts: ["Caída continua con ondas tipo ola", "Se adapta a curvas y esquinas", "Amplia colección de telas"],
  },
  {
    id: "panel-japones", name: "Panel Japonés", tag: "Grandes vanos",
    short: "Paneles anchos y superpuestos que se desplazan con suavidad para cubrir grandes vanos.",
    media: [
      photo("/assets/pentagrama/panel-japones-room-official.jpg", "Grandes vanos", "Panel Japonés cubriendo un ventanal amplio"),
      photo("/assets/pentagrama/panel-japones-1-p25.jpg", "Ambiente", "Panel Japonés instalado en una habitación"),
      officialVideo("yDJPIBatdJM", "Nuestros Paneles Japoneses son únicos", "1:48"),
    ],
    filters: ["grandes", "oscuridad", "decorar"],
    ideal: "Puertaventanas, divisiones y ventanales amplios.",
    material: "Telas decorativas, traslúcidas, opacas, Screen o Blackout.",
    control: "Bastón, cordel o motor.",
    system: "Riel multivía; recoge a derecha, izquierda, centro o extremos.",
    facts: ["Concepto modular y minimalista", "Muy poco espacio de instalación", "Paneles desmontables con velcro o platina"],
  },
  {
    id: "honeycell", name: "Honeycell", tag: "Aislamiento",
    short: "Celdas de tejido atrapan aire para mejorar el confort térmico y acústico ocupando muy poco espacio.",
    media: [
      photo("/assets/pentagrama/honeycell-tdbu-official.jpg", "Top Down Bottom Up", "Honeycell Top Down Bottom Up en un espacio luminoso"),
      photo("/assets/pentagrama/honeycell-bedroom-official.jpg", "Habitación", "Honeycell oscura instalada en una habitación"),
      photo("/assets/pentagrama/honeycell-cell-detail-official.png", "Estructura celular", "Detalle de las celdas de tejido Honeycell"),
      officialVideo("RbgMu0OwitI", "Instalación y presentaciones Honeycell", "3:56"),
    ],
    filters: ["termico", "oscuridad", "luz"],
    ideal: "Alcobas y espacios donde importan la temperatura, el silencio y un cierre compacto.",
    material: "Tejidos celulares en velo, traslúcido y Blackout.",
    control: "Omnirise, TwinPull ChildSafety, PULL o motor.",
    system: "Estándar, Día y Noche o Top Down Bottom Up.",
    facts: ["Celdas que aíslan temperatura y ruido", "Casi no deja luces laterales", "Combina dos tejidos en un cabezal"],
  },
  {
    id: "romana", name: "Romana", tag: "Pliegues suaves",
    short: "Pliegues horizontales definidos aportan calidez y una presencia textil más arquitectónica.",
    media: [
      photo("/assets/pentagrama/romana-room-official.jpg", "Ambiente", "Cortinas Romanas instaladas en una habitación"),
      photo("/assets/pentagrama/romana-4-p38.jpg", "Accionamiento manual", "Cortina Romana accionada manualmente"),
      officialVideo("xZTr52m6o44", "Instalación Romana Omnirise", "2:16"),
    ],
    filters: ["decorar", "luz", "oscuridad"],
    ideal: "Salas y habitaciones clásicas, cálidas o contemporáneas.",
    material: "Telas traslúcidas, Screen o Blackout con perfiles posteriores de aluminio.",
    control: "Cordel, cadena continua o motor.",
    system: "Standard, Omnirise, Dos en Uno o Top Down Bottom Up.",
    facts: ["Pliegues definidos y uniformes", "Perfiles coordinados con la tela", "Cuatro configuraciones disponibles"],
  },
  {
    id: "vertical", name: "Vertical", tag: "Giro preciso",
    short: "Lamas verticales giratorias para controlar con precisión el paso de luz y la privacidad.",
    media: [
      photo("/assets/pentagrama/vertical-1-p27.jpg", "Ambiente", "Persianas Verticales en grandes ventanales"),
      photo("/assets/pentagrama/vertical-detail-official.jpg", "Detalle de lamas", "Detalle del giro y la cadena inferior de una persiana Vertical"),
      photo("/assets/pentagrama/vertical-4-p28.jpg", "Riel", "Detalle del riel y las lamas verticales"),
      officialVideo("tG0lk1_A7lA", "Motor para Verticales y Sheer Vertesse", "1:09"),
    ],
    filters: ["grandes", "luz", "oscuridad"],
    ideal: "Salas, comedores, oficinas e incluso ventanas inclinadas.",
    material: "Lamas de 9 o 13 cm en traslúcido, Screen o Blackout.",
    control: "Cordel y bastón o motorización.",
    system: "Riel de bajo perfil con lengüetas equidistantes.",
    facts: ["Gradúa la luz con el giro de las lamas", "Útil en ventanas inclinadas", "Colección especial Maxi13"],
  },
  {
    id: "viewtex", name: "Viewtex", tag: "Fácil cuidado",
    short: "Láminas livianas de poliéster que suben, bajan y giran para controlar vista y privacidad.",
    media: [
      photo("/assets/pentagrama/viewtex-room-official.jpg", "Ambiente", "Viewtex blanca instalada sobre una sala"),
      photo("/assets/pentagrama/viewtex-1-p43.jpg", "Vista y privacidad", "Viewtex graduando la vista desde una sala"),
      officialVideo("SSFxz77zcpo", "Spot Viewtex", "1:00"),
    ],
    filters: ["luz", "termico"],
    ideal: "Cocinas, baños y áreas amplias donde importa una limpieza sencilla.",
    material: "Láminas de poliéster de 5 cm con recubrimiento nanocerámico antiestático.",
    control: "Cordeles, unimando o motor.",
    system: "Cinta decorativa de algodón o escalerilla de cordón.",
    facts: ["Resiste agua, polvo y rayones", "Apta para ambientes húmedos", "Material liviano y flexible"],
  },
  {
    id: "classic-50", name: "Classic 50", tag: "Aluminio",
    short: "Láminas anchas de aluminio crean una estética industrial y un control directo del resplandor.",
    media: [
      photo("/assets/pentagrama/classic-50-room-official.jpg", "Ambiente", "Classic 50 en aluminio instalada en sala y comedor"),
      photo("/assets/pentagrama/classic-50-1-p45.jpg", "Acabado", "Classic 50 en acabado cálido instalada en una sala"),
      photo("/assets/pentagrama/classic-50-4-p47.jpg", "Cocina", "Classic 50 de aluminio instalada en una cocina"),
      officialVideo("imkOZLIlUo4", "Motor para Classic 50, Viewtex y Macromadera", "2:19"),
    ],
    filters: ["luz", "decorar"],
    ideal: "Cocinas, baños, estudios y ambientes modernos.",
    material: "Láminas templadas de aluminio de 5 cm, planas o perforadas.",
    control: "Manual, PULL o motorizada.",
    system: "Presentación con escalerilla o cinta decorativa de algodón.",
    facts: ["Aluminio flexible y resistente", "Láminas planas o perforadas", "Limpieza y mantenimiento sencillos"],
  },
  {
    id: "mini-micro", name: "Mini y Micropersiana", tag: "Versátil",
    short: "Una solución compacta de aluminio, durable y precisa para ventanas pequeñas o de uso intenso.",
    media: [
      photo("/assets/pentagrama/mini-micro-room-official.jpg", "Ambiente", "Minipersiana de aluminio instalada en una sala"),
      photo("/assets/pentagrama/minipersiana-1-p50.jpg", "Control de luz", "Mini y Micropersianas controlando la luz en una cocina"),
      photo("/assets/pentagrama/mini-micro-system-official.jpg", "Cómo funciona", "Esquema oficial de accionamiento y niveles de privacidad"),
    ],
    filters: ["luz", "termico"],
    ideal: "Baños, cocinas, oficinas y habitaciones infantiles.",
    material: "Aluminio resistente a humedad, desgaste y cambios de temperatura.",
    control: "Cordeles tradicionales o sistema Unimando.",
    system: "Presentaciones con distinta cantidad de laminillas según el nivel de privacidad.",
    facts: ["No se oxida ni se deforma", "Gran abanico de colores", "Control preciso del ingreso de luz"],
  },
];

const recommenderQuestions = {
  space: {
    key: "space", eyebrow: "EMPECEMOS POR TU CASA", title: "Cuéntame, ¿dónde está esa ventana?",
    choices: [
      { value: "living", label: "Sala o comedor", detail: "Un espacio que usas y compartes todos los días" },
      { value: "bedroom", label: "Habitación", detail: "Donde descansar y sentir privacidad importa más" },
      { value: "work", label: "Oficina o estudio", detail: "Para trabajar sin reflejos ni exceso de sol" },
      { value: "wet", label: "Cocina o baño", detail: "Hay humedad o necesitas limpiar con frecuencia" },
      { value: "door", label: "Salida al balcón o terraza", detail: "La ventana también puede ser una puerta" },
    ],
  },
  opening: {
    key: "opening", eyebrow: "AHORA MIREMOS LA VENTANA", title: "Cuando la abres, ¿qué hace la hoja?",
    choices: [
      { value: "fixed", label: "No se abre", detail: "Es un vidrio fijo" },
      { value: "sliding", label: "Se desliza hacia un lado", detail: "Una hoja pasa por delante de la otra" },
      { value: "hinged", label: "Gira como una puerta", detail: "Abre hacia dentro o hacia fuera" },
      { value: "curve", label: "Va en curva o hace esquina", detail: "El recorrido no es completamente recto" },
      { value: "inclined", label: "Está inclinada", detail: "La parte superior o inferior va en diagonal" },
      { value: "unknown", label: "No sabría decirte", detail: "No pasa nada; dejamos varias opciones abiertas" },
    ],
  },
  passage: {
    key: "passage", eyebrow: "UNA PREGUNTA IMPORTANTE", title: "¿También pasan personas por ahí?",
    choices: [
      { value: "yes", label: "Sí, es una salida", detail: "La usamos para ir al balcón, terraza o patio" },
      { value: "no", label: "No, solo es una ventana", detail: "La corremos para abrirla o ventilar" },
    ],
  },
  size: {
    key: "size", eyebrow: "SIN NECESITAR UNA CINTA MÉTRICA", title: "¿Cómo describirías su tamaño?",
    choices: [
      { value: "compact", label: "Más bien pequeña", detail: "Una ventana de una sola hoja o hasta 1,50 m aprox." },
      { value: "medium", label: "De tamaño normal", detail: "Entre 1,50 y 3 m aprox." },
      { value: "large", label: "Ocupa gran parte de la pared", detail: "Más de 3 m de ancho" },
      { value: "floor", label: "Va de piso a techo", detail: "Es un ventanal alto o una salida" },
      { value: "unknown", label: "No tengo idea", detail: "La medida exacta se confirma en la visita" },
    ],
  },
  need: {
    key: "need", eyebrow: "LO QUE QUIERES CAMBIAR", title: "¿Qué te incomoda más hoy?",
    choices: [
      { value: "soft-light", label: "Entra demasiada luz", detail: "Quiero poder graduarla sin dejar el espacio oscuro" },
      { value: "darkness", label: "No logro oscurecer", detail: "Necesito descansar, ver TV o dormir mejor" },
      { value: "privacy", label: "Me pueden ver desde afuera", detail: "Quiero sentirme tranquilo dentro de casa" },
      { value: "heat", label: "Entra mucho calor o reflejo", detail: "El sol calienta o molesta en las pantallas" },
      { value: "view", label: "No quiero perder la vista", detail: "Quiero filtrar el sol y seguir viendo hacia afuera" },
      { value: "easy-clean", label: "Se ensucia o moja con facilidad", detail: "Prefiero algo resistente y sencillo de cuidar" },
    ],
  },
  privacyMode: {
    key: "privacyMode", eyebrow: "PRIVACIDAD NO SIEMPRE ES OSCURIDAD", title: "Cuando la cierres, ¿quieres que siga entrando claridad?",
    choices: [
      { value: "light", label: "Sí, quiero luz suave", detail: "Que no se vea hacia adentro, pero que el lugar siga claro" },
      { value: "flexible", label: "Quiero poder elegir", detail: "A veces vista, a veces privacidad" },
      { value: "opaque", label: "Prefiero que cierre la vista", detail: "La prioridad es sentir el espacio más reservado" },
    ],
  },
  style: {
    key: "style", eyebrow: "PENSEMOS EN CÓMO SE VERÁ", title: "¿Qué tipo de acabado te gusta más?",
    choices: [
      { value: "minimal", label: "Limpio y discreto", detail: "Líneas simples y poco volumen" },
      { value: "textile", label: "Suave, como una cortina", detail: "Tela, caída y una sensación más cálida" },
      { value: "decorative", label: "Con más presencia", detail: "Quiero que también vista el espacio" },
      { value: "technical", label: "Lo más práctico", detail: "Me importa más que funcione y sea fácil de cuidar" },
    ],
  },
  budget: {
    key: "budget", eyebrow: "PARA RECOMENDARTE CON LOS PIES EN LA TIERRA", title: "¿Cómo quieres manejar el presupuesto?",
    choices: [
      { value: "practical", label: "Quiero cuidar el presupuesto", detail: "Resolver bien lo esencial" },
      { value: "balanced", label: "Busco un buen punto medio", detail: "Equilibrar diseño, uso y durabilidad" },
      { value: "premium", label: "Puedo invertir más por el acabado", detail: "Quiero más opciones y una presencia especial" },
      { value: "unknown", label: "Prefiero comparar primero", detail: "Muéstrame opciones antes de decidir" },
    ],
  },
  control: {
    key: "control", eyebrow: "EL USO DE TODOS LOS DÍAS", title: "¿Cómo te gustaría manejarla?",
    choices: [
      { value: "manual", label: "Con la mano, sin complicarme", detail: "Una opción sencilla y directa" },
      { value: "motorized", label: "Con control o desde el celular", detail: "Quiero comodidad y automatización" },
      { value: "compare", label: "Quiero ver las dos opciones", detail: "Comparar manual y motorizada" },
      { value: "unknown", label: "No lo he pensado", detail: "Hommy priorizará el sistema adecuado" },
    ],
  },
};

function getRecommenderFlow(answers) {
  const keys = ["space", "opening"];
  if (answers.opening === "sliding") keys.push("passage");
  keys.push("size", "need");
  if (answers.need === "privacy") keys.push("privacyMode");
  keys.push("style", "budget", "control");
  return keys.map((key) => recommenderQuestions[key]);
}

const emptyRecommenderAnswers = () => Object.fromEntries(Object.keys(recommenderQuestions).map((key) => [key, ""]));

const productProfiles = {
  "sheer-elegance": { motion: "vertical", special: [], space: ["living", "bedroom", "work"], size: ["compact", "medium"], need: ["soft-light", "privacy", "view", "darkness"], privacyMode: ["light", "flexible", "opaque"], style: ["minimal", "decorative"], budget: ["balanced", "premium"], control: ["manual", "motorized"] },
  vertesse: { motion: "lateral", special: [], space: ["living", "bedroom", "door"], size: ["medium", "large", "floor"], need: ["soft-light", "privacy", "view"], privacyMode: ["light", "flexible"], style: ["textile", "decorative"], budget: ["balanced", "premium"], control: ["manual", "motorized"] },
  "enrollable-screen": { motion: "vertical", special: [], space: ["living", "work"], size: ["compact", "medium", "large", "floor"], need: ["heat", "view", "soft-light"], privacyMode: ["light"], style: ["minimal", "technical"], budget: ["practical", "balanced", "premium"], control: ["manual", "motorized"] },
  "enrollable-blackout": { motion: "vertical", special: [], space: ["bedroom", "living", "work"], size: ["compact", "medium", "large"], need: ["darkness", "privacy", "heat"], privacyMode: ["opaque"], style: ["minimal", "technical"], budget: ["practical", "balanced", "premium"], control: ["manual", "motorized"] },
  "onda-serena": { motion: "lateral", special: ["curve"], space: ["living", "bedroom", "door"], size: ["medium", "large", "floor"], need: ["soft-light", "privacy", "darkness"], privacyMode: ["light", "flexible", "opaque"], style: ["textile", "decorative"], budget: ["balanced", "premium"], control: ["manual", "motorized"] },
  "panel-japones": { motion: "lateral", special: [], space: ["living", "bedroom", "door"], size: ["medium", "large", "floor"], need: ["privacy", "darkness", "soft-light", "heat"], privacyMode: ["light", "flexible", "opaque"], style: ["minimal", "decorative"], budget: ["balanced", "premium"], control: ["manual", "motorized"] },
  honeycell: { motion: "vertical", special: [], space: ["bedroom", "work", "living"], size: ["compact", "medium"], need: ["heat", "darkness", "privacy", "soft-light"], privacyMode: ["light", "flexible", "opaque"], style: ["minimal", "technical"], budget: ["balanced", "premium"], control: ["manual", "motorized"] },
  romana: { motion: "vertical", special: [], space: ["living", "bedroom"], size: ["compact", "medium"], need: ["soft-light", "darkness", "privacy"], privacyMode: ["light", "opaque"], style: ["textile", "decorative"], budget: ["balanced", "premium"], control: ["manual", "motorized"] },
  vertical: { motion: "lateral", special: ["inclined"], space: ["living", "work", "door"], size: ["medium", "large", "floor"], need: ["soft-light", "privacy", "darkness", "view", "heat"], privacyMode: ["light", "flexible", "opaque"], style: ["technical", "minimal"], budget: ["practical", "balanced"], control: ["manual", "motorized"] },
  viewtex: { motion: "vertical", special: [], space: ["wet", "work", "living"], size: ["compact", "medium", "large"], need: ["easy-clean", "soft-light", "privacy", "heat"], privacyMode: ["light", "flexible"], style: ["technical", "minimal"], budget: ["balanced", "premium"], control: ["manual", "motorized"] },
  "classic-50": { motion: "vertical", special: [], space: ["wet", "work", "living"], size: ["compact", "medium"], need: ["easy-clean", "soft-light", "privacy"], privacyMode: ["light", "flexible"], style: ["technical", "minimal"], budget: ["practical", "balanced"], control: ["manual", "motorized"] },
  "mini-micro": { motion: "vertical", special: [], space: ["wet", "work", "bedroom"], size: ["compact", "medium"], need: ["easy-clean", "privacy", "soft-light"], privacyMode: ["light", "flexible"], style: ["technical", "minimal"], budget: ["practical", "balanced"], control: ["manual"] },
};

const recommendationWeights = { space: 2, size: 3, need: 7, privacyMode: 4, style: 2, budget: 3, control: 2 };
const answerLabels = Object.fromEntries(Object.values(recommenderQuestions).flatMap((question) => question.choices.map((choice) => [`${question.key}:${choice.value}`, choice.label])));
const manualControls = {
  "sheer-elegance": "Cadena o sistema PULL", vertesse: "Bastón, cordel o cadena", "enrollable-screen": "Cadena",
  "enrollable-blackout": "Cadena", "onda-serena": "Accionamiento manual", "panel-japones": "Bastón o cordel",
  honeycell: "PULL, Omnirise o TwinPull", romana: "Omnirise, cadena o cordel", vertical: "Bastón o cordel",
  viewtex: "Unimando o cordeles", "classic-50": "Manual o sistema PULL", "mini-micro": "Unimando o cordeles",
};

function isMechanicalCompatible(profile, answers) {
  if (answers.opening === "sliding" && answers.passage === "yes" && profile.motion !== "lateral") return false;
  if (answers.opening === "curve" && !profile.special.includes("curve")) return false;
  if (answers.opening === "inclined" && !profile.special.includes("inclined")) return false;
  return true;
}

function meetsMainPreference(profile, answers) {
  if (["darkness", "view", "easy-clean"].includes(answers.need) && !profile.need.includes(answers.need)) return false;
  if (answers.need === "privacy" && answers.privacyMode && !profile.privacyMode.includes(answers.privacyMode)) return false;
  if (answers.control === "motorized" && !profile.control.includes("motorized")) return false;
  return true;
}

function scoreRecommendations(answers) {
  const mechanicallyCompatible = products.filter((product) => isMechanicalCompatible(productProfiles[product.id], answers));
  const preferred = mechanicallyCompatible.filter((product) => meetsMainPreference(productProfiles[product.id], answers));
  const pool = preferred.length ? preferred : mechanicallyCompatible;
  return pool.map((product) => {
    const profile = productProfiles[product.id];
    const score = Object.entries(recommendationWeights).reduce((total, [key, weight]) => {
      const value = answers[key];
      if (!value || value === "unknown") return total;
      return total + (profile[key]?.includes(value) ? weight : -(weight * 0.65));
    }, 0);
    return { product, profile, score, preferenceFit: preferred.length > 0 };
  }).sort((a, b) => b.score - a.score);
}

function suggestedControl(product, answers) {
  const supported = productProfiles[product.id].control;
  if (answers.control === "motorized" && supported.includes("motorized")) return "Motorizada, según medidas y configuración";
  if (answers.control === "compare" && supported.includes("motorized")) return `${manualControls[product.id]} o motorizada`;
  return manualControls[product.id];
}

function movementSummary(match, answers) {
  if (match.profile.motion === "lateral" && answers.passage === "yes") return "Se recoge hacia un lado para dejar libre el paso";
  if (match.profile.motion === "lateral") return "Se abre y se recoge hacia los lados";
  if (answers.opening === "sliding") return "Sube por delante del marco; la hoja puede correr detrás";
  return "Sube para despejar la ventana";
}

function recommendationReasons(match, answers) {
  const reasons = [];
  if (answers.opening === "sliding" && answers.passage === "yes") reasons.push("Su recogida lateral acompaña la apertura y evita levantar toda la cortina para pasar.");
  else if (answers.opening === "sliding") reasons.push("Como no es una puerta de paso, puede instalarse por delante y dejar que las hojas corran detrás.");
  if (answers.need === "privacy" && answers.privacyMode === "light") reasons.push("Da privacidad sin convertir el espacio en un cuarto oscuro.");
  else if (answers.need === "privacy" && answers.privacyMode === "flexible") reasons.push("Permite alternar entre vista, luz y privacidad.");
  else if (answers.need === "privacy" && answers.privacyMode === "opaque") reasons.push("Admite una configuración que cierra mejor la vista hacia el interior.");
  else if (answers.need === "darkness") reasons.push("Admite tejido Blackout; la oscuridad final también depende del tejido y de cómo se instale.");
  else if (answers.need && match.profile.need.includes(answers.need)) reasons.push(`Responde a lo que más te incomoda: ${answerLabels[`need:${answers.need}`].toLowerCase()}.`);
  else if (answers.need) reasons.push("No existe una opción que cumpla todo a la vez; Hommy priorizó que la cortina no estorbe el uso de la ventana.");
  if (answers.size && answers.size !== "unknown" && match.profile.size.includes(answers.size)) reasons.push(`El tamaño que elegiste —${answerLabels[`size:${answers.size}`].toLowerCase()}— está dentro de su uso recomendado.`);
  if (answers.budget && answers.budget !== "unknown" && match.profile.budget.includes(answers.budget)) reasons.push(`Encaja con tu forma de manejar el presupuesto: ${answerLabels[`budget:${answers.budget}`].toLowerCase()}.`);
  return reasons.slice(0, 3);
}

function Brand() {
  return (
    <a className="brand" href="#inicio" aria-label="HomeEasy, inicio">
      <img src="/assets/brand/triangulogold.png" alt="" aria-hidden="true" />
      <span><strong>HomeEasy</strong><small>PERSIANAS & PAPEL TAPIZ</small></span>
    </a>
  );
}

function Header({ openAdvisor }) {
  const [open, setOpen] = useState(false);
  const links = [
    ["Sistemas", "#productos"],
    ["Papel tapiz", "#papel-tapiz"],
    ["Cómo trabajamos", "#proceso"],
  ];
  return (
    <header className="site-header">
      <Brand />
      <nav className={open ? "nav-open" : ""} aria-label="Navegación principal">
        {links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
        <button className="button small" onClick={() => { setOpen(false); openAdvisor(); }}>Enviar una foto</button>
      </nav>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open}>
        {open ? <X size={24} /> : <List size={24} />}
      </button>
    </header>
  );
}

const HOMMY_INITIAL_MESSAGE = "Hola, soy Hommy. Vamos a encontrar algo que de verdad encaje contigo.";
const HOMMY_THINKING_MESSAGE = "Dame un segundo… estoy cruzando todo lo que me contaste.";
const HOMMY_COMPLETE_MESSAGE = "¡Ya lo tengo! Encontré una opción que encaja contigo.";

const hommyReplies = {
  space: {
    living: "Mmm, una sala o comedor. Aquí la luz y la comodidad van de la mano.",
    bedroom: "Perfecto, una habitación. Vamos a cuidar mucho el descanso y la privacidad.",
    work: "Bien, una oficina o estudio. Tendré muy en cuenta el reflejo y la luz de trabajo.",
    wet: "Entiendo, cocina o baño. Entonces la humedad y la limpieza importan bastante.",
    door: "Ah, es una salida al balcón o terraza. Necesitamos algo cómodo para pasar.",
  },
  opening: {
    fixed: "Perfecto, el vidrio no se abre. Eso nos da bastante libertad para elegir.",
    sliding: "Bien, se desliza hacia un lado. Voy a cuidar que la solución no estorbe su recorrido.",
    hinged: "Entiendo, gira como una puerta. Tendremos que dejar libre su apertura.",
    curve: "Interesante, tiene curva o esquina. Buscaré un sistema que acompañe esa forma.",
    inclined: "Ya veo, está inclinada. Necesitamos una solución que trabaje bien con ese ángulo.",
    unknown: "No pasa nada. Mantendré abiertas las opciones hasta poder verla.",
  },
  passage: {
    yes: "Perfecto, también es una salida. Priorizaré algo que deje el paso libre.",
    no: "Entendido, solo la corres para abrir o ventilar. Tenemos más alternativas.",
  },
  size: {
    compact: "Perfecto, es más bien pequeña. Podemos resolverla sin cargar visualmente el espacio.",
    medium: "Bien, es de tamaño normal. Hay varias soluciones que pueden funcionarte.",
    large: "Mmm, ocupa gran parte de la pared. Necesitamos estabilidad y una presencia bien cuidada.",
    floor: "Ah, va de piso a techo. Buscaré algo elegante y fácil de manejar.",
    unknown: "Tranquilo, la medida exacta la confirmamos durante la visita.",
  },
  need: {
    "soft-light": "Entiendo, quieres bajar la intensidad sin apagar el espacio.",
    darkness: "Perfecto, necesitas oscuridad de verdad. Voy a priorizar un mejor cierre de luz.",
    privacy: "Claro, quieres sentir privacidad sin pensar en quién mira desde afuera.",
    heat: "Ya veo, el sol está calentando o reflejando demasiado. Buscaré mejor control solar.",
    view: "Perfecto, quieres protegerte del sol sin renunciar a la vista.",
    "easy-clean": "Entiendo, necesitas algo resistente y fácil de mantener.",
  },
  privacyMode: {
    light: "Perfecto, privacidad con luz suave. No hace falta oscurecer para sentirte tranquilo.",
    flexible: "Me gusta esa idea: poder elegir entre vista y privacidad según el momento.",
    opaque: "Entendido, prefieres cerrar la vista por completo y sentir más reserva.",
  },
  style: {
    minimal: "Perfecto, algo limpio y discreto que se integre sin llamar demasiado la atención.",
    textile: "Bien, buscas una sensación más suave y cálida, como una cortina.",
    decorative: "Ah, quieres que también vista el espacio. Tendré en cuenta textura y presencia.",
    technical: "Entendido, primero la función: práctica, resistente y sencilla de cuidar.",
  },
  budget: {
    practical: "Claro, cuidemos el presupuesto y resolvamos bien lo esencial.",
    balanced: "Perfecto, busquemos equilibrio entre diseño, uso y durabilidad.",
    premium: "Bien, podemos explorar mejores acabados y más posibilidades.",
    unknown: "Sin problema. Primero te mostraré opciones claras para que compares.",
  },
  control: {
    manual: "Perfecto, prefieres algo sencillo y directo, sin complicaciones.",
    motorized: "Entendido, quieres comodidad con control o desde el celular.",
    compare: "Muy bien, compararemos manual y motorizada para que decidas con calma.",
    unknown: "No pasa nada. Te recomendaré el manejo que tenga más sentido para tu espacio.",
  },
};

function HommyTestGuide({ state, message, reaction }) {
  return (
    <div className={`hommy-test-guide is-${state}`} role="img" aria-label={`Hommy dice: ${message}`}>
      <div className="hommy-motion-stage" aria-hidden="true">
        <div className="hommy-character">
          <HommyLayered reaction={reaction} />
        </div>
      </div>
      <div className="hommy-motion-status" aria-hidden="true">
        <span aria-hidden="true" />
        <div><small>Hommy</small><strong key={message}>{message}</strong></div>
      </div>
    </div>
  );
}

function Recommender() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(emptyRecommenderAnswers);
  const [done, setDone] = useState(false);
  const [hommyState, setHommyState] = useState("listening");
  const [hommyMessage, setHommyMessage] = useState(HOMMY_INITIAL_MESSAGE);
  const [hommyReaction, setHommyReaction] = useState({ sequence: 0, type: "write", progress: 0 });
  const resultRef = useRef(null);
  const hommyMotionTimers = useRef([]);
  const interactionLocked = useRef(false);
  const reactionSequence = useRef(0);
  const reactionBusyUntil = useRef(0);
  const pendingReaction = useRef(null);
  const pendingReactionTimer = useRef(null);
  const questionFlow = useMemo(() => getRecommenderFlow(answers), [answers]);
  const safeStep = Math.min(step, questionFlow.length - 1);
  const current = questionFlow[safeStep];
  const recommendations = useMemo(() => scoreRecommendations(answers), [answers]);
  const primary = recommendations[0];
  const alternatives = recommendations.slice(1, 3);
  const reasons = done ? recommendationReasons(primary, answers) : [];

  useEffect(() => {
    if (done) resultRef.current?.focus();
  }, [done]);

  useEffect(() => {
    if (step !== safeStep) setStep(safeStep);
  }, [safeStep, step]);

  useEffect(() => () => {
    hommyMotionTimers.current.forEach(clearTimeout);
    if (pendingReactionTimer.current) clearTimeout(pendingReactionTimer.current);
  }, []);

  const clearHommyMotion = () => {
    hommyMotionTimers.current.forEach(clearTimeout);
    hommyMotionTimers.current = [];
  };

  const cancelPendingReaction = () => {
    if (pendingReactionTimer.current) clearTimeout(pendingReactionTimer.current);
    pendingReactionTimer.current = null;
    pendingReaction.current = null;
    reactionBusyUntil.current = 0;
  };

  const requestHommyReaction = (type, progressValue) => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reducedMotion ? 240 : 1100;
    const emit = (reaction) => {
      reactionSequence.current += 1;
      setHommyReaction({ ...reaction, sequence: reactionSequence.current });
    };
    const now = window.performance.now();

    if (now >= reactionBusyUntil.current) {
      emit({ type, progress: progressValue });
      reactionBusyUntil.current = now + duration;
      return;
    }

    pendingReaction.current = { type, progress: progressValue, duration };
    if (pendingReactionTimer.current) clearTimeout(pendingReactionTimer.current);
    pendingReactionTimer.current = setTimeout(() => {
      const reaction = pendingReaction.current;
      pendingReaction.current = null;
      pendingReactionTimer.current = null;
      if (!reaction) return;
      emit(reaction);
      reactionBusyUntil.current = window.performance.now() + reaction.duration;
    }, Math.max(0, reactionBusyUntil.current - now));
  };

  const acknowledgeAnswer = (isFinalAnswer, reply) => {
    clearHommyMotion();
    setHommyState("noting");
    setHommyMessage(reply);
    if (isFinalAnswer) {
      hommyMotionTimers.current.push(setTimeout(() => {
        setHommyState("thinking");
        setHommyMessage(HOMMY_THINKING_MESSAGE);
        setDone(true);
        interactionLocked.current = false;
      }, 480));
      hommyMotionTimers.current.push(setTimeout(() => {
        setHommyState("complete");
        setHommyMessage(HOMMY_COMPLETE_MESSAGE);
      }, 1100));
    } else {
      hommyMotionTimers.current.push(setTimeout(() => {
        setHommyState("listening");
        setStep((currentStep) => currentStep + 1);
        interactionLocked.current = false;
      }, 480));
    }
  };

  const choose = (value) => {
    if (interactionLocked.current) return;
    interactionLocked.current = true;
    const next = { ...answers, [current.key]: value };
    if (current.key === "opening" && value !== "sliding") next.passage = "";
    if (current.key === "need" && value !== "privacy") next.privacyMode = "";
    setAnswers(next);
    const nextFlow = getRecommenderFlow(next);
    const isFinalAnswer = safeStep === nextFlow.length - 1;
    const reply = hommyReplies[current.key]?.[value] ?? "Perfecto, lo tendré en cuenta.";
    requestHommyReaction(isFinalAnswer ? "success" : "write", Math.min(1, (safeStep + 1) / nextFlow.length));
    acknowledgeAnswer(isFinalAnswer, reply);
  };
  const goBack = () => {
    clearHommyMotion();
    cancelPendingReaction();
    interactionLocked.current = false;
    setHommyState("listening");
    setHommyMessage("Claro, revisemos la respuesta anterior.");
    if (done) setDone(false);
    else setStep((currentStep) => Math.max(0, currentStep - 1));
  };
  const reset = () => {
    clearHommyMotion();
    cancelPendingReaction();
    interactionLocked.current = false;
    setStep(0);
    setAnswers(emptyRecommenderAnswers());
    setDone(false);
    setHommyState("listening");
    setHommyMessage(HOMMY_INITIAL_MESSAGE);
    setHommyReaction({ sequence: 0, type: "write", progress: 0 });
  };
  const openProduct = (productId) => {
    window.dispatchEvent(new CustomEvent("homeeasy:select-product", { detail: productId }));
    document.querySelector("#productos")?.scrollIntoView({ behavior: "smooth" });
  };
  const progress = done ? 100 : ((step + 1) / questionFlow.length) * 100;

  return (
    <section className="recommender section-shell" id="recomendador">
      <div className="editorial-heading recommender-heading">
        <span className="section-label">Recomendador de producto</span>
        <h2>Hommy no empieza por una persiana. Empieza por cómo funciona tu ventana.</h2>
        <p>Responde cómo abre, qué tamaño tiene y qué quieres resolver. El recomendador cruza eso con la mecánica y los tejidos de cada sistema.</p>
      </div>
      <div className="recommender-card">
        <HommyTestGuide state={hommyState} message={hommyMessage} reaction={hommyReaction} />
        <div className="question-panel">
          <div className="quiz-progress" aria-hidden="true"><span style={{ "--progress": progress / 100 }} /></div>
          {!done ? <div className="question-step" key={current.key}>
            <div className="question-top"><span>{current.eyebrow}</span><small>{step + 1} de {questionFlow.length}</small></div>
            <h3>{current.title}</h3>
            <div className="choice-grid">
              {current.choices.map((choice) => (
                <button key={choice.value} onClick={() => choose(choice.value)} className={answers[current.key] === choice.value ? "selected" : ""}>
                  <span><strong>{choice.label}</strong><small>{choice.detail}</small></span><CaretRight size={18} />
                </button>
              ))}
            </div>
            <div className="question-nav">
              {step > 0 && <button type="button" className="text-button" onClick={goBack}><ArrowLeft size={15} /> Anterior</button>}
              <span>Menos de 2 minutos</span>
            </div>
          </div> : <div className="recommendation-result" ref={resultRef} tabIndex="-1" aria-live="polite">
            <div className="result-heading"><CheckCircle size={35} weight="fill" /><div><p className="eyebrow rose">{primary.preferenceFit ? "MEJOR COINCIDENCIA" : "OPCIÓN MÁS COMPATIBLE"}</p><h3>{primary.product.name}</h3></div></div>
            <p className="result-lede">{primary.product.short}</p>
            <div className="recommendation-facts">
              <div><small>Cómo deja libre la ventana</small><strong>{movementSummary(primary, answers)}</strong></div>
              <div><small>Cómo manejarla</small><strong>{suggestedControl(primary.product, answers)}</strong></div>
            </div>
            <ul className="fit-reasons">{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
            <div className="result-alternatives">
              <span>Otras opciones compatibles con tu ventana</span>
              <div>{alternatives.map(({ product }) => <button key={product.id} onClick={() => openProduct(product.id)}>{product.name}<CaretRight size={15} /></button>)}</div>
            </div>
            <p className="recommendation-note">Hommy separa el sistema que se mueve del tejido que controla la luz. La medida, el lado de recogida y el nivel real de oscuridad se confirman durante la visita.</p>
            <div className="result-actions"><button className="button" onClick={() => openProduct(primary.product.id)}>Conocer {primary.product.name}</button><button className="text-button" onClick={reset}>Repetir el test</button></div>
          </div>}
        </div>
      </div>
    </section>
  );
}

function Products({ openAdvisorFor }) {
  const filters = [
    ["todos", "Todos"], ["luz", "Filtrar luz"], ["oscuridad", "Oscurecer"],
    ["grandes", "Grandes ventanales"], ["decorar", "Decorar"], ["termico", "Aislar calor"],
  ];
  const [filter, setFilter] = useState("todos");
  const [selectedId, setSelectedId] = useState(products[0].id);
  const [mediaIndex, setMediaIndex] = useState(0);
  useEffect(() => {
    const selectRecommendedProduct = (event) => {
      if (!products.some((product) => product.id === event.detail)) return;
      setFilter("todos");
      setSelectedId(event.detail);
      setMediaIndex(0);
    };
    window.addEventListener("homeeasy:select-product", selectRecommendedProduct);
    return () => window.removeEventListener("homeeasy:select-product", selectRecommendedProduct);
  }, []);
  const visibleProducts = filter === "todos" ? products : products.filter((product) => product.filters.includes(filter));
  const selected = products.find((product) => product.id === selectedId) || products[0];
  const chooseProduct = (id) => {
    setSelectedId(id);
    setMediaIndex(0);
  };
  const chooseFilter = (value) => {
    const nextProducts = value === "todos" ? products : products.filter((product) => product.filters.includes(value));
    setFilter(value);
    if (!nextProducts.some((product) => product.id === selectedId)) chooseProduct(nextProducts[0].id);
  };
  const changeMedia = (direction) => {
    setMediaIndex((current) => (current + direction + selected.media.length) % selected.media.length);
  };
  const activeMedia = selected.media[mediaIndex];
  const photoCount = selected.media.filter((item) => item.type === "image").length;
  const videoCount = selected.media.filter((item) => item.type === "video").length;

  return (
    <section className="products section-shell" id="productos">
      <div className="section-heading editorial-heading split-heading">
        <div><span className="section-label">12 sistemas · catálogo Pentagrama</span><h2>Primero decide qué quieres resolver. Después miramos el sistema.</h2></div>
        <p>Filtra por luz, oscuridad, tamaño o control solar. La ficha te muestra cómo se mueve, qué tejido usa y dónde funciona mejor.</p>
      </div>

      <div className="product-filters" role="group" aria-label="Filtrar productos por necesidad">
        {filters.map(([value, label]) => (
          <button key={value} className={filter === value ? "active" : ""} onClick={() => chooseFilter(value)}>{label}</button>
        ))}
      </div>

      <div className="catalog-layout">
        <aside className="catalog-list" aria-label="Familias de producto">
          <div className="catalog-count"><span>{String(visibleProducts.length).padStart(2, "0")}</span> soluciones para comparar</div>
          <div className="catalog-scroll">
            {visibleProducts.map((product) => (
              <button
                key={product.id}
                className={`catalog-product ${selected.id === product.id ? "selected" : ""}`}
                onClick={() => chooseProduct(product.id)}
                aria-pressed={selected.id === product.id}
              >
                <img src={product.media.find((item) => item.type === "image")?.src} alt="" loading="lazy" decoding="async" />
                <span><small>{product.tag}</small><strong>{product.name}</strong></span>
                <CaretRight size={17} />
              </button>
            ))}
          </div>
        </aside>

        <article className="product-explorer" aria-live="polite">
          <div className="product-gallery">
            <div className="product-media-frame">
              {activeMedia.type === "image" ? (
                <img src={activeMedia.src} alt={activeMedia.alt} loading="lazy" decoding="async" />
              ) : (
                <div className="video-slide">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${activeMedia.id}?rel=0`}
                    title={`${selected.name}: ${activeMedia.title}`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                  <p><span>Video oficial Pentagrama</span><strong>{activeMedia.title}</strong><small>{activeMedia.duration}</small></p>
                </div>
              )}
            </div>
            {selected.media.length > 1 && <div className="gallery-controls">
              <button onClick={() => changeMedia(-1)} aria-label="Contenido anterior"><ArrowLeft size={18} /></button>
              <span>{mediaIndex + 1} / {selected.media.length}</span>
              <button onClick={() => changeMedia(1)} aria-label="Contenido siguiente"><ArrowRight size={18} /></button>
            </div>}
            <div className="gallery-meta">
              <strong>{activeMedia.label}</strong>
              <span>{photoCount} {photoCount === 1 ? "foto" : "fotos"}{videoCount ? ` · ${videoCount} video oficial` : ""}</span>
            </div>
            <div className="media-thumbnails" aria-label={`Galería de ${selected.name}`}>
              {selected.media.map((item, index) => (
                <button
                  key={item.type === "image" ? item.src : item.id}
                  className={index === mediaIndex ? "active" : ""}
                  onClick={() => setMediaIndex(index)}
                  aria-label={item.type === "image" ? `Ver ${item.label}` : `Reproducir ${item.title}`}
                  aria-pressed={index === mediaIndex}
                >
                  {item.type === "image" ? <img src={item.src} alt="" loading="lazy" decoding="async" /> : <span className="video-thumb"><PlayCircle size={24} weight="fill" /><small>{item.duration}</small></span>}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="product-detail">
            <div className="product-detail-head">
              <p className="product-kind">{selected.tag}</p>
              <h3>{selected.name}</h3>
              <p>{selected.short}</p>
            </div>
            <div className="product-facts">
              {selected.facts.map((fact, index) => <div key={fact}><span>0{index + 1}</span><p>{fact}</p></div>)}
            </div>
            <dl className="product-specs">
              <div><dt>Ideal para</dt><dd>{selected.ideal}</dd></div>
              <div><dt>Materiales</dt><dd>{selected.material}</dd></div>
              <div><dt>Accionamiento</dt><dd>{selected.control}</dd></div>
              <div><dt>Cómo funciona</dt><dd>{selected.system}</dd></div>
            </dl>
            <div className="product-detail-actions">
              <button type="button" className="button" onClick={() => openAdvisorFor(`Cotización: ${selected.name}`)}>Cotizar {selected.name}</button>
              <a className="text-button" href="#recomendador">¿No sabes si es para ti? Pregúntale a Hommy <ArrowRight size={16} /></a>
            </div>
          </div>
        </article>
      </div>

      <p className="catalog-source">Información de sistemas y materiales basada en las fichas técnicas oficiales de Pentagrama. La medida final y compatibilidad se validan en visita técnica.</p>
    </section>
  );
}

function Wallpaper({ openAdvisorFor }) {
  const details = [
    { n: "01", title: "Escala", copy: "Un patrón que funciona en una muestra pequeña puede verse completamente distinto cuando ocupa un muro entero." },
    { n: "02", title: "Textura", copy: "Mate, lino, relieve o brillo cambian según la luz que recibe la pared durante el día." },
    { n: "03", title: "Entorno", copy: "Piso, muebles, iluminación y color existente pesan más que elegir el diseño aislado en un catálogo." },
  ];
  return (
    <section className="wallpaper section-shell" id="papel-tapiz">
      <div className="wallpaper-copy">
        <h2>El papel no se elige mirando una muestra de diez centímetros.</h2>
        <p>Lo decidimos dentro del ambiente, con la luz real y los materiales que ya están ahí. Así la pared se integra en vez de parecer añadida después.</p>
        <div className="wallpaper-details">
          {details.map((item) => (
            <article key={item.n}>
              <span>{item.n}</span>
              <div><strong>{item.title}</strong><p>{item.copy}</p></div>
            </article>
          ))}
        </div>
        <button type="button" className="text-button" onClick={() => openAdvisorFor("Papel tapiz")}>Ver opciones para mi pared <ArrowRight size={16} /></button>
      </div>
      <figure className="wallpaper-editorial">
        <img src="/assets/wallpaper-room.jpg" alt="Ambiente HomeEasy con papel tapiz instalado" loading="lazy" decoding="async" />
        <figcaption>
          <span>ESCALA REAL · LUZ REAL</span>
          <strong>El diseño se decide viendo el muro completo, no una muestra aislada.</strong>
        </figcaption>
      </figure>
    </section>
  );
}


function Process() {
  const steps = [
    { n: "01", title: "Vemos la ventana", copy: "Una foto nos permite revisar apertura, paso, orientación y qué está pasando hoy con la luz." },
    { n: "02", title: "Medimos en sitio", copy: "Confirmamos dimensiones y puntos de instalación antes de cerrar sistema, tejido y recogida." },
    { n: "03", title: "Definimos la solución", copy: "Elegimos mecanismo y acabado por uso real: privacidad, oscuridad, vista, calor o mantenimiento." },
    { n: "04", title: "Instalamos y probamos", copy: "Revisamos recorrido, accionamiento y terminación para que la ventana quede lista para usar." },
  ];
  return (
    <section className="process section-shell" id="proceso">
      <div className="process-heading editorial-heading split-heading">
        <div><h2>No cotizamos una persiana antes de entender cómo abre la ventana.</h2></div>
        <p>La foto da contexto. La visita confirma la medida. La recomendación sale de esas dos cosas, no de escoger un producto por nombre.</p>
      </div>
      <div className="process-list">
        {steps.map(({ n, title, copy }) => (
          <article key={n}>
            <span>{n}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Footer({ openAdvisor }) {
  return (
    <footer id="contacto">
      <div className="contact-editorial">
        <div className="contact-symbol" aria-hidden="true"><img src="/assets/brand/triangulo.png" alt="" /></div>
        <div className="contact-copy">
          <span className="contact-line">WhatsApp · {HOMEEASY_WHATSAPP_DISPLAY}</span>
          <h2>Mándanos una foto de la ventana. Con eso empezamos.</h2>
          <p>Que se vea completa y, si puedes, cómo abre. No hace falta que sepas las medidas ni el nombre del sistema.</p>
          <div className="contact-actions">
            <a className="button contact-whatsapp" href={whatsappUrl("Hola HomeEasy, quiero enviarles una foto de mi ventana para que me orienten.")} target="_blank" rel="noreferrer"><WhatsappLogo size={19} /> Abrir WhatsApp</a>
            <button type="button" className="contact-secondary" onClick={openAdvisor}>Preparar la consulta <ArrowRight size={16} /></button>
          </div>
        </div>
        <div className="contact-notes" aria-label="Qué ayuda a revisar tu ventana">
          <div><span>01</span><p><strong>Foto completa</strong><small>Ventana y un poco del muro alrededor.</small></p></div>
          <div><span>02</span><p><strong>Cómo abre</strong><small>Fija, corrediza, abatible o salida de paso.</small></p></div>
          <div><span>03</span><p><strong>Qué quieres corregir</strong><small>Luz, privacidad, calor, oscuridad o apariencia.</small></p></div>
        </div>
      </div>
      <div className="footer-bottom"><Brand /><a href={whatsappUrl("Hola HomeEasy, quiero hacer una consulta.")} target="_blank" rel="noreferrer">{HOMEEASY_WHATSAPP_DISPLAY}</a><small>© 2026 HomeEasy. Todos los derechos reservados.</small></div>
    </footer>
  );
}

function AdvisorModal({ open, onClose, context }) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    window.requestAnimationFrame(() => dialog?.focus());

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;

      const focusable = [...dialog.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      )].filter((element) => element.getAttribute("aria-hidden") !== "true");
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      const previousFocus = previousFocusRef.current;
      if (previousFocus instanceof HTMLElement && document.contains(previousFocus)) previousFocus.focus();
    };
  }, [open, onClose]);

  const continueOnWhatsApp = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const space = String(formData.get("space") || "").trim();
    const message = [
      "Hola HomeEasy, quiero revisar una ventana.",
      "",
      `Nombre: ${name}`,
      `Mi WhatsApp: ${phone}`,
      `Espacio: ${space}`,
      context ? `Interés: ${context}` : null,
      "",
      "Quiero enviarles una foto de la ventana para que me orienten.",
    ].filter((line) => line !== null).join("\n");
    window.location.assign(whatsappUrl(message));
  };

  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section ref={dialogRef} className="advisor-modal" role="dialog" aria-modal="true" aria-labelledby="advisor-title" aria-describedby="advisor-description" tabIndex="-1">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar"><X size={22} /></button>
        <h2 id="advisor-title">Cuéntanos qué ventana quieres resolver.</h2>
        <p id="advisor-description">Con estos datos preparamos el mensaje. Después puedes adjuntar la foto directamente en WhatsApp.</p>
        {context && <div className="advisor-context"><span>CONSULTA</span><strong>{context}</strong></div>}
        <form onSubmit={continueOnWhatsApp}>
          <label>Nombre<input required name="name" autoComplete="name" placeholder="Tu nombre" /></label>
          <label>Tu WhatsApp<input required name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="300 000 0000" /></label>
          <label>Espacio<select name="space"><option>Sala</option><option>Habitación</option><option>Oficina</option><option>Comedor</option><option>Otro</option></select></label>
          <button className="button" type="submit"><WhatsappLogo size={18} /> Preparar mensaje en WhatsApp <ArrowRight size={18} /></button>
        </form>
        <small className="advisor-privacy-note">No enviamos estos datos a ningún servidor desde la web. Se incluyen únicamente en el mensaje que tú confirmas en WhatsApp.</small>
      </section>
    </div>
  );
}

export function App() {
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [advisorContext, setAdvisorContext] = useState("");
  const openAdvisor = useCallback(() => {
    setAdvisorContext("");
    setAdvisorOpen(true);
  }, []);
  const openAdvisorFor = useCallback((context) => {
    setAdvisorContext(context);
    setAdvisorOpen(true);
  }, []);
  const closeAdvisor = useCallback(() => setAdvisorOpen(false), []);
  return (
    <>
      <Header openAdvisor={openAdvisor} />
      <main>
        <HomeEasyHero openAdvisor={openAdvisor} />
        <Recommender />
        <Products openAdvisorFor={openAdvisorFor} />
        <Wallpaper openAdvisorFor={openAdvisorFor} />
        <Process />
      </main>
      <Footer openAdvisor={openAdvisor} />
      <a className="floating-whatsapp" href={whatsappUrl("Hola HomeEasy, quiero enviarles una foto de mi ventana para que me orienten.")} target="_blank" rel="noreferrer" aria-label="Escribir a HomeEasy por WhatsApp"><WhatsappLogo size={26} weight="fill" /></a>
      <AdvisorModal open={advisorOpen} onClose={closeAdvisor} context={advisorContext} />
    </>
  );
}
