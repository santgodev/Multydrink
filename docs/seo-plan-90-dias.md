# MultyDrink Colombia — Plan inicial de 90 días para SEO y lanzamiento

**Estado:** Hoja de ruta acordada, con prerrequisitos de lanzamiento y ajustes según arquitectura de pedidos ya desarrollada.
**Dominio definitivo de trabajo:** https://multydrincolombia.com/
**Mercado:** Colombia
**Rama de referencia:** feature/doctora-erika

## Arquitectura comercial EXISTENTE — NO reemplazar

**Flujo aprobado y probado parcialmente:** Sitio web → Cloudflare Worker → Google Apps Script → Google Sheets.

- El Worker se encarga de controles de seguridad, validación, control de frecuencia, consentimiento y transformación de la solicitud.
- Apps Script verifica la solicitud, registra el pedido con precios del catálogo e idempotencia en Google Sheets; en la prueba previa se registró exitosamente un pedido ficticio.
- La responsabilidad de la página es **capturar, validar y entregar la solicitud de pedido correctamente**, mostrar al comprador una constancia válida de recepción y permitir el monitoreo técnico básico de fallos de entrega.
- **NO crear panel de administración logística, ni estados «pendiente de confirmación», «confirmado», «enviado», «entregado» o «cancelado» en la web.** El cliente gestiona esos estados fuera del sitio.
- **Pendiente acordado:** enlazar el formulario real con el Worker previamente implementado y habilitar Cloudflare Turnstile ahora que existe dominio, sin inventar endpoints ni sustituir la arquitectura.
- No eliminar validaciones, protección antiabuso, idempotencia ni obligaciones de privacidad para habilitar recepción libre de solicitudes válidas.
- Revisar los cambios locales y `worker-respaldo.txt` sin publicar secretos. Nunca guardar claves o datos de clientes en el repositorio.

## Prerrequisitos críticos ANTES de publicar la web con recepción real

1. Confirmar configuración efectiva del Worker, Apps Script y Google Sheets existentes y conectar `orderEndpoint` con el frontend.
2. Configurar Turnstile para dominio y validar lado servidor; probar contra duplicados, errores de conexión y fallos parciales. Confirmar persistencia del pedido en Sheets y constancia de recepción al comprador.
3. Finalizar información del **vendedor responsable**, medios de atención, consentimiento y **políticas públicas definitivas**: tratamiento de datos, términos de compra, envíos, retracto/devoluciones/garantía y contacto; el código auditado contiene borradores y datos todavía sin confirmar.
4. Confirmar cobertura y reglas de envío/pago contra entrega según operación real, sin inventar condiciones, stock o tiempos.
5. Corregir bloqueo SEO **solo para producción** cuando se apruebe el lanzamiento; conservar staging/local no indexables.
6. QA focalizado de formulario real, políticas, móvil, performance, multimedia, errores y SEO. No realizar push a rama de producción ni deploy sin autorización.

## Fase 1 — Preparación para Google | Días 1–7
- Verificar dominio, HTTPS, variantes de host y redirecciones, respuestas HTTP y disponibilidad de assets.
- En producción únicamente: retirar `noindex,nofollow` de HTML y `Disallow: /` del robots generado; validar que el servidor entregue lo esperado.
- Canonical para https://multydrincolombia.com/ si es la URL final confirmada.
- Publicar `robots.txt` y `sitemap.xml` con URLs indexables reales; no incluir anclas.
- Configurar Google Search Console y Bing Webmaster Tools, enviar sitemap, solicitar indexación y medir cobertura.

## Fase 2 — Optimización comercial y SEO técnico | Semanas 2–3
- Mejorar title, description, Open Graph, imágenes absolutas, encabezados, accesibilidad y enlaces internos.
- Validar schema Product/Offer para las presentaciones y precios COP, sin inventar seller, disponibilidad, reseñas ni ratings.
- Publicar datos del vendedor y políticas aprobadas; evaluar Merchant Center cuando la operación sea apta.
- Medir y optimizar LCP, INP, CLS, especialmente hero, galería, media y móvil.
- Instalar analítica con privacidad adecuada: clic a CTA, formulario iniciado, pedidos realmente **recibidos**, errores de entrega. **No rastrear estados de distribución desde la web.**

## Fase 3 — Contenido y posicionamiento en respuestas de IA | Semanas 3–6
- Investigar consultas reales de marca, precio, ingredientes y preparación (sin asumir volúmenes).
- Mantener la landing como página comercial; producir páginas independientes solo con valor original y comprobable.
- Optimizar preguntas/respuestas claras para SEO/AEO/GEO, con información contrastada y autoría verificable.
- Aprovechar presentación y video de Dra. Erika Piedrahita, confirmar credenciales y permisos, aportar transcripción útil.
- Separar evidencia sobre ingredientes aislados de efectos clínicos de la bebida, y revisar declaraciones sujetas a normas de alimentos.
- Facilitar rastreo de buscadores y agentes de búsqueda compatibles, respetando decisiones de privacidad.

## Fase 4 — Autoridad y crecimiento | Semanas 6–12
- Consolidar perfiles oficiales e identidad de marca con nombre y dominio consistente.
- Conseguir menciones y enlaces relevantes y legítimos; no reseñas inventadas ni compra de enlaces.
- Evaluar Merchant Center y canales complementarios según elegibilidad.
- Revisar Search Console, Bing, analítica y visibilidad observable en respuestas de IA.
- Iterar contenido/SEO según consultas, indexación, CTR y conversiones reales.

## Métricas
- Páginas indexadas, errores de cobertura e impresiones/clics/CTR/posiciones por intención de búsqueda.
- Rendimiento móvil LCP, INP, CLS.
- Conversión a **solicitud recibida y persistida** (no estados logísticos).
- Fallos de formulario, errores de Worker/Apps Script y posibles solicitudes duplicadas.
- Referencias verificables en respuestas con IA.

## Hallazgos técnicos auditados
- `index.html`: `<meta name="robots" content="noindex, nofollow">`.
- `scripts/build.mjs`: compila `robots.txt` con `Disallow: /`.
- No se identificó generación de sitemap ni canonical en el código revisado.
- `src/config.js`: `orderEndpoint`, `merchantName`, `privacyPolicyUrl`, `privacyPolicyVersion` aún en `null` en la rama auditada, aunque backend externo ya fue desarrollado; hay que integrar y verificar, **no reconstruir**.
- `src/legal.js` y `src/legal-config.js`: borradores con datos reales pendientes.
- Revisar cambios locales antes de cualquier sincronización Git. Mantener galería, recursos y secciones visuales aprobadas.

## Reglas de ejecución
- No replantear arquitectura ya acordada ni abrir alcance a paneles logísticos.
- No cambiar diseño, precios, copy, imágenes o checkout visual sin decisión explícita.
- Trabajar por fases, validar hitos y no publicar/desplegar sin autorización.
