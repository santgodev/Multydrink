import { packages, ingredientGroups, research, nutrition, faqCategories, faqs } from './config.js';
import { productMedia, customerPhotos } from './media.js';
import { escapeHTML as esc, icon, renderFaqs } from './components.js';
import { money } from './order.js';
import { imageAttributes } from './images.js';

export function renderEditorialIngredients() {
  return ingredientGroups.map((item, index) => `<article class="editorial-ingredient"><div class="editorial-image ${item.images.length > 1 ? 'paired-images' : ''}">${item.images.map(name => `<img src="assets/${name}.webp" alt="${esc(name === 'tea' ? 'Té negro' : item.name)}" width="800" height="467" loading="lazy">`).join('')}</div><span class="editorial-index">0${index + 1} / ${esc(item.name)}</span><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></article>`).join('');
}
export function renderResearch() {
  return research.map(item => `<article><strong class="research-year">${esc(item.year)}</strong><h3>${esc(item.label)}</h3><p>${esc(item.description)}</p><a href="${esc(item.pdf)}" target="_blank" rel="noopener noreferrer" aria-label="Consultar publicación sobre ${esc(item.label)} en el banco de investigaciones de MultyDrink (PDF, abre una pestaña nueva)">Consultar publicación</a></article>`).join('');
}
export function renderNutrition() {
  const label = productMedia.nutritionLabel;
  if (!label) return '<p class="nutrition-unavailable">Consulta la información nutricional en el empaque del producto.</p>';
  return `<figure class="nutrition-label-figure"><a href="${esc(label.src)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir la etiqueta nutricional original completa en una pestaña nueva"><img class="real-nutrition-label" ${imageAttributes(label, '(max-width: 560px) 90vw, 430px')} loading="lazy"></a><figcaption>Etiqueta original de MultyDrink. <a href="${esc(label.src)}" target="_blank" rel="noopener noreferrer">Ampliar imagen ↗</a></figcaption></figure>`;
}

export function renderFinalOffers() {
  return packages.map(item => {
    const photo = item.id === 'individual' ? productMedia.individual : productMedia.family;
    return `<article class="final-offer ${item.id === 'familiar' ? 'final-offer-family' : 'final-offer-individual'}"><div class="offer-photo ${photo ? '' : 'without-photo'}">${photo ? `<img ${imageAttributes(photo, '(max-width: 560px) 85vw, 420px')} loading="lazy">` : `<span class="offer-count">${item.sachets}<small>SOBRES / ${item.boxes} CAJA</small></span>`}</div><div class="offer-copy"><h3>${item.id === 'familiar' ? 'Pack Familiar' : item.name}</h3><div class="offer-meta">${item.id === 'familiar' ? `<p>${item.boxes} cajas.</p><p>${item.sachets} sobres en total.</p>` : `<p>${item.sachets} sobres.</p>`}</div><div class="offer-pricing"><div class="offer-price"><span>${item.id === 'familiar' ? 'Precio especial:' : 'Precio:'}</span> <strong>${money(item.price)}<small> COP.</small></strong>${item.id === 'familiar' ? `<del>${money(item.referencePrice)}</del>` : ''}</div>${item.id === 'familiar' ? `<p class="offer-saving"><strong>Ahorras ${money(item.referencePrice - item.price)} COP</strong> frente a comprar las seis cajas por separado.</p>` : ''}</div><a href="#pedido" class="button button-black" data-order-package="${item.id}">${item.id === 'individual' ? 'QUIERO MI CAJA' : 'QUIERO MI PACK FAMILIAR'} ${icon('arrow')}</a></div></article>`;
  }).join('');
}
export function renderFaqCategories() {
  return faqCategories.map((item, index) => `<button type="button" id="faq-tab-${item.id}" role="tab" aria-selected="${index === 0}" aria-controls="faq-panel-${item.id}" tabindex="${index === 0 ? '0' : '-1'}">${item.label}<span aria-hidden="true">↗</span></button>`).join('');
}
export function renderFaqPanels() {
  return faqCategories.map((item, index) => `<div id="faq-panel-${item.id}" role="tabpanel" tabindex="0" aria-labelledby="faq-tab-${item.id}" ${index ? 'hidden' : ''}><p class="faq-active-category">${esc(item.label)}</p>${renderFaqs(faqs.filter(faq => faq.category === item.id))}</div>`).join('');
}
export function bindTabs(root, { vertical = false, onSelect = () => {} } = {}) {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const activate = (tab, focus = false) => {
    tabs.forEach(button => {
      const active = button === tab;
      button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1;
      const panel = root.ownerDocument.getElementById(button.getAttribute('aria-controls'));
      if (panel) panel.hidden = !active;
    });
    onSelect(tab);
    if (focus) tab.focus();
  };
  tabs.forEach(tab => tab.addEventListener('click', () => activate(tab)));
  root.addEventListener('keydown', event => {
    const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = vertical ? 'ArrowUp' : 'ArrowLeft';
    if (![nextKey, prevKey, 'Home', 'End'].includes(event.key)) return;
    const index = tabs.indexOf(event.target);
    if (index < 0) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === nextKey ? 1 : -1) + tabs.length) % tabs.length;
    activate(tabs[next], true);
  });
}

