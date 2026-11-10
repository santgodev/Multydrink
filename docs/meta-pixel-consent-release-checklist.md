# Meta Pixel y cookies — cierre técnico previo a publicación

**Rama:** `feature/meta-pixel-multydrink`  
**Píxel:** `1615961720211982`  
**Fecha de revisión:** 10 de noviembre de 2026  
**Estado:** desarrollo; NO publicado en `main`.

## Alcance aprobado

- Aviso premium de cookies en móvil y escritorio, con texto breve y enlaces directos al apartado de cookies de la política.
- Botones Aceptar y Rechazar, con igualdad funcional de navegación y compra.
- Enlace permanente «Preferencias de cookies» en el pie de página para revisar/modificar la decisión.
- La aceptación del tratamiento de datos de pedido es distinta de la decisión sobre medición publicitaria.

## Controles implementados

1. **Carga condicionada:** el script `fbevents.js` solamente se inserta tras aceptación explícita, no al entrar al sitio.
2. **Rechazo:** no se inicializa el píxel ni se envían eventos desde el código de medición si el usuario rechaza o no ha decidido.
3. **Entornos privados:** `localhost`, loopback y rangos IPv4 privados (10/8, 172.16/12, 192.168/16), así como link-local, no activan Meta; el aviso sigue disponible para revisión visual.
4. **Consentimiento local:** se guarda la decisión (`accepted`/`rejected`), versión del aviso (`cookies-2026-11-10`) y marca temporal ISO en `localStorage`. Los datos de clientes no se almacenan ahí. Un registro ausente/inválido/desactualizado exige decidir nuevamente. Esta evidencia local **no equivale a un registro centralizado demostrable de autorización**.
5. **Eventos:** `PageView` y `ViewContent` después de aceptar; `InitiateCheckout` al abrir el formulario; `Lead` únicamente tras respuesta válida del Worker de pedidos. No hay evento de `Purchase` por ser pago contra entrega. La simulación local no registra conversiones.
6. **Revocación:** el rechazo posterior a la aceptación detiene la medición desde la aplicación y recarga la página para descargar la biblioteca de Meta de la sesión actual.

## Contrato de pedidos y política vigente

El documento web ampliado con información de Meta y cookies se identifica como `2026-11-10`, mientras el campo `consent.policyVersion` enviado en pedidos conserva temporalmente `2026-11-03`, que es el contrato del Worker previamente validado. La preferencia publicitaria usa `cookies-2026-11-10`. **Esta separación es transitoria, no acredita que el backend haya aceptado ni registrado la versión nueva del documento**. Antes del lanzamiento comercial es necesario acordar con el responsable legal la versión de la política y actualizar/verificar de forma coordinada el contrato y registro del Worker si debe registrar `2026-11-10`. No cambiar el valor de pedidos unilateralmente.

## Validaciones

- Anteriormente: 75/75 pruebas automatizadas aprobadas por la usuaria, build y smoke check correctos.
- Se añadieron pruebas nuevas (no ejecutadas aún en la máquina de la usuaria): local LAN sin píxel, persistencia fechada y versionada, invalidación de preferencias antiguas y carga de script solo después de aceptar.
- Pendiente: correr `npm test` una sola vez al terminar estos cambios.
- Pendiente: revisar en un navegador real solicitudes a `connect.facebook.net` y `facebook.com/tr` en los casos sin decisión, rechazo, aceptación y revocación. No generar pedidos de prueba reales para esto.
- Pendiente: validar en Events Manager usando entorno autorizado de prueba; la visita local privada NO emite eventos.
- Pendiente: revisión legal final de los textos y la vigencia, antes del merge a `main`.

## Fuera de alcance

No se modificaron precios, diseño aprobado de las secciones, formulario, Google Sheets, Cloudflare Worker, comprobaciones Turnstile ni publicación Hostinger.
