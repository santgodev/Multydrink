# MultyDrink — Estado maestro del proyecto y registro de decisiones

**Fecha de corte:** 22 de noviembre de 2026 (hora de Colombia).  
**Tipo:** documento de continuidad operativa para personas, Codex y nuevos chats.  
**Estado:** actualización comercial de kits rituales publicada y validada en los escenarios probados; mejora de alertas por correo pendiente de autorización.  
**Fuente:** historial de trabajo y resultados/salidas/capturas compartidos en el proyecto. No representa una auditoría independiente en vivo de todos los servicios.

> **Regla para futuras sesiones:** leer este documento antes de cualquier intervención sobre MultyDrink. No volver a preguntar configuraciones ya confirmadas, repetir pruebas aprobadas o inspeccionar todo el repositorio por costumbre. Verificar solamente cuando exista cambio en el componente afectado, evidencia de fallo o necesidad concreta. No afirmar que una funcionalidad está desplegada por el solo hecho de estar guardada en el editor. La ejecución de acciones remotas requiere autorización expresa.

## 1. Proyecto, repositorio y publicación

- **Proyecto:** MultyDrink Colombia; sitio público: `https://multydrincolombia.com/`.
- **Repositorio de producción:** `santgodev/Multydrink`.
- **Rama de producción:** `main`.
- **Despliegue web:** Hostinger está configurado para actualizar automáticamente el sitio cuando se actualiza `main`; su flujo existente construye con `npm run build` y publica el directorio `dist/`. **Esta conexión ya fue establecida y confirmada por la responsable; no solicitar una nueva revisión de hPanel sin motivo concreto.**
- **Ruta local de trabajo (equipo Windows):** `C:\Users\PROBOOK\Documents\Desarrollo\MultyDrink`.
- **Rama de implementación de los kits al preparar entrega:** `design/light-palette-multydrink`.
- **Commit final del frontend enviado a `main`:** `263792793173f0830eadce15ddfa83f593f4e3c9`. Push confirmado por Codex, sin conflictos ni force-push. La página pública mostró posteriormente el catálogo nuevo y permitió registrar pedidos.
- **Archivos incluidos en ese commit:** `assets/multydrink-kit-ritual-2-cajas.png`, `index.html`, `scripts/build.mjs`, `src/app.js`, `src/components.js`, `src/config.js`, `src/editorial.js`, `src/order.js`, `src/phase-one.css`, `src/seo.js`.
- **No incluidos en ese commit:** cambios locales del Worker, documentación del contrato, archivos de pruebas y temporales (se conservaron fuera del push). No asumir que su exclusión significa que esos cambios no se desplegaron por separado: el Worker **sí** se actualizó manualmente en Cloudflare.

## 2. Arquitectura real de pedidos

**Flujo:** sitio web → Cloudflare Worker `multydrink-orders-api` (`POST /orders`) → Google Apps Script **«MultyDrink - Gestión de pedidos API»** → pestaña `Pedidos` de Google Sheets.

- La página envía SKU y cantidad, datos requeridos de entrega, consentimiento, origen, Turnstile y una clave de idempotencia. **No define el precio autoritativo.**
- El Worker valida y calcula los precios desde su propio catálogo; protege la API y compara la confirmación de Apps Script antes de confirmar al navegador.
- Apps Script autentica la solicitud con `APPS_SCRIPT_SHARED_SECRET` guardado en propiedades privadas, valida el pedido contra su catálogo, calcula los importes y registra la fila en Sheets.
- El checkout y recibo preservan total validado en servidor; pago contra entrega, envío incluido, sin anticipos.
- **No cambiar la arquitectura, las columnas, los secretos ni las reglas de seguridad sin necesidad explícita.**

### Contrato de catálogo actual `ritual-v1`

| SKU de pedido / `pedido.presentacion` | Nombre visible | Cajas por kit | Sobres por kit | Precio COP por kit |
| --- | --- | ---: | ---: | ---: |
| `ritual-inicio` | Kit Ritual de Inicio | 2 | 42 | 220000 |
| `ritual-transformacion` | Kit Ritual de Transformación | 6 | 126 | 425000 |

