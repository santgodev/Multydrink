import { packages, ingredients, gallery, faqs, departments, moments } from './config.js';
import { money } from './order.js';

const paths = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  box: '<path d="m12 3 9 5v9l-9 5-9-5V8l9-5Z"/><path d="m3 8 9 5 9-5M12 13v9M7 5.8l10 5.5"/>',
  leaf: '<path d="M20 3C7 2 2 8 6 15s15 3 14-12Z"/><path d="M3 21 16 8"/>',
  flask: '<path d="M9 3h6M10 3v7L5 20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1l-5-10V3M8 15h8"/>',
  glass: '<path d="m5 3 2 18h10l2-18ZM6 10c4-3 8 3 12 0"/>',
  drop: '<path d="M12 3S5 11 5 15a7 7 0 0 0 14 0c0-4-7-12-7-12Z"/>',
  apple: '<path d="M12 7c-3-3-8-1-8 4 0 6 4 11 8 8 4 3 8-2 8-8 0-5-5-7-8-4ZM12 7V4M12 4c1-2 3-2 4-2M12 5C9 5 8 3 8 2"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  truck: '<path d="M2 6h12v12H2zM14 10h4l4 5v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  cash: '<path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7Z"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
  focus: '<circle cx="12" cy="12" r="4"/><path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5"/>',
  moon: '<path d="M20.8 13a9 9 0 0 1-9.8-9.8A9 9 0 1 0 20.8 13Z"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3"/>',
  chat: '<path d="M21 11a9 9 0 0 1-9 9H3l2-5a9 9 0 1 1 16-4Z"/><path d="M8 10h8M8 14h5"/>',
};
export const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.leaf}</svg>`;
export const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function renderPackages(selected) {
  return packages.map(item => `<label class="package-card ${item.id === selected ? 'is-selected' : ''}">
    <input type="radio" name="package" value="${item.id}" aria-label="${item.sachets} sobres, ${item.name}, ${money(item.price)} COP por paquete" ${item.id === selected ? 'checked' : ''}>
    <span class="package-content">${item.id === 'familiar' ? '<span class="package-tag">MEJOR VALOR</span>' : ''}
      <span class="package-icon" aria-hidden="true">${icon('box')}</span>
      <span class="package-info">
        <span class="package-title">${item.sachets} sobres</span>
        <span class="package-unit">${money(Math.round(item.price / item.sachets))} / sobre</span>
      </span>
      <span class="package-radio" aria-hidden="true"></span>
    </span></label>`).join('');
}
export function renderMomentTabs() {
  return moments.map((item, index) => `<button type="button" role="tab" id="tab-${item.id}" aria-controls="panel-${item.id}" aria-selected="${index === 0}" tabindex="${index === 0 ? '0' : '-1'}">${item.tab}</button>`).join('');
}
export function renderMomentPanels() {
  return moments.map((item, index) => `<div role="tabpanel" id="panel-${item.id}" aria-labelledby="tab-${item.id}" tabindex="0" ${index === 0 ? '' : 'hidden'}><h3>${item.title}</h3><p>${item.text}</p><ul class="benefits">${item.points.map(point => `<li>${icon('check')}<span>${point}</span></li>`).join('')}</ul><a class="button button-outline" href="#confianza">CONOCE LA INFORMACIÓN ${icon('arrow')}</a></div>`).join('');
}
export function renderGallery() {
  return gallery.map((item, index) => `<button type="button" class="gallery-thumb" data-gallery="${index}" aria-label="Ver ${item.label}" aria-pressed="${index === 0}"><img src="${item.thumbnail || item.src}" width="64" height="64" alt="" loading="lazy"></button>`).join('');
}
export function renderIngredients() {
  return ingredients.map((item, index) => `<article class="ingredient-card"><div class="ingredient-image"><img src="assets/${item.image}.webp" alt="${item.name}" width="800" height="467" loading="lazy"><span>0${index + 1}</span></div><div class="ingredient-copy"><span class="eyebrow">${item.subtitle}</span><h3>${item.name}</h3><p>${item.text}</p></div></article>`).join('');
}
export const renderFaqs = (items = faqs) => items.map(item => `<details class="accordion"><summary>${item.question}<span aria-hidden="true">+</span></summary><p>${item.answer}</p></details>`).join('');
export const renderProductFaqs = items => items.map(item => `<details class="accordion product-detail" data-detail="${escapeHTML(item.id)}">
  <summary>${icon(item.icon)}<strong>${escapeHTML(item.question)}</strong><span aria-hidden="true">+</span></summary>
  <div class="product-detail-body">
    ${item.intro ? `<p>${escapeHTML(item.intro)}</p>` : ''}
    ${item.items ? `<ul class="product-detail-list${item.stacked ? ' is-stacked' : ''}">${item.items.map(point => `<li>${point.icon ? `<span class="product-detail-symbol">${icon(point.icon)}</span>` : icon('check')}<div>${point.label ? `<strong>${escapeHTML(point.label)}</strong> ` : ''}${item.stacked ? `<p>${escapeHTML(point.text)}</p>` : escapeHTML(point.text)}</div></li>`).join('')}</ul>` : ''}
    ${item.footer ? `<p class="product-detail-footer">${escapeHTML(item.footer)}</p>` : ''}
  </div>