const imageMarkup = (item, cls = '', sizes = '100vw') => `<img class="${cls}" ${imageAttributes(item, sizes)} loading="lazy">`;
export function bindIngredientCounter(root, win = root?.ownerDocument.defaultView) {
  const number = root?.querySelector('[data-ingredient-count]');
  if (!number || root.dataset.ingredientCounterBound) return;
  root.dataset.ingredientCounterBound = 'true';
  const motion = win.matchMedia('(prefers-reduced-motion: reduce)');
  let observer, timer, started = false;
  const finish = () => {
    started = true;
    win.clearTimeout(timer);
    observer?.disconnect();
    number.textContent = '5';
    motion.removeEventListener?.('change', onMotionChange);
  };
  const onMotionChange = () => { if (motion.matches) finish(); };
  if (motion.matches || !win.IntersectionObserver) { finish(); return; }
  // Only the visual digit changes; a separate, static 5 remains accessible.
  number.textContent = '1';
  observer = new win.IntersectionObserver(entries => {
    if (started || !entries.some(entry => entry.isIntersecting)) return;
    started = true;
    observer.disconnect();
    let value = 1;
    const advance = () => {
      number.textContent = String(++value);
      if (value === 5) finish();
      else timer = win.setTimeout(advance, 220);
    };
    timer = win.setTimeout(advance, 220);
  }, { threshold: .35 });
  observer.observe(number);
  motion.addEventListener?.('change', onMotionChange);
}

export function renderComparison(pair) {
  if (!pair?.first?.src || !pair?.second?.src) return '';
  return `<div class="comparison-labels"><span>${esc(pair.firstLabel)}</span><span>${esc(pair.secondLabel)}</span></div><div class="comparison-stage" style="--position:50%">${imageMarkup(pair.second, 'comparison-base')}<div class="comparison-overlay">${imageMarkup(pair.first)}</div><div class="comparison-divider" aria-hidden="true"><span>‹ ›</span></div><label class="sr-only" for="comparison-range">Comparar las dos escenas: mueve el divisor</label><input id="comparison-range" type="range" min="0" max="100" value="50" step="1" aria-valuetext="50% de la primera escena" aria-describedby="comparison-help"></div><p id="comparison-help" class="sr-only">Arrastra el divisor o usa las flechas del teclado. Dos momentos cotidianos; no representan un resultado garantizado del producto.</p>`;
}
export function bindComparison(root) {
  const stage = root.querySelector('.comparison-stage');
  if (!stage) return;
  const input = stage.querySelector('input');
  const labels = root.querySelectorAll('.comparison-labels span');
  const update = value => {
    const position = Math.max(0, Math.min(100, Math.round(Number(value))));
    input.value = String(position); stage.style.setProperty('--position', position + '%');
    input.setAttribute('aria-valuetext', `${position}% de la primera escena`);
    // A label must not describe the opposite scene when its own pane closes.
    if (labels[0]) labels[0].style.visibility = position < 30 ? 'hidden' : 'visible';
    if (labels[1]) labels[1].style.visibility = position > 70 ? 'hidden' : 'visible';
  };
  input.addEventListener('input', () => update(input.value));
  let pointer = null;
  const move = event => { const rect = stage.getBoundingClientRect(); if (rect.width > 0) update((event.clientX - rect.left) / rect.width * 100); };
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    event.preventDefault(); pointer = event.pointerId; input.focus({ preventScroll: true });
    stage.setPointerCapture?.(pointer); move(event);
  });
  stage.addEventListener('pointermove', event => { if (pointer === event.pointerId) move(event); });
  const stop = event => { if (pointer === event.pointerId) { if (stage.hasPointerCapture?.(pointer)) stage.releasePointerCapture(pointer); pointer = null; } };
  stage.addEventListener('pointerup', stop); stage.addEventListener('pointercancel', stop);
  update(input.value);
}