- `cantidad` significa **número de kits completos**, no número de cajas; rango autorizado en el Apps Script compartido: 1–20.
- Ejemplos verificados/calculados: 2 kits Inicio = 4 cajas, 84 sobres, $440.000; 2 kits Transformación = 12 cajas, 252 sobres, $850.000.
- `individual`/`familiar` pueden persistir **solo como claves internas de selección/tracking frontend**; **no** son los SKU válidos del nuevo contrato de pedidos.
- Ahorro aprobado para Transformación: **$235.000 frente a 3 kits de inicio** (3 × 220000 − 425000). Es una comparación, **no un precio anterior histórico**; no mostrar $660.000 tachado como si fuera antiguo precio comprobado.
- Precio por sobre mostrado: Inicio $5.238; Transformación $3.373, valores redondeados.
- Respuesta que el Worker nuevo espera de Apps Script para registro confirmado: `{ ok: true, numero: "MD-...", total: <importe numérico COP>, catalogVersion: "ritual-v1" }`. En reintentos, devolver información del pedido persistido, sin recalcular pedidos históricos con el catálogo actual.
- **Preservar idempotencia**: misma solicitud repetida con igual ID y contenido debe recuperar el pedido previo; mismo ID con datos distintos debe ser rechazado.

## 3. Estado exacto de versiones publicadas

| Componente | Versión / evidencia | Estado al corte |
| --- | --- | --- |
| Google Apps Script | Implementación existente **versión 4**, publicada 22/11/2026 a las 20:53; URL de despliegue conservada | **Publicado**. Catálogo/contrato `ritual-v1`; pruebas internas aprobadas |
| Cloudflare Worker `multydrink-orders-api` | Versión **`e1eda091`**, desplegada manualmente; reemplaza `0f5b1312` | **Publicado**; reporte de versión Ready y transacciones de prueba completadas |
| Frontend Hostinger | Git commit **`263792793173f0830eadce15ddfa83f593f4e3c9`** en `main` | **Publicado en la práctica**, comprobado en dominio público al hacer pruebas de pedidos |
| Google Sheets | Hoja existente `Pedidos`, columna `AD = Origen` | **En funcionamiento**, recibió los dos nuevos kits |
| Avisos por correo | Código de `Pedidos.gs` con aviso preparado/guardado en editor y propiedad `PEDIDOS_ALERT_EMAIL` | **NO desplegados/NO habilitados**; falta autorización OAuth de la propietaria y pruebas posteriores |

**Variables de Worker observadas sin necesidad de cambio en esta migración:** `ORDERS_ENABLED=true`, `DEV_TEST_MODE=false`, `POLICY_VERSION=2026-11-10`, `DEV_POLICY_VERSION=dev-test-v1`; `APPS_SCRIPT_URL`, `APPS_SCRIPT_SHARED_SECRET`, `DEV_TEST_TOKEN`, `TURNSTILE_SECRET_KEY` configurados como secretos. La responsable pidió explícitamente **no pausar `ORDERS_ENABLED`** en la migración. No exponer ni copiar los valores de secretos.

## 4. Pruebas aprobadas: no repetirlas por defecto

### 4.1 Validación local de la migración comercial

- **43 pruebas focalizadas aprobadas, 0 fallidas** según Codex, con los tests `tests/order.test.mjs`, `tests/interface.test.mjs`, `tests/ritual-contract.test.mjs` y servicios simulados. Cubrieron selección desde HOME/ofertas inferiores, banner, checkout, SKU nuevos, cálculo de cantidades y totales, compatibilidad de recibos, rechazo de SKU anteriores, y controles del checkout.
- Revisión visual reportada por Codex a **320, 390, 768 y 1440 px**: sin desbordamiento horizontal o recortes reportados en elementos intervenidos, imágenes completas, CTA visibles y sincronización entre opciones.
- **Build de producción aprobado**, con PNG de dos cajas presente en `dist/` e información JSON-LD de ambos kits/precios correcta.
- Inspección visual de escritorio basada también en capturas aportadas por la responsable; la revisión de uso en celular físico quedó recomendada como comprobación puntual, no como suite obligatoria.
- Validación posterior focalizada del resumen de checkout: fila potencialmente confusa de ahorro retirada; subtotales, envío y totales correctos para 1 y 2 kits; cinco pruebas focalizadas aprobadas según Codex. Las ofertas mantienen el mensaje de ahorro fuera del desglose económico.

### 4.2 Apps Script y conexión existentes

