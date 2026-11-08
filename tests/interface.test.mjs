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
  const win = new Window({ url: options.url || 'http://localhost:4173', settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true } });
  win.document.write(html);
  if (options.viewportWidth) Object.defineProperty(win, 'innerWidth', { configurable:true, value:options.viewportWidth });
  const app = initApp(win.document, win, options.commerce ? { ...options, turnstile: { mount: async () => {}, getToken: () => 'test-turnstile-token', reset: () => {} } } : options);
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
  assert.equal(ctx.$('.order-summary .summary-saving').hidden, true);
  assert.equal(ctx.$('#packageId').value, 'individual');
  assert.equal(ctx.$('#sticky-price').textContent, '$110.000');
  assert.equal(ctx.$('#sticky-reference').hidden, true);
  assert.equal(ctx.$('#sticky-reference').textContent, '');
  assert.equal(ctx.$('input[value="individual"]').checked, true);
  ctx.$('#quantity-more').click();
  assert.equal(ctx.$('#summary-subtotal').textContent, '$220.000');
  assert.equal(ctx.$('#summary-count').textContent, '2 cajas · 42 sobres en total');
  assert.equal(ctx.$('#summary-total').textContent, '$220.000');
  assert.equal(ctx.$('#summary-shipping').textContent, 'Incluido');
  fill(ctx, 'packageId', 'familiar', 'change');
  assert.equal(ctx.$('.order-summary .summary-saving').hidden, false);
  assert.equal(ctx.$('#summary-subtotal').textContent, '$850.000');
  assert.equal(ctx.$('#summary-savings').textContent, '$470.000');
  assert.equal(ctx.$('#sticky-reference').hidden, false);
  assert.equal(ctx.$('#sticky-reference').textContent, '$660.000');
  assert.equal(ctx.$('input[value="familiar"]').checked, true);
  assert.equal(ctx.$('input[value="familiar"]').checked, true);
  const individualCard = ctx.$('input[value="individual"]').nextElementSibling;
  const familyCard = ctx.$('input[value="familiar"]').nextElementSibling;
  assert.equal(individualCard.querySelector('.package-title').textContent, 'Caja individual');
  assert.equal(familyCard.querySelector('.package-title').textContent, 'Pack familiar');
  assert.equal(individualCard.querySelector('.package-unit').textContent, '21 sobres');
  assert.equal(familyCard.querySelector('.package-unit').textContent, '6 cajas · 126 sobres');
  assert.equal(individualCard.querySelector('.package-price strong').textContent, '$110.000');
  assert.equal(familyCard.querySelector('.package-price strong').textContent, '$425.000');
  assert.equal(individualCard.querySelector('.package-saving'), null);
  assert.equal(familyCard.querySelector('.package-saving').textContent, 'Ahorras comprando el pack $235.000');
  assert.equal(familyCard.querySelector('del').textContent, '$660.000');
  assert.equal(familyCard.querySelector('.package-tag').textContent, 'MEJOR VALOR');
  assert.equal(ctx.doc.querySelectorAll('.package-card .package-cta').length, 2);
  assert.equal(ctx.$('#offer-image'), null);
  ctx.$('#quantity-more').click();
  assert.equal(ctx.$('#quantity').value, '3');
  assert.equal(ctx.$('#offer-total'), null);
  assert.equal(ctx.$('#summary-total').textContent, '$1.275.000');
  ctx.$('.package-card.is-selected .package-cta').click();
  assert.equal(ctx.$('#pedido').open, true);
  assert.equal(ctx.$('#packageId').value, 'familiar');
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
  assert.match(ctx.$('#hero-image').src, /hero-02-producto-approved-1024.webp$/);
  ctx.$('#gallery-next').click();
  assert.match(ctx.$('#hero-image').src, /hero-ingredientes-1254.webp$/);
  assert.equal(ctx.$('[data-gallery="1"]').getAttribute('aria-pressed'), 'true');
  assert.equal(ctx.doc.querySelectorAll('[data-gallery][aria-pressed="true"]').length, 1);
  ctx.$('#gallery-thumbs').dispatchEvent(new ctx.win.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  assert.match(ctx.$('#hero-image').src, /hero-03-beneficios-approved-1254.webp$/);
  assert.equal(ctx.doc.activeElement, ctx.$('[data-gallery="2"]'));
  ctx.$('#gallery-thumbs').dispatchEvent(new ctx.win.KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
  ctx.$('#gallery-prev').click();
  assert.equal(ctx.$('#gallery-count').textContent, '08 / 08');
  assert.match(ctx.$('#hero-image').src, /hero-08-mujer-oficina-approved-1086.webp$/);
  ctx.win.happyDOM.abort();
});

