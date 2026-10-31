# MultyDrink — Consentimiento de datos en la hoja Pedidos (diseño corregido)

**Estado: propuesta sin activar ni desplegar.**

## Decisión corregida
NO crear una pestaña `Consentimientos`. La hoja existente `Pedidos` ya cuenta, según confirmó la responsable del proyecto, con una columna **«Fecha de autorización de datos»**. Mantener sus 29 columnas y todos los registros existentes.

## Condiciones obligatorias
1. En el navegador el checkbox debe iniciar desmarcado. Si no se marca, se muestra el error y se impide enviar.
2. El Worker debe exigir `consent.accepted === true` y una versión de política aprobada; no confiar exclusivamente en el navegador.
3. Apps Script debe volver a exigir `pedido.aceptaPrivacidad === true` antes de guardar.
4. Apps Script debe registrar la **fecha y hora generadas por el servidor** en la columna exacta `Fecha de autorización de datos` al insertar un pedido válido. No utilizar una fecha que el cliente envíe como evidencia autoritativa.
5. Mantener la idempotencia por `solicitudId`: reintentos idénticos no crean más filas; reutilizar la misma clave con otros datos debe rechazarse.
6. El comprador solo debe ver una confirmación si Apps Script acredita el registro del pedido y la autorización correspondiente.

## Verificación imprescindible antes de editar Pedidos.gs
El fragmento de `appendRow` compartido contiene **29 valores**, y los últimos son:
- Índice base cero 27 / columna AB: `solicitudId`.
- Índice base cero 28 / columna AC: `fecha`.

No inferir que la columna AC corresponde a «Fecha de autorización de datos» sin verificar los **encabezados reales de la fila 1**. Si efectivamente AC tiene ese título, el valor `fecha` final ya representa una marca temporal escrita por servidor, pero debe verificarse que solo se escriba ante consentimiento estricto. Si el encabezado está en otra columna, corregir el mapeo preservando la estructura de 29 columnas.

Para versión de política, revisar los encabezados y campos existentes antes de proponer nuevos. No añadir hojas, columnas ni desplazar datos sin autorización.

## Límites conocidos
- La marca temporal indica cuándo el servidor recibió/registró el consentimiento, no prueba que se leyó una política específica.
- Una simple casilla no sustituye una política publicada ni los datos del responsable.
- No se han cambiado Apps Script, Google Sheets ni Cloudflare.
- Permanecen deshabilitados `orderEndpoint: null`, `ORDERS_ENABLED=false` y los bloqueos del servicio.

## Próximo paso
Pedir únicamente los nombres de encabezados A:AC de la pestaña `Pedidos` (sin filas con datos personales) para comprobar el mapeo y, con ellos, preparar una versión exacta de `Pedidos.gs` sin alterar la hoja.
