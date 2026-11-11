# Atribución de pedidos: solo Origen — preparación, no publicada

Fecha: 10 de noviembre de 2026. Decisión: **una columna `Origen`**, sin `Campaña`, sin acceso a Ads Manager y sin modificar la interfaz.

## Estado del alcance

- Rama aislada: `feature/order-origin-only`. **No fusionar en `main` ni publicar todavía.**
- Frontend: `src/order-origin.js` clasifica `utm_source` (si existe), en su defecto el dominio de `document.referrer`, y en su defecto `Directo / desconocido`. Clasificación: Facebook, Instagram, WhatsApp, TikTok, Google, Otro sitio web u Otro enlace identificado. No retiene ni transmite URL, parámetros originales, identificadores `fbclid`, correo ni otras PII para atribución.
- El origen se calcula al inicializar la página; se añade como campo opcional `origin` al JSON del pedido. No depende del consentimiento de Meta Pixel, no usa cookies ni almacenamiento persistente.
- Worker: valida el valor con una lista cerrada, usa `Directo / desconocido` si falta o es inválido, y lo pasa a Apps Script como `pedido.origen`. No cambia `POLICY_VERSION`, Turnstile, CORS, precios, idempotencia ni las reglas de aprobación del pedido.
- Pruebas nuevas solo sobre la clasificación y el payload. **Todavía no ejecutadas en el equipo local.**
- Referrer/UTM son señales aproximadas, no garantizan atribución de cada visita; los navegadores y aplicaciones pueden omitir el referente.

## Integración pendiente con Google Apps Script

El Worker actual envía datos a `registrarPedido` usando `pedido`. La fuente editable del `Pedidos.gs` desplegado **no está en el repositorio** y no se debe inventar ni sobrescribir. Antes de cambiar el Apps Script, revisar la función real de registro y el arreglo de la fila.

La hoja evidenciada dispone de 29 columnas (A:AC); el identificador de solicitud se encuentra en AB y la marca temporal en AC. La propuesta es **agregar `Origen` al final, columna AD (30), sin insertar columnas en medio**.

Cambios mínimos requeridos en `Pedidos.gs`, según la implementación real:
1. Mantener intactos los 29 valores y su orden actual, incluyendo idempotencia en AB y marca temporal en AC.
2. Añadir a la fila únicamente un 30.º valor, normalizado a las etiquetas aprobadas; si `pedido.origen` falta, usar `Directo / desconocido`.
3. Añadir encabezado `Origen` en AD1 y comprobar que ningún rango fijo, comparación de idempotencia o fórmula se amplíe incorrectamente. No desplazar ni eliminar filas históricas.
4. Coordinar despliegue Apps Script primero; después Worker y web. Mantener compatibilidad con pedidos antiguos que no envían `origin`.
5. Una sola prueba de pedido autorizada con `utm_source=instagram`, confirmar ID/total/Origen en Sheets y limpiar solo la fila ficticia.

## Precauciones

- Los cambios son **preparatorios e incompletos** hasta conectar el Apps Script. No fusionar ni desplegar la rama.
- No ejecutar llamadas reales de pedidos para probar esta implementación antes de coordinar el esquema de la hoja.
- Las validaciones de Meta Pixel, checkout, Turnstile y reparación del HTTP 400 ya están documentadas en `docs/meta-pixel-production-validation-2026-11-10.md`; no repetirlas.
