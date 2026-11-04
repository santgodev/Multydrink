# MultyDrink — revisión responsive local

Revisión sobre `feature/doctora-erika`, base `3dba048`. Objetivo local: http://127.0.0.1:4173/. Se consultó https://multydrincolombia.com/ en lectura y se abrió el modal de compra sin enviar pedidos. No se cambió de rama ni se modificó producción.

## Hallazgos y correcciones

| Hallazgo observado | Causa | Corrección aplicada |
| --- | --- | --- |
| El título de «El producto, con claridad» ocupa cuatro líneas a 320 px y resulta mayor que los títulos contiguos. | La regla móvil `.nutrition-layout h2` fija 36 px, por encima de la escala responsive anterior. | `clamp(26px,6.5vw,30px)` solamente hasta 560 px; misma fuente, color, contenido y estructura. |
| Menú móvil de 34 × 40 px y enlace de compra del header de unos 31 px de alto. | Reglas móviles reducen el tamaño original del menú y el enlace carece de altura mínima. | Mínimos de 44 px para menú y altura del enlace, dentro del breakpoint de 800 px. |
| Flechas de testimonios de 36 × 36 px. | Reducción explícita en el breakpoint de 560 px. | Recuperación de los 44 × 44 px del componente original. |
| Pestañas de producto de unos 41 px, desplegable de credenciales de unos 23 px y enlaces legales cortos de unos 20 px de alto. | El área interactiva depende de una línea de texto sin espacio suficiente para tocarla. | Altura mínima de 44 px y padding localizado en credenciales/footer hasta 800 px; se reduce el margen entre enlaces para compensar. |

No se encontró desbordamiento horizontal del documento ni del checkout en los tamaños revisados. El desplazamiento horizontal de miniaturas/testimonios y el recorte interno del comparador son intencionales. Se preservaron las proporciones fotográficas, el espacio compartido de los cuatro capítulos y la presentación editorial de las demás secciones.

Archivos de aplicación modificados: `src/styles.css`, `src/product-hero.css`, `src/phase-one.css`. No se modificaron HTML, JavaScript, textos, imágenes, precios, datos del vendedor, dominio, SEO, configuración de pedidos, Turnstile ni servicios externos. Los tres archivos previamente sin seguimiento se conservaron, incluido `worker-respaldo.txt`.

## Cobertura de navegador

Viewports CSS: **320, 375, 390, 430, 768 y 1440 px**; altura de 844 px para interacciones y 900 px para capturas completas/comparación de escritorio. Emulación de movimiento reducido para capturas reproducibles; no equivale a teléfonos físicos ni a una certificación de accesibilidad.

- Inspección visual de página completa: header, hero, identificación, comparación, capítulos, ingredientes, investigación, nutrición, preparación, doctora, ofertas, FAQ y footer. Capturas antes/después abiertas y examinadas.
- Galería: ocho imágenes decodificadas y navegación completa en cada ancho; retorno a `01 / 08`.
- Cuatro capítulos: cambios de imagen/contenido; tecla Home devuelve el foco/selección a Origen. Presentación/Preparación y categorías de FAQ responden a selección.
- Testimonios del hero: avance al testimonio 2. El carrusel independiente de videos permanece oculto según la configuración existente; no se habilitó para esta revisión.
- Selección de caja individual y cantidad 2: total visible COP $220.000 en cada ancho.
- Menú móvil: apertura y Escape. Checkout: apertura, cierre, retorno al CTA, navegación entre campos y validación vacía (8 errores, foco en `fullName`), sin desbordamiento. No se enviaron pedidos; se bloquearon las solicitudes `/orders` en la sesión de comprobación del formulario.
- Cinco enlaces legales en los seis anchos: documento correcto, fondo blanco, marca `#65FF3F`, desplazamiento hasta el final, Escape y retorno de foco. El contenido aprobado no se editó.
- Doctora: fotografía visible y reproducción local del MP4 confirmada a 390 px (720 × 1280, 87,44 s, controles nativos, sin autoplay; audio silenciado durante la comprobación).
- Sin imágenes rotas en la comprobación final. Se esperó la carga de imágenes al repetir capturas donde la carga diferida aún estaba pendiente; esa normalización solo se hizo en el navegador.

