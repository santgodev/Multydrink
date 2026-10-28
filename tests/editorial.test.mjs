import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';
import { initApp } from '../src/app.js';
import { packages } from '../src/config.js';
import { productMedia, videoTestimonials } from '../src/media.js';
import { renderComparison, bindComparison, eligibleVideos, renderVideoCarousel, bindVideoCarousel } from '../src/editorial.js';
import { productStructuredData } from '../src/seo.js';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const photo = { src: 'assets/family.webp', alt: 'Recurso de prueba', width: 567, height: 594 };
function windowForTest() {
  return new Window({ url: 'http://localhost:4173', settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true } });
}

test('Final offers select the right package; image selection cannot change the price', async () => {
  const win = windowForTest(); win.document.write(html); const app = initApp(win.document, win);
  const $ = selector => win.document.querySelector(selector);
  assert.equal(win.document.querySelectorAll('[data-order-package]').length, 2);
  $('[data-order-package="individual"]').click();
  assert.equal($('#packageId').value, 'individual');
  assert.equal($('#summary-total').textContent, '$110.000');
  $('#gallery-next').click(); $('[data-presentation="caja"]').click();
  assert.equal(app.getState().selected, 'individual');
  assert.equal($('[data-presentation="sobres"]').disabled, true);
  $('[data-order-package="familiar"]').click();
  assert.equal($('#sticky-price').textContent, '$425.000');
  assert.equal($('#comparacion').hidden, false);
  assert.equal($('#video-testimonials').hidden, true);
  await win.happyDOM.abort();
});