// Client-supplied summary; no measured per-star distribution or review totals are available.
export function renderCustomerReviewSection(testimonials, videos, options = {}) {
  const customerPhotoMarkup = customerPhotos.map(photo => `<figure class="customer-photo-item" style="--photo-ratio:${photo.width / photo.height}">${imageMarkup(photo, '', '200px')}</figure>`).join('');
  const bars = [5, 4, 3, 2, 1].map(star => `<li class="customer-rating-row"><span>${star} <span aria-hidden="true">★</span></span><span class="customer-rating-bar" aria-hidden="true"></span></li>`).join('');
  const quotes = testimonials.map(item => `<article class="customer-quote"><h4>${esc(item.name)}</h4><blockquote><p>&ldquo;${esc(item.comment)}&rdquo;</p></blockquote><p class="customer-quote-source">${esc(item.sourceNote)}</p></article>`).join('');
  return `<header class="customer-reviews-heading"><h2 id="customer-reviews-title" class="customer-reviews-kicker">COMUNIDAD MULTYDRINK</h2></header>
    <div class="community-review-showcase">
      <section class="customer-ratings" aria-label="Resumen de valoraciones proporcionado por el cliente"><div class="customer-ratings-intro"><p class="customer-rating-overview"><strong>4,9</strong><span class="customer-rating-stars" aria-label="4,9 de 5 estrellas">★★★★★</span></p><p class="customer-rating-source">Basado en reseñas</p></div><p class="customer-recommendation"><strong>99 %</strong> recomendaría MultyDrink</p><ol class="customer-rating-rows" aria-label="Distribución de estrellas pendiente de recuentos reales">${bars}</ol></section>
      <section class="customer-gallery" aria-labelledby="customer-gallery-title"><div class="customer-section-heading"><h3 id="customer-gallery-title">Momentos compartidos</h3><div class="customer-photo-controls" aria-label="Navegación de fotografías"><button type="button" data-customer-photo-prev aria-label="Fotografías anteriores">←</button><button type="button" data-customer-photo-next aria-label="Fotografías siguientes">→</button></div></div><div class="customer-photo-grid" tabindex="0" role="region" aria-roledescription="carrusel" aria-label="Fotografías de la comunidad MultyDrink">${customerPhotoMarkup}</div></section>
    </div>
    <section class="customer-video-stories" aria-label="Historias reales en video">${renderVideoCarousel(videos, options)}</section>
    <section class="customer-comments" aria-labelledby="customer-comments-title"><div class="customer-section-heading"><h3 id="customer-comments-title">Lo que nos cuentan</h3></div><div class="customer-quote-grid">${quotes}</div></section>`;
}

export function bindCustomerPhotoCarousel(root) {
  if (!root) return;
  const track = root.querySelector('.customer-photo-grid');
  const prev = root.querySelector('[data-customer-photo-prev]');
  const next = root.querySelector('[data-customer-photo-next]');
  if (!track || !prev || !next) return;
  const updateControls = () => {
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    prev.disabled = max < 2 || track.scrollLeft <= 2;
    next.disabled = max < 2 || track.scrollLeft >= max - 2;
  };
  const move = direction => {
    const item = track.querySelector('.customer-photo-item');
    if (!item) return;
    const gap = parseFloat(root.ownerDocument.defaultView.getComputedStyle(track).gap) || 0;
    const delta = item.getBoundingClientRect().width + gap;
    const reduceMotion = root.ownerDocument.defaultView.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: direction * delta, behavior: reduceMotion ? 'instant' : 'smooth' });
  };
  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('scroll', updateControls, { passive: true });
  track.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowRight' ? 1 : -1);
  });
  root.ownerDocument.defaultView.addEventListener('resize', updateControls);
  updateControls();
}