La comparación completa de escritorio, con las hojas originales y nuevas en la misma página a 1440 px, produjo capturas de iguales dimensiones y solo 11 píxeles distintos sobre aproximadamente 15 millones. No se observó cambio de composición. Todas las reglas editadas están dentro de breakpoints móviles/tablet.

## Validación automática

- `npm test`: **56 aprobadas / 0 fallidas / 56 totales**, 0 omitidas y 0 canceladas, tras el mantenimiento de pruebas del 3 de noviembre de 2026. La ejecución anterior tenía 50 aprobadas y 6 fallidas.
- `npm run build`: correcto.
- `npm run check:build`: correcto; HTTP 200, 89 recursos, 16 archivos fuente, tres hojas de estilo válidas y rutas privadas denegadas.
- `git diff --check`: correcto.

Los seis fallos previos se resolvieron mediante mantenimiento de tests, sin cambiar la configuración protegida:

1. `tests/editorial.test.mjs`: la prueba de datos estructurados ahora exige `index, follow`, conforme al sitio aprobado. Este informe la atribuía erróneamente a `tests/assets.test.mjs`, que no necesitó cambios. Se mantienen las comprobaciones de ofertas y ausencia de valoraciones o disponibilidad inventadas.
2. `tests/interface.test.mjs`: «Missing service» utiliza un fixture explícito con `orderEndpoint: null` y datos válidos de formulario. Conserva las comprobaciones de botón deshabilitado, cero llamadas al servicio, ausencia de confirmación y mensaje de datos no enviados.
3. Cuatro pruebas de `tests/legal.test.mjs`: las expectativas de endpoint nulo se sustituyeron por comparación íntegra de la configuración comercial contra su copia previa. Renderizar las políticas no debe alterar la configuración existente. Se conservan todas las comprobaciones legales, de checkout, botón deshabilitado en el HTML inicial, enlaces SIC, privacidad e inyección de contenido.

La suite completa está aprobada, sin quitar ni omitir pruebas. Siguen pasando los controles de bloqueo sin servicio o sin token Turnstile, idempotencia, errores HTTP, recibos inválidos y precios autoritativos del backend. Este mantenimiento modifica únicamente los tres archivos de tests indicados y este documento. Se verificó por hashes que los archivos JavaScript/CSS de `src/`, `index.html`, `robots.txt` y `sitemap.xml` permanecen intactos respecto al inicio de esta intervención; las mejoras responsive previas se conservan. No se repitió la auditoría visual.

## Evidencia y límites

Capturas y registro de pruebas en `tmp/mobile-audit/` (evidencia local, no artefactos de publicación):

- `before-{ancho}.png` y `sheet-before-{ancho}.png`: baseline y hojas de lectura.
- `final-{header,reviews,nutrition,footer}-matrix.png`: comparación de los cinco anchos móviles/tablet, de izquierda a derecha 320/375/390/430/768.
- `nutrition-stable-430.png`: nutrición con la etiqueta completamente cargada.
- `checkout-errors-320.png`, `legal-contact-390.png`, `doctor-playback-390.png`.
- `desktop-after.png` y `desktop-baseline-matched.png`: comparación equivalente de escritorio.
- `tests-final.txt`: registro histórico de la revisión responsive (50 aprobadas y 6 fallidas), anterior al mantenimiento de pruebas descrito arriba.

Turnstile devolvió el código **110200** en localhost durante la automatización. La observación breve en el dominio público quedó en «Preparando verificación»; no acredita éxito ni fallo definitivo en producción. No se tocó su configuración ni se eludió el desafío. Falta comprobar en móvil real el desafío completo, su tamaño, el teclado virtual y los controles de video de Safari/iOS. Tampoco se enviaron órdenes reales ni se verificaron integraciones de backend, lectores de pantalla o métricas de rendimiento de usuarios reales.

El propietario aclaró que el error Turnstile **110200** corresponde a autorización del hostname. La verificación real se realizará por separado en el dominio oficial; no se modifica la seguridad de producción para admitir localhost.

Los cambios CSS quedan preparados para revisión y los seis fallos previos de tests están resueltos. La verificación real de Turnstile y los límites de validación indicados siguen pendientes; una suite aprobada no equivale a aceptación completa de producción. Sin commits, push, merge ni despliegues.
