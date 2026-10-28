# Integración real de pedidos

El frontend incluye un límite de integración, no un backend ficticio. No se creó una ruta `/api/orders` ni un servicio remoto. `orderEndpoint` vale `null` hasta recibir un destino real.

## Configuración pública

Completar `commerce` en `src/config.js` con:

- `orderEndpoint`: endpoint real, preferiblemente HTTPS y mismo origen. Si está en otro origen, configurar CORS y permitir `Idempotency-Key`.
- `merchantName`: identidad del responsable comercial.
- `privacyPolicyUrl` y `privacyPolicyVersion`: política vigente del vendedor y versión aceptada.
- `shippingFee`: **0**, confirmado por el brief de fase 1: envío incluido en ambas ofertas. El cálculo conserva soporte de `null` para desconocido, pero no es el estado entregado. El backend debe respetar los totales aprobados y validar cobertura; no añadir recargos silenciosos.
- `shippingDescription`: alcance y condiciones de esa tarifa, cobertura y plazos confirmados.
- `sanitaryRegistration` y `sanitarySourceUrl`: configurados con NSA-0019488-2025 y documento fuente, según confirmación del usuario en fase 1. No equivalen a eficacia clínica.

Las credenciales de servicios pertenecen al servidor, nunca a este archivo público. Antes de habilitar, actualizar los textos de preguntas y condiciones comerciales con la operación real y enlazar las condiciones del vendedor.

## Solicitud

Método `POST`, tipo `application/json`. Cabecera `Idempotency-Key` con un UUID generado por el cliente. Ejemplo de contrato, con datos de prueba:

```json
{
  "customer": {
    "fullName": "Persona de Prueba",
    "phone": "+573001234567",
    "department": "Antioquia",
    "city": "Medellín",
    "address": "Dirección de prueba",
    "instructions": ""
  },
  "items": [{ "packageId": "familiar", "quantity": 1 }],
  "paymentMethod": "cash_on_delivery",
  "consent": { "accepted": true, "policyVersion": "VERSION_REAL" }
}
```

El cliente envía IDs y cantidad, nunca un precio confiable. El servidor debe validar campos, paquete, cantidad, tarifa/cobertura, disponibilidad y consentimiento; recalcular los valores desde su catálogo y persistir el pedido y la clave de idempotencia de forma atómica. Aplicar controles contra abuso y evitar registrar datos personales en logs. El acuse de recibo solo debe emitirse después de guardar durablemente la solicitud.

## Respuesta confirmada

```json
{
  "status": "received",
  "orderId": "IDENTIFICADOR_REAL",
  "currency": "COP",
  "total": 425000
}
```

`total` debe ser entero no negativo y el valor autoritativo confirmado, incluyendo el envío aplicable. Una respuesta `200` sin estos campos no confirma nada. La interfaz usa `textContent` para el identificador y nunca interpreta HTML del servidor.

## Errores e idempotencia

- Validación: devolver `400` o `422`. El frontend conserva los datos y permite corregirlos.
- Límite de solicitudes: `429`.
- Solicitud todavía procesándose: `409`; reintentar con la misma clave.
- Error del servicio: `5xx`. No presentar éxito.
- Timeout de 15 segundos, respuesta malformada o pérdida de red: resultado incierto. Conservar la clave y reintentar exactamente los mismos datos.
- Mismo UUID y mismo payload: devolver el mismo recibo, sin volver a crear pedido.
- Mismo UUID y distinto payload: rechazar. Las claves de intentos rechazados por validación no deben crear pedidos.

La prevención del cliente cubre envíos concurrentes y reintentos dentro de la misma instancia de página. El backend debe cubrir concurrencia entre procesos. Recargar o abrir otra pestaña no conserva la clave: no se persisten datos personales en el navegador. Tras una respuesta incierta el cliente bloquea cambios en el payload al reintentar y recomienda contactar al vendedor.

## Pendiente para operar

Servicio real, almacenamiento, gestión y confirmación logística, identidad/contacto del vendedor, condiciones legales, cobertura y tiempos. El envío incluido ya está confirmado. La configuración no sustituye esos servicios.

La fase 2 podrá usar una API segura y Supabase/PostgreSQL para catálogo autoritativo, pedidos, detalle de cantidades, consentimiento e idempotencia. Requiere autenticación del administrador, permisos mínimos/RLS según arquitectura, claves privilegiadas exclusivamente en servidor, controles de abuso, registro de estado y notificaciones operativas. No se configuró ninguno de estos servicios en fase 1.

Las reseñas futuras requieren un pedido elegible, vínculo verificable, permiso de publicación y moderación. El frontend exige aprobación, fuente, `verifiedOrderId` y `verificationReference`; estos campos públicos no reemplazan la verificación real del servidor. Nunca incluir información privada del cliente o evidencia sensible en los recursos públicos.
