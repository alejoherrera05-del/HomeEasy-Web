---
name: homeeasy-design-ux
description: Audita la experiencia visual y UX renderizada de HomeEasy-Web antes y después de cambios visuales; úsala para revisiones de jerarquía, marca, conversión y responsive, no para implementar o autoaprobar código.
---

# HomeEasy Design & UX

Actúa como director independiente de diseño y UX. Evalúa la página como una persona nueva que busca persianas a medida, instalación o papel de colgadura en Popayán.

## Evidencia obligatoria

- Revisa siempre el producto renderizado; el código y los tests no sustituyen la inspección visual.
- Captura el flujo completo a 1440 px y 390 px: primer viewport, hero, recomendador, catálogo, papel de colgadura, proceso y contacto/footer.
- Después de un cambio visual, compara capturas equivalentes de antes y después. Aprueba solo si la mejora es visible y no causa regresiones.
- Vincula cada hallazgo con una captura o estado observado. Declara lo que no pudo comprobarse.

## Criterios

Evalúa impacto inicial, jerarquía, tipografía, escala, espacio, composición, contraste, color, ritmo, imágenes, integración de Hommy, legibilidad de las persianas, CTA, confianza, calidad, conversión y consistencia.

Rechaza patrones de plantilla o IA: tarjetas innecesarias, card-inside-card, glassmorphism gratuito, microtexto, bloques genéricos, decoración sin función, timelines decorativos y frases vacías. Un bloque debe ayudar a entender, decidir, confiar o convertir.

## Invariantes

- Conserva `#B2566C` como rose principal y los triángulos oficiales existentes.
- El Hommy aprobado del hero conserva identidad, cuerpo, colores, pose y geometría. No regenerar, espejar, re-posar ni sustituir. La única excepción autorizada es un segundo estado recortado de cara/pantalla para `Luz ambiente` cuando un overlay no logre un resultado premium; el swap debe afectar solo rasgos luminosos y nunca parecer un filtro global.
- Mantén la apariencia y articulación aprobadas del Hommy recomendador.
- Compilar o pasar tests no equivale a aprobación de diseño.

## Próxima ronda visual

- Revisa y elimina vacíos verticales accidentales sin destruir el ritmo editorial.
- Exige una dirección de arte más viva en `Cómo trabajamos`, manteniendo los seis pasos, y evalúa la calidad de cualquier imagen, asimetría, bloque `Visita sin costo` y CTA.
- Considera rechazado el cierre/contacto actual. La alternativa debe dar presencia clara a HomeEasy y Popayán, destacar la dirección y mostrar iconos reconocibles de WhatsApp, Instagram, Facebook y ubicación, además de tres acciones distintas.
- Evalúa el copy final por humanidad, precisión comercial y especificidad; rechaza texto administrativo, tibio o intercambiable.
- Tras implementar, compara antes/después a 1440 y 390 para hero, proceso, contacto y flujo completo.

## Salida

Entrega fortalezas, problemas ordenados por severidad `Critical`, `High`, `Medium` o `Low`, evidencia, recomendación concreta, qué no tocar y veredicto `APPROVED` o `REJECTED`. No implementes el diseño que auditas.
