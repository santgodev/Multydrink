# Confirmación de pedidos — corrección local

Revisión del 4 de noviembre de 2026. Rama `fix/standalone-order-receipt`, creada desde `origin/main` actualizado (`74a073e`). Sin commits, push, merge ni despliegue. Los tres archivos ajenos sin seguimiento permanecen intactos.

## Diagnóstico comprobado

- En el commit anterior `950c3ce`, el éxito asignaba literalmente `Solicitud ${result.orderId}. Total confirmado: ...` a `#confirmation-detail`. Ocultaba el formulario y la disponibilidad, pero dejaba fuera el encabezado, introducción e instrucciones. Ese código explica los síntomas descritos.
- La consulta pública actual de `https://multydrincolombia.com/` devolvió HTML con el recibo nuevo y JavaScript/CSS correspondientes a `74a073e`. Los SHA-256 del contenido, normalizando CRLF a LF en el archivo local, coincidieron: `app.js` = `c2b4e8a486c06c2de2f4dd0d01c39b771bf7af8b4feb29297b70cc4d5eadae31`; `phase-one.css` = `7ce8638c5b887f89bbc7a74295dd6ab1884a774e99b3b60d5b03f5dec4ac7a94`. Esa respuesta no contiene la concatenación antigua.
- Ambos recursos públicos respondieron HTTP 200, con `Cache-Control: public, max-age=604800`, URLs sin versión y el mismo `Last-Modified`. No se demostró una mezcla de versiones en esa consulta, ni se dispone de la caché del navegador que produjo la captura reportada. Atribuirle definitivamente la incidencia a caché sería una inferencia, no un hallazgo probado.
- La versión reciente todavía conservaba un encabezado de checkout y dependía de selectores CSS para ocultar elementos individuales. Al reabrir, enfocaba el título del checkout y montaba Turnstile aunque el pedido ya estuviera confirmado. Las pruebas anteriores no exigían ocultar todo el contenido previo al envío.

## Corrección

- `index.html`: agrupa el checkout completo en `#order-entry`; el recibo es su hermano, con cierre propio. Contenido del recibo ajustado al texto solicitado. Versiona únicamente las entradas modificadas `app.js` y `phase-one.css` mediante `?v=receipt-20261104`.
- `src/app.js`: una transición compartida por éxito y demo oculta/inactiva el bloque previo mediante `hidden` e `inert`, muestra el recibo y cambia el nombre accesible del diálogo. Reapertura y teclado enfocan la confirmación. Se conserva el ID exacto recibido y el total independiente. No se vuelve a montar la verificación después del éxito; su configuración y la comprobación obligatoria previa al envío no cambian.
- `src/phase-one.css`: sustituye el bloque anterior de estilos de recibo, sin acumular overrides. Superficie blanca, texto oscuro, acento `var(--accent)` y verde oscuro existente; tarjeta compacta, tamaños adaptables y cierre de 44 px.
- `tests/interface.test.mjs`: conserva los controles anteriores y añade comprobaciones del checkout oculto sin depender del CSS, ID único, cierre/foco/reapertura, reenvío bloqueado, formulario disponible ante error y reinicio seguro de la demo.
- `scripts/build.mjs`: la comprobación de existencia separa la query de versión del nombre físico. La primera ejecución con URLs versionadas detectó este fallo y se corrigió; el build final pasa.
- `scripts/check-build.mjs`: verifica por HTTP también las URLs de entrada que realmente referencia el HTML, incluidas sus queries.

No se modificaron Worker, Apps Script, Sheets, configuración de Turnstile, payloads, precios, consentimiento, políticas, SEO, galería ni otras secciones. No se enviaron pedidos reales. La idempotencia y validación del recibo permanecen en el cliente de pedidos existente.

## Validación

- `npm test`: **57 aprobadas, 0 fallidas, 0 omitidas**.
- `npm run build`: correcto.
- `npm run check:build`: correcto; HTTP 200, 89 recursos, 16 archivos fuente, tres hojas de estilo válidas y rutas privadas denegadas.
- `git diff --check`: correcto.
- Navegador a **320, 375, 390, 430, 768 y 1440 px**, altura 900 px: recibo renderizado y capturas abiertas/examinadas. Sin overflow horizontal; checkout anterior completamente oculto; ID mock `MD-F9FB3ECC` una vez; total mock `$110.000 COP` separado; foco inicial, Tab/Shift+Tab, cierre, Escape y retorno al CTA correctos. Reabrir conserva recibo y foco; un intento adicional no invoca el servicio de nuevo.
- Formulario antes del envío a 320 y 1440 px: comparación de capturas antes/después con **0 píxeles diferentes** bajo las mismas condiciones.
- Comprobación adicional a **320 × 568**: scroll desde inicio hasta los últimos pasos, retorno por teclado al cierre y ausencia de overflow. Las URLs versionadas cargan en el navegador local.
- Demo de loopback `?pedido-demo=1`: muestra expresamente que no es un pedido real, cero llamadas al mock, reinicio del formulario y foco en nombre correctos. Se preserva su limitación a localhost.

Las pruebas visuales del recibo real usaron el punto de inyección existente de `initApp` para un fetcher y Turnstile simulados únicamente en la respuesta del navegador local; además se bloquearon las solicitudes `/orders`. Cada captura lleva una etiqueta de simulación añadida solo al DOM de prueba. Se retiraron las interceptaciones al terminar. No se simula persistencia real ni se certifican integraciones externas. No se probaron dispositivos físicos ni lectores de pantalla.

## Evidencia visual local

Las imágenes «antes» muestran la versión reciente de `origin/main` con respuesta mock, no la captura histórica defectuosa del cliente.

| Vista | Antes | Después |
| --- | --- | --- |
| Móvil 320 px | [Recibo anterior](../tmp/receipt-audit/before-receipt-320.png) | [Recibo corregido](../tmp/receipt-audit/after-receipt-320.png) |
| Escritorio 1440 px | [Recibo anterior](../tmp/receipt-audit/before-receipt-1440.png) | [Recibo corregido](../tmp/receipt-audit/after-receipt-1440.png) |

Capturas adicionales en `tmp/receipt-audit/`: `after-receipt-{375,390,430,768}.png`, `before-form-{320,1440}.png`, `after-form-{320,1440}.png`, `demo-320.png` y `after-short-screen-320.png`. Son evidencia local ignorada por Git y no se publica con el build.

## Pendiente de publicación autorizada

Revisar visualmente y autorizar por separado cualquier commit o publicación. En un despliegue posterior, comprobar que el HTML público referencia las dos URLs versionadas y que Hostinger/CDN sirve su contenido actualizado. Si una capa ignora las queries o conserva el HTML anterior, revisar su política de caché/invalidez con autorización; no se cambió configuración remota. La verificación real de Turnstile y persistencia corresponde al dominio oficial en un procedimiento aparte autorizado.
