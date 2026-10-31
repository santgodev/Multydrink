# MultyDrink — Endurecimiento propuesto de Pedidos.gs (NO DESPLEGADO)

**Estado:** propuesta de implementación para revisar antes de pegar en Google Apps Script. El archivo real `Pedidos.gs` vive en Google Apps Script, no en este repositorio. No ejecutar `probarRegistroPedido()` ni activar `API.gs` en esta fase.

## A. Reglas obligatorias verificadas contra el código compartido

- `solicitudId`: caracteres alfanuméricos o guion, longitud 8–80; clave de idempotencia.
- `nombre`: nombre y apellido, 5–100 caracteres; campos obligatorios no pueden ser solo espacios.
- `documento`: regla consistente con el frontend actual: 4–30 caracteres, letras/números y separadores internos simples; no convertir a número para conservar ceros iniciales.
- `celular`: diez dígitos colombianos comenzando con 3, o `+57` seguido de esos diez dígitos; normalizar en el servidor antes de comparar/guardar. Rechazar valores vacíos.
- `departamento`: obligatorio y debe pertenecer al catálogo de departamentos aprobado; `ciudad` 2–80; `direccion` 8–180; `barrio` 2–100.
- `interior` opcional (hasta 120), `referencia` opcional (hasta 300), `correo` opcional (hasta 254, formato válido).
- `presentacion`: solo `individual` o `familiar`; `cantidad`: entero de 1 a 20; precios calculados exclusivamente con `CATALOGO`.
- `aceptaPrivacidad === true` **estricto**. Falta, `false`, `1` o `"true"` = rechazo.
- Antes de habilitar, registrar versión de política aceptada y fecha de consentimiento de manera persistente, acordando cómo adaptar el esquema actual sin reutilizar arbitrariamente columnas reservadas.
- Limitación actual: el frontend permite ciertos separadores en el documento; alinear la expresión regular exacta con Apps Script antes de probar integración. Las reglas del servidor son autoritativas.

## B. Corregir la idempotencia antes de aceptar pedidos

Actualmente `registrarPedidoInterno` busca `solicitudId` en columna AB (índice 27) y devuelve inmediatamente el número anterior, **sin comprobar que los datos sean iguales**. Eso es insuficiente: una segunda solicitud con otro contenido y el mismo ID debe rechazarse.

Propuesta de comparación con las 29 columnas actuales, bajo el mismo `LockService`:

```javascript
// Dentro de registrarPedidoInterno, después de validar datos
// y recuperar el registro con la solicitudId existente:
if (existente) {
  // Indices basados en appendRow actual (base cero):
  // D 3 nombre, E 4 documento, F 5 celular, G 6 departamento,
  // H 7 ciudad, I 8 dirección, J 9 barrio, K 10 interior,
  // L 11 referencia, M 12 correo, N 13 nombre del producto,
  // O 14 cantidad, R 17 total, AB 27 solicitudId.
  const quitarPrefijoHoja = value => String(value == null ? '' : value).replace(/^'/, '').trim();
  const camposComparados = [
    [3, pedido.nombre], [4, pedido.documento],
    [5, pedido.celular], [6, pedido.departamento],
    [7, pedido.ciudad], [8, pedido.direccion],
    [9, pedido.barrio], [10, pedido.interior || ''],
    [11, pedido.referencia || ''], [12, pedido.correo || '']
  ];
  const iguales = camposComparados.every(([indice, value]) =>
    quitarPrefijoHoja(existente[indice]) === String(value).trim()
  ) &&
    quitarPrefijoHoja(existente[13]) === producto.nombre &&
    Number(existente[14]) === cantidad &&
    Number(existente[17]) === producto.precio * cantidad;
  if (!iguales) {
    throw new Error('Identificador de solicitud reutilizado con datos diferentes');
  }
  return { ok: true, numero: existente[0] };
}
```

**Revisión obligatoria antes de usar:** esta comparación supone que los datos ya fueron normalizados de modo idéntico al guardarlos, especialmente celular, documento y espacios. Para registros históricos, comprobar formato real de columna F y de campos con prefijo protector de fórmulas. Además, la versión de privacidad no está almacenada entre las columnas comparadas: antes de activar se debe resolver esa laguna y decidir una estrategia de idempotencia de petición completa.

## C. Regla central de consentimiento

```javascript
if (pedido.aceptaPrivacidad !== true) {
  throw new Error('Falta autorización de tratamiento de datos');
}
```

Debe validarse en el **Worker y de nuevo en Apps Script**. No basta con el `required` del checkbox ni con un valor enviado desde el cliente. La política aprobada debe estar disponible antes de aceptar el consentimiento.

## D. Pruebas aisladas (sin escribir en la hoja)

Antes de aplicar modificaciones a `Pedidos.gs`, crear pruebas unitarias para la **función de validación pura**, sin llamar a `registrarPedidoInterno`, que sí hace `appendRow`.

Casos mínimos:
- `aceptaPrivacidad`: ausente, falso y cadena `"true"` rechazados; `true` aceptado.
- Celular: vacío, nueve dígitos, once dígitos, comienza en 2, y válido de diez dígitos; con prefijo `+57`.
- Campos obligatorios vacíos; documento con ceros iniciales; límites máximos y formatos.
- Cantidad 0, 21, decimal y producto desconocido.
- Reutilización del mismo `solicitudId` con contenido distinto: rechazo; reintento idéntico: mismo número de pedido sin nueva fila (ensayo con hoja de pruebas aislada, nunca con pedidos reales).
- No incluir datos personales reales en pruebas ni logs.

## E. Bloqueos que permanecen

- `src/config.js`: `orderEndpoint: null`.
- Worker: `ORDERS_ENABLED=false` y segundo retorno HTTP 503, según código compartido.
- `API.gs` responde `Pedidos no habilitados` para toda acción distinta del handshake.
- No editar los tres servicios ni ejecutar pruebas que escriban datos hasta revisar propuesta y definir versión de política, persistencia del consentimiento y estrategia completa de idempotencia.
