import { packages, ingredientGroups, research, nutrition, faqCategories, faqs } from './config.js';
import { productMedia } from './media.js';
import { escapeHTML as esc, icon, renderFaqs } from './components.js';
import { money } from './order.js';
import { imageAttributes } from './images.js';

export function renderEditorialIngredients() {
  return ingredientGroups.map((item, index) => `<article class="editorial-ingredient"><div class="editorial-image ${item.images.length > 1 ? 'paired-images' : ''}">${item.images.map(name => `<img src="assets/${name}.webp" alt="${esc(name === 'tea' ? 'Té negro' : item.name)}" width="800" height="467" loading="lazy">`).join('')}</div><span class="editorial-index">0${index + 1} / ${esc(item.name)}</span><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></article>`).join('');
}
export function renderResearch() {
  return research.map(item => `<article><strong class="research-year">${item.year}</strong><h3>${esc(item.label)}</h3><p>${esc(item.description)}</p><a href="${item.url}" target="_blank" rel="noopener noreferrer">${esc(item.source)} ↗</a></article>`).join('');
}
export function renderNutrition() {
  const transcript = `<div class="nutrition-sheet"><span>DATOS DECLARADOS EN EL EMPAQUE</span><h3>Información<br>por porción</h3><p>${nutrition.servings} porciones por caja · 1 sobre (${nutrition.servingGrams} g)</p><table><caption class="sr-only">Datos nutricionales confirmados por porción de 10 gramos</caption><tbody>${nutrition.rows.map(([label, value]) => `<tr><th scope="row">${label}</th><td>${value}</td></tr>`).join('')}</tbody></table><p class="nutrition-note">Selección de datos de la etiqueta. Consulta tu empaque para la información nutricional completa.</p></div>`;
  const label = productMedia.nutritionLabel;
  if (!label) return transcript;
  return `<figure class="nutrition-label-figure"><a href="${esc(label.src)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir la etiqueta nutricional completa en una pestaña nueva"><img class="real-nutrition-label" ${imageAttributes(label, '(max-width: 560px) 90vw, 540px')} loading="lazy"></a><figcaption>Etiqueta suministrada de MultyDrink. <a href="${esc(label.src)}" target="_blank" rel="noopener noreferrer">Abrir en tamaño completo ↗</a></figcaption></figure><details class="nutrition-transcript"><summary>Leer los datos principales de la etiqueta</summary>${transcript}<p>Ingredientes declarados: pulpa concentrada de café, uva en polvo, sirope orgánico de agave azul, extracto de té negro, betaglucanos de Ganoderma lucidum y sabor natural a limón.</p><p>Preparación declarada: diluir un sobre en 250 mL de agua fría o a temperatura ambiente. Mezclar bien antes de consumir. Conservar en un lugar fresco y seco, alejado de la luz solar.</p></details>`;
}
export function renderFinalOffers() {
  return packages.map(item => {
    const photo = item.id === 'individual' ? productMedia.individual : { src: 'assets/family.webp', alt: 'Pack familiar de seis cajas MultyDrink', width: 567, height: 594 };
    return `<article class="final-offer"><div class="offer-photo ${photo ? '' : 'without-photo'}">${photo ? `<img ${imageAttributes(photo, '(max-width: 560px) 85vw, 420px')} loading="lazy">` : `<span class="offer-count">${item.sachets}<small>SOBRES / ${item.boxes} CAJA</small></span>`}</div><div class="offer-copy"><h3>${item.name}</h3><p>${item.boxes} ${item.boxes === 1 ? 'caja' : 'cajas'} · ${item.sachets} sobres · envío incluido</p><div class="offer-price"><strong>${money(item.price)}</strong><del>${money(item.referencePrice)}</del></div><p class="offer-saving">Ahorras ${money(item.referencePrice - item.price)}</p><a href="#pedido" class="button button-black" data-order-package="${item.id}">ELEGIR ${item.id === 'individual' ? 'CAJA INDIVIDUAL' : 'PACK FAMILIAR'} ${icon('arrow')}</a></div></article>`;
  }).join('');
}
export function renderFaqCategories() {
  return faqCategories.map((item, index) => `<button type="button" id="faq-tab-${item.id}" role="tab" aria-selected="${index === 0}" aria-controls="faq-panel-${item.id}" tabindex="${index === 0 ? '0' : '-1'}">${item.label}<span aria-hidden="true">↗</span></button>`).join('');
}
export function renderFaqPanels() {
  return faqCategories.map((item, index) => `<div id="faq-panel-${item.id}" role="tabpanel" tabindex="0" aria-labelledby="faq-tab-${item.id}" ${index ? 'hidden' : ''}>${renderFaqs(faqs.filter(faq => faq.category === item.id))}</div>`).join('');
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
export function renderComparison(pair) {
  if (!pair?.first?.src || !pair?.second?.src) return '';
  return `<div class="comparison-stage" style="--position:50%">${imageMarkup(pair.second, 'comparison-base')}<div class="comparison-overlay">${imageMarkup(pair.first)}</div><div class="comparison-labels"><span>${esc(pair.firstLabel)}</span><span>${esc(pair.secondLabel)}</span></div><div class="comparison-divider" aria-hidden="true"><span>‹ ›</span></div><label class="sr-only" for="comparison-range">Comparar las dos escenas: mueve el divisor</label><input id="comparison-range" type="range" min="0" max="100" value="50" step="1" aria-valuetext="50% de la primera escena" aria-describedby="comparison-help"></div><p id="comparison-help" class="comparison-help">Arrastra el divisor o usa las flechas del teclado. Dos momentos cotidianos; no representan un resultado garantizado del producto.</p>`;
}
export function bindComparison(root) {
  const stage = root.querySelector('.comparison-stage');
  if (!stage) return;
  const input = stage.querySelector('input');
  const update = value => {
    const position = Math.max(0, Math.min(100, Math.round(Number(value))));
    input.value = String(position); stage.style.setProperty('--position', position + '%');
    input.setAttribute('aria-valuetext', `${position}% de la primera escena`);
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

export function eligibleVideos(items) {
  return items.filter(item => item.approved === true && item.publicationRightsConfirmed === true && item.name && item.excerpt && item.poster?.src && item.sourceUrl && item.transcript && /^assets\/[\w.-]+\.vtt$/.test(item.captionsSrc) && /^assets\/[\w.-]+\.(mp4|webm)$/.test(item.videoSrc));
}
export function renderVideoCarousel(items) {
  const eligible = eligibleVideos(items);
  if (!eligible.length) return '';
  return `<div class="carousel-heading"><div><p class="eyebrow">EXPERIENCIAS COMPARTIDAS</p><h2 id="video-title">MultyDrink, en sus palabras.</h2></div><div class="carousel-controls"><button type="button" data-carousel-prev aria-label="Testimonio anterior">←</button><button type="button" data-carousel-next aria-label="Siguiente testimonio">→</button></div></div><ul class="video-track" tabindex="0" aria-label="Testimonios en video">${eligible.map((item, index) => `<li class="video-card"><button type="button" data-play-video="${index}" aria-label="Reproducir testimonio de ${esc(item.name)}">${imageMarkup(item.poster)}<span class="video-play" aria-hidden="true">▶</span></button><blockquote>${esc(item.excerpt)}</blockquote><p>${esc(item.name)}</p></li>`).join('')}</ul><p class="sr-only" data-carousel-status aria-live="polite"></p><dialog class="video-dialog" aria-labelledby="video-dialog-title"><button type="button" data-video-close class="dialog-close" aria-label="Cerrar video">×</button><h3 id="video-dialog-title"></h3><div data-video-player></div></dialog>`;
}
export function bindVideoCarousel(root, items) {
  const eligible = eligibleVideos(items);
  if (!eligible.length) return;
  const track = root.querySelector('.video-track');
  const cards = [...track.children];
  const prev = root.querySelector('[data-carousel-prev]'), next = root.querySelector('[data-carousel-next]');
  const dialog = root.querySelector('dialog'), player = root.querySelector('[data-video-player]');
  let index = 0;
  const controls = () => { prev.disabled = index === 0; next.disabled = index === cards.length - 1; root.querySelector('[data-carousel-status]').textContent = `Testimonio ${index + 1} de ${cards.length}`; };
  const go = value => { index = Math.max(0, Math.min(cards.length - 1, value)); const left = cards[index].offsetLeft - cards[0].offsetLeft; track.scrollTo({ left, behavior: root.ownerDocument.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); controls(); };
  prev.addEventListener('click', () => go(index - 1)); next.addEventListener('click', () => go(index + 1));
  track.addEventListener('keydown', event => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); go(event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1 : index + (event.key === 'ArrowRight' ? 1 : -1)); });
  track.addEventListener('scroll', () => { const offsets = cards.map(card => Math.abs(card.offsetLeft - cards[0].offsetLeft - track.scrollLeft)); index = offsets.indexOf(Math.min(...offsets)); controls(); });
  root.querySelectorAll('[data-play-video]').forEach(button => button.addEventListener('click', () => {
    const item = eligible[Number(button.dataset.playVideo)];
    const video = root.ownerDocument.createElement('video');
    video.controls = true; video.preload = 'none'; video.playsInline = true; video.poster = item.poster.src; video.src = item.videoSrc;
    const captions = root.ownerDocument.createElement('track');
    captions.kind = 'captions'; captions.src = item.captionsSrc; captions.srclang = 'es'; captions.label = 'Español'; captions.default = true;
    video.append(captions);
    const transcript = root.ownerDocument.createElement('details');
    const summary = root.ownerDocument.createElement('summary'); summary.textContent = 'Leer transcripción';
    const text = root.ownerDocument.createElement('p'); text.textContent = item.transcript;
    transcript.append(summary, text);
    player.replaceChildren(video, transcript); root.querySelector('#video-dialog-title').textContent = `Testimonio de ${item.name}`; dialog.showModal();
    video.play()?.catch(() => {});
  }));
  root.querySelector('[data-video-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { const video = player.querySelector('video'); if (video) { video.pause(); video.removeAttribute('src'); video.load(); } player.replaceChildren(); });
  controls();
}
