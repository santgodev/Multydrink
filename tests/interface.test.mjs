import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';
import { initApp } from '../src/app.js';
import { commerce } from '../src/config.js';
import { renderTestimonials, bindTestimonials } from '../src/components.js';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const configured = { ...commerce, orderEndpoint: '/test-orders', merchantName: 'Test merchant', privacyPolicyUrl: '/test-policy', privacyPolicyVersion: 'test-v1', shippingFee: 0, shippingDescription: 'Test delivery' };
function setup(options = {}) {
  const win = new Window({ url: 'http://localhost:4173', settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true } });
  win.document.write(html);
  const app = initApp(win.document, win, options);
  return { win, doc: win.document, app, $: selector => win.document.querySelector(selector) };
}
function fill(ctx, id, value, event = 'input') {
  const node = ctx.$('#' + id);
  if (node.type === 'checkbox') node.checked = value; else node.value = value;
  node.dispatchEvent(new ctx.win.Event(event, { bubbles: true }));
}
function fillValid(ctx) {
  for (const [id, value] of Object.entries({ fullName: 'María Pérez', documentNumber: '0012345678', phone: '3001234567', department: 'Antioquia', city: 'Medellín', address: 'Carrera 10 # 20-30', neighborhood: 'Laureles', privacy: true })) fill(ctx, id, value, 'change');
}
const settle = () => new Promise(resolve => setTimeout(resolve, 0));

