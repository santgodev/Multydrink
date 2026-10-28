import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { approvedImages } from '../src/media-catalog.js';

// Approved additions only. Existing assets and supplied originals are never overwritten.
const galleryNames = ['01-caja-principal', '02-descanso-oficina', '03-coworking', '04-como-prepararlo', '05-brindis-oficina', '06-cinco-extractos', '07-mujer-sachet-caja', '08-preparacion-en-pareja', '09-tabla-nutricional', '10-bebida-caja-sobres'];
const galleryAlts = ['Caja individual MultyDrink', 'Mujer disfrutando una bebida en su oficina, junto a la caja MultyDrink', 'Mujer con una bebida y MultyDrink en un espacio de coworking', 'Preparación de MultyDrink: un sobre de 10 g en 250 mL de agua', 'Hombre con una bebida, caja y sobres MultyDrink en una oficina', 'Imagen de la fórmula botánica de MultyDrink con caja y sobres', 'Mujer presentando un sobre y una caja MultyDrink', 'Pareja preparando MultyDrink en la cocina', 'Etiqueta nutricional completa de MultyDrink', 'Bebida preparada, caja y sobres MultyDrink'];
const benefitAlts = { enfoque: galleryAlts[1], energia: 'Dos ciclistas durante una pausa, con bebidas y MultyDrink', memoria: 'Mujer con una bebida, libreta y caja MultyDrink', bienestar: 'Pareja con bebidas y una caja MultyDrink en la cocina' };
const hash = buffer => createHash('sha256').update(buffer).digest('hex');
const existing = JSON.parse(await readFile('docs/asset-inventory.json', 'utf8'));
const reused = new Map(existing.map(entry => [entry.sha256, approvedImages[entry.key]]));
const inventory = [], gallery = [], benefits = {};
async function discover(directory, stem) {
  const found = (await readdir(directory)).filter(name => name.replace(/\.[^.]+$/, '') === stem && /\.(png|jpe?g|webp)$/i.test(name));
  if (found.length !== 1) throw new Error(`Expected exactly one approved asset: ${directory}/${stem}`);
  return `${directory}/${found[0]}`;
}
async function integrate(original, stem, alt, { lossless = false, family = false } = {}) {
  const input = await readFile(original), sha256 = hash(input), meta = await sharp(input).metadata();
  const entry = { original, sha256, originalWidth: meta.width, originalHeight: meta.height };
  if (!family && reused.has(sha256)) {
    const image = { ...reused.get(sha256), alt };
    inventory.push({ ...entry, reused: true, image }); return image;
  }
  let normalized = input;
  if (family) {
    // Ignore near-invisible alpha noise at the outer edges, with a 2px safety margin.
    // Preserve the packaging, then restore the approved sticky image's 21:22 canvas.
    const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let left = info.width, top = info.height, right = 0, bottom = 0;
    for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * 4 + 3] > 8) { left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y); }
    left = Math.max(0, left - 2); top = Math.max(0, top - 2); right = Math.min(info.width - 1, right + 2); bottom = Math.min(info.height - 1, bottom + 2);
    entry.transparentBounds = { left, top, width: right - left + 1, height: bottom - top + 1 };
    normalized = await sharp(input).extract(entry.transparentBounds).resize({ width: 840, height: 880, fit: 'contain', background: '#00000000', withoutEnlargement: true }).png().toBuffer();
  }
  const width = family ? 840 : Math.min(meta.width, 1448);
  const widths = [...new Set([160, Math.min(480, width), Math.min(960, width), width])].sort((a, b) => a - b);
  const variants = [];
  for (const size of widths) {
    const src = `assets/multydrink/optimized/${stem}-${size}.webp`;
    const result = await sharp(normalized).resize({ width: size, withoutEnlargement: true }).webp(lossless ? { lossless: true } : { quality: 90, alphaQuality: 100 }).toFile(src);
    variants.push({ src, width: result.width, height: result.height, bytes: result.size });
  }
  const full = variants.at(-1);
  const image = { src: full.src, alt, width: full.width, height: full.height, variants: variants.map(({ src, width }) => ({ src, width })), thumbnail: variants[0].src };
  inventory.push({ ...entry, image, variants }); reused.set(sha256, image); return image;
}
for (const [index, name] of galleryNames.entries()) gallery.push({ ...await integrate(await discover('assets/multydrink/lifestyle-copia', name), `gallery-${name}`, galleryAlts[index], { lossless: [3, 5, 8].includes(index) }), label: galleryAlts[index], sourceName: name });
for (const key of ['enfoque', 'energia', 'memoria', 'bienestar']) benefits[key] = await integrate(await discover('assets/multydrink/beneficios', key), `benefit-${key}`, benefitAlts[key]);
const family = await integrate(await discover('assets/multydrink/producto', 'pack-familiar-6-cajas'), 'pack-familiar-aprobado', 'Pack familiar de seis cajas MultyDrink', { family: true });
await writeFile('src/storefront-media.js', '// Generated by scripts/integrate-storefront-images.mjs. Originals remain unchanged.\nexport const storefrontImages = ' + JSON.stringify({ gallery, benefits, family }, null, 2) + ';\n');
await writeFile('docs/storefront-image-inventory.json', JSON.stringify(inventory, null, 2) + '\n');
console.log(`Integrated ${inventory.length} approved sources; ${inventory.filter(item => item.reused).length} reuse identical existing derivatives.`);