export function eligibleVideos(items) {
  return items.filter(item => item.localReviewApproved === true && item.name && item.videoSrc && item.poster?.src);
}
function reviewableVideos(items, localReview) {
  return localReview ? items.filter(item => item.localReviewApproved === true && item.name && item.videoSrc && item.poster?.src) : eligibleVideos(items);
}
export function renderVideoCarousel(items, { localReview = false } = {}) {
  const eligible = reviewableVideos(items, localReview);
  if (!eligible.length) return '';
  return `<div class="carousel-heading"><div><h2 id="video-title">MultyDrink en su día a día.</h2></div></div><ul class="video-track" tabindex="0" aria-label="Testimonios en video">${eligible.map((item, index) => `<li class="video-card"><button type="button" data-play-video="${index}" aria-label="Reproducir testimonio de ${esc(item.name)}">${imageMarkup(item.poster, 'video-poster', '(max-width: 560px) 85vw, (max-width: 800px) 45vw, 360px')}<span class="video-inline-play-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="23" height="23" fill="currentColor" focusable="false"><path d="M8 5.8a1 1 0 0 1 1.52-.85l10 6.2a1 1 0 0 1 0 1.7l-10 6.2A1 1 0 0 1 8 18.2V5.8Z"/></svg></span></button></li>`).join('')}</ul><p class="sr-only" data-carousel-status aria-live="polite"></p>`;
}
export function bindVideoCarousel(root, items, { localReview = false } = {}) {
  const eligible = reviewableVideos(items, localReview);
  if (!eligible.length) return;
  const track = root.querySelector('.video-track');
  const cards = [...track.children];
  let active = null;
  const releasePlayer = () => {
    if (!active) return;
    const { video, button } = active;
    video.pause();
    video.removeAttribute('src');
    video.load();
    video.replaceWith(button);
    active = null;
  };
  // Native scrolling and touch swipes remain available, without visible arrows.
  const status = root.querySelector('[data-carousel-status]');
  const announcePosition = () => {
    const offsets = cards.map(card => Math.abs(card.offsetLeft - cards[0].offsetLeft - track.scrollLeft));
    const current = offsets.indexOf(Math.min(...offsets));
    status.textContent = `Testimonio ${current + 1} de ${cards.length}`;
  };
  track.addEventListener('scroll', announcePosition, { passive:true });
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const current = cards.reduce((best, card, i) =>
      Math.abs(card.offsetLeft - cards[0].offsetLeft - track.scrollLeft) <
      Math.abs(cards[best].offsetLeft - cards[0].offsetLeft - track.scrollLeft) ? i : best, 0);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1 :
      Math.max(0, Math.min(cards.length - 1, current + (event.key === 'ArrowRight' ? 1 : -1)));
    track.scrollTo({ left:cards[next].offsetLeft - cards[0].offsetLeft,
      behavior: root.ownerDocument.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  announcePosition();
  root.querySelectorAll('[data-play-video]').forEach(button => button.addEventListener('click', () => {
    releasePlayer();
    const item = eligible[Number(button.dataset.playVideo)];
    const video = root.ownerDocument.createElement('video');
    video.className = 'video-inline-player';
    video.controls = true;
    video.preload = 'none';
    video.playsInline = true;
    video.setAttribute('aria-label', `Testimonio de ${item.name}`);
    if (item.poster?.src) video.poster = item.poster.src;
    if (item.captionsSrc) {
      const captions = root.ownerDocument.createElement('track');
      captions.kind = 'captions'; captions.src = item.captionsSrc; captions.srclang = 'es'; captions.label = 'Español'; captions.default = true;
      video.append(captions);
    }
    button.replaceWith(video);
    active = { button, video };
    video.src = item.videoSrc;
    video.play()?.catch(() => {});
  }));
}
