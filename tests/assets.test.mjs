import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { Window } from 'happy-dom';
import { initApp } from '../src/app.js';
import { productMedia, comparisonMedia, videoTestimonials } from '../src/media.js';
import { gallery } from '../src/config.js';
import { imageSrcset } from '../src/images.js';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const inventory = JSON.parse(await readFile(new URL('../docs/asset-inventory.json', import.meta.url), 'utf8'));
const storefrontInventory = JSON.parse(await readFile(new URL('../docs/storefront-image-inventory.json', import.meta.url), 'utf8'));
function setup() {
  const win = new Window({ url: 'http://localhost:4173', settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true } });
  win.document.write(html);
  const app = initApp(win.document, win);
  return { win, app, $: selector => win.document.querySelector(selector) };
}

test('Supplied originals are unchanged and optimized images retain dimensions, aspect and transparency', async () => {
  assert.equal(inventory.length, 10);
  for (const entry of inventory) {
    const original = await readFile(entry.original);
    assert.equal(createHash('sha256').update(original).digest('hex'), entry.sha256, entry.original);
    const source = await sharp(original).metadata();
    for (const variant of entry.variants) {
      const meta = await sharp(variant.src).metadata();
      assert.equal(meta.format, 'webp');
      assert.equal(meta.width, variant.width);
      assert.equal(meta.height, variant.height);
      assert.ok(Math.abs(meta.height - source.height * meta.width / source.width) <= 1, variant.src);
      assert.ok(meta.width <= source.width, 'No upscaling');
      if (source.hasAlpha) assert.equal(meta.hasAlpha, true, variant.src);
    }
  }
  const label = inventory.find(item => item.key === 'nutritionLabel');
  const originalPixels = await sharp(label.original).ensureAlpha().raw().toBuffer();
  const optimizedPixels = await sharp(label.variants.at(-1).src).ensureAlpha().raw().toBuffer();
  assert.ok(originalPixels.equals(optimizedPixels), 'Full-resolution label is lossless');
});

test('Real media is mapped to gallery, final offers, nutrition, tabs and selected-purchase thumbnails', async () => {
  const { win, $, app } = setup();
  try {
    assert.ok($('#hero-image').src.endsWith(productMedia.gallery[0].src));
    assert.notEqual(productMedia.gallery[0].src, productMedia.individual.src, 'Hero photo must not replace purchase imagery');
    assert.ok($('.final-offer img').src.endsWith(productMedia.individual.src));
    assert.ok($('.real-nutrition-label').src.endsWith(productMedia.nutritionLabel.src));
    assert.equal($('.nutrition-label-figure a').getAttribute('href'), productMedia.nutritionLabel.src);
    assert.match($('.nutrition-label-figure figcaption').textContent, /Etiqueta original de MultyDrink/);
    assert.equal($('#comparacion').hidden, false);
    assert.equal($('#comparacion img.comparison-base').getAttribute('src'), comparisonMedia.second.src);
    assert.equal($('#comparacion .comparison-overlay img').getAttribute('src'), comparisonMedia.first.src);
    assert.equal(comparisonMedia.first.width / comparisonMedia.first.height, comparisonMedia.second.width / comparisonMedia.second.height);
    const chapters = ['origen', 'nutricional', 'combinacion', 'rutina'];
    for (const chapter of chapters) {
      const tab = $('#story-tab-' + chapter);
      tab.click();
      assert.equal($('#story-panel-' + chapter).hidden, false);
      assert.equal($('[data-chapter-image="story-panel-' + chapter + '"]').hidden, false);
    }
    app.selectPackage('individual');
    assert.ok($('.sticky-inner > img').src.endsWith(productMedia.individual.thumbnail));
    assert.equal($('.sticky-inner > img').dataset.package, 'individual');
    assert.ok($('.order-preview img').src.endsWith(productMedia.individual.src));
    app.selectPackage('familiar');
    assert.ok($('.sticky-inner > img').src.endsWith(productMedia.family.thumbnail));
    assert.equal($('.sticky-inner > img').dataset.package, 'familiar');
    assert.equal($('.order-preview img').srcset, imageSrcset(productMedia.family));
    assert.equal($('[data-presentation="sobres"]'), null, 'Unavailable standalone sachet photography is not offered as a gallery choice');
    assert.equal(productMedia.sachet, null);
    assert.equal(productMedia.preparedDrink, null);
    assert.equal(videoTestimonials.length, 3);
    assert.equal($('#video-testimonials').hidden, false);
    assert.equal(win.document.querySelectorAll('#video-carousel .video-card').length, 3);
    assert.equal(win.document.querySelectorAll('#video-carousel video').length, 0, 'Video files load only on request');
  } finally { await win.happyDOM.abort(); }
});