- `probarValidacionesSinEscritura`: ejecutada en Apps Script, mostró «Pruebas de validación sin escritura: correctas» y ejecución completada.
- `probarSeguridadAPI`: ejecutada en Apps Script, mostró autenticación, consentimiento, ambos kits y contrato `ritual-v1` correctos; **sin escrituras en Google Sheets**.
- Se preservó `Código.gs` (`verificarConexion`), `API.gs` (`doPost`, autenticación, consentimiento y respuestas), y `Pedidos.gs` (catálogo, registro, idempotencia, seguridad de celdas y Origen). No reconstruir estos componentes.

### 4.3 Pruebas reales de producción — migración cerrada

| Pedido de prueba | Fecha (hora Colombia) | Kit | Cantidad de kits | Sobres | Precio unitario | Total | Evidencia |
| --- | --- | --- | ---: | ---: | ---: | ---: | --- |
| **MD-3D9A4B39** | 22/11/2026 21:20:28 | Ritual de Inicio | 1 | 42 | $220.000 | **$220.000** | Recibo web y registro en Sheets coinciden |
| **MD-753042E1** | 22/11/2026 21:21:58 | Ritual de Transformación | 2 | 252 | $425.000 | **$850.000** | Recibo web y registro en Sheets coinciden |

- Ambos registros llegaron con estado `NUEVO` y `Origen = Directo / desconocido`, según los datos compartidos; Google Sheets registró nombre de kit, cantidad, sobres, precio y total.
- Evidencia de integración **extremo a extremo de los escenarios ejecutados**; **no** representa una auditoría independiente de todas las posibles condiciones de seguridad, carga o recuperación.
- Estos registros eran **pedidos de prueba**. Se recomendó identificarlos y limpiarlos para evitar despachos. **No consta confirmación de que ya se hayan eliminado.**
- **No volver a enviar pedidos de prueba de estos mismos escenarios** a menos que se modifique su recorrido o aparezca un fallo real.

### 4.4 Validaciones anteriores que se conservan

- Durante noviembre ya se había probado la recepción de pedidos de la configuración anterior; el error inicial HTTP 400 de Cloudflare se resolvió al promover la versión correcta de Worker/política.
- Se habían validado eventos del Meta Pixel: `PageView`, `ViewContent`, `InitiateCheckout`, `Lead`, y pruebas de pedidos anteriores; no repetir sin cambios.
- Regla de consentimiento: **al rechazar cookies no debe cargarse Pixel**; los pedidos deben seguir funcionando. Revisar solo si se cambia la lógica de consentimiento/píxel. En anteriores pruebas se documentó ausencia de solicitudes a Facebook tras rechazo; no atribuir la verificación a la migración ritual si no fue repetida.

## 5. Diseño, UX y contenido aprobados

### Ofertas comerciales

- Sección de ofertas: rótulo `ELIGE TU PRESENTACIÓN`, encabezado en dos frases **«Empieza tu ritual hoy.» / «Pagas cuando lo tengas en tus manos.»**.
- **Kit Ritual de Inicio:** tarjeta clara con oliva, imagen original de **dos cajas**, 2 cajas · 42 sobres · 30 días de ritual; beneficios «2 cajas de MultyDrink», «5 ingredientes de origen natural», guía «Protocolo de 5 minutos para desconectarte de la pantalla», y «Envío prioritario gratis y pago contra entrega»; $220.000 COP; CTA verde «Quiero mi Ritual de Inicio».
- **Kit Ritual de Transformación:** tarjeta oliva oscura, seis cajas, 6 cajas · 126 sobres · 90 días de ritual; badge verde biche flotante `RECOMENDADO · MAYOR AHORRO`; añade acompañamiento por WhatsApp exclusivo de este kit; $425.000 COP; ahorro $235.000 frente a 3 kits de inicio; CTA verde «Quiero el Ritual de Transformación».
- Se eliminó la sección redundante **«Esto es todo lo que recibes»** y su botón duplicado. Después de las tarjetas se conserva la franja de confianza: Envío incluido / Pago contra entrega / Origen botánico / Notificación sanitaria INVIMA.
- Home: «Kit Ritual de Inicio» reemplazó «Caja individual» y «Kit Ritual de Transformación» reemplazó «Pack familiar», sin rediseñar tarjetas aprobadas. Badge `MEJOR VALOR`, ahorro comparativo correcto.
- Banner flotante: diseño preservado; refleja **selección efectiva de kit**, imagen, nombre, cantidades y precio. **No seleccionar por solo desplazarse.**
- Checkout: selector de kits, cantidad en kits completos, desglose `Subtotal de productos`, `Envío: Incluido`, `Total a pagar`; eliminar fila de «Ahorro frente a 3 kits de inicio» del desglose para no generar sensación de cargo adicional. Confirmación de pedido con número `MD-...` y total a pagar al recibir.
- Pago contra entrega y envío incluido son mensajes aprobados. No inventar promesas de envío, beneficios clínicos o descuentos históricos.

