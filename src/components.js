import { packages, ingredients, gallery, faqs, departments, moments } from './config.js';
import { money } from './order.js';

const paths = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  box: '<path d="m12 3 9 5v9l-9 5-9-5V8l9-5Z"/><path d="m3 8 9 5 9-5M12 13v9M7 5.8l10 5.5"/>',
  leaf: '<path d="M20 3C7 2 2 8 6 15s15 3 14-12Z"/><path d="M3 21 16 8"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  truck: '<path d="M2 6h12v12H2zM14 10h4l4 5v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
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
    <input type="radio" name="package" value="${item.id}" ${item.id === selected ? 'checked' : ''}>
    <span class="package-content">${item.id === 'familiar' ? '<span class="package-tag">MEJOR PRECIO POR SOBRE</span>' : ''}
      <span class="package-title"><span>${item.name}</span><span class="radio-mark" aria-hidden="true"></span></span>
      <span class="package-detail">${item.boxes} ${item.boxes === 1 ? 'caja' : 'cajas'} · ${item.sachets} sobres</span>
      <span class="package-pricing"><strong>${money(item.price)}</strong><del>${money(item.referencePrice)}</del></span>
      <span class="package-unit">≈ ${money(Math.round(item.price / item.sachets))} / sobre</span>
      <span class="package-saving">Ahorras ${money(item.referencePrice - item.price)} <span>−${Math.round((1 - item.price / item.referencePrice) * 100)}%</span></span>
    </span></label>`).join('');
}
export function renderMomentTabs() {
  return moments.map((item, index) => `<button type="button" role="tab" id="tab-${item.id}" aria-controls="panel-${item.id}" aria-selected="${index === 0}" tabindex="${index === 0 ? '0' : '-1'}">${icon(item.icon)}${item.tab}</button>`).join('');
}
export function renderMomentPanels() {
  return moments.map((item, index) => `<div role="tabpanel" id="panel-${item.id}" aria-labelledby="tab-${item.id}" tabindex="0" ${index === 0 ? '' : 'hidden'}><h3>${item.title}</h3><p>${item.text}</p><ul class="benefits">${item.points.map(point => `<li>${icon('check')}<span>${point}</span></li>`).join('')}</ul><a class="button button-outline" href="#confianza">CONOCE LA INFORMACIÓN ${icon('arrow')}</a></div>`).join('');
}
export function renderGallery() {
  return gallery.map((item, index) => `<button type="button" class="gallery-thumb" data-gallery="${index}" aria-label="Ver ${item.label}" aria-pressed="${index === 0}"><img src="${item.thumbnail || item.src}" width="80" height="80" alt="" loading="lazy"><span>${item.label}</span></button>`).join('');
}
export function renderIngredients() {
  return ingredients.map((item, index) => `<article class="ingredient-card"><div class="ingredient-image"><img src="assets/${item.image}.webp" alt="${item.name}" width="800" height="467" loading="lazy"><span>0${index + 1}</span></div><div class="ingredient-copy"><span class="eyebrow">${item.subtitle}</span><h3>${item.name}</h3><p>${item.text}</p></div></article>`).join('');
}
export const renderFaqs = (items = faqs) => items.map(item => `<details class="accordion"><summary>${item.question}<span aria-hidden="true">+</span></summary><p>${item.answer}</p></details>`).join('');
export function renderField({ name, label, autocomplete, placeholder = '', type = 'text', optional = false, full = false, maxLength = 100 }) {
  return `<div class="field ${full ? 'full-width' : ''}"><label for="${name}">${label}${optional ? ' <span>(opcional)</span>' : ''}</label><input id="${name}" name="${name}" type="${type}" autocomplete="${autocomplete || 'off'}" placeholder="${placeholder}" maxlength="${maxLength}" ${optional ? '' : 'required'} ${name === 'phone' ? 'inputmode="tel"' : ''} aria-describedby="${name}-error"><span class="field-error" id="${name}-error"></span></div>`;
}
export const renderDepartments = () => departments.map(item => `<option value="${item}">${item}</option>`).join('');
export function renderTestimonials(reviews) {
  // Require approval and provenance. A source is not proof of a verified purchase.
  const approved = reviews.filter(item => item.approved === true && item.verifiedOrderId && item.verificationReference && item.sourceUrl && item.name && item.comment && Number.isInteger(item.rating) && item.rating >= 1 && item.rating <= 5);
  if (!approved.length) return '';
  return `<section class="section container" aria-labelledby="reviews-title"><p class="eyebrow">EXPERIENCIAS REALES</p><h2 id="reviews-title">En sus propias palabras.</h2><div class="review-grid">${approved.map(item => `<figure class="review-card"><div class="stars" aria-label="${item.rating} de 5 estrellas">${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}</div><blockquote>${escapeHTML(item.comment)}</blockquote><figcaption>${escapeHTML(item.name)}${item.verifiedPurchase === true && item.verificationReference ? ' <span>Compra verificada</span>' : ''}</figcaption></figure>`).join('')}</div></section>`;
}
