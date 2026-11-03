# MultyDrink — Contrato de integración de pedidos (BORRADOR, NO ACTIVO)

Estado: especificación para revisar. No es una autorización de despliegue, de conexión ni de procesamiento real de datos personales.

## Arquitectura prevista
Navegador -> Cloudflare Worker (`POST /orders`) -> Google Apps Script -> hoja privada de pedidos.
El navegador **nunca** llama directamente a Apps Script ni recibe credenciales compartidas. La validación del navegador mejora la UX, pero no constituye una barrera de seguridad.

## Solicitud actual del frontend (`src/order.js`)
- Cabecera `Content-Type: application/json`.
- Cabecera `Idempotency-Key`: UUID de intento, generado en el navegador y reutilizado cuando el resultado del mismo pedido es incierto.
- `customer`: `fullName`, `documentNumber`, `phone` (normalizado a `+57` seguido de diez dígitos), `department`, `city`, `address`, `neighborhood`, `unit`, `instructions`, `email`.
- `items`: arreglo con un objeto `{ packageId, quantity }`; códigos públicos actuales: `individual`, `familiar`.
- `paymentMethod`: `cash_on_delivery`.
- `consent`: `{ accepted: true, policyVersion }` (la versión solo debe configurarse cuando la política real esté aprobada).
- **No** se envían importes calculados en el cliente ni identificadores de Google Sheets.

## Validación obligatoria en el servidor (pendiente de implementar/verificar)
- Analizar JSON con tamaño limitado, validar tipos y rechazar campos inesperados o inválidos.
- Nombre y apellido, documento, celular colombiano de 10 dígitos que comience por 3, departamento, ciudad, dirección y barrio requeridos.
- Validar longitud y formato; validar email opcional si está presente; limitar instrucciones y unidad opcionales.
- Producto permitido y cantidad entera en rango autorizado; el precio, el envío y el total se recalculan usando catálogo **del servidor**.
- Comprobar consentimiento explícito y versión aprobada de la política; el cliente no puede inventar legitimidad.
- Gestionar idempotencia de extremo a extremo por solicitud (la clave HTTP debe llegar a la función de registro como identificador de solicitud); conservar la misma respuesta para reintentos del mismo contenido y rechazar reutilización con contenidos distintos.
- Mantener Rate Limiting; antes de habilitar recepción real, verificar Turnstile **en el Worker** contra la clave secreta del servidor, además de restricciones de origen/CORS y controles contra abuso. CORS no es autenticación.
- No registrar PII ni credenciales en logs; limitar el acceso a la hoja y definir retención adecuada.

## Adaptación prevista Worker -> Apps Script (REQUIERE CONFIRMAR CÓDIGO REAL)
Los nombres del formulario frontend son ingleses. El Apps Script previo usa campos en español como `nombre`, `documento`, `celular`, `presentacion`, `cantidad` y `solicitudId`. El Worker deberá traducir y validar cada campo, preservar el identificador de reintento y proteger la llamada con el secreto **solo del servidor**.
**No asumir** que esta lista es el contrato completo. Antes de editar Worker o Apps Script, comparar versiones actuales y acordar campos obligatorios, valores de `presentacion`, domicilio completo y resultado de registro.

## Respuesta hacia el navegador (contrato actual esperado)
Solo si el almacenamiento fue confirmado por Apps Script, el Worker debe responder HTTP 2xx JSON:
```json
{"status":"received","orderId":"MD-EXAMPLE","total":110000,"currency":"COP"}
```
El `total` debe ser un entero seguro, no negativo y calculado por el servidor; `orderId` debe proceder del registro persistido, nunca inventarse.
No mostrar confirmación para fallos HTTP ni JSON incompleto.
- `400`: datos rechazados; mostrar corrección sin exponer secretos.
- `429`: demasiados intentos.
- `503`: pedidos no disponibles.
- `5xx`, respuestas malformadas o problemas de red: estado incierto; reintentar con la **misma** clave para evitar duplicados, sin crear un segundo pedido.
Si Apps Script responde `{ok:true,numero:...}`, el Worker deberá convertirlo **solo tras verificar registro exitoso y total autorizado**.

## Estado de seguridad al crear este documento
`src/config.js` conserva `orderEndpoint: null`; el navegador no envía pedidos reales.
Según las comprobaciones previas, Cloudflare mantiene `ORDERS_ENABLED=false` y un bloqueo explícito de `POST /orders`. No se modificó ni se volvió a verificar el Worker en esta revisión.
No activar envíos ni desplegar hasta revisar código real del Worker y Apps Script, permisos, dominio/Turnstile, requisitos comerciales y pruebas aisladas con datos ficticios.


## Política aprobada — integración local del 3 de noviembre de 2026

- Fuente única: `approvedPrivacyPolicy` en `src/legal-config.js`. Texto aprobado por el cliente, responsable Dora Patricia Ortiz / MultyDrink Colombia. No constituye una auditoría de tratamiento ni una revisión jurídica.
- Versión exacta del documento y de `consent.policyVersion`: **`2026-11-03`**. El formulario y el pie abren el mismo diálogo aprobado. La aceptación no incluye publicidad.
- Configuración manual requerida antes de activar pedidos: en el Worker, definir/verificar **`POLICY_VERSION=2026-11-03`** y comprobar que el contrato rechace versiones distintas y consentimiento no aceptado. Esta variable es pública, no una credencial. No se configuró ni desplegó en esta intervención.
- La copia local `worker-respaldo.txt` no contiene validación de `consent.policyVersion` ni referencia a `POLICY_VERSION`; no acredita el estado remoto actual. Si el Worker desplegado tampoco valida la versión, configurar la variable por sí solo no basta: su validación requiere una tarea posterior autorizada.
- Se conservan `orderEndpoint: null`, identidad comercial de checkout pendiente y guardias existentes. No se modifican `ORDERS_ENABLED`, secretos, Turnstile, Apps Script ni Sheets. No se realizó ninguna solicitud real de pedido.
- Privacidad, Envíos y Entregas, y Términos y Condiciones de Compra cuentan con contenido aprobado integrado localmente. Devoluciones y Contacto conservan sus borradores locales y requieren revisión antes del lanzamiento. Deben verificarse los controles operativos declarados (acceso, proveedores, conservación y atención de derechos).
- El dominio de la política reproduce exactamente el aprobado: https://multydrincolombia.com. No se cambiaron canonical, SEO ni configuración de dominio.


## Preparación de publicación — términos aprobados

Los tres documentos aprobados reutilizan los modales y enlaces del footer. Los términos no incorporan NIT ni nuevos procesos; el número de pedido sigue dependiendo de la respuesta real del servicio existente. Esta integración no activa ni certifica la operación en producción.

Pendientes técnicos antes de habilitar pedidos, sujetos a autorización:

- Confirmar el endpoint de pedidos y la identidad comercial de checkout, actualmente sin configurar. Conservar los bloqueos actuales hasta completar la integración.
- Verificar el contrato desplegado de Worker/Apps Script, la recepción del número real de pedido y la validación de consentimiento con `POLICY_VERSION=2026-11-03`. No se cambiaron estos servicios.
- Verificar en producción los dominios permitidos de Turnstile y CORS, y los permisos de los servicios. No se consultaron ni modificaron secretos, permisos o `ORDERS_ENABLED`.
- Confirmar que el alojamiento publique el build y los recursos actuales; comprobar los tres enlaces legales en el dominio público tras un despliegue autorizado. No se ejecutó ni verificó un despliegue real.