### Diseño general del sitio / decisiones históricas relevantes

- Estética clara/editorial/premium con paleta crema, oliva, verde biche, tarjetas limpias y alto contraste. Inspiración de referencia Bloom Nutrition/Focusing utilizada **como intención y composición**, no como copia literal del copy.
- Hero, galería, testimonios/videos y bloques existentes: respetar activos aprobados y la estructura actual; cambios nuevos solo por instrucción específica.
- Sección emocional: `TE HA PASADO QUE…`, tres tarjetas aprobadas, con el mensaje «Notas pesadez después de algunas comidas». También sección de mensaje «Tu cuerpo no está fallando. Es el ritmo del día a día.» en la implementación revisada.
- Investigación científica cronología aprobada: **2011 → 2014 → 2021**; documento consolidado `investigaciones-multydrink.pdf`; conservar enlaces «Consultar publicación».
- Galería previamente aprobada con 8 imágenes, visor 1:1 sin recortes. Mantener activos originales de empaque; sobre contiene bebida líquida ámbar, no polvo.
- Se retiraron enlaces de header que no aportaban, y sección WhatsApp de contacto fue situada después de preguntas frecuentes; botón WhatsApp flotante abajo a la derecha.
- **Pendiente visual conocido:** foto de **dos cajas** aprobada **provisionalmente** como activo funcional; no alcanza aún el acabado fotográfico premium deseado. Rediseñar **solo cuando se retome ese trabajo**, sin alterar empaque, tarjetas o lógica.
- **Pendiente UX específico a revisar cuando proceda:** en una revisión anterior, el botón flotante de WhatsApp podía superponerse a CTA a 320 px. No afirmar que sigue fallando: hacer comprobación puntual en móvil real si se retoma la UX móvil.

## 6. SEO, búsquedas y contenidos

### Cerrado en la migración ritual

- `index.html`: metadescripción y descripción Twitter actualizadas a los kits.
- `src/seo.js`: descripción de producto basada en catálogo actual.
- JSON-LD del build mostró ambos kits y precios correspondientes.
- Estos puntos fueron comprobados localmente en el build y publicados mediante commit del frontend. **No reabrir ni reescribir sin hallazgo concreto.**

### Próxima fase autorizada por la responsable

**Después de cerrar/documentar el estado, seguir con revisión estratégica SEO.** Alcance recomendado en fase de diagnóstico, **sin editar ni desplegar antes de revisar hallazgos**:

1. Partir del estudio de palabras clave y las validaciones SEO **ya realizadas**; recuperarlas y citarlas, evitando rehacer investigación aprobada.
2. Revisar indexación efectiva, títulos/metadescripciones y coherencia de intención de búsqueda para kits rituales, contenido de producto, FAQ y datos estructurados, separando SEO técnico de copy comercial.
3. Comprobar enlaces canónicos, sitemap, robots y metadata social solo si hay sospecha concreta de regresión o si la etapa SEO lo requiere.
4. Contrastar contenido con evidencia disponible; evitar promesas médicas no demostradas y afirmaciones absolutas sobre beneficios/ingredientes/INVIMA.
5. Proponer lista priorizada por impacto y esfuerzo, acordar alcance antes de editar y ejecutar una validación final concentrada al cierre.

**Nota:** No se considera terminada una auditoría nueva de SEO por la sola actualización del metadato y JSON-LD; esto es un pendiente distinto.

## 7. Meta Pixel, cookies y medición

- Integración existente del Meta Pixel previamente probada; ID usado en el trabajo del proyecto: `1615961720211982`.
- Eventos implementados/probados históricamente: `PageView`, `ViewContent`, `InitiateCheckout`, `Lead`.
- La columna de Google Sheets acordada es **solo `Origen`**; se descartó agregar «Campaña». La gestión de campañas corresponde al cliente, no a la persona que mantiene el sitio.
- **No duplicar eventos** ni hacer que Pixel se active tras rechazar cookies. No tocar tracking durante tareas de imágenes o SEO salvo autorización y necesidad real.