test('Responsive candidates are replaced on gallery changes and every rendered image path exists', async () => {
  const { win, $, app } = setup();
  try {
    const preload = $('link[as="image"]');
    assert.equal(preload.getAttribute('imagesrcset'), $('#hero-image').srcset);
    assert.equal(preload.getAttribute('imagesizes'), $('#hero-image').sizes);
    app.displayGallery(1);
    assert.ok($('#hero-image').src.endsWith(gallery[1].src));
    assert.equal($('#hero-image').srcset, imageSrcset(gallery[1]));
    app.displayGallery(2);
    assert.ok($('#hero-image').src.endsWith(gallery[2].src));
    assert.equal($('#hero-image').srcset, imageSrcset(gallery[2]));
    for (const img of win.document.querySelectorAll('img')) {
      await stat(img.getAttribute('src'));
      for (const candidate of (img.getAttribute('srcset') || '').split(',').filter(Boolean)) await stat(candidate.trim().split(' ')[0]);
      assert.ok(img.width > 0 && img.height > 0);
    }
  } finally { await win.happyDOM.abort(); }
});

test('Approved gallery order, full-size links and optimized sources remain complete and independent of checkout', async () => {
  assert.deepEqual(gallery.map(item => item.sourceName), ['hero-02-producto', '01-hero-ingredientes', 'hero-03-beneficios', 'gallery-como-disfrutar', 'gallery-cliente-multydrink', 'hero-06-vaso-frio', 'hero-07-ingredientes', 'hero-08-mujer-oficina']);
  for (const entry of storefrontInventory) {
    const original = await readFile(entry.original);
    assert.equal(createHash('sha256').update(original).digest('hex'), entry.sha256);
    for (const variant of entry.image.variants) {
      const meta = await sharp(variant.src).metadata();
      assert.equal(meta.width, variant.width);
      assert.ok(Math.abs(meta.height - meta.width * entry.image.height / entry.image.width) <= 1);
    }
    if (entry.original.includes('04-como-prepararlo') || entry.original.includes('06-cinco-extractos') || entry.original.includes('09-tabla-nutricional')) {
      assert.ok((await sharp(original).ensureAlpha().raw().toBuffer()).equals(await sharp(entry.image.src).ensureAlpha().raw().toBuffer()), 'Written information retains original pixels at full resolution');
    }
  }
  const { win, $, app } = setup();
  try {
    const selected = app.getState().selected;
    for (const [index, item] of gallery.entries()) {
      $(`[data-gallery="${index}"]`).click();
      assert.ok($('#hero-image').src.endsWith(item.src));
      assert.equal($('#gallery-full').getAttribute('href'), item.videoSrc || item.src);
      assert.equal($('#gallery-count').textContent, `${String(index + 1).padStart(2, '0')} / ${String(gallery.length).padStart(2, '0')}`);
      assert.equal(app.getState().selected, selected);
    }
  } finally { await win.happyDOM.abort(); }
});

test('Gallery video defers loading, exposes native controls and pauses when navigating away', async () => {
  const { win, $, app } = setup();
  try {
    const video = $('#gallery-video');
    assert.equal(video.getAttribute('src'), null);
    assert.equal(video.preload, 'none');
    assert.equal(video.autoplay, false);
    assert.equal(video.loop, false);
    assert.equal(video.controls, true);
    app.displayGallery(3);
    assert.equal(video.hidden, false);
    assert.equal($('#hero-image').hidden, true);
    assert.equal(video.muted, true);
    assert.equal(video.getAttribute('src'), gallery[3].videoSrc);
    assert.equal(video.getAttribute('poster'), gallery[3].src);
    let pauses = 0;
    Object.defineProperty(video, 'paused', { configurable: true, get: () => false });
    video.pause = () => { pauses++; };
    app.displayGallery(4);
    assert.equal(pauses, 1);
    assert.equal(video.hidden, true);
    assert.equal($('#hero-image').hidden, false);
    assert.equal($('#hero-image').width, 1086);
    assert.equal($('#hero-image').height, 1448);
  } finally { await win.happyDOM.abort(); }
});

test('Comparison input changes only the divider and leaves the selected order untouched', async () => {
  const { win, $, app } = setup();
  try {
    app.selectPackage('individual');
    const before = app.getState();
    $('#comparison-range').value = '85';
    $('#comparison-range').dispatchEvent(new win.Event('input'));
    assert.equal($('.comparison-stage').style.getPropertyValue('--position'), '85%');
    assert.deepEqual(app.getState(), before);
    assert.equal($('#summary-total').textContent, '$110.000');
  } finally { await win.happyDOM.abort(); }
});
