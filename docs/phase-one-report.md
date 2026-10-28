# Entrega fase 1 — MultyDrink

**Estado:** implementación local funcional de las secciones independientes de nuevos recursos; fidelidad visual final pendiente. El usuario confirmó que imágenes y videos aprobados en ChatGPT aún no se han copiado al proyecto. No se generaron, descargaron ni inventaron sustitutos. No hubo commits, push, despliegue o cambios de historial Git.

## 1. Auditoría y secciones

Antes de editar se revisaron HTML, módulos, estilos, configuración, scripts, pruebas y carpeta `assets/`. Se preservó el stack estático. La versión previa tenía tres pestañas, ingredientes en tarjetas oscuras, acordeones a la derecha y carecía de bloque nutricional, carrusel/comparador y ofertas finales; además mantenía envío y notificación sanitaria sin confirmar. El nuevo brief reemplazó esos últimos datos.

Se implementaron A/B/D/E/F/G/H/I/K/L/N: hero con cinco acordeones izquierdos; titulares exactos; tres situaciones; 5 monumental; cuatro pestañas con cuatro puntos; cuatro columnas blancas de ingredientes; evidencia de ingredientes; controles nutricionales; preparación conectada; dos ofertas finales; FAQ de cuatro categorías; trust negro/footer blanco. Barra inferior con CTA blanco y formulario completo, envío incluido y recepción deshabilitada.

C y J tienen componentes interactivos probados, pero están ocultos sin imágenes/videos. M permanece vacío sin reseñas elegibles. La [comparación A–N](reference-comparison.md) detalla cada correspondencia y diferencia.

## 2. Reutilización

Galería, selectores, componentes de campos, acordeones, menú, diálogos legales, configuración central de ofertas, estado compartido, cálculo, validación, idempotencia y lógica de barra fija. `src/order.js` y la base `src/styles.css` se preservan. Se reemplazó `src/sections.css` por `src/phase-one.css`; no se reconstruyó la aplicación ni cambió el stack.

## 3. Recursos usados y pendientes

Conservados: `family.webp`, `product.webp`, cinco fotos de ingredientes, `brand.svg`, favicon, Poppins/Montserrat locales y licencias. La primera imagen es el pack aislado de seis cajas; la composición botánica sigue identificada como imagen de marca.

Faltan caja individual, otra vista, sobre, bebida preparada, fotografía de etiqueta, escenas lifestyle, pareja de comparación, videos y miniaturas. El usuario debe aportar también subtítulos/transcripciones y confirmación de derechos. [Nombres, rutas exactas y activación](../assets/README.md). Se conserva la carpeta plana `assets/`; no hay segunda arquitectura de medios.

La caja individual final tiene contenido tipográfico de cantidad, sin foto sustituta; las pestañas conservan la foto válida del pack; nutrición muestra una tabla parcial transcrita del brief. Ninguno equivale al acabado visual aprobado pendiente.

## 4. Contenido y decisiones

Confirmados: titulares solicitados, dos precios y sus referencias, envío incluido, contra entrega, 10 g en 250 mL, datos nutricionales suministrados y NSA-0019488-2025. No se anuncia cero azúcar añadida.

Los tres números científicos son años de publicaciones verificables sobre ingredientes; no estadísticas clínicas inventadas. La pestaña Memoria explica el límite de evidencia. Quedan por aprobar gráficos/copy final de ingredientes, extractos auténticos de testimonios, advertencias completas del empaque, políticas, vendedor/contacto, cobertura y tiempos. [Fuentes](sources.md).

## 5. Interacciones

Galería, precios y cantidades, selección de oferta final, independencia del selector visual, menú, tabs/foco, nutrición, FAQ, enlaces y diálogos, formulario/errores, bloqueo sin backend, cálculo con envío incluido, duplicados y respuestas reales simuladas únicamente en tests. Comparador probado con puntero y control nativo; videos probados con gating, teclado, clic y limpieza. Referencias ARIA y alt comprobadas.

## 6. Responsive, accesibilidad, SEO y rendimiento

CSS adaptado para 1440, 1024/768, 390 y 320 px. **Sin verificación renderizada ni capturas:** no hay navegador conectado. No se afirma ausencia de overflow, contraste conforme ni coincidencia exacta con la referencia.

Metadatos, HTML semántico, teclado, foco, movimiento reducido y JSON-LD Product/Offer implementados. Build genera schema desde precios centrales sin ratings o stock inventados. Revisión con noindex/robots bloqueado; canonical, sitemap y URLs absolutas requieren dominio final. WebP, dimensiones, prioridad de hero, lazy loading y videos bajo demanda; Core Web Vitals pendientes de medición. [QA completo y criterios](qa.md).

## 7. Validación

30/30 pruebas aprobadas. Build y comprobación HTTP aprobados: 16 activos (~1342 KB totales), 9 archivos fuente, 2 CSS analizables, schema correcto y rutas privadas denegadas. Los tests no certifican layout. El servidor efímero se detuvo al terminar.

## 8. Fase 2

API segura, persistencia en Supabase/PostgreSQL, catálogo/precios autoritativos, validación de cobertura, idempotencia durable, consentimiento, permisos de administración, operaciones/notificaciones y verificación de reseñas. Backend y producción no configurados. [Contrato existente actualizado](order-integration.md).

## 9. Archivos cambiados en esta fase

| Tipo | Archivos |
| --- | --- |
| Modificados | `index.html`, `src/app.js`, `src/components.js`, `src/config.js` |
| Creados | `src/editorial.js`, `src/media.js`, `src/phase-one.css`, `src/seo.js` |
| Eliminado/reemplazado | `src/sections.css` → `src/phase-one.css` |
| Build/servidor | `scripts/build.mjs`, `scripts/check-build.mjs`, `scripts/serve.mjs` |
| Pruebas modificadas | `tests/interface.test.mjs`, `tests/order.test.mjs` |
| Pruebas creadas | `tests/editorial.test.mjs` |
| Documentación modificada | `README.md`, `docs/reference-comparison.md`, `docs/qa.md`, `docs/sources.md`, `docs/order-integration.md` |
| Documentación creada | `assets/README.md`, `docs/phase-one-report.md` |
| Salida regenerada | `dist/index.html`, `dist/robots.txt`, `dist/src/` y copias de recursos existentes en `dist/assets/` |

No se cambiaron dependencias ni imágenes existentes. El manifiesto de medios deja nulos/arrays vacíos los recursos ausentes y el build comprueba rutas activadas. Los archivos temporales de transformación se retiraron; no se distribuyen documentos internos ni evidencias privadas.
