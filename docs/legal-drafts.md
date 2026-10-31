# Políticas de MultyDrink — borradores locales

29 de octubre de 2026. Documentos preliminares, no vigentes ni aprobados para lanzamiento. No constituyen una certificación de cumplimiento; requieren revisión jurídica y comercial final.

## Integración y revisión

Abrir el servidor de fuentes en `http://127.0.0.1:4175/` y utilizar los accesos del pie de página. Se reutilizan privacidad, condiciones, envíos y contacto, y se añade devoluciones/retracto/garantía. El enlace de privacidad del checkout abre el mismo documento. Los diálogos nativos conservan cierre con Escape, botón de cierre y retorno del foco; el encabezado permanece visible al leer documentos largos.

`src/legal.js` contiene los cinco documentos. La bibliografía de investigación se conserva únicamente en este documento interno; se retiró de los diálogos sin modificar sus textos sustantivos ni estilos. Se mantiene el enlace a la SIC del diálogo de contacto. `src/legal-config.js` concentra los hechos pendientes como `null`, mostrados como «Pendiente de confirmar» únicamente en revisión local. La razón social se obtiene de `commerce.merchantName`; presentaciones, precios y descripción de envío se leen de la configuración existente. No duplicar esos valores en la configuración legal. `commerce.contactUrl` es un sitio de la marca y no acredita el canal del vendedor.

La vista de borradores solo se monta en `localhost`, `127.0.0.1` o `[::1]`, con pedidos deshabilitados y sin URL de política definitiva. En otros hosts se conservan los avisos de indisponibilidad y el nuevo aviso provisional de devoluciones, sin marcadores de datos empresariales. Es una salvaguarda de presentación, no de confidencialidad: los módulos son código público y nunca deben contener secretos o datos de compradores. Completar los campos no publica políticas ni activa pedidos; su publicación definitiva exige una intervención posterior expresamente revisada.

No se modifican el formulario, su consentimiento, validación, envío ni el backend. No se conectan Google Sheets o Apps Script y no se afirma haber comprobado sus permisos. La recepción de pedidos permanece bloqueada por la configuración existente.

## Base y criterios jurídicos

