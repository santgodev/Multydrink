import { cp, mkdir, readFile, writeFile, readdir, stat, rm } from 'node:fs/promises';
import path from 'node:path';
import { serializeStructuredData } from '../src/seo.js';
import { productMedia, comparisonMedia, videoTestimonials, customerCollage, customerPhotos } from '../src/media.js';
import { eligibleVideos } from '../src/editorial.js';
import { versionAssets } from './version-assets.mjs';

const videos = eligibleVideos(videoTestimonials);
const approvedVideoFiles = new Set(videos.flatMap(item => [item.videoSrc, item.captionsSrc]));
// Gallery videos are explicit client-approved assets, independent of testimonials.
for (const item of productMedia.gallery.filter(item => item.type === 'video')) {
  if (!/^assets\/[\w-]+\.mp4$/.test(item.videoSrc)) throw new Error('Invalid gallery video path');
  approvedVideoFiles.add(item.videoSrc);
}
const configuredImages = [productMedia.individual, productMedia.family, ...productMedia.gallery, productMedia.alternateBox, productMedia.sachet, productMedia.preparedDrink, productMedia.nutritionLabel, productMedia.composition, ...Object.values(productMedia.lifestyle), comparisonMedia?.first, comparisonMedia?.second, ...videos.map(item => item.poster)].filter(Boolean);
const configuredImageFiles = new Set();
configuredImages.push(customerCollage, ...customerPhotos);
const validImagePath = /^assets\/(?:multydrink\/(?:optimized|producto)\/)?[\w.-]+\.webp$/;
const sourceHtml = await readFile('index.html', 'utf8');
// Include explicit HTML image/poster/srcset candidates as well as module metadata.
for (const [file] of sourceHtml.matchAll(/assets\/(?:multydrink\/(?:optimized|producto)\/)?[\w.-]+\.webp/g)) {
  await stat(file); configuredImageFiles.add(file);
}
for (const item of configuredImages) {
  if (!validImagePath.test(item.src) || !item.alt || ((item.width > 0) !== (item.height > 0))) throw new Error('Approved image requires a local WebP, alt text and dimensions');
  for (const file of [item.src, item.thumbnail, ...(item.variants || []).map(variant => variant.src)].filter(Boolean)) {
    if (!validImagePath.test(file)) throw new Error('Invalid image candidate path');
    await stat(file); configuredImageFiles.add(file);
  }
}
// Doctor's approved portrait and explainer video, referenced by the standalone editorial section.
const doctorFiles = ['assets/multydrink/profesional/dra-erika-piedrahita.jpg', 'assets/multydrink/profesional/dra-erika-multydrink.mp4', 'assets/multydrink/optimized/dra-erika-video-poster-360.webp'];
for (const file of doctorFiles) { await stat(file); configuredImageFiles.add(file); }
// Original customer photographs remain in the repository; only optimized thumbnails ship.
// Exact approved Origen photograph, referenced directly by its chapter markup.
configuredImageFiles.add('assets/multydrink/optimized/origen-cafe-multydrink.png');
for (const file of approvedVideoFiles) {
  if (!file) continue;
  await stat(file);
  // The new story clips are referenced directly from nested assets paths.
  if (/^assets\/multydrink\/historias-reales\/historia-0[1-3]\.mp4$/.test(file)) configuredImageFiles.add(file);
}
// Brand-supplied research bank: copy the original PDF without transforming it.
const researchPdf = 'assets/multydrink/investigacion/investigaciones-multydrink.pdf';
if (!(await readFile(researchPdf)).subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error('Invalid research PDF');

const output = path.resolve('dist');
if (output !== path.join(process.cwd(), 'dist')) throw new Error('Unexpected build target');
// Rebuild only this project's known output directory; stale assets must not ship.
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const sources = Object.fromEntries(await Promise.all((await readdir('src')).map(async name => [name, await readFile(path.join('src', name), 'utf8')])));
const versioned = versionAssets(sources, sourceHtml.replace('<script type="application/ld+json" id="product-schema">{}</script>', `<script type="application/ld+json" id="product-schema">${serializeStructuredData()}</script>`));
const index = versioned.html;
await writeFile('dist/index.html', index);
await mkdir('dist/src', { recursive: true });
for (const [name, content] of Object.entries(versioned.files)) await writeFile(path.join('dist/src', name), content);
await mkdir('dist/assets', { recursive: true });
for (const name of await readdir('assets')) {
  if (/\.(webp|ttf|svg)$/.test(name) || approvedVideoFiles.has('assets/' + name) || name === 'favicon.png' || name.endsWith('-LICENSE.txt')) await cp(path.join('assets', name), path.join('dist/assets', name));
}
for (const file of configuredImageFiles) {
  const destination = path.join('dist', file);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(file, destination);
}
await mkdir(path.dirname(path.join('dist', researchPdf)), { recursive: true });
await cp(researchPdf, path.join('dist', researchPdf));
// The approved production hostname is the canonical destination.
const siteUrl = 'https://multydrincolombia.com/';
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${siteUrl}sitemap.xml\n`);
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}</loc></url>\n</urlset>\n`);
async function directorySize(directory) {
  let size = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    size += entry.isDirectory() ? await directorySize(file) : (await stat(file)).size;
  }
  return size;
}
const total = await directorySize('dist/assets');
for (const match of index.matchAll(/(?:src|href)="((?:assets|src)\/[^"#]+)"/g)) await stat(path.join('dist', match[1].split('?')[0]));
console.log(`Build OK: dist/index.html; assets ${(total / 1024).toFixed(0)} KB. No runtime dependencies.`);
