# MultyDrink — Diseño del registro de consentimiento (propuesta, sin activar)

**Estado:** arquitectura pendiente de aprobación e implementación. No sustituye una política de privacidad aprobada. No es un despliegue.

## Decisión
Mantener las 29 columnas y los registros existentes de la hoja privada `Pedidos`. Añadir, cuando se autorice, una pestaña privada `Consentimientos` en **el mismo spreadsheet**, sin incluir nombres ni documentos duplicados. Cada fila de autorización queda vinculada mediante `solicitudId` y `numeroPedido`.

Columnas propuestas (pendientes de aprobar):
1. `solicitudId` — UUID del intento, único.
2. `numeroPedido` — identificador `MD-...` de Pedidos.
3. `versionPolitica` — identificador de una versión **real, aprobada y publicada**.
4. `aceptado` — booleano `true` estricto.
5. `fechaAceptacionServidor` — marca de tiempo emitida por Apps Script al recibir la solicitud.
6. `fechaRegistro` — marca de tiempo del registro de auditoría.
7. `huellaSolicitud` — hash de contenido canónico que permita reconocer un reintento sin duplicar pedidos.

La fecha del servidor acredita la recepción del consentimiento, **no demuestra por sí sola que la persona haya visto o entendido el documento**. La prueba documental debe complementarse con el texto exacto y su versión archivada.

## Contrato del cliente y del Worker
El navegador envía `consent: {accepted: true, policyVersion: "..."}`. El checkbox permanece desmarcado inicialmente, y no se puede confirmar el pedido sin aceptación. El Worker:
- verifica que el valor sea el booleano `true` y que la versión esté en una lista aprobada por el servidor;
- rechaza versiones ausentes, inválidas, antiguas no aceptadas o inventadas por el cliente;
- envía a Apps Script `aceptaPrivacidad: true` y `versionPolitica`, y el mismo `solicitudId` de la clave de idempotencia;
- no inserta datos ni expone secretos al navegador; el cálculo de precios permanece del lado servidor.

Apps Script valida de nuevo todos esos puntos. La verificación de Turnstile debe realizarse en el Worker cuando se implemente, antes de cualquier escritura.

## Consistencia al escribir en dos hojas
Google Sheets **no garantiza una transacción atómica entre dos appendRow**. Por ello, jamás prometer atomicidad.

Propuesta de flujo bajo `LockService` y un solo código de registro:
1. Validar todos los datos, producto, precio, idempotencia, consentimiento y versión de política **antes de escribir**.
2. Consultar por `solicitudId` las hojas `Pedidos` y `Consentimientos` y comparar la huella canónica de la solicitud. Si la misma clave aparece con contenido diferente, rechazar.
3. Registrar o recuperar de forma idempotente la autorización en `Consentimientos`, conservando `solicitudId` y un `numeroPedido` generado de manera estable para ese intento.
4. Registrar o recuperar el pedido en las 29 columnas existentes de `Pedidos`.
5. **Solo responder éxito al Worker** después de verificar que ambos registros están persistidos, completos, se relacionan por el mismo número e ID, y los totales provienen del catálogo del servidor.

### Manejo de fallos y reintentos
- Si falla la escritura de `Consentimientos`: **no escribir el pedido**; devolver fallo sin confirmación.
- Si la autorización se escribió pero falla el pedido: devolver fallo sin confirmación. Dejar la autorización pendiente de vinculación y recuperar el mismo número/ID en un reintento con idéntico contenido, sin una segunda fila de autorización.
- Si el pedido se escribió pero no se puede verificar la lectura posterior: devolver estado incierto sin confirmación; en el reintento verificar ambas hojas antes de añadir filas.
- Una fila huérfana en cualquiera de las hojas requiere conciliación administrativa antes de confirmar. Nunca inferir éxito basándose solo en HTTP 200 o `{ok:true}`.
- No cambiar datos de cliente, producto, cantidad ni versión de la política bajo el mismo `solicitudId`. Para un pedido distinto se necesita otra clave.

**Alternativa más segura a evaluar antes de implementar:** guardar los metadatos mínimos del consentimiento en el propio registro principal como fuente de verdad y hacer `Consentimientos` una copia de auditoría. Requeriría confirmar uso de columnas reservadas o añadir columnas, por lo que no se adoptará sin autorización.

## Pendientes que bloquean la implementación
- Identidad del responsable y texto definitivo de la política; versión publicada e histórica accesible al comprador.
- Aprobación del nuevo esquema `Consentimientos` y del procedimiento de conciliación/reintento.
- Confirmar que el esquema existente tiene 29 columnas y los índices de `solicitudId`, `numeroPedido`, `total` coinciden; no alterar encabezados actuales.
- Pruebas aisladas con hojas ficticias y fallos simulados en cada escritura, sin utilizar datos personales ni pedidos reales.
- Comparar y actualizar `Pedidos.gs`, `API.gs` y el Worker **en una iteración coordinada**; comprobar 400, 429, 503, idempotencia y confirmación basada en persistencia.
- Mantener `orderEndpoint: null`, `ORDERS_ENABLED=false`, la barrera final HTTP 503 del Worker y `doPost` bloqueado hasta completar todos los controles.
