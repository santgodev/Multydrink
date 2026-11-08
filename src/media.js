import { approvedImages } from './media-catalog.js';
import { storefrontImages } from './storefront-media.js';
// Exact client collage. The embedded "#1" ranking requires client substantiation
// before production publication; it is not added to Product structured data.
export const customerCollage = {
  src: 'assets/multydrink/optimized/collage-clientes-1600.webp',
  width: 1600,
  height: 661,
  alt: 'Collage de clientes con cajas, sobres y bebidas MultyDrink, con el texto «#1 en Superalimento de Colombia».',
  variants: [480, 960, 1600].map(width => ({ src: `assets/multydrink/optimized/collage-clientes-${width}.webp`, width })),
};
// Approved square compositions: keep native resolution and complete framing.
function approvedGalleryImage(sourceName, size, alt, label) {
  const variants = [160, 480, 960, size].map(width => ({
    src: `assets/multydrink/optimized/${sourceName}-approved-${width}.webp`, width,
  }));
  return { src: variants.at(-1).src, thumbnail: variants[0].src, width: size, height: size, variants, alt, label, sourceName };
}
// Hero-only photograph. Purchase imagery and the generated catalog remain independent.
const heroImage = {
  src: 'assets/multydrink/optimized/hero-ingredientes-1254.webp',
  alt: 'Caja MultyDrink en una composición botánica',
  width: 1254,
  height: 1254,
  variants: [160, 480, 960, 1254].map(width => ({ src: `assets/multydrink/optimized/hero-ingredientes-${width}.webp`, width })),
  thumbnail: 'assets/multydrink/optimized/hero-ingredientes-160.webp',
  label: 'MultyDrink, presentación botánica',
  sourceName: '01-hero-ingredientes',
};
// Original supplied PNGs stay under assets/multydrink/; derivatives preserve their content.
// Independent sachet and drink photographs are still absent. Never crop them out of scenes.
export const productMedia = {
  individual: approvedImages.individual,
  family: storefrontImages.family,
  gallery: [
    approvedGalleryImage('hero-02-producto', 1024, 'Caja MultyDrink rodeada de ingredientes botánicos sobre una mesa', 'Producto MultyDrink'),
    heroImage,
    approvedGalleryImage('hero-03-beneficios', 1254, 'Infografía sobre las características de MultyDrink', 'Características de MultyDrink'),
    {
      type: 'video',
      videoSrc: 'assets/gallery-como-disfrutar.mp4',
      src: 'assets/multydrink/optimized/gallery-preparacion-poster-464.webp',
      thumbnail: 'assets/multydrink/optimized/gallery-preparacion-poster-160.webp',
      width: 464,
      height: 848,
      alt: 'Fotograma del video de MultyDrink suministrado por la marca',
      label: 'Cómo disfrutar MultyDrink — video',
      sourceName: 'gallery-como-disfrutar',
    },
    {
      src: 'assets/multydrink/optimized/gallery-cliente-multydrink-1086.webp',
      thumbnail: 'assets/multydrink/optimized/gallery-cliente-multydrink-160.webp',
      width: 1086,
      height: 1448,
      variants: [160, 480, 960, 1086].map(width => ({ src: `assets/multydrink/optimized/gallery-cliente-multydrink-${width}.webp`, width })),
      alt: 'Mujer mostrando un sobre, una caja individual y el pack familiar MultyDrink',
      label: 'Presentaciones MultyDrink',
      sourceName: 'gallery-cliente-multydrink',
    },
    approvedGalleryImage('hero-06-vaso-frio', 1217, 'Vaso de MultyDrink servido frío', 'MultyDrink frío'),
    approvedGalleryImage('hero-07-ingredientes', 1254, 'Infografía de ingredientes de MultyDrink', 'Ingredientes de MultyDrink'),
    approvedGalleryImage('hero-08-mujer-oficina', 1086, 'Mujer en una oficina con MultyDrink', 'MultyDrink en la oficina'),
  ],
  alternateBox: approvedImages.alternateBox,
  sachet: null,
  preparedDrink: null,
  nutritionLabel: approvedImages.nutritionLabel,
  composition: approvedImages.composition,
  lifestyle: storefrontImages.benefits,
};

// { first: Image, second: Image, firstLabel: '...', secondLabel: '...' }
// Describes two everyday scenes, never a guaranteed product transformation.
export const comparisonMedia = {
  first: approvedImages.comparisonFirst,
  second: approvedImages.comparisonSecond,
  firstLabel: 'Una jornada exigente',
  secondLabel: 'Un momento para ti',
};

// Historical testimonials remain available for possible future reuse, but are not
// shown in the new Historias reales gallery. No old media is deleted.
export const previousVideoTestimonials = [
  { id: 'vitalidad', name: 'Experiencia compartida', videoSrc: 'assets/multydrink/testimonios/Testimonio-Multydrink-Vitalidad.mp4', poster: { src: 'assets/multydrink/optimized/testimonio-vitalidad-136.webp', alt: 'Fotograma del testimonio compartido', width: 136, height: 240 } },
  { id: 'kim-cuervo', name: 'Kim Cuervo', videoSrc: 'assets/multydrink/testimonios/Testimonio-Kim-Cuervo-Practicante de jiu-jitsu.mp4', poster: { src: 'assets/multydrink/optimized/testimonio-kim-cuervo-204.webp', alt: 'Kim Cuervo en su testimonio', width: 204, height: 360 } },
  { id: 'juan-alcantara', name: 'Juan Alcántara Medina', videoSrc: 'assets/multydrink/testimonios/Testimonio-Juan-Alcántara- Medina-República Dominicana.mp4', poster: { src: 'assets/multydrink/optimized/testimonio-juan-alcantara-640.webp', alt: 'Juan Alcántara Medina en su testimonio', width: 640, height: 360 } },
];

// New client-supplied clips; descriptive labels only until identities/transcripts are approved.
// The cards display the actual video frame instead of an unrelated legacy poster.
export const videoTestimonials = [
  { id: 'historia-01', name: 'Historia real 01', videoSrc: 'assets/multydrink/historias-reales/historia-01.mp4' },
  { id: 'historia-02', name: 'Historia real 02', videoSrc: 'assets/multydrink/historias-reales/historia-02.mp4' },
  { id: 'historia-03', name: 'Historia real 03', videoSrc: 'assets/multydrink/historias-reales/historia-03.mp4' },
].map(item => ({ ...item, localReviewApproved: true, approved: false, publicationRightsConfirmed: false }));
