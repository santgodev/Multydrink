# Recursos MultyDrink: entrega pendiente

Se conserva el directorio plano `assets/`, compatible con el servidor y el build existentes. No se crearon archivos visuales ficticios. Este documento no se copia a `dist/`.

## Archivos que debe aportar el propietario

| Ruta esperada | Contenido real | Integración en `src/media.js` |
| --- | --- | --- |
| `assets/multydrink-caja-individual.webp` | Caja vigente de 21 sobres, aislada, logo y textos legibles | `productMedia.individual` |
| `assets/multydrink-caja-alterna.webp` | Otra vista de esa caja | `productMedia.alternateBox` |
| `assets/multydrink-sobre.webp` | Sobre individual de 10 g | `productMedia.sachet` |
| `assets/multydrink-bebida.webp` | Bebida preparada de color ámbar | `productMedia.preparedDrink` |
| `assets/multydrink-etiqueta-nutricional.webp` | Fotografía completa y legible de la etiqueta real | `productMedia.nutritionLabel` |
| `assets/multydrink-enfoque.webp` | Fotografía aprobada para trabajo/estudio | `productMedia.lifestyle.enfoque` |
| `assets/multydrink-energia.webp` | Fotografía aprobada para rutina activa | `productMedia.lifestyle.energia` |
| `assets/multydrink-memoria.webp` | Fotografía aprobada para esta pestaña, sin promesa de resultados | `productMedia.lifestyle.memoria` |
| `assets/multydrink-bienestar.webp` | Fotografía aprobada para bienestar cotidiano | `productMedia.lifestyle.bienestar` |
| `assets/multydrink-escena-01.webp` | Primera fotografía del comparador | `comparisonMedia.first` |
| `assets/multydrink-escena-02.webp` | Segunda fotografía del comparador; mismo encuadre/proporción | `comparisonMedia.second` |
| `assets/testimonio-01.mp4` | Video auténtico autorizado (también admite `.webm`) | `videoTestimonials[0].videoSrc` |
| `assets/testimonio-01-poster.webp` | Miniatura auténtica de ese video | `videoTestimonials[0].poster` |
| `assets/testimonio-01.es.vtt` | Subtítulos completos en español, revisados | `videoTestimonials[0].captionsSrc` |

Para más videos, repetir el esquema `02`, `03`, etc. Las fotografías de pestañas pueden reutilizar las dos escenas u otros recursos suministrados si el propietario aprueba esa correspondencia; no son obligatorias cuatro fotos adicionales distintas. No se exige inventar un antes/después físico.

Se aceptan originales PNG/JPEG para preparar los WebP posteriormente, conservando logotipos y contenido. No basta renombrar una extensión. Entregar resolución original; recomendaciones de trabajo: producto ≥1200 px de alto, escenas ≥1600 px de ancho, etiqueta suficientemente nítida para leer todo el rotulado. Son recomendaciones, no dimensiones inventadas de archivos presentes.

## Activación

1. Copiar los archivos aprobados aquí, sin sobrescribir `family.webp`, `product.webp`, ingredientes, marca o fuentes existentes.
2. Registrar cada imagen con su ruta, texto alternativo y dimensiones REALES: `{ src, alt, width, height }`. Los campos pendientes permanecen `null`; no apuntan a archivos inexistentes.
3. Registrar el par con `first`, `second`, `firstLabel`, `secondLabel`. Describir escenas, sin afirmar una transformación garantizada.
4. Para cada video aportar nombre autorizado, extracto exacto, transcripción fiel, procedencia y confirmación de derechos. Solo configurar `approved: true` y `publicationRightsConfirmed: true` tras comprobarlo. Sin fuente, derechos, subtítulos o transcripción, el componente no se publica. No guardar documentos privados de consentimiento en `assets/`.
5. Ejecutar pruebas/build y revisar encuadres, legibilidad y comportamiento en navegador. El build rechaza rutas configuradas ausentes y solo empaqueta videos elegibles.

La carga de archivos por sí sola no los activa. El mapeo explícito evita publicar material no revisado. Los gráficos editoriales finales de ingredientes y sus textos requieren aprobación; entretanto se conservan las cinco fotos reales existentes, agrupadas en cuatro columnas.
