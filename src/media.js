import { approvedImages } from './media-catalog.js';
import { storefrontImages } from './storefront-media.js';
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
  gallery: [heroImage, ...storefrontImages.gallery.slice(1)],
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

// { id, name, excerpt, poster: Image, videoSrc, approved: true,
//   publicationRightsConfirmed: true, sourceUrl, captionsSrc: 'assets/testimonio-01.es.vtt', transcript }
// Approved by the owner for local review only. Publication approval and reviewed
// captions remain pending; these records are excluded from production eligibility.
export const videoTestimonials = [
  { id: 'vitalidad', name: 'Experiencia compartida', videoSrc: 'assets/multydrink/testimonios/Testimonio-Multydrink-Vitalidad.mp4', poster: { src: 'assets/multydrink/optimized/testimonio-vitalidad-136.webp', alt: 'Fotograma del testimonio compartido', width: 136, height: 240 } },
  { id: 'kim-cuervo', name: 'Kim Cuervo', videoSrc: 'assets/multydrink/testimonios/Testimonio-Kim-Cuervo-Practicante de jiu-jitsu.mp4', poster: { src: 'assets/multydrink/optimized/testimonio-kim-cuervo-204.webp', alt: 'Kim Cuervo en su testimonio', width: 204, height: 360 } },
  { id: 'juan-alcantara', name: 'Juan Alcántara Medina', videoSrc: 'assets/multydrink/testimonios/Testimonio-Juan-Alcántara- Medina-República Dominicana.mp4', poster: { src: 'assets/multydrink/optimized/testimonio-juan-alcantara-640.webp', alt: 'Juan Alcántara Medina en su testimonio', width: 640, height: 360 } },
].map(item => ({ ...item, localReviewApproved: true, approved: false, publicationRightsConfirmed: false }));