test('FAQ and nutrition tabs support keyboard navigation and maintain a single visible panel', async () => {
  const win = windowForTest(); win.document.write(html); initApp(win.document, win);
  const $ = selector => win.document.querySelector(selector);
  $('#faq-tab-uso').dispatchEvent(new win.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  assert.equal(win.document.activeElement, $('#faq-tab-ingredientes'));
  assert.equal($('#faq-panel-uso').hidden, true);
  assert.equal($('#faq-panel-ingredientes').hidden, false);
  $('#nutrition-tab-portion').dispatchEvent(new win.KeyboardEvent('keydown', { key: 'End', bubbles: true }));
  assert.equal($('#nutrition-preparation').hidden, false);
  assert.equal($('#nutrition-portion').hidden, true);
  assert.equal(win.document.activeElement, $('#nutrition-tab-preparation'));
  await win.happyDOM.abort();
});

test('Benefit tabs update approved imagery and retain four supporting points per panel', async () => {
  const old = productMedia.lifestyle.energia;
  productMedia.lifestyle.energia = { ...photo, alt: 'Fotografía aprobada de prueba' };
  const win = windowForTest();
  try {
    win.document.write(html); initApp(win.document, win);
    win.document.querySelector('#tab-energia').click();
    assert.equal(win.document.querySelector('#benefit-image').alt, productMedia.lifestyle.energia.alt);
    for (const panel of win.document.querySelectorAll('#moment-panels [role="tabpanel"]')) assert.equal(panel.querySelectorAll('li').length, 4);
  } finally { productMedia.lifestyle.energia = old; await win.happyDOM.abort(); }
});

test('Comparison uses two real image layers; input and captured pointer movement update bounded position', async () => {
  assert.equal(renderComparison(null), '');
  const win = windowForTest(), root = win.document.body;
  root.innerHTML = renderComparison({ first: photo, second: photo, firstLabel: 'Escena uno', secondLabel: 'Escena dos' });
  bindComparison(root);
  const stage = root.querySelector('.comparison-stage'), range = root.querySelector('input');
  stage.getBoundingClientRect = () => ({ left: 100, width: 400 });
  assert.equal(root.querySelectorAll('img').length, 2);
  assert.equal(range.type, 'range'); // Native range provides arrow/Home/End keyboard semantics.
  range.value = '25'; range.dispatchEvent(new win.Event('input'));
  assert.equal(stage.style.getPropertyValue('--position'), '25%');
  stage.dispatchEvent(new win.PointerEvent('pointerdown', { pointerId: 2, pointerType: 'touch', clientX: 400, button: 0 }));
  assert.equal(range.value, '75');
  assert.equal(win.document.activeElement, range);
  stage.dispatchEvent(new win.PointerEvent('pointermove', { pointerId: 2, clientX: 900 }));
  assert.equal(range.value, '100');
  stage.dispatchEvent(new win.PointerEvent('pointerup', { pointerId: 2 }));
  stage.dispatchEvent(new win.PointerEvent('pointermove', { pointerId: 2, clientX: 100 }));
  assert.equal(range.value, '100');
  assert.equal(range.getAttribute('aria-valuetext'), '100% de la primera escena');
  await win.happyDOM.abort();
});

const video = { id: 'test', name: 'Persona de prueba', excerpt: 'Extracto de prueba', poster: photo, videoSrc: 'assets/testimonio-01.mp4', sourceUrl: 'https://example.com/source', approved: true, publicationRightsConfirmed: true, captionsSrc: 'assets/testimonio-01.es.vtt', transcript: 'Transcripción de prueba' };
test('Video eligibility requires rights, approval, source, captions and transcript', () => {
  for (const key of ['approved', 'publicationRightsConfirmed', 'sourceUrl', 'captionsSrc', 'transcript']) assert.equal(eligibleVideos([{ ...video, [key]: null }]).length, 0);
  assert.equal(renderVideoCarousel([]), '');
  const markup = renderVideoCarousel([video]);
  assert.doesNotMatch(markup, /<video|autoplay|Compra verificada|estrellas/);
});

test('Video carousel is keyboard navigable, plays only on request and releases media on close', async () => {
  const win = windowForTest(), root = win.document.body;
  let played = 0, paused = 0;
  win.HTMLMediaElement.prototype.play = () => { played++; return Promise.resolve(); };
  win.HTMLMediaElement.prototype.pause = () => { paused++; };
  win.HTMLMediaElement.prototype.load = () => {};
  root.innerHTML = renderVideoCarousel([video, { ...video, id: 'test-2' }]);
  bindVideoCarousel(root, [video, { ...video, id: 'test-2' }]);
  assert.equal(played, 0);
  root.querySelector('.video-track').dispatchEvent(new win.KeyboardEvent('keydown', { key: 'End', bubbles: true }));
  assert.equal(root.querySelector('[data-carousel-next]').disabled, true);
  root.querySelector('[data-play-video]').click();
  assert.equal(played, 1);
  assert.equal(root.querySelector('dialog').open, true);
  assert.equal(root.querySelector('video').preload, 'none');
  assert.equal(root.querySelector('track').srclang, 'es');
  assert.match(root.querySelector('[data-video-player] details').textContent, /Transcripción de prueba/);
  root.querySelector('[data-video-close]').click();
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(paused, 1);
  assert.equal(root.querySelector('video'), null);
  await win.happyDOM.abort();
});

test('Enabling a supplied eligible video does not break application dialog binding', async () => {
  const win = windowForTest();
  videoTestimonials.push(video);
  try {
    win.document.write(html); assert.doesNotThrow(() => initApp(win.document, win));
    assert.equal(win.document.querySelector('#video-testimonials').hidden, false);
  } finally { videoTestimonials.pop(); await win.happyDOM.abort(); }
});

test('Structured data uses exactly the approved offers and no fabricated ratings or availability', () => {
  const data = productStructuredData();
  assert.deepEqual(data.offers.map(item => item.price), packages.map(item => item.price));
  assert.ok(data.offers.every(item => item.priceCurrency === 'COP'));
  assert.doesNotMatch(JSON.stringify(data), /aggregateRating|reviewCount|availability|priceValidUntil/);
  assert.match(html, /name="robots" content="noindex, nofollow"/);
});
