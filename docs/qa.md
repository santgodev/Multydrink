# QA — fase 1

## Resultado automatizado

- `npm.cmd test`: **30/30 aprobadas** con Node Test Runner y Happy DOM.
- `npm.cmd run build`: correcto. 16 recursos públicos, aproximadamente 1342 KB en total; no equivale al peso de primera carga.
- `npm.cmd run check:build`: correcto. HTTP 200, 9 archivos fuente, 2 CSS analizables, JSON-LD coherente y rutas privadas denegadas. Servidor de prueba detenido al terminar.
- Sin dependencias nuevas de ejecución, trackers, cookies o almacenamiento local del formulario.

Las pruebas de API usan respuestas simuladas, nunca pedidos comerciales. Los medios de fixtures solo prueban lógica y no se publican.

## Interacciones verificadas

Selección en hero/formulario/ofertas y barra; envío incluido; cantidades, ahorros y validación; galería por botones, miniaturas y teclado; independencia vista/precio; menú/Escape; pestañas con foco y paneles; FAQ; controles nutricionales; cambio de foto configurada; cinco acordeones del hero; etiquetas, IDs ARIA, anclas y alt; diálogos legales.

Comparador: capas, range, puntero, límites y liberación. El teclado nativo real y gesto táctil quedan para navegador. Videos: permisos, fuente, subtítulos/transcripción, ausencia de reproductor antes del clic, navegación y limpieza al cerrar. Reseñas: evidencia de pedido, aprobación y escape de texto.

Pedidos: bloqueo sin servicio, errores accesibles, conservación ante fallo, doble envío, idempotencia y ausencia de confirmación ante respuestas inválidas. En la configuración entregada los datos no salen del navegador.

## Responsive y accesibilidad visual

| Ancho | Implementación prevista | Verificación renderizada |
| --- | --- | --- |
| 1440 px | Hero a dos columnas; ingredientes/footer en cuatro | Pendiente |
| 1024 px | Espaciado tablet | Pendiente |
| 768 px | Ingredientes/footer en dos columnas; FAQ apilado | Pendiente |
| 390 px | Bloques apilados, preparación vertical, barra compacta | Pendiente |
| 320 px | Ajustes de padding, tipografía y controles | Pendiente |

No hay navegador conectado ni screenshots. Happy DOM no renderiza. No se comprobó overflow, contraste, encuadres, cortes, safe area ni similitud exacta; no se declara conformidad WCAG completa.

Pendiente: teclado/lector de pantalla, foco de diálogos, zoom 200%, movimiento reducido, contraste, targets táctiles y barra ante formulario/footer/teclado virtual. Los tabs usan selección exclusiva, roving tabindex, paneles asociados y Home/End según el [patrón WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

## SEO y datos estructurados

- Idioma `es-CO`, viewport, título/descripción, un H1, headings, enlaces reales, favicon, Open Graph y Twitter Card.
- JSON-LD `Product` y dos `Offer`, COP y precios de `src/config.js`. Build lo inserta en HTML. Sin ratings, reseñas, stock, vencimientos o vendedor inventados.
- Revisión con `noindex, nofollow` y robots `Disallow: /`; no es indexable ni garantiza resultados enriquecidos.
- Con dominio final: canonical, `og:url`, imágenes sociales/JSON-LD absolutas y sitemap. Revisar disponibilidad y condiciones; cambiar robots/noindex solo para publicación autorizada.
- JSON-LD y precios comprobados localmente; [Rich Results Test y Search Console](https://developers.google.com/search/docs/appearance/structured-data/product-snippet) pendientes.

## Core Web Vitals

Medidas aplicadas: WebP, dimensiones y contenedores estables, preload/prioridad de imagen inicial, lazy loading bajo el hero, fuentes locales `font-display: swap`, JS sin framework, sin embeds de terceros y videos creados tras clic.

Objetivos: **LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1**, percentil 75 por tipo de dispositivo según [Web Vitals](https://web.dev/articles/vitals). Son objetivos, no resultados medidos.

Falta navegador/Lighthouse y datos de campo cuando haya producción. No se reporta puntuación o cumplimiento. Al integrar originales, revisar compresión, dimensiones y `srcset/sizes` donde corresponda; conservar etiqueta legible. No se generaron variantes de imágenes ausentes. Las fuentes siguen TTF; WOFF2/subsetting es una optimización pendiente.

## Calidad y límites

Configuración centralizada, manifiesto separado, módulos editoriales y cliente de pedidos reutilizado. Build comprueba archivos configurados y solo incluye videos elegibles. El servidor local no sustituye un servidor de producción, incluido streaming/range de video. No se modificó historial Git ni se desplegó.