## 8. Alertas de nuevos pedidos por correo — PENDIENTE, NO ACTIVO

- **Objetivo acordado:** un correo por pedido **nuevo**, después de que Google Sheets confirme el registro; no incluir nombre, teléfono, documento, dirección ni correo del comprador.
- **Destinatario:** misma cuenta que administra/ejecuta Google Apps Script; propiedad privada `PEDIDOS_ALERT_EMAIL` **agregada por la usuaria**.
- **Contenido propuesto:** número `MD-...`, nombre del kit, cantidad de kits, cajas/sobres totales, valor total COP, modalidad de pago contra entrega; acceso a datos de entrega únicamente en Sheets.
- **Código:** versión de `Pedidos.gs` con notificaciones entregada, copiada/guardada en editor de Apps Script. `probarConfiguracionAvisosSinEnvio` visible en editor. **No se ha confirmado ejecución satisfactoria de esa función**: apareció solicitud de permisos; la responsable la cerró para esperar a la propietaria de la cuenta.
- **Bloqueo:** falta autorización OAuth de Google para `MailApp` por la propietaria. **No autorizar ni desplegar hasta contar con el acceso necesario**.
- **Producción actual:** sigue ejecutando versión 4 que registra pedidos; la función de correo guardada en el editor **no implica que esté desplegada**.
- **Cómo retomar sin rehacer pasos:** en Apps Script → editor → desplegable de funciones → `probarConfiguracionAvisosSinEnvio` → Ejecutar → «Revisar permisos» cuando propietaria esté disponible → verificar el registro de prueba de configuración → publicar nueva versión de la implementación **existente** manteniendo URL → prueba controlada de un pedido nuevo y de un reintento sin duplicación del correo. No alterar Google Sheets ni Worker salvo necesidad demostrada.
- **Diseño de fallo:** si enviar email falla, el pedido sigue confirmado. Reintentos con mismo `solicitudId` no deben crear nuevas filas ni correos repetidos. No se implementó un reenvío automático garantizado para alertas fallidas; no prometerlo.
- **Cuota MailApp de Google:** depende de tipo de cuenta y políticas vigentes; consultar documentación oficial cuando se vaya a activar. No anunciar costos por correo inexistentes ni prometer notificación instantánea sonora: depende del cliente Gmail/dispositivo.

## 9. Pendientes ordenados por prioridad

1. **[EN ESPERA]** Alertas email: autorización de cuenta para `MailApp`, ejecución de prueba de configuración y despliegue aislado; **no bloquear otros trabajos**.
2. **[PRÓXIMO]** SEO: revisión estratégica reutilizando estudio previo, análisis de intención de búsqueda y revisión técnica focalizada, antes de hacer cambios.
3. **[VISUAL FUTURO]** Mejorar solo la imagen de las dos cajas para nivel premium. Arte actual es funcional y provisional; no tocar oferta ni checkout.
4. **[PUNTUAL]** Revisar en celular físico la relación entre botón WhatsApp flotante y CTA en ancho pequeño, si se presenta el problema.
5. **[CONTENIDO]** Evaluar videos reales / prueba social y su presentación, según material y aprobación del cliente.
6. **[OPERATIVO]** Confirmar si los pedidos de prueba `MD-3D9A4B39` y `MD-753042E1` fueron identificados/limpiados; no modificar pedidos reales ni columnas. Mantener evidencia de las pruebas.
7. **[MANTENIMIENTO]** Mantener este documento al día después de nuevas decisiones, commits, despliegues y pruebas, en lugar de documentar nuevamente todo el proyecto.

## 10. Reglas de intervención para Codex y asistentes