- Derechos, autorización y atención de consultas/reclamos: [Ley 1581 de 2012, arts. 8–17](https://cancilleria.gov.co/normograma/compilacion/docs/ley_1581_2012.htm).
- Contenido mínimo de políticas, vigencia, encargados y tratamiento internacional: [Decreto 1074 de 2015, capítulo 25](https://normativa.colpensiones.gov.co/colpens/docs/decreto_1074_2015_pr026.htm). Se contrastó también la [orientación SIC sobre políticas](https://sedeelectronica.sic.gov.co/publicaciones/boletin-juridico/concepto/politicas-de-tratamiento-de-datos-personales).
- Compra a distancia, garantía y comercio electrónico: [Ley 1480 de 2011, texto integrado](https://normograma.mintic.gov.co/mintic/compilacion/docs/ley_1480_2011.htm), especialmente arts. 8, 10, 11, 46, 47, 50, 51 y 58; orientación de la [SIC sobre calidad y garantía](https://sedeelectronica.sic.gov.co/temas/proteccion-al-consumidor/derechos-y-deberes/fallas-en-un-producto).
- Se incorporan las modificaciones de la [Ley 2439 de 2024](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=257116), contrastadas en el texto integrado del MinTIC: reembolsos, información del producto, atención trazable y entrega. El acceso directo al Gestor Normativo devolvió 502; se consultaron sus resultados indexados y el texto integrado oficial, sin depender solo del resumen del buscador.

No se excluye el retracto automáticamente por tratarse de un alimento: debe revisarse la presentación y naturaleza concreta frente a las excepciones legales. No se confunde garantía con retracto, ni devolución de dinero con reversión de un pago electrónico. La revisión manual del pedido tampoco puede utilizarse para desconocer un contrato ya celebrado.

## Revisión focalizada y checklist priorizado

Revisión del 29-10-2026, sobre código local y fuentes oficiales disponibles. **P0:** resolver antes de habilitar ventas o presentar el sitio como operativo. **P1:** resolver antes de la publicación definitiva. Ninguna casilla pendiente acredita cumplimiento. La revisión no certifica al vendedor ni sustituye la consulta profesional.

### Implementación confirmada — alcance local, no cumplimiento integral

- [x] Cinco borradores identificados como no vigentes, con acceso desde el footer y privacidad desde checkout; datos pendientes centralizados. Bibliografía retirada, derechos y advertencias conservados.
- [x] Resumen visual con presentación, cantidad, precio, ahorro, envío y total (`index.html`, `src/app.js`). No equivale a comprobante fiscal ni soporte duradero.
- [x] Envío real bloqueado (`commerce.orderEndpoint`, identidad y política sin configurar); el cliente solo acepta un recibo explícito del servidor. No demuestra registro, entrega o confirmación comercial reales.
- [x] Enlace oficial SIC conservado en el borrador de contacto. **Solo local:** falta la disponibilidad pública exigida, indicada abajo.

### Información empresarial faltante

- [ ] **P0 · Vendedor:** razón social, NIT, domicilio, dirección de notificaciones, correo, teléfono y atención efectiva; responsables de privacidad y posventa.
- [ ] **P0 · Operación:** cobertura, transportador, plazos por zona, medios de pago al recibir, incidencias, devoluciones y reembolsos. Confirmar el envío incluido anunciado, existencias, vigencia y fundamento de promociones e impuestos, sin añadir cobros ocultos.
- [ ] **P0 · Datos:** inventario y necesidad de cada dato, cuentas/proveedores Google, ubicaciones, accesos, retención por finalidad y copias, duración de bases y fecha de vigencia de políticas. No se verificaron Google Sheets ni Apps Script.

### Funcionalidad requerida antes del lanzamiento

- [ ] **P0 · PQR:** implementar y probar recepción con radicado, fecha/hora y seguimiento. Un correo pendiente o un diálogo informativo no lo resuelve. Preparar respuesta a reclamaciones de consumo y consultas/reclamos de datos con sus plazos diferenciados. [Ley 2439, art. 4](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php/norma_pdf.php?i=257116), [Ley 1581, arts. 14–16](https://cancilleria.gov.co/normograma/compilacion/docs/ley_1581_2012.htm).
- [ ] **P0 · Transacción:** garantizar corrección/cancelación previa, aceptación verificable, condiciones y resumen imprimibles/descargables, acuse hasta el día calendario siguiente con importe y entrega, y archivo durable de identidad, aceptación, pago y entrega. El recibo de pantalla no prueba este flujo. [Ley 1480, art. 50 d–e](https://normograma.mintic.gov.co/mintic/compilacion/docs/ley_1480_2011.htm).
- [ ] **P0 · Logística:** informar plazo antes de aceptar, gestionar indisponibilidad, cancelación, retracto cuando corresponda y garantía. Validar la regla supletoria de 30 días y reembolso por incumplimiento hasta en 15 días calendario; no convertirlos en promesas logísticas. [Ley 2439, arts. 3–4](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php/norma_pdf.php?i=257116).
- [ ] **P0 · Privacidad:** autorización informada con prueba y versión; canal de derechos, eliminación/retención, seguridad y respuesta a incidentes verificables. Si se incorpora mercadeo, autorización separada y voluntaria. [Ley 1581, arts. 8–17](https://cancilleria.gov.co/normograma/compilacion/docs/ley_1581_2012.htm), [Decreto 1074, capítulo 25](https://normativa.colpensiones.gov.co/colpens/docs/decreto_1074_2015_pr026.htm).
- [ ] **P0 · Facturación, si resulta obligado:** emisión/validación y entrega de factura electrónica o equivalente procedente, conservación y gestión de notas/contingencias. No exige necesariamente una integración en esta página, pero sí un proceso operativo comprobado. El pago contra entrega y una hoja de pedidos no son facturas. [DIAN: obligación de facturar](https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/debes-facturar-electronicamente/).
- [ ] **P1 · Publicación legal y SIC:** publicar políticas definitivas accesibles y un enlace visible, identificable y público a la autoridad. El enlace actual oculto fuera de localhost es insuficiente para considerar resuelto el requisito. No se añadió navegación pública en esta intervención. [Ley 1480, art. 50, parágrafo](https://normograma.mintic.gov.co/mintic/compilacion/docs/ley_1480_2011.htm).

### Verificación profesional jurídica, tributaria y sanitaria

- [ ] **P0 · Jurídica:** validar formación del contrato y confirmación manual; retracto de 5 días hábiles y excepciones según naturaleza/presentación, sin excluir todo alimento; garantía y restituciones según causal. Revisar permisos de imagen/voz, datos sensibles, transmisión/transferencia internacional y eventual obligación de RNBD. No se asumen excepciones por usar Google. [Ley 1480, arts. 47 y 50](https://normograma.mintic.gov.co/mintic/compilacion/docs/ley_1480_2011.htm), [Decreto 1074](https://normativa.colpensiones.gov.co/colpens/docs/decreto_1074_2015_pr026.htm).
- [ ] **P0 · Tributaria:** contador debe verificar RUT, calidad del vendedor y excepciones, obligaciones de factura, impuestos y momento de expedición/recaudo. No se presume obligación o exención individual sin esos datos. Base: ET 615, 616-1, 616-2 y 617, Decreto 1625 y [Resolución DIAN 227 de 2025, título 5 y modificaciones](https://normograma.dian.gov.co/dian/compilacion/docs/resolucion_dian_0227_2025.htm). La [doctrina DIAN de 2026](https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_5716_2026.htm) reitera la regla general y excepciones; no es un concepto particular sobre MultyDrink.
- [ ] **P0 · Autorización del alimento:** contrastar en INVIMA vigencia, titular, fabricante, categoría, composición y presentación del número configurado `NSA-0019488-2025`, incluyendo etiqueta y soportes originales. El número y enlace documental del proyecto no acreditan verificación actual ni eficacia. [Resolución 2674 de 2013, art. 37 y modificaciones](https://normograma.invima.gov.co/compilacion/docs/resolucion_minsaludps_2674_2013.htm).
- [ ] **P0 · Publicidad:** revisar frases como «todo lo que tu cuerpo necesita» y «transformar cómo funciona tu mente», testimonios y comparaciones visuales frente al expediente y evidencia del producto. No se modificaron. Evaluar declaraciones nutricionales/de salud, sellos y reglas de etiquetado según [Resolución 2492 de 2022, modificatoria de la 810 de 2021](https://normograma.invima.gov.co/compilacion/docs/resolucion_minsaludps_2492_2022.htm). Determinar por categoría si exige autorización previa de publicidad: no es universal para todo alimento. [INVIMA, ABC 2024, apartado 11](https://www.invima.gov.co/invima_website/static/attachments/alimentos_otros_alimentos_y_bebidas/cartilla_abc_de_publicidad_en_ayb__2024_.pdf). No se certifican claims, autorización publicitaria ni conformidad del etiquetado.

## Correcciones sustantivas propuestas — no aplicadas

No se identificó en esta revisión acotada un error demostrable que justifique reescribir los borradores. Antes del lanzamiento, revisar la frase de la confirmación técnica «Total confirmado» para que no se confunda con aceptación comercial, y explicitar el momento de perfeccionamiento del contrato. Los textos publicitarios señalados arriba requieren revisión regulatoria, no aprobación implícita por contener un descargo. Cualquier cambio de significado queda pendiente de revisión y autorización; esta limpieza solo retiró la bibliografía visible.

## Recomendación futura sobre el consentimiento

El checkbox actual no se modificó. Antes de recolectar datos, revisar su texto para identificar al responsable, informar finalidades y derechos y enlazar una política vigente y versionada; conservar prueba verificable de la autorización. Una futura opción de mercadeo debe ser voluntaria, separada y no premarcada. No añadirla como requisito de compra ni interpretar la casilla actual como permiso publicitario.

## Límites

Historial de validación: la implementación inicial y el refinamiento visual se comprobaron en escritorio y a 320 px, incluidos Escape, foco y privacidad desde checkout. Estas observaciones no son una auditoría de lanzamiento.

La limpieza actual modifica solo `src/legal.js`, su prueba específica y este documento. No altera HTML, CSS, configuración ni comportamiento del checkout. Copia anterior para comparar en `tmp/legal-cleanup/`; las copias de intervenciones previas se conservan.

Comprobaciones de esta limpieza: 3/3 pruebas específicas aprobadas (`node --test tests/legal.test.mjs`), sintaxis y `git diff --check` correctos. Comparación de los cinco diálogos con el estado anterior: DOM idéntico al retirar únicamente el bloque bibliográfico, normalizando espacios entre etiquetas; enlace SIC conservado. HTML y CSS idénticos byte a byte. No se ejecutó automatización de navegador en esta intervención.

Revisión de fuentes y controles locales acotados. No se auditó el servidor, Google, procedimientos del vendedor, autorizaciones documentales ni cumplimiento integral. No se ejecutaron suite completa, build, commits, push o despliegues.