test('Package selection synchronizes cards, form, sticky price and quantity totals', () => {
  const ctx = setup();
  assert.equal(ctx.$('#sticky-price').textContent, '$425.000');
  assert.equal(ctx.$('#summary-subtotal').textContent, '$425.000');
  ctx.$('input[value="individual"]').click();
  assert.equal(ctx.$('#packageId').value, 'individual');
  assert.equal(ctx.$('#sticky-price').textContent, '$110.000');
  assert.equal(ctx.$('#selected-package-price').textContent, '$110.000');
  assert.equal(ctx.$('#selected-package-name').textContent, 'Caja individual');
  ctx.$('#quantity-more').click();
  assert.equal(ctx.$('#summary-subtotal').textContent, '$220.000');
  assert.equal(ctx.$('#summary-count').textContent, '2 cajas · 42 sobres en total');
  assert.equal(ctx.$('#summary-total').textContent, '$220.000');
  assert.equal(ctx.$('#summary-shipping').textContent, 'Incluido');
  fill(ctx, 'packageId', 'familiar', 'change');
  assert.equal(ctx.$('#summary-subtotal').textContent, '$850.000');
  assert.equal(ctx.$('#summary-savings').textContent, '$470.000');
  assert.equal(ctx.$('input[value="familiar"]').checked, true);
  assert.equal(ctx.$('#selected-package-price').textContent, '$425.000');
  assert.match(ctx.$('input[value="individual"]').nextElementSibling.querySelector('.package-unit').textContent, /5\.238/);
  assert.match(ctx.$('input[value="familiar"]').nextElementSibling.querySelector('.package-unit').textContent, /3\.373/);
  const individualCard = ctx.$('input[value="individual"]').nextElementSibling;
  const familyCard = ctx.$('input[value="familiar"]').nextElementSibling;
  assert.equal(individualCard.querySelector('.package-title').textContent, '21 sobres');
  assert.equal(familyCard.querySelector('.package-title').textContent, '126 sobres');
  assert.equal(individualCard.querySelector('.package-saving'), null);
  assert.equal(familyCard.querySelector('.package-saving'), null);
  assert.equal(familyCard.querySelector('.package-tag').textContent, 'MEJOR VALOR');
  assert.equal(ctx.$('#offer-saving').textContent, 'AHORRA 36%');
  assert.equal(ctx.$('#offer-saving').hidden, false);
  assert.equal(ctx.$('#package-selector del'), null);
  ctx.win.happyDOM.abort();
});
test('Quantity rejects invalid typed values, caps at configured bounds and recovers', () => {
  const ctx = setup();
  assert.equal(ctx.$('#quantity-less').disabled, true);
  fill(ctx, 'quantity', '0');
  assert.equal(ctx.$('#quantity').getAttribute('aria-invalid'), 'true');
  assert.equal(ctx.$('#summary-subtotal').textContent, '—');
  fill(ctx, 'quantity', '20');
  assert.equal(ctx.$('#quantity-more').disabled, true);
  assert.equal(ctx.$('#summary-subtotal').textContent, '$8.500.000');
  fill(ctx, 'quantity', '1.5');
  assert.equal(ctx.$('#quantity').getAttribute('aria-invalid'), 'true');
  ctx.$('#quantity-less').click();
  assert.equal(ctx.$('#quantity').value, '19');
  assert.equal(ctx.$('#quantity').getAttribute('aria-invalid'), 'false');
  ctx.win.happyDOM.abort();
});
test('Gallery buttons, thumbnails and arrow keys update image and accessible state', () => {
  const ctx = setup();
  assert.match(ctx.$('#hero-image').src, /hero-ingredientes-1254.webp$/);
  ctx.$('#gallery-next').click();
  assert.match(ctx.$('#hero-image').src, /gallery-02-descanso-oficina-1254.webp$/);
  assert.equal(ctx.$('[data-gallery="1"]').getAttribute('aria-pressed'), 'true');
  assert.equal(ctx.doc.querySelectorAll('[data-gallery][aria-pressed="true"]').length, 1);
  ctx.$('#gallery-thumbs').dispatchEvent(new ctx.win.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  assert.match(ctx.$('#hero-image').src, /gallery-03-coworking-1254.webp$/);
  assert.equal(ctx.doc.activeElement, ctx.$('[data-gallery="2"]'));
  ctx.$('#gallery-thumbs').dispatchEvent(new ctx.win.KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
  ctx.$('#gallery-prev').click();
  assert.equal(ctx.$('#gallery-count').textContent, '10 / 10');
  assert.match(ctx.$('#hero-image').src, /gallery-10-bebida-caja-sobres-1254.webp$/);
  ctx.win.happyDOM.abort();
});

test('Product reading order introduces the product and purchase before supplementary details', () => {
  const ctx = setup();
  const sequence = ['.product-intro', '.product-visual', '.product-info', '#product-accordions'];
  assert.deepEqual([...ctx.$('#producto').children].map(element => sequence.find(selector => element.matches(selector))), sequence);
  assert.ok(ctx.$('.product-info .main-cta'));
  assert.equal(ctx.doc.querySelectorAll('h1').length, 1);
  ctx.win.happyDOM.abort();
});
test('Menu supports opening, link dismissal and Escape; CTAs open checkout dialog', () => {
  const ctx = setup();
  const menu = ctx.$('.menu-toggle');
  menu.click(); assert.equal(menu.getAttribute('aria-expanded'), 'true');
  ctx.doc.dispatchEvent(new ctx.win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(menu.getAttribute('aria-expanded'), 'false');
  assert.equal(ctx.doc.activeElement, menu);
  menu.click(); ctx.$('#navigation a').click();
  assert.equal(menu.getAttribute('aria-expanded'), 'false');
  ctx.$('.main-cta').click();
  assert.equal(ctx.$('#pedido').open, true);
  assert.equal(ctx.$('main #order-form'), null);
  assert.equal(ctx.doc.activeElement, ctx.$('#order-title'));
  ctx.win.happyDOM.abort();
});
test('Missing service keeps submission disabled and blocks programmatic submission', async () => {
  let calls = 0;
  const ctx = setup({ fetcher: async () => { calls++; } });
  assert.equal(ctx.$('#submit-order').disabled, true);
  ctx.$('#order-form').dispatchEvent(new ctx.win.Event('submit', { bubbles: true, cancelable: true }));
  await settle();
  assert.equal(calls, 0);
  assert.equal(ctx.$('#order-confirmation').hidden, true);
  assert.match(ctx.$('#form-message').textContent, /No hemos enviado tus datos/);
  ctx.win.happyDOM.abort();
});
test('Validation shows field errors, corrects in real time and focuses first invalid field', async () => {
  const ctx = setup({ commerce: configured });
  assert.equal(ctx.$('#fullName').closest('.field').nextElementSibling.querySelector('input').id, 'documentNumber');
  assert.equal(ctx.$('#documentNumber').type, 'text');
  assert.equal(ctx.$('#documentNumber').getAttribute('inputmode'), 'numeric');
  assert.equal(ctx.$('#documentNumber').required, true);
  assert.equal(ctx.$('label[for="phone"]').textContent, 'Celular');
  fill(ctx, 'documentNumber', '', 'change');
  assert.equal(ctx.$('#documentNumber').getAttribute('aria-invalid'), 'true');
  fill(ctx, 'documentNumber', '0012345678');
  assert.equal(ctx.$('#documentNumber').value, '0012345678');
  assert.equal(ctx.$('#documentNumber-error').textContent, '');
  fill(ctx, 'phone', '123', 'change');
  assert.equal(ctx.$('#phone').getAttribute('aria-invalid'), 'true');
  fill(ctx, 'phone', '3001234567');
  assert.equal(ctx.$('#phone').getAttribute('aria-invalid'), 'false');
  ctx.$('#order-form').dispatchEvent(new ctx.win.Event('submit', { bubbles: true, cancelable: true }));
  await settle();
  assert.equal(ctx.doc.activeElement, ctx.$('#fullName'));
  assert.ok(ctx.$('#privacy-error').textContent);
  ctx.win.happyDOM.abort();
});
test('Configured submission shows loading, locks duplicate clicks and renders real receipt', async () => {
  let resolveRequest;
  let calls = 0;
  const ctx = setup({ commerce: configured, fetcher: () => { calls++; return new Promise(resolve => { resolveRequest = resolve; }); } });
  fillValid(ctx);
  const submit = () => ctx.$('#order-form').dispatchEvent(new ctx.win.Event('submit', { bubbles: true, cancelable: true }));
  submit(); submit();
  assert.equal(calls, 1);
  assert.equal(ctx.$('#submit-order').disabled, true);
  assert.equal(ctx.$('#order-fields').disabled, true);
  assert.match(ctx.$('#submit-order').textContent, /Enviando/);
  resolveRequest(new Response(JSON.stringify({ status: 'received', orderId: '<test-123>', total: 425000, currency: 'COP' })));
  await settle();
  assert.equal(ctx.$('#order-form').hidden, true);
  assert.equal(ctx.$('#order-confirmation').hidden, false);
  assert.match(ctx.$('#confirmation-detail').textContent, /<test-123>/);
  assert.equal(ctx.$('#confirmation-detail').children.length, 0);
  assert.equal(ctx.doc.activeElement, ctx.$('#order-confirmation'));
  ctx.win.happyDOM.abort();
});
test('Submission failure retains customer data and unlocks retry without success', async () => {
  const ctx = setup({ commerce: configured, fetcher: async () => new Response('{}', { status: 500 }) });
  fillValid(ctx);
  ctx.$('#order-form').dispatchEvent(new ctx.win.Event('submit', { bubbles: true, cancelable: true }));
  await settle();
  assert.equal(ctx.$('#order-confirmation').hidden, true);
  assert.equal(ctx.$('#order-fields').disabled, false);
  assert.equal(ctx.$('#submit-order').disabled, false);
  assert.equal(ctx.$('#fullName').value, 'María Pérez');
  assert.equal(ctx.$('#form-message').hidden, false);
  ctx.win.happyDOM.abort();
});
test('Legal dialogs open and close; FAQs use native semantic accordions', () => {
  const ctx = setup();
  ctx.$('#privacy-link').click(); assert.equal(ctx.$('#privacy-dialog').open, true);
  ctx.$('#privacy-dialog [data-close]').click(); assert.equal(ctx.$('#privacy-dialog').open, false);
  assert.equal(ctx.doc.querySelectorAll('#faq-list details>summary').length, 11);
  assert.equal(ctx.doc.querySelectorAll('#product-accordions details>summary').length, 5);
  ctx.win.happyDOM.abort();
});
test('Routine tabs support click, roving keyboard focus and one visible associated panel', () => {
  const ctx = setup();
  const tabs = [...ctx.doc.querySelectorAll('#moment-tabs [role="tab"]')];
  assert.equal(tabs.length, 4);
  tabs[1].click();
  assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
  assert.equal(ctx.$('#panel-energia').hidden, false);
  assert.equal(ctx.$('#panel-enfoque').hidden, true);
  tabs[1].dispatchEvent(new ctx.win.KeyboardEvent('keydown', { key: 'End', bubbles: true }));
  assert.equal(ctx.doc.activeElement, tabs[3]);
  assert.equal(tabs[1].tabIndex, -1);
  assert.equal(tabs[3].tabIndex, 0);
  tabs[3].dispatchEvent(new ctx.win.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  assert.equal(ctx.doc.activeElement, tabs[0]);
  assert.equal(ctx.doc.querySelectorAll('#moment-panels [role="tabpanel"]:not([hidden])').length, 1);
  ctx.win.happyDOM.abort();
});
test('Product facts use configured counts and all accessibility ID references resolve', () => {
  const ctx = setup();
  assert.match(ctx.$('#nutrition-composition').textContent, /21 porciones/);
  assert.match(ctx.$('#nutrition-composition').textContent, /0,2 g/);
  for (const attribute of ['aria-labelledby', 'aria-describedby', 'aria-controls']) {
    for (const element of ctx.doc.querySelectorAll(`[${attribute}]`)) {
      for (const id of element.getAttribute(attribute).split(/\s+/)) assert.ok(ctx.doc.getElementById(id), `${attribute}: ${id}`);
    }
  }
  ctx.win.happyDOM.abort();
});
test('All control labels, image alternatives and internal anchor destinations exist', () => {
  const ctx = setup();
  const ids = [...ctx.doc.querySelectorAll('[id]')].map(el => el.id);
  assert.equal(ids.length, new Set(ids).size);
  for (const input of ctx.doc.querySelectorAll('input,select')) assert.ok(input.closest('label') || ctx.$(`label[for="${input.id}"]`));
  for (const image of ctx.doc.querySelectorAll('img')) assert.ok(image.hasAttribute('alt'));
  for (const anchor of ctx.doc.querySelectorAll('a[href^="#"]')) assert.ok(ctx.doc.getElementById(anchor.getAttribute('href').slice(1)));
  assert.equal(ctx.$('#testimonials').hidden, true);
  assert.equal(ctx.$('#testimonials').children.length, 0);
  assert.ok(ctx.$('.product-info #testimonials'));
  ctx.win.happyDOM.abort();
});
test('Reviews require approval and source; text is escaped and verification requires evidence', () => {
  assert.equal(renderTestimonials([{ name: 'Example', rating: 5, comment: 'Example' }]), '');
  const rendered = renderTestimonials([{ approved: true, publicationRightsConfirmed: true, sourceUrl: 'https://example.com', name: '<script>', comment: '<img src=x>', rating: 4, verifiedPurchase: false, verifiedOrderId: 'test-order', verificationReference: 'test-evidence' }]);
  assert.match(rendered, /&lt;script&gt;/);
  assert.doesNotMatch(rendered, /Compra verificada/);
});

test('Hero offer preserves shared quantity, bounds, totals and independent gallery state', () => {
  const ctx = setup();
  const image = ctx.$('#hero-image').getAttribute('src');
  ctx.$('#offer-more').click();
  assert.equal(ctx.$('#quantity').value, '2');
  assert.equal(ctx.$('#offer-total').textContent, 'Total: COP $850.000');
  ctx.$('input[value="individual"]').click();
  assert.equal(ctx.$('#offer-saving').hidden, true);
  assert.equal(ctx.$('#offer-total').textContent, 'Total: COP $220.000');
  assert.match(ctx.$('#offer-image').getAttribute('src'), /caja-principal/);
  assert.equal(ctx.$('#hero-image').getAttribute('src'), image);
  fill(ctx, 'offer-quantity', '21');
  assert.equal(ctx.$('#quantity').value, '21');
  assert.equal(ctx.$('#offer-quantity').getAttribute('aria-invalid'), 'true');
  fill(ctx, 'offer-quantity', '20');
  assert.equal(ctx.$('#offer-more').disabled, true);
  assert.equal(ctx.$('#quantity-more').disabled, true);
  fill(ctx, 'quantity', '1');
  assert.equal(ctx.$('#offer-quantity').value, '1');
  assert.equal(ctx.$('#offer-less').disabled, true);
  assert.equal(ctx.$('#offer-quantity-error').textContent, '');
  ctx.win.happyDOM.abort();
});

test('Review output does not invent scores, provenance or purchase verification', () => {
  const fixture = { approved: true, publicationRightsConfirmed: true, sourceUrl: 'https://example.com/review', name: 'Fixture', comment: 'Test only' };
  assert.equal(renderTestimonials([{ ...fixture, publicationRightsConfirmed: false }]), '');
  assert.equal(renderTestimonials([{ ...fixture, sourceUrl: 'javascript:alert(1)' }]), '');
  const plain = renderTestimonials([{ ...fixture, verifiedPurchase: true }]);
  assert.doesNotMatch(plain, /Compra verificada|review-stars|4\.9|500|TODO COLOMBIA|PRODUCTO SEGURO/);
  assert.match(plain, /Ver fuente/);
  assert.match(renderTestimonials([{ ...fixture, rating: 3 }]), /3 de 5 estrellas/);
});

test('Review carousel supports arrows, endpoints and pagination with one interactive slide', () => {
  const win = new Window();
  const root = win.document.createElement('div');
  win.document.body.append(root);
  root.innerHTML = renderTestimonials([1, 2, 3].map(n => ({ approved: true, publicationRightsConfirmed: true, sourceUrl: 'https://example.com/test', name: `Fixture ${n}`, comment: 'Test content' })));
  const track = root.querySelector('.purchase-review-track');
  [...track.children].forEach((card, n) => Object.defineProperty(card, 'offsetLeft', { value: n * 300 }));
  track.scrollTo = ({ left }) => { track.scrollLeft = left; };
  bindTestimonials(root);
  const key = key => track.dispatchEvent(new win.KeyboardEvent('keydown', { key, bubbles: true }));
  key('End');
  assert.equal(track.scrollLeft, 600);
  assert.equal(root.querySelector('[data-review-next]').disabled, true);
  assert.equal([...track.children].filter(c => !c.inert).length, 1);
  key('Home');
  assert.equal(root.querySelector('[data-review-prev]').disabled, true);
  root.querySelector('[data-review-next]').click();
  assert.equal(track.scrollLeft, 300);
  root.querySelector('[data-review-index="2"]').click();
  assert.equal(track.children[2].inert, false);
  assert.equal(root.querySelector('[data-review-status]').textContent, 'Testimonio 3 de 3');
  win.happyDOM.abort();
});


test('Checkout modal preserves selection, totals and form values across openings', async () => {
  const ctx = setup();
  ctx.$('#offer-more').click();
  ctx.$('.main-cta').focus();
  ctx.$('.main-cta').click();
  assert.equal(ctx.$('#pedido').open, true);
  assert.equal(ctx.$('#packageId').value, 'familiar');
  assert.equal(ctx.$('#quantity').value, '2');
  assert.equal(ctx.$('#summary-total').textContent, '$850.000');
  fill(ctx, 'neighborhood', 'Laureles', 'change');
  fill(ctx, 'packageId', 'individual', 'change');
  assert.equal(ctx.$('#summary-total').textContent, '$220.000');
  assert.equal(ctx.$('#offer-quantity').value, '2');
  ctx.$('#pedido [data-close]').click();
  await settle();
  assert.equal(ctx.$('#pedido').open, false);
  assert.equal(ctx.doc.activeElement, ctx.$('.main-cta'));
  assert.equal(ctx.doc.documentElement.classList.contains('checkout-open'), false);
  ctx.$('.nav-purchase').click();
  assert.equal(ctx.$('#quantity').value, '2');
  assert.equal(ctx.$('#neighborhood').value, 'Laureles');
  ctx.$('#pedido [data-close]').click();
  await settle();
  ctx.$('[data-order-package="familiar"]').click();
  assert.equal(ctx.$('#packageId').value, 'familiar');
  assert.equal(ctx.$('#quantity').value, '2');
  assert.equal(ctx.$('#summary-total').textContent, '$850.000');
  ctx.win.happyDOM.abort();
});
