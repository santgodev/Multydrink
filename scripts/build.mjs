import { cp, mkdir, readFile, writeFile, readdir, stat, rm } from 'node:fs/promises';
import path from 'node:path';
import { serializeStructuredData } from '../src/seo.js';
import { productMedia, comparisonMedia, videoTestimonials } from '../src/media.js';
import { eligibleVideos } from '../src/editorial.js';

const videos = eligibleVideos(videoTestimonials);
const approvedVideoFiles = new Set(videos.flatMap(item => [item.videoSrc, item.captionsSrc]));
const configuredImages = [productMedia.individual, productMedia.family, ...productMedia.gallery, productMedia.alternateBox, productMedia.sachet, productMedia.preparedDrink, productMedia.nutritionLabel, productMedia.composition, ...Object.values(productMedia.lifestyle), comparisonMedia?.first, comparisonMedia?.second, ...videos.map(item => item.poster)].filter(Boolean);
const configuredImageFiles = new Set();
const validImagePath = /^assets\/(?:multydrink\/(?:optimized|producto)\/)?[\w.-]+\.webp$/;
for (const item of configuredImages) {
  if (!validImagePath.test(item.src) || !item.alt || ((item.width > 0) !== (item.height > 0))) throw new Error('Approved image requires a local WebP, alt text and dimensions');
  for (const file of [item.src, item.thumbnail, ...(item.variants || []).map(variant => variant.src)].filter(Boolean)) {
    if (!validImagePath.test(file)) throw new Error('Invalid image candidate path');
    await stat(file); configuredImageFiles.add(file);
  }
}
for (const file of approvedVideoFiles) await stat(file);

const output = path.resolve('dist');
if (output !== path.join(process.cwd(), 'dist')) throw new Error('Unexpected build target');
// Rebuild only this project's known output directory; stale assets must not ship.
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const index = (await readFile('index.html', 'utf8')).replace('<script type="application/ld+json" id="product-schema">{}</script>', `<script type="application/ld+json" id="product-schema">${serializeStructuredData()}</script>`);
await writeFile('dist/index.html', index);
await cp('src', 'dist/src', { recursive: true });
await mkdir('dist/assets', { recursive: true });
for (const name of await readdir('assets')) {
  if (/\.(webp|ttf|svg)$/.test(name) || approvedVideoFiles.has('assets/' + name) || name === 'favicon.png' || name.endsWith('-LICENSE.txt')) await cp(path.join('assets', name), path.join('dist/assets', name));
}
for (const file of configuredImageFiles) {
  const destination = path.join('dist', file);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(file, destination);
}
// No speculative canonical, availability or review schema. Add a canonical only with a real deployment URL.
await writeFile('dist/robots.txt', 'User-agent: *\nDisallow: /\n');
async function directorySize(directory) {
  let size = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    size += entry.isDirectory() ? await directorySize(file) : (await stat(file)).size;
  }
  return size;
}
const total = await directorySize('dist/assets');
for (const match of index.matchAll(/(?:src|href)="((?:assets|src)\/[^"#]+)"/g)) await stat(path.join('dist', match[1]));
console.log(`Build OK: dist/index.html; assets ${(total / 1024).toFixed(0)} KB. No runtime dependencies.`);
