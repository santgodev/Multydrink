# MultyDrink — Registro de validaciones de publicación (10-11-2026)

**Propósito:** conservar evidencia y evitar repetir pruebas ya superadas. Este documento solo registra resultados observados; no sustituye las evidencias del chat ni acredita pruebas no ejecutadas.

## Entrega GitHub / Hostinger

- PR #9 «Integrar Meta Pixel con consentimiento y eventos del pedido», rama `feature/meta-pixel-multydrink`, integrada en `main` mediante commit `f5eedeb91802c7212ba5b4f77f9dea275b1bb085`.
- Hostinger confirmó automáticamente un despliegue completado de `main` para `multydrincolombia.com`, commit `f5eedeb9`. No se necesita ZIP ni subida manual en ese flujo.
- Política pública actualizada a versión `2026-11-10`; el formulario envía `consent.policyVersion = "2026-11-10"`.
- Meta Pixel ID `1615961720211982`; los cuatro eventos implementados son `PageView`, `ViewContent`, `InitiateCheckout` y `Lead`. **Todavía falta confirmarlos en Meta Events Manager en el dominio real**.

## Pruebas automatizadas y build — cerradas

- Primera ejecución después del cambio de privacidad: **78 aprobadas / 79**, único fallo por aserción desactualizada de `2026-11-03` en `tests/order.test.mjs`. Era una expectativa del test, no un error confirmado del checkout.
- Test corregido en commit `fbec57645e653eabefe42a652eb69c2724bcd4a6`, sin cambios de lógica de pedidos.
- Tras sincronizar, `node --test tests/order.test.mjs`: **14/14 aprobadas**. No se volvió a ejecutar la suite completa de 79 tras esa corrección exclusivamente de test; no afirmar un nuevo 79/79.
- `npm run build`: **Build OK** (`dist/index.html`, 45603 KB de activos).
- `npm run check:build`: **Production smoke check OK**, HTTP 200, 110 assets, 19 source files, 4 stylesheets; rutas privadas bloqueadas. No equivale a prueba visual de navegador.
- **Regla:** no repetir suite, compilación ni pruebas manuales previamente aprobadas salvo cambio posterior que afecte funcionalmente ese alcance.

## Incidente HTTP 400 y solución — cerrado

- Tras publicación de web, los envíos al endpoint `https://multydrink-orders-api.santgodev.workers.dev/orders` devolvían HTTP 400. CORS y recepción POST funcionaban; respuesta del Worker no se pudo leer en DevTools. El tamaño de la respuesta (58 B) era consistente con «Versión de privacidad inválida», pero ese mensaje no se leyó de forma directa.
- En Cloudflare, Settings > Production mostraba `POLICY_VERSION = 2026-11-10`, `ORDERS_ENABLED = true`, `DEV_TEST_MODE = false`.
- En Deployments, **`c53ca9e4`** seguía atendiendo 100 % del tráfico, mientras **`43e43214`**, creada al actualizar `POLICY_VERSION`, estaba lista pero sin promover.
- Se promovió `43e43214` al **100 %**; el historial del rollout lo confirmó. No se modificó código del Worker ni Apps Script para solucionar este incidente.
- **Resultado:** el pedido real de prueba posterior se registró correctamente. La discrepancia entre versión configurada y versión desplegada fue la causa operativa consistente con la evidencia; no atribuir prueba directa del mensaje HTTP 400 sin una captura del cuerpo.

## Pedido real de prueba — validado

- Dominio: `https://multydrincolombia.com` (incógnito).
- Fecha/hora de registro: **10/11/2026 17:03:31** (Colombia).
- Pedido: **`MD-D41DD925`**.
- Presentación: **Caja individual, 21 sobres, cantidad 1**.
- Subtotal y total: **110000 COP**, envío incluido.
- La pantalla mostró «Tu pedido quedó registrado», número de pedido y `$110.000 COP`.
- Google Sheets mostró el mismo ID, estado `NUEVO`, fecha, presentación, cantidad y total correcto.
- Turnstile mostró verificación completada. La prueba demuestra que el flujo web → Worker → Apps Script → Sheets y la confirmación funcionan **después** de promover la nueva versión.
- No conservar en este archivo los datos personales o ficticios del formulario (documento, teléfono, correo, dirección).
- **Limpieza:** al cierre de este registro, **no consta confirmación de eliminación de la fila ficticia `MD-D41DD925`**. Eliminar solo esa fila una vez terminada la comprobación, sin tocar otras filas, encabezados o fórmulas.