- **No repetir** auditorías del repo, hPanel/Hostinger, configuraciones de Cloudflare/Apps Script, suites de 43 pruebas, validaciones pixel o pedidos ya aprobados, a menos que haya evidencia de cambio relevante o fallo.
- Al iniciar cada tarea: leer el estado maestro y revisar **solo los archivos afectados**. Reportar archivo(s), alcance, validación focalizada y estado de publicación; evitar exploración y uso de tokens innecesarios.
- El cambio de imagen o estilo **no autoriza** tocar precios, Worker, pedidos, consentimiento, SEO o Meta Pixel.
- Reutilizar componentes/activos existentes. No copiar literalmente claims de marcas de referencia. Mantener empaque auténtico.
- No ejecutar builds o suites completas por cada microajuste; usar comprobaciones focalizadas y validación final agrupada cuando proceda.
- No hacer commit, push, merge, despliegue ni cambiar servicios remotos sin instrucción explícita de publicación.
- Para publicación web: integración aprobada a `santgodev/Multydrink:main` → Hostinger automático. No solicitar reconfiguración conocida. Recordar incluir imágenes nuevas aún sin seguimiento en Git.
- Para Apps Script: `Código.gs`, `Pedidos.gs`, `API.gs` son partes de un **sistema vigente**, no borradores; preferencia de la responsable: recibir **archivo completo** cuando deba sustituirse, no fragmentos desconectados. No inventar ubicación local de copias.
- Distinguir claramente: **preparado / guardado en editor / pruebas locales aprobadas / versión desplegada / probado en producción**.
- Datos personales: en documentación y capturas de pruebas, usar únicamente identificadores y datos comerciales; **no copiar PII de la hoja ni secretos** al repositorio o a documentación compartible.

## 11. Referencias de trabajo conocidas

- `docs/checkout-integration-contract.md`: especificación de migración y respuesta `ritual-v1`. **Precaución:** incluye secciones históricas marcadas como antiguas; la versión actual publicada se determina por las evidencias más recientes de este documento.
- `cloudflare/multydrink-orders-worker.js`: candidato de Worker `ritual-v1` que se publicó por separado en el panel Cloudflare (versión `e1eda091`); podía conservar cambios locales fuera del commit web.
- `src/config.js`, `src/order.js`, `src/app.js`, `src/components.js`, `src/editorial.js`: frontend y sincronización de presentación/compra.
- `src/seo.js`, `index.html`, `scripts/build.mjs`: SEO y compilación de sitio.
- `assets/multydrink-kit-ritual-2-cajas.png`: imagen provisional de dos cajas incluida en entrega web.
- Apps Script remoto **«MultyDrink - Gestión de pedidos API»**, archivos `Código.gs`, `Pedidos.gs`, `API.gs`.
- Google Sheets `Pedidos`: columna **AB = ID de solicitud**, **AC = Fecha de autorización de datos**, **AD = Origen**. Mantener orden actual.

## 12. Registro resumido de hitos

| Fecha | Hito |
| --- | --- |
| Octubre / inicio de noviembre 2026 | Se construyó la arquitectura web → Worker → Apps Script → Google Sheets y las protecciones de pedidos; se acordó la estructura visual y editorial del sitio. |
| 8–10 nov 2026 | Recuperación/publicación del sitio y validaciones previas de pedidos, cookies y Pixel; se solucionó un error HTTP 400 del Worker. |
| 11 nov 2026 | Incorporación/confirmación operativa de columna `Origen` en Google Sheets; no agregar `Campaña`. |
| 22 nov 2026 | Nuevos kits Ritual de Inicio y Transformación: diseño y contenido aprobados, 43 pruebas focalizadas y build local. |
| 22 nov, 20:53 | Apps Script versión 4 publicada, contrato `ritual-v1`. |
| 22 nov, ~21:02 | Worker `e1eda091` publicado. |
| 22 nov, ~21:17 | Push de frontend a `main`: `263792793173f0830eadce15ddfa83f593f4e3c9`; Hostinger publica automáticamente. |
| 22 nov, 21:20–21:22 | Pedidos nuevos de prueba Inicio y Transformación recibidos correctamente y confirmados en Sheets. |
| 22 nov, ~21:44–21:54 | Código de alertas por correo guardado en editor, propiedad `PEDIDOS_ALERT_EMAIL` configurada; pendiente autorización MailApp, **sin despliegue**. |

---

### Checklist de inicio rápido para próximos chats

**Estado de partida:** no volver a crear ofertas ni sincronizar pedidos; estos están publicados y probados. No reconfigurar Hostinger, Cloudflare, Apps Script o Google Sheets. Antes de actuar, identificar si la solicitud afecta una parte aprobada o un pendiente. **Siguiente tarea seleccionada por la responsable: revisión de SEO**. Alertas de correo se retoman solamente cuando la titular de la cuenta autorice permisos. Imagen de dos cajas queda para una fase posterior.

**Actualización de este documento:** agregar nuevo hito y archivo(s) tocados al final de cada fase; nunca sobrescribir afirmaciones históricas sin evidencias de cambio.