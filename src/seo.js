import { packages } from './config.js';
import { productMedia } from './media.js';

// Product facts only: no invented stock, reviews, seller identity or canonical URL.
export function productStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'MultyDrink',
    description: `Mezcla para preparar bebida con cinco grupos de ingredientes botánicos. ${packages.map(item => `${item.name}: ${item.boxes} cajas, ${item.sachets} sobres`).join('; ')}. Envío incluido y pago contra entrega.`,
    brand: { '@type': 'Brand', name: 'MultyDrink' },
    image: [productMedia.individual?.src || 'assets/family.webp', 'assets/family.webp'],
    offers: packages.map(item => ({
      '@type': 'Offer', name: item.name,
      description: `${item.boxes} ${item.boxes === 1 ? 'caja' : 'cajas'}, ${item.sachets} sobres. Envío incluido. Pago contra entrega.`,
      price: item.price, priceCurrency: 'COP',
    })),
  };
}

export function serializeStructuredData() {
  return JSON.stringify(productStructuredData()).replace(/</g, '\\u003c');
}