test('Checkout has one order flow and mobile-first summary, delivery, final action order', () => {
  const ctx = setup();
  try {
    const form = ctx.$('#order-form');
    const columns = ctx.$('.checkout-columns');
    assert.deepEqual([...columns.children].map(element => element.className),
      ['checkout-details', 'checkout-customer', 'checkout-actions']);
    for (const id of ['packageId', 'quantity', 'customer-fields', 'privacy', 'order-turnstile', 'submit-order']) {
      assert.equal(ctx.doc.querySelectorAll('#' + id).length, 1);
      assert.equal(form.contains(ctx.$('#' + id)), true);
    }
    assert.equal(ctx.$('#order-availability').hidden, true);
    assert.equal(ctx.doc.querySelector('.order-assurance'), null);
    assert.equal(ctx.$('#shipping-note').textContent,
      'Pago contra entrega, sin anticipos. La cobertura y el plazo de entrega se confirman según tu dirección.');
    assert.equal(ctx.$('#order-title').textContent,
      '¡ESTÁS A UN PASO DE RECIBIR MULTYDRINK EN CASA!');
    ctx.$('#quantity-more').click();
    assert.equal(ctx.$('#summary-total').textContent, '$850.000');
  } finally { ctx.win.happyDOM.abort(); }
});

test('Mobile checkout initializes at phone width and closes with the X button', () => {
  const ctx = setup({ viewportWidth:390 });
  try {
    ctx.$('.nav-purchase').click();
    assert.equal(ctx.$('#pedido').open, true);
    ctx.$('#pedido .checkout-header [data-close]').click();
    assert.equal(ctx.$('#pedido').open, false);
    assert.equal(ctx.doc.documentElement.classList.contains('checkout-open'), false);
    ctx.$('.nav-purchase').click();
    assert.equal(ctx.$('#pedido').open, true);
    ctx.$('#pedido .checkout-header [data-close]').click();
    assert.equal(ctx.$('#pedido').open, false);
  } finally { ctx.win.happyDOM.abort(); }
});

