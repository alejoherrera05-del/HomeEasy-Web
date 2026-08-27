# Rig por capas de Hommy

## Estado actual

La fuente oficial del formulario es `public/assets/hommy/hommy-official.png`: un PNG RGBA aplanado de 1254 x 1254, derivado de `hommy2.png` mediante extracción del fondo negro. No contiene articulaciones independientes. El componente `HommyLayered.jsx` usa por ello el fallback oficial inmóvil. No intenta doblar, desplazar ni simular el gesto con el PNG completo.

La animación, los pivotes y la integración con cada respuesta ya están preparados. El rig se activa únicamente después de exportar y revisar todas las capas y cambiar `HOMMY_RIG_AVAILABLE` a `true` en `src/components/hommyAssets.js`.

## Capas obligatorias

Todas deben ser PNG transparentes de **1254 x 1254**, conservar la posición exacta de la fuente y exportarse sin recortar el lienzo:

1. `hommy-body.png`: torso, cintura y piernas; sin cabeza ni brazos.
2. `hommy-head.png`: gorra, carcasa de la cabeza y auriculares; sin pantalla facial.
3. `hommy-face.png`: vidrio, cejas y sonrisa; sin los dos ojos.
4. `hommy-eyes.png`: únicamente los píxeles luminosos de ambos ojos.
5. `hommy-arm-tablet.png`: brazo, antebrazo y mano que sostienen la tableta.
6. `hommy-tablet.png`: tableta completa, sin cambios en su pantalla.
7. `hommy-free-arm-upper.png`: hombro y brazo libre hasta el codo.
8. `hommy-free-arm-forearm.png`: antebrazo libre desde el codo hasta la muñeca.
9. `hommy-free-hand.png`: mano libre completa.

Los nombres y rutas exactos ya viven en `src/components/hommyAssets.js`.

## Recorte en Photopea

1. Abrir `hommy-official.png` y convertir la capa base en objeto inteligente protegido.
2. Crear un grupo por cada asset anterior. No escalar, recolorear, afilar ni aplicar filtros.
3. Trazar máscaras vectoriales a 200–300 % de zoom, siguiendo las uniones mecánicas reales.
4. Dejar entre 8 y 14 px de solape debajo de hombro, codo, muñeca y cuello. El solape queda oculto por las tapas doradas y evita grietas durante la rotación.
5. Reconstruir en la capa inferior únicamente las áreas que estaban ocultas detrás de una pieza móvil. Usar clonación manual del mismo PNG; no relleno generativo.
6. Eliminar de cada capa el halo atmosférico del fondo. Ese halo nunca debe duplicarse entre piezas.
7. Exportar cada grupo con `Archivo > Exportar como > PNG`, 1254 x 1254, sRGB y transparencia, sin `Trim`.
8. Volver a montar las nueve capas en Photopea y alternar su visibilidad. La composición idle debe coincidir píxel a píxel con la fuente antes de activar el rig.

## Pivotes iniciales

Los porcentajes se refieren al lienzo completo y están centralizados en `hommyAssets.js`:

- cuello / cabeza: `50% 43.5%`
- hombro libre: `28.4% 55.6%`
- codo libre: `25.2% 70.2%`
- muñeca libre: `26.8% 89.6%`

Estos valores son una primera localización geométrica. Tras montar las capas reales deben afinarse visualmente a escala 1x y 2x; no se deben compensar errores de recorte con deformaciones.

## Secuencia implementada

- 0–140 ms: ojos hacia la tableta.
- 80–240 ms: cabeza acompaña 4 grados.
- 180–470 ms: hombro y codo elevan el brazo libre.
- 470–600 ms: un contacto breve; la tableta permanece inmóvil.
- 600–990 ms: brazo, cabeza y ojos regresan por la misma trayectoria.
- 1100 ms: todos los transforms quedan retirados y la pose vuelve al idle exacto.

Con `prefers-reduced-motion`, solo se mueven levemente ojos y cabeza durante 240 ms.

## Validación antes de activar

- Revisar a 0.25x que no aparezcan huecos, dobles bordes, halos o saltos en articulaciones.
- Confirmar que la tableta y su brazo permanecen estables.
- Comparar capturas del primer y último frame mediante diferencia de píxeles.
- Probar clic rápido en dos respuestas: se conserva solo la última reacción pendiente.
- Probar desktop, móvil y `prefers-reduced-motion`.

Hasta superar esas comprobaciones, `HOMMY_RIG_AVAILABLE` debe permanecer en `false`.
