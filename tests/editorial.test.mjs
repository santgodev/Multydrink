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
  assert.equal(win.document.querySelectorAll('.final-offer [data-order-package]').length, 2);
  assert.equal(win.document.querySelectorAll('.package-cta[data-order-package]').length, 2);
  $('[data-order-package="individual"]').click();
  assert.equal($('#packageId').value, 'individual');
  assert.equal($('#summary-total').textContent, '$110.000');
  $('#gallery-next').click(); $('[data-gallery="0"]').click();
  assert.equal(app.getState().selected, 'individual');
  assert.equal($('[data-presentation="sobres"]'), null);
  $('[data-order-package="familiar"]').click();
  assert.equal($('#sticky-price').textContent, '$425.000');
  assert.equal($('#comparacion').hidden, false);
  assert.equal($('#video-testimonials').hidden, false);
  assert.equal(win.document.querySelectorAll('#video-testimonials .video-card').length, 3);
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

test('Story chapters select their approved images and preserve meaningful content', async () => {
  const win = windowForTest();
  try {
    win.document.write(html); initApp(win.document, win);
    const doc = win.document;
    const chapters = ['origen', 'nutricional', 'combinacion', 'rutina'];
    for (const chapter of chapters) {
      const tab = doc.getElementById('story-tab-' + chapter);
      const panel = doc.getElementById('story-panel-' + chapter);
      const visual = doc.querySelector('[data-chapter-image="story-panel-' + chapter + '"]');
      assert.ok(tab && panel && visual, chapter);
      tab.click();
      assert.equal(tab.getAttribute('aria-selected'), 'true');
      assert.equal(panel.hidden, false);
      assert.equal(visual.hidden, false);
      assert.ok(visual.querySelector('img')?.getAttribute('alt'), chapter);
      assert.ok(panel.textContent.trim().length > 35, chapter);
      assert.equal(doc.querySelectorAll('.moment-panels [role="tabpanel"]:not([hidden])').length, 1);
    }
    assert.doesNotMatch(doc.getElementById('story-panel-rutina').textContent, /Sin azúcar añadida/i);
  } finally { await win.happyDOM.abort(); }
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
  const labels = root.querySelectorAll('.comparison-labels span');
  assert.equal(labels[0].style.visibility, 'visible');
  assert.equal(labels[1].style.visibility, 'visible');
  range.value = '25'; range.dispatchEvent(new win.Event('input'));
  assert.equal(stage.style.getPropertyValue('--position'), '25%');
  assert.equal(labels[0].style.visibility, 'hidden');
  assert.equal(labels[1].style.visibility, 'visible');
  stage.dispatchEvent(new win.PointerEvent('pointerdown', { pointerId: 2, pointerType: 'touch', clientX: 400, button: 0 }));
  assert.equal(range.value, '75');
  assert.equal(win.document.activeElement, range);
  stage.dispatchEvent(new win.PointerEvent('pointermove', { pointerId: 2, clientX: 900 }));
  assert.equal(range.value, '100');
  stage.dispatchEvent(new win.PointerEvent('pointerup', { pointerId: 2 }));
  stage.dispatchEvent(new win.PointerEvent('pointermove', { pointerId: 2, clientX: 100 }));
  assert.equal(range.value, '100');
  assert.equal(range.getAttribute('aria-valuetext'), '100% de la primera escena');
  assert.equal(labels[0].style.visibility, 'visible');
  assert.equal(labels[1].style.visibility, 'hidden');
  range.value = '0'; range.dispatchEvent(new win.Event('input'));
  assert.equal(labels[0].style.visibility, 'hidden');
  assert.equal(labels[1].style.visibility, 'visible');
  await win.happyDOM.abort();
});

const video = { id: 'test', name: 'Persona de prueba', excerpt: 'Extracto de prueba', poster: photo, videoSrc: 'assets/testimonio-01.mp4', sourceUrl: 'https://example.com/source', approved: true, publicationRightsConfirmed: true, captionsSrc: 'assets/testimonio-01.es.vtt', transcript: 'Transcripción de prueba' };
test('Video eligibility requires rights, approval, source, captions and transcript', () => {
  for (const key of ['approved', 'publicationRightsConfirmed', 'sourceUrl', 'captionsSrc', 'transcript']) assert.equal(eligibleVideos([{ ...video, [key]: null }]).length, 0);
  assert.equal(renderVideoCarousel([]), '');
  const markup = renderVideoCarousel([video]);
  assert.doesNotMatch(markup, /<video|autoplay|Compra verificada|estrellas/);
});

test('Client-provided local-review clips remain visible without relying on loopback URL flags', async () => {
  assert.equal(eligibleVideos(videoTestimonials).length, 3);
  assert.equal(renderVideoCarousel(videoTestimonials).match(/data-play-video=/g)?.length, 3);
  for (const url of ['http://localhost:4173/?revision-videos=1', 'https://example.com/?revision-videos=1']) {
    const win = windowForTest();
    win.location.href = url;
    win.document.write(html);
    initApp(win.document, win);
    assert.equal(win.document.querySelector('#video-testimonials').hidden, false);
    assert.equal(win.document.querySelectorAll('#video-testimonials .video-card').length, 3);
    assert.equal(win.document.querySelectorAll('#video-testimonials video').length, 0);
    await win.happyDOM.abort();
  }
});

test('Video carousel supports keyboard navigation, inline playback and releases the previous player', async () => {
  const win = windowForTest(), root = win.document.body;
  let played = 0, paused = 0;
  win.HTMLMediaElement.prototype.play = () => { played++; return Promise.resolve(); };
  win.HTMLMediaElement.prototype.pause = () => { paused++; };
  win.HTMLMediaElement.prototype.load = () => {};
  const clips = [
    { ...video, id: 'test-1', localReviewApproved: true },
    { ...video, id: 'test-2', localReviewApproved: true },
  ];
  root.innerHTML = renderVideoCarousel(clips);
  bindVideoCarousel(root, clips);
  const track = root.querySelector('.video-track');
  assert.ok(track);
  assert.equal(root.querySelector('dialog'), null, 'Videos must play inside their cards, not in a modal');
  assert.equal(played, 0);
  track.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'End', bubbles: true }));
  assert.equal(root.querySelectorAll('[data-play-video]').length, 2);
  root.querySelector('[data-play-video="0"]').click();
  assert.equal(played, 1);
  let player = root.querySelector('.video-inline-player');
  assert.ok(player);
  assert.equal(player.preload, 'metadata');
  assert.equal(player.playsInline, true);
  assert.equal(player.controls, true);
  assert.equal(root.querySelector('track').srclang, 'es');
  assert.equal(root.querySelectorAll('.video-inline-player').length, 1);
  root.querySelector('[data-play-video="1"]').click();
  assert.equal(played, 2);
  assert.equal(paused, 1, 'The previous clip must stop when another starts');
  player = root.querySelector('.video-inline-player');
  assert.ok(player.closest('.video-card') === root.querySelectorAll('.video-card')[1]);
  assert.equal(root.querySelectorAll('.video-inline-player').length, 1);
  assert.equal(root.querySelectorAll('[data-play-video]').length, 1);
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
  assert.match(html, /name="robots" content="index, follow"/);
});