test('Product reading order introduces the product and purchase before supplementary details', () => {
  const ctx = setup();
  const sequence = ['.product-intro', '.product-visual', '.product-info', '#product-accordions'];
  assert.deepEqual([...ctx.$('#producto').children].map(element => sequence.find(selector => element.matches(selector))), sequence);
  assert.ok(ctx.$('.product-info .package-card.is-selected .package-cta'));
  assert.equal(ctx.doc.querySelectorAll('h1').length, 1);
  ctx.win.happyDOM.abort();
});
test('Empty header navigation stays hidden, content sections remain and purchase CTAs open checkout', () => {
  const ctx = setup();
  assert.equal(ctx.$('#navigation').hidden, true);
  assert.equal(ctx.$('.menu-toggle').hidden, true);
  for (const id of ['producto', 'ingredientes', 'confianza', 'preguntas']) {
    assert.equal(ctx.$(`header a[href="#${id}"]`), null);
    assert.ok(ctx.$(`main #${id}`));
  }
  assert.ok(ctx.$('header .brand img'));
  ctx.$('.nav-purchase').click();
  assert.equal(ctx.$('#pedido').open, true);
  assert.equal(ctx.$('main #order-form'), null);
  assert.equal(ctx.doc.activeElement, ctx.$('#order-title'));
  ctx.win.happyDOM.abort();
});
test('Missing service keeps submission disabled and blocks programmatic submission', async () => {
  let calls = 0;
  const unavailable = { ...configured, orderEndpoint: null };
  const ctx = setup({ commerce: unavailable, fetcher: async () => { calls++; } });
  fillValid(ctx);
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
  assert.equal(ctx.$('#order-entry').hidden, false);
  assert.equal(ctx.$('#order-entry').inert, false);
  const originalTitle = ctx.$('#order-title').textContent;
  const originalSubtitle = ctx.$('.checkout-subtitle').textContent;
  const originalDetails = ctx.$('.checkout-details').innerHTML;
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
  assert.equal(ctx.$('#confirmation-detail').textContent, '<test-123>');
  assert.equal(ctx.$('#confirmation-detail').children.length, 0);
  assert.equal(ctx.$('#confirmation-total').textContent, '$425.000 COP');
  assert.equal(ctx.$('#order-title').textContent, originalTitle);
  assert.equal(ctx.$('.checkout-subtitle').textContent, originalSubtitle);
  assert.equal(ctx.$('.checkout-details').innerHTML, originalDetails);
  assert.equal(ctx.$('#pedido').classList.contains('is-confirmed'), true);
  assert.equal(ctx.$('#pedido').getAttribute('aria-labelledby'), 'confirmation-heading');
  assert.equal(ctx.$('#order-entry').hidden, true);
  assert.equal(ctx.$('#order-entry').inert, true);
  for (const selector of ['.checkout-header', '#order-availability', '#shipping-note', '#order-form', '#privacy', '#order-turnstile', '#submit-order']) {
    assert.ok(ctx.$(selector).closest('[hidden]'), `${selector} must be hidden without relying on receipt CSS`);
  }
  assert.equal(ctx.$('#order-confirmation').closest('#order-entry'), null);
  assert.equal(ctx.$('#order-confirmation').textContent.split('<test-123>').length - 1, 1);
  submit(); await settle(); assert.equal(calls, 1, 'Confirmed orders cannot be resubmitted');
  assert.equal(ctx.$('.checkout-subtitle').getAttribute('aria-hidden'), null);
  assert.match(ctx.$('.confirmation-followup').textContent, /WhatsApp/);
  assert.equal(ctx.doc.activeElement, ctx.$('#order-confirmation'));
  ctx.$('.package-card.is-selected .package-cta').click();
  assert.equal(ctx.doc.activeElement, ctx.$('#order-confirmation'));
  ctx.$('#order-confirmation [data-close]').click();
  await settle();
  assert.equal(ctx.$('#pedido').open, false);
  assert.equal(ctx.doc.activeElement, ctx.$('.package-card.is-selected .package-cta'));
  ctx.win.happyDOM.abort();
});
test('Submission failure retains customer data and unlocks retry without success', async () => {
  const ctx = setup({ commerce: configured, fetcher: async () => new Response('{}', { status: 500 }) });
  fillValid(ctx);
  ctx.$('#order-form').dispatchEvent(new ctx.win.Event('submit', { bubbles: true, cancelable: true }));
  await settle();
  assert.equal(ctx.$('#order-confirmation').hidden, true);
  assert.equal(ctx.$('#order-entry').hidden, false);
  assert.equal(ctx.$('#order-entry').inert, false);
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
  assert.equal(ctx.doc.querySelectorAll('#faq-list details>summary').length, 13);
  assert.equal(ctx.doc.querySelectorAll('#product-accordions details>summary').length, 5);
  ctx.win.happyDOM.abort();
});
test('Routine tabs support click, roving keyboard focus and one visible associated panel', () => {
  const ctx = setup();
  const tabs = [...ctx.doc.querySelectorAll('#moment-tabs [role="tab"]')];
  assert.equal(tabs.length, 4);
  tabs[1].click();
  assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
  assert.equal(ctx.$('#story-panel-nutricional').hidden, false);
  assert.equal(ctx.$('#story-panel-origen').hidden, true);
  tabs[1].dispatchEvent(new ctx.win.KeyboardEvent('keydown', { key: 'End', bubbles: true }));
  assert.equal(ctx.doc.activeElement, tabs[3]);
  assert.equal(tabs[1].tabIndex, -1);
  assert.equal(tabs[3].tabIndex, 0);
  tabs[3].dispatchEvent(new ctx.win.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  assert.equal(ctx.doc.activeElement, tabs[0]);
  assert.equal(ctx.doc.querySelectorAll('.moment-panels [role="tabpanel"]:not([hidden])').length, 1);
  ctx.win.happyDOM.abort();
});
test('Product facts use configured counts and all accessibility ID references resolve', () => {
  const ctx = setup();
  assert.ok(ctx.$('#nutrition-composition .real-nutrition-label'));
  assert.match(ctx.$('#nutrition-portion').textContent, /21 sobres/);
  assert.match(ctx.$('#story-panel-nutricional').textContent, /30 mg/);
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
  assert.equal(ctx.$('#testimonials').hidden, false);
  assert.equal(ctx.doc.querySelectorAll('#testimonials .purchase-review-card, #testimonials button').length, 0);
  const collage = ctx.$('#testimonials img');
  assert.ok(collage.src.endsWith('collage-clientes-1600.webp'));
  assert.equal(collage.getAttribute('loading'), 'lazy');
  assert.equal(collage.width, 1600);
  assert.equal(collage.height, 661);
  assert.ok(ctx.$('.product-info #testimonials'));
  ctx.win.happyDOM.abort();
});
test('Transcript testimonials require provenance and escape user-supplied text', () => {
  assert.equal(renderTestimonials([{ name: 'Example', rating: 5, comment: 'Example' }]), '');
  const rendered = renderTestimonials([{
    transcriptProvided: true, name: '<script>', comment: '<img src=x>',
    sourceNote: 'Fragmento de transcripción de prueba', verifiedPurchase: false
  }]);
  assert.match(rendered, /&lt;script&gt;/);
  assert.match(rendered, /&lt;img src=x&gt;/);
  assert.match(rendered, /Fragmento de transcripción de prueba/);
  assert.doesNotMatch(rendered, /Compra verificada|review-stars|5 de 5 estrellas/);
});

test('Hero CTAs select their packages while quantity and totals remain in checkout only', () => {
  const ctx = setup();
  const image = ctx.$('#hero-image').getAttribute('src');
  assert.equal(ctx.$('#offer-total'), null);
  assert.equal(ctx.$('[data-offer-quantity]'), null);
  assert.equal(ctx.$('#package-selector input[type="number"]'), null);
  assert.equal(ctx.$('#packageId').value, 'familiar');
  ctx.$('.package-cta[data-order-package="individual"]').click();
  assert.equal(ctx.$('#pedido').open, true);
  assert.equal(ctx.$('#packageId').value, 'individual');
  ctx.$('#quantity-more').click();
  assert.equal(ctx.$('#quantity').value, '2');
  assert.equal(ctx.$('#summary-total').textContent, '$220.000');
  assert.equal(ctx.$('#sticky-price').textContent, '$110.000');
  assert.match(ctx.$('.package-card.is-selected .package-thumbnail').getAttribute('src'), /caja-principal/);
  assert.equal(ctx.$('#hero-image').getAttribute('src'), image);
  fill(ctx, 'quantity', '21');
  assert.equal(ctx.$('#quantity').getAttribute('aria-invalid'), 'true');
  fill(ctx, 'quantity', '20');
  assert.equal(ctx.$('#quantity-more').disabled, true);
  fill(ctx, 'quantity', '1');
  assert.equal(ctx.$('#quantity-less').disabled, true);
  assert.equal(ctx.$('#quantity-error').textContent, '');
  ctx.$('#quantity-more').click();
  ctx.$('#pedido [data-close]').click();
  ctx.$('.package-cta[data-order-package="familiar"]').click();
  assert.equal(ctx.$('#pedido').open, true);
  assert.equal(ctx.$('#packageId').value, 'familiar');
  assert.equal(ctx.$('#quantity').value, '2');
  assert.equal(ctx.$('#summary-total').textContent, '$850.000');
  assert.equal(ctx.$('#sticky-price').textContent, '$425.000');
  assert.equal(ctx.$('.package-card.is-selected input[name="package"]').value, 'familiar');
  ctx.win.happyDOM.abort();
});

test('Transcript testimonials do not fabricate provenance, scores or verification', () => {
  const fixture = { transcriptProvided: true, name: 'Persona de prueba', comment: 'Testimonio de prueba', sourceNote: 'Transcripción de prueba' };
  assert.equal(renderTestimonials([{ ...fixture, transcriptProvided: false }]), '');
  assert.equal(renderTestimonials([{ ...fixture, comment: '' }]), '');
  const plain = renderTestimonials([{ ...fixture, rating: 5, verifiedPurchase: true }]);
  assert.match(plain, /Transcripción de prueba/);
  assert.doesNotMatch(plain, /Compra verificada|review-stars|4\\.9|500|TODO COLOMBIA|PRODUCTO SEGURO|5 de 5 estrellas/);
});
test('Transcript testimonial carousel supports arrows, endpoints and pagination', () => {
  const win = new Window();
  const root = win.document.createElement('div');
  win.document.body.append(root);
  root.innerHTML = renderTestimonials([1, 2, 3].map(n => ({
    transcriptProvided: true, name: 'Persona ' + n, comment: 'Testimonio ' + n,
    sourceNote: 'Transcripción de prueba'
  })));
  const track = root.querySelector('.purchase-review-track');
  assert.ok(track, 'Testimonial carousel is rendered for transcript excerpts');
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
  ctx.$('#quantity-more').click();
  const openingTrigger = ctx.$('.package-card.is-selected .package-cta');
  openingTrigger.focus();
  openingTrigger.click();
  assert.equal(ctx.$('#pedido').open, true);
  assert.equal(ctx.$('#packageId').value, 'familiar');
  assert.equal(ctx.$('#quantity').value, '2');
  assert.equal(ctx.$('#summary-total').textContent, '$850.000');
  fill(ctx, 'neighborhood', 'Laureles', 'change');
  fill(ctx, 'packageId', 'individual', 'change');
  assert.equal(ctx.$('#summary-total').textContent, '$220.000');
  assert.equal(ctx.$('#quantity').value, '2');
  ctx.$('#pedido [data-close]').click();
  await settle();
  assert.equal(ctx.$('#pedido').open, false);
  assert.equal(ctx.doc.activeElement, openingTrigger, 'Close restores focus to the button that originally opened checkout');
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


test('Loopback demo clearly disclaims a real order and restores the complete checkout on reset', async () => {
  let calls = 0;
  const ctx = setup({ url: 'http://localhost:4173/?pedido-demo=1', commerce: configured, fetcher: async () => { calls++; } });
  ctx.$('.package-card.is-selected .package-cta').click();
  fillValid(ctx);
  ctx.$('#order-form').dispatchEvent(new ctx.win.Event('submit', { bubbles: true, cancelable: true }));
  await settle();
  assert.equal(calls, 0);
  assert.equal(ctx.$('#order-entry').hidden, true);
  assert.equal(ctx.$('#order-entry').inert, true);
  assert.match(ctx.$('#confirmation-heading').textContent, /no es un pedido real/);
  assert.match(ctx.$('.confirmation-lead').textContent, /No se enviaron ni guardaron datos/);
  assert.equal(ctx.$('#confirmation-detail').textContent, 'SIN PEDIDO REAL');
  assert.match(ctx.$('#confirmation-total').textContent, /simulado/);
  assert.equal(ctx.$('#pedido').classList.contains('is-demo-confirmation'), true);
  ctx.$('[data-demo-reset]').click();
  assert.equal(ctx.$('#order-entry').hidden, false);
  assert.equal(ctx.$('#order-entry').inert, false);
  assert.equal(ctx.$('#order-form').hidden, false);
  assert.equal(ctx.$('#order-confirmation').hidden, true);
  assert.equal(ctx.$('#pedido').getAttribute('aria-labelledby'), 'order-title');
  assert.equal(ctx.$('#pedido').classList.contains('is-confirmed'), false);
  assert.equal(ctx.doc.activeElement, ctx.$('#fullName'));
  assert.equal(ctx.app.getState().confirmed, false);
  await ctx.win.happyDOM.abort();
});


test('Customer experiences preserve client ratings, disclose pending distribution and defer video loading', () => {
  const ctx = setup();
  const section = ctx.$('#video-testimonials');
  assert.equal(section.hidden, false);
  assert.equal(section.querySelector('.customer-rating-overview strong').textContent, '4,9');
  assert.match(section.querySelector('.customer-recommendation').textContent, /99\s*%/);
  assert.equal(section.querySelectorAll('.customer-rating-rows .customer-rating-bar').length, 5);
  assert.equal(section.querySelector('.customer-rating-source').textContent, 'Basado en reseñas');
  assert.equal(section.querySelectorAll('.customer-rating-bar-fill').length, 5);
  assert.equal(section.querySelector('#customer-distribution-note'), null);
  assert.equal(section.querySelectorAll('.customer-rating-row > span').length, 10);
  assert.equal(section.querySelectorAll('.customer-rating-row [aria-label="Recuento pendiente"]').length, 0);
  assert.equal(section.querySelector('.customer-ratings .customer-ratings-pending'), null);
  assert.equal(section.querySelectorAll('.customer-rating-row').length, 5);
  assert.ok(section.querySelector('.community-review-showcase > .customer-ratings'));
  assert.ok(section.querySelector('.community-review-showcase > .customer-gallery'));
  assert.equal(section.querySelectorAll('.customer-photo-grid img').length, 7);
  assert.equal(section.querySelectorAll('.customer-photo-item').length, 7);
  assert.ok(section.querySelector('[data-customer-photo-prev]'));
  assert.ok(section.querySelector('[data-customer-photo-next]'));
  assert.equal(section.querySelector('.customer-photo-grid').getAttribute('aria-roledescription'), 'carrusel');
  assert.ok([...section.querySelectorAll('.customer-photo-grid img')].every(image => image.getAttribute('loading') === 'lazy' && image.getAttribute('src').startsWith('assets/multydrink/optimized/comunidad-cliente-')));
  assert.equal(section.querySelectorAll('.customer-video-stories .video-card').length, 3);
  assert.equal(section.querySelector('.customer-video-stories #video-title').textContent, 'MultyDrink en su día a día.');
  assert.equal(section.querySelectorAll('.customer-video-stories .eyebrow, .customer-video-stories .video-intro, .customer-video-stories .video-play, .customer-video-stories .video-watch').length, 0);
  assert.equal(section.querySelectorAll('.customer-video-stories video').length, 0);
  assert.deepEqual([...section.querySelectorAll('.customer-video-stories img.video-poster')].map(node => node.getAttribute('src')), [
    'assets/multydrink/optimized/historia-01-poster.webp',
    'assets/multydrink/optimized/historia-02-poster.webp',
    'assets/multydrink/optimized/historia-03-poster.webp',
  ]);
  assert.equal(section.querySelectorAll('.customer-quote').length, 3);
  assert.equal(section.querySelectorAll('.customer-quote .review-stars, .customer-quote .verified-buyer').length, 0);
  assert.ok(section.textContent.includes('Manuela'));
  assert.ok(section.textContent.includes('Kim Cuervo'));
  assert.ok(section.textContent.includes('Juan Alcántara Medina'));
  ctx.win.happyDOM.abort();
});
