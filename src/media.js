import { approvedImages } from './media-catalog.js';
import { storefrontImages } from './storefront-media.js';
// Original supplied PNGs stay under assets/multydrink/; derivatives preserve their content.
// Independent sachet and drink photographs are still absent. Never crop them out of scenes.
export const productMedia = {
  individual: approvedImages.individual,
  family: storefrontImages.family,
  gallery: storefrontImages.gallery,
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
// Three original MP4s exist in assets/multydrink/testimonios/. No eligible publication
// records, posters, captions or authorized transcripts/excerpts have been supplied yet.
export const videoTestimonials = [];
