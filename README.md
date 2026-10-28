# MultyDrink — fase 1

Landing local en español de Colombia. Conserva HTML semántico, CSS y módulos JavaScript existentes, sin framework ni dependencias de ejecución. No se implementó backend, ni se hicieron commits, push o despliegues.

## Ejecutar

Node.js 22 o posterior:

```powershell
npm.cmd ci
npm.cmd run dev
```

Abrir `http://127.0.0.1:4173`. Validar y compilar:

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run check:build
npm.cmd run preview
```

`dist/` es una compilación de revisión con `noindex` y rastreo deshabilitado. No está lista para indexación ni recepción de pedidos. El servidor escucha en loopback y solo sirve rutas públicas permitidas.

## Estado

- Dos ofertas: 21 sobres por $110.000 (antes $125.000) y 126 sobres por $425.000 (antes $660.000). Envío incluido, pago contra entrega.
- Galería y selector visual independientes del precio; ofertas, cantidades, formulario y barra fija sincronizados.
- Secciones oscuras/blancas, cuatro pestañas, cuatro columnas de ingredientes, referencias científicas, nutrición, preparación, ofertas finales y FAQ por categorías.
- Comparador y carrusel implementados pero ocultos sin archivos aprobados. Reseñas ocultas sin pedidos verificables.
- Formulario validado con envío deshabilitado, sin almacenamiento local ni confirmaciones ficticias.
- JSON-LD derivado de los precios centrales, metadatos sociales y controles de accesibilidad.

**La implementación visual no está completa:** faltan los recursos aprobados y la revisión renderizada. Se conservan las fotos reales existentes. [Archivos esperados y activación](assets/README.md).

## Organización

| Ruta | Función |
| --- | --- |
| `index.html` | Estructura, contenido y metadatos |
| `src/styles.css` | Base visual y controles existentes |
| `src/phase-one.css` | Composiciones y responsive de fase 1 |
| `src/config.js` | Ofertas, contenido y configuración comercial |
| `src/media.js` | Manifiesto de medios aprobados; pendientes en null |
| `src/components.js`, `src/editorial.js` | Componentes reutilizables y editoriales |
| `src/app.js` | Estado compartido e interacciones |
| `src/order.js` | Validación, cálculos y cliente de pedidos |
| `src/seo.js` | Datos estructurados |
| `assets/` | Recursos reales; arquitectura plana conservada |
| `scripts/`, `tests/` | Servidor, build y pruebas |

## Entrega

- [Informe de fase 1 y archivos modificados](docs/phase-one-report.md)
- [Comparación por secciones](docs/reference-comparison.md)
- [QA, accesibilidad, SEO y Core Web Vitals](docs/qa.md)
- [Fuentes y pendientes](docs/sources.md)
- [Contrato del backend de fase 2](docs/order-integration.md)

No hay navegador conectado. Happy DOM comprueba interacciones, no layout, contraste, screenshots ni rendimiento. No se afirma fidelidad visual exacta. Dominio, canonical, sitemap, URLs sociales absolutas, políticas y operación real se completarán antes de una futura publicación autorizada.
# Multydrink
