import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { Window } from 'happy-dom';
import sharp from 'sharp';
import { customerPhotos, videoTestimonials, previousVideoTestimonials } from '../src/media.js';
import { renderCustomerReviewSection, bindCustomerPhotoCarousel, renderVideoCarousel, bindVideoCarousel, eligibleVideos } from '../src/editorial.js';
import { productStructuredData } from '../src/seo.js';

test('Community thumbnails preserve all seven originals and their full proportions', async () => {
  assert.equal(customerPhotos.length, 7);
  assert.equal(new Set(customerPhotos.map(photo => photo.src)).size, 7);
  for (const photo of customerPhotos) {
    const original = await sharp(photo.original).metadata();
    const thumbnail = await sharp(photo.src).metadata();
    assert.equal(original.format, 'jpeg');
    assert.equal(thumbnail.format, 'webp');
    assert.equal(thumbnail.width, photo.width);
    assert.equal(thumbnail.height, photo.height);
    assert.ok(Math.abs(thumbnail.width - original.width / original.height * thumbnail.height) <= 1);
    assert.ok(thumbnail.width <= original.width && thumbnail.height <= original.height);
    assert.ok((await stat(photo.src)).size < (await stat(photo.original)).size);
  }
});

test('Story covers are decodable WebP files and original/new clips remain available', async () => {
  assert.equal(videoTestimonials.length, 3);
  for (const item of videoTestimonials) {
    const metadata = await sharp(item.poster.src).metadata();
    assert.equal(metadata.format, 'webp');
    assert.equal(metadata.width, item.poster.width);
    assert.equal(metadata.height, item.poster.height);
    assert.ok((await readFile(item.videoSrc)).subarray(4, 8).equals(Buffer.from('ftyp')));
  }
  for (const item of previousVideoTestimonials) assert.ok((await stat(item.videoSrc)).size > 0);
  assert.equal(eligibleVideos([{ ...videoTestimonials[0], poster: null }]).length, 0);
  assert.equal(eligibleVideos([{ ...videoTestimonials[0], localReviewApproved: false }]).length, 0);
});

test('Community data stays honest and video requests are absent from initial markup', () => {
  const win = new Window();
  try {
    win.document.body.innerHTML = renderCustomerReviewSection([], videoTestimonials);
    const root = win.document.body;
    assert.equal(root.querySelector('.customer-rating-overview strong').textContent, '4,9');
    assert.match(root.querySelector('.customer-recommendation').textContent, /99 %/);
    assert.equal(root.querySelectorAll('.customer-rating-bar').length, 5);
    assert.equal(root.querySelectorAll('.customer-rating-bar-fill, [role="progressbar"]').length, 0);
    assert.equal(root.querySelector('#customer-distribution-note'), null);
    assert.equal(root.querySelectorAll('video, source').length, 0);
    assert.equal(root.querySelectorAll('.video-poster').length, 3);
    assert.ok([...root.querySelectorAll('img')].every(img => img.loading === 'lazy' && img.width > 0 && img.height > 0));
    assert.doesNotMatch(JSON.stringify(productStructuredData()), /aggregateRating|reviewCount/);
  } finally { win.happyDOM.abort(); }
});

test('Photo arrows and keyboard use the same scroll track and respect reduced motion', () => {
  const win = new Window();
  try {
    win.document.body.innerHTML = renderCustomerReviewSection([], videoTestimonials);
    const root = win.document.body, track = root.querySelector('.customer-photo-grid');
    const motions = [];
    win.matchMedia = () => ({ matches: true });
    Object.defineProperties(track, { clientWidth: { value: 300 }, scrollWidth: { value: 900 } });
    root.querySelector('.customer-photo-item').getBoundingClientRect = () => ({ width: 132 });
    track.scrollBy = motion => { motions.push(motion); track.scrollLeft += motion.left; track.dispatchEvent(new win.Event('scroll')); };
    bindCustomerPhotoCarousel(root);
    assert.equal(root.querySelector('[data-customer-photo-prev]').disabled, true);
    root.querySelector('[data-customer-photo-next]').click();
    assert.ok(track.scrollLeft > 0);
    assert.equal(root.querySelector('[data-customer-photo-prev]').disabled, false);
    track.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    assert.equal(track.scrollLeft, 0);
    assert.ok(motions.every(motion => motion.behavior === 'instant'));
  } finally { win.happyDOM.abort(); }
});

test('Each story plays inline in its own card, without a dialog, and stops the previous video', async () => {
  const win = new Window();
  try {
    let played = 0, paused = 0;
    win.HTMLMediaElement.prototype.play = () => { played++; return Promise.resolve(); };
    win.HTMLMediaElement.prototype.pause = () => { paused++; };
    win.HTMLMediaElement.prototype.load = () => {};
    win.document.body.innerHTML = renderVideoCarousel(videoTestimonials);
    const root = win.document.body;
    bindVideoCarousel(root, videoTestimonials);
    assert.equal(root.querySelector('dialog'), null);
    assert.equal(root.querySelectorAll('.carousel-controls [data-carousel-prev], .carousel-controls [data-carousel-next]').length, 0);
    assert.equal(root.querySelectorAll('.video-inline-play-icon').length, 3);
    assert.ok([...root.querySelectorAll('.video-card>button')].every(button => button.getAttribute('aria-label')?.startsWith('Reproducir testimonio')));
    assert.equal(root.querySelectorAll('video').length, 0);
    assert.equal(played, 0);
    const buttons = [...root.querySelectorAll('[data-play-video]')];
    for (const [index, trigger] of buttons.entries()) {
      trigger.click();
      const video = root.querySelector('.video-inline-player');
      assert.ok(video);
      assert.equal(video.closest('.video-card'), root.querySelectorAll('.video-card')[index]);
      assert.equal(video.getAttribute('src'), videoTestimonials[index].videoSrc);
      assert.equal(video.preload, 'none');
      assert.equal(video.controls, true);
      assert.equal(root.querySelectorAll('.video-inline-player').length, 1);
    }
    assert.equal(played, 3);
    assert.equal(paused, 2);
    assert.equal(root.querySelectorAll('[data-play-video]').length, 2);
  } finally { await win.happyDOM.abort(); }
});