## Cookies y atribución — seguimiento pendiente

- Consentimiento publicitario separado del consentimiento obligatorio de datos para gestionar pedidos.
- Implementación de píxel: no cargar `fbevents.js` antes de aceptar; rechazo no debe bloquear el checkout. Comprobado a nivel de test automatizado; falta verificación de solicitudes de red en navegador real en el dominio público y en Meta Test Events.
- No consta evidencia independiente de la decisión de cookies tomada durante el pedido real exitoso; no declarar esa comprobación de navegador como superada todavía.
- **Pendiente:** verificar `PageView`, `ViewContent`, `InitiateCheckout` y `Lead` en Meta Events Manager con aceptación explícita, y ausencia de tráfico al rechazar; no enviar PII a Meta.
- **Fase posterior, sin implementar:** agregar las columnas «Origen» y «Campaña» a Sheets y la atribución de origen/campaña vía web → Worker → Apps Script; evitar usar identificadores publicitarios para eludir rechazo.
- Las pruebas de Meta pueden quedar en sus informes aun después de borrar las filas ficticias de Sheets.

## Restricciones para futuras intervenciones

1. No volver a diagnosticar el error 400 como pendiente: quedó solucionado con el rollout al 100 % de `43e43214`, verificado con pedido `MD-D41DD925`.
2. No pedir repetir pruebas de pedidos, de compilación o tests ya documentados sin un cambio posterior o una evidencia de nueva regresión.
3. No tocar otras secciones, visuales aprobados ni el contrato de pedidos para trabajar en Meta Pixel/atribución.
4. Mantener el despliegue automático desde `main` en Hostinger y revisar rollout activo en Cloudflare cuando cambien variables de Worker.

## Actualización de validación de Meta Pixel — 10/11/2026, tarde

- Se abrió en Meta Events Manager la pestaña **Probar eventos**, canal **Sitio web**, para el píxel `1615961720211982`. El usuario aportó capturas de la extensión Asistente de Meta Pixel en el dominio público `multydrincolombia.com`.
- **`PageView`: Activo**; **`ViewContent`: Activo** en la primera captura.
- **`InitiateCheckout`: Activo** después de abrir el formulario en la siguiente captura.
- **`Lead`: Activo** en la captura posterior, tras realizar una nueva prueba de pedido según la secuencia de la conversación. El asistente mostró también `SubscribedButtonClick` como detección automática, evento ajeno a los cuatro configurados.
- **Alcance de esta evidencia:** confirma detección por el Asistente de Meta Pixel en el navegador; falta comprobar que los eventos se vean en el historial de **Probar eventos de Events Manager** y relacionar la prueba `Lead` con el recibo/número del nuevo pedido y su fila de Sheets. No asumir que esos pasos ya fueron comprobados.
- Todavía falta comprobar en Network que el píxel no se cargue ni transmita eventos al **rechazar** el consentimiento en una sesión limpia; no repetir innecesariamente pruebas de pedidos ya cerradas.

## Confirmación de recepción en Meta Events Manager — 10/11/2026

- En la vista Información general de Meta Events Manager, para el píxel `1615961720211982`, la usuaria compartió captura donde figuran **ViewContent**, **PageView** e **InitiateCheckout** como activos y con 2 eventos registrados cada uno en el momento de la captura.
- La usuaria corrigió el rango de fechas para incluir el 10 de noviembre y confirmó explícitamente que **Lead también figura en la lista**. Esta confirmación es testimonial de la usuaria, sin una segunda captura de la fila Lead en Events Manager; el asistente de Meta Pixel ya había mostrado **Lead · Activo**.
- **Estado cerrado:** detección de los 4 eventos en navegador y recepción de los 4 eventos reportada en Meta Events Manager. No solicitar nuevas pruebas de estos cuatro eventos sin regresión posterior.
- **Pendientes independientes:** verificar ausencia de requests publicitarios al rechazar cookies en sesión nueva; identificar y limpiar la fila del pedido ficticio generado para Lead (además de `MD-D41DD925` si aún existe). No modificar otras filas ni repetir pruebas de checkout para cerrar esas tareas.