</details>`).join('');
export function renderField({ name, label, autocomplete, placeholder = '', type = 'text', optional = false, full = false, maxLength = 100, inputmode = name === 'phone' ? 'tel' : '' }) {
  return `<div class="field ${full ? 'full-width' : ''}"><label for="${name}">${label}${optional ? ' <span>(opcional)</span>' : ''}</label><input id="${name}" name="${name}" type="${type}" autocomplete="${autocomplete || 'off'}" placeholder="${placeholder}" maxlength="${maxLength}" ${optional ? '' : 'required'} ${inputmode ? `inputmode="${inputmode}"` : ''} aria-describedby="${name}-error"><span class="field-error" id="${name}-error"></span></div>`;
}
export const renderDepartments = () => departments.map(item => `<option value="${item}">${item}</option>`).join('');
export function renderTestimonials(reviews) {
  // Only user-supplied transcript excerpts; no fabricated stars, ratings or verification badges.
  const excerpts = reviews.filter(item => item.transcriptProvided === true && item.name && item.comment);
  if (!excerpts.length) return '';
  return `<section class="purchase-reviews" aria-labelledby="reviews-title" aria-roledescription="carrusel">
    <div class="purchase-reviews-heading"><h2 id="reviews-title">Experiencias compartidas</h2><div class="review-controls"><button type="button" data-review-prev aria-label="Testimonio anterior">‹</button><button type="button" data-review-next aria-label="Siguiente testimonio">›</button></div></div>
    <div class="purchase-review-track" tabindex="0" aria-label="Experiencias personales; usa las flechas para navegar">
      ${excerpts.map((item, index) => `<figure class="purchase-review-card" role="group" aria-roledescription="diapositiva" aria-label="${index + 1} de ${excerpts.length}">
        <span class="review-topic">${escapeHTML(item.topic || 'Experiencia personal')}</span>
        <blockquote class="review-quote">“${escapeHTML(item.comment)}”</blockquote>
        <figcaption class="review-author"><strong>${escapeHTML(item.name)}</strong>${item.location ? `<span>${escapeHTML(item.location)}</span>` : ''}</figcaption>
        <p class="review-source-note">${escapeHTML(item.sourceNote || 'Testimonio personal')}</p>
      </figure>`).join('')}
    </div>
    <div class="review-dots" aria-label="Elegir testimonio">${excerpts.map((_, index) => `<button type="button" data-review-index="${index}" aria-label="Ver testimonio ${index + 1}" aria-pressed="${index === 0}"></button>`).join('')}</div>
    <p class="sr-only" data-review-status aria-live="polite"></p>
  </section>`;
}

export function bindTestimonials(root) {
  const track = root.querySelector('.purchase-review-track');
  if (!track) return;
  const win = root.ownerDocument.defaultView;
  const cards = [...track.children];
  const dots = [...root.querySelectorAll('[data-review-index]')];
  let index = 0;
  function controls() {
    cards.forEach((card, i) => { card.inert = i !== index; });
    root.querySelector('[data-review-prev]').disabled = index === 0;
    root.querySelector('[data-review-next]').disabled = index === cards.length - 1;
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === index)));
    root.querySelector('[data-review-status]').textContent = `Testimonio ${index + 1} de ${cards.length}`;
  }
  function go(next) {
    index = Math.max(0, Math.min(cards.length - 1, next));
    track.scrollTo({ left: cards[index].offsetLeft - cards[0].offsetLeft, behavior: win.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    controls();
  }
  root.querySelector('[data-review-prev]').addEventListener('click', () => go(index - 1));
  root.querySelector('[data-review-next]').addEventListener('click', () => go(index + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => go(i)));
  track.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); go(event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1 : index + (event.key === 'ArrowRight' ? 1 : -1));
  });
  track.addEventListener('scroll', () => {
    const nearest = cards.map(card => Math.abs(card.offsetLeft - cards[0].offsetLeft - track.scrollLeft));
    index = nearest.indexOf(Math.min(...nearest)); controls();
  });
  controls();
}
