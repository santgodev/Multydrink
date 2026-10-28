import { commerce as defaultCommerce, packages, gallery, testimonials, productFaqs } from './config.js';
import { calculateOrder, createOrderClient, getPackage, isOrderingEnabled, money, validateField, validateOrder } from './order.js';
import { icon, renderDepartments, renderFaqs, renderField, renderGallery, renderPackages, renderTestimonials, renderMomentTabs, renderMomentPanels } from './components.js';
import { productMedia, comparisonMedia, videoTestimonials } from './media.js';
import { serializeStructuredData } from './seo.js';
import { applyImage } from './images.js';
import { renderEditorialIngredients, renderResearch, renderNutrition, renderFinalOffers, renderFaqCategories, renderFaqPanels, bindTabs, renderComparison, bindComparison, renderVideoCarousel, bindVideoCarousel } from './editorial.js';

export function initApp(doc = document, win = window, options = {}) {
  const commerce = options.commerce || defaultCommerce;
  const $ = selector => doc.querySelector(selector);
  const $$ = selector => [...doc.querySelectorAll(selector)];
  let selected = commerce.defaultPackage;
  let quantity = 1;
  let galleryIndex = 0;
  let sending = false;
  let confirmed = false;
  const client = createOrderClient(commerce, options.fetcher || globalThis.fetch);
  const touched = new Set();
  const ready = isOrderingEnabled(commerce);
  $('#product-schema').textContent = serializeStructuredData();
  $('#package-selector').insertAdjacentHTML('beforeend', renderPackages(selected));
  $('#gallery-thumbs').innerHTML = renderGallery();
  $('#ingredients-grid').innerHTML = renderEditorialIngredients();
  $('#moment-tabs').innerHTML = renderMomentTabs();
  $('#moment-panels').innerHTML = renderMomentPanels();
  $('#product-accordions').innerHTML = renderFaqs(productFaqs);
  $('#faq-categories').innerHTML = renderFaqCategories();
  $('#faq-list').innerHTML = renderFaqPanels();
  $('#research-sources').innerHTML = renderResearch();
  $('#nutrition-composition').innerHTML = renderNutrition();
  $('#final-offers').innerHTML = renderFinalOffers();
  bindTabs($('#faq-categories'), { vertical: true });
  bindTabs($('#nutrition-tabs'));
  $('#comparacion').innerHTML = renderComparison(comparisonMedia);
  $('#comparacion').hidden = !$('#comparacion').children.length;
  bindComparison($('#comparacion'));
  $('#video-carousel').innerHTML = renderVideoCarousel(videoTestimonials);
  $('#video-testimonials').hidden = !$('#video-carousel').children.length;
  bindVideoCarousel($('#video-carousel'), videoTestimonials);
  $('#testimonials').innerHTML = renderTestimonials(testimonials);
  $('#customer-fields').innerHTML = [
    renderField({ name: 'fullName', label: 'Nombre completo', autocomplete: 'name', placeholder: 'Nombre y apellidos', full: true }),
    renderField({ name: 'phone', label: 'Celular colombiano', type: 'tel', autocomplete: 'tel', placeholder: '300 123 4567', maxLength: 20, full: true }),
    `<div class="field"><label for="department">Departamento</label><select id="department" name="department" autocomplete="address-level1" required aria-describedby="department-error"><option value="">Selecciona</option>${renderDepartments()}</select><span id="department-error" class="field-error"></span></div>`,
    renderField({ name: 'city', label: 'Ciudad o municipio', autocomplete: 'address-level2', placeholder: 'Tu ciudad', maxLength: 80 }),
    renderField({ name: 'address', label: 'Dirección de entrega', autocomplete: 'address-line1', placeholder: 'Calle, carrera, número y barrio', full: true, maxLength: 180 }),
    renderField({ name: 'instructions', label: 'Detalles de entrega', autocomplete: 'address-line2', placeholder: 'Apartamento, torre o indicaciones', optional: true, full: true, maxLength: 300 }),
  ].join('');
  $('#packageId').innerHTML = packages.map(item => `<option value="${item.id}">${item.name} · ${item.sachets} sobres</option>`).join('');
  $$('[data-icon]').forEach(element => { element.innerHTML = icon(element.dataset.icon); });
  $('#year').textContent = String(new Date().getFullYear());
  if (commerce.sanitaryRegistration && commerce.sanitarySourceUrl) {
    $('#registration').hidden = false;
    const link = doc.createElement('a');
    link.href = commerce.sanitarySourceUrl;
    link.textContent = `Notificación sanitaria INVIMA ${commerce.sanitaryRegistration} ↗`;
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    $('#registration').append(link);
  }
  if (commerce.privacyPolicyUrl) {
    $('#privacy-link').href = commerce.privacyPolicyUrl;
    $('#privacy-link').target = '_blank';
    $('#privacy-link').rel = 'noopener noreferrer';
    $('#privacy-help').textContent = 'Consulta quién recibe tus datos y cómo ejercer tus derechos.';
    $('#privacy-dialog').querySelector('p:not(.eyebrow)').textContent = `Consulta la política de ${commerce.merchantName || 'el vendedor'} antes de enviar tus datos.`;
    $('#privacy-dialog').querySelectorAll('p:not(.eyebrow)').forEach((p, index) => { if (index > 0) p.hidden = true; });
    const privacyAnchor = $('#privacy-dialog').querySelector('a');
    privacyAnchor.href = commerce.privacyPolicyUrl; privacyAnchor.textContent = 'Leer la política del vendedor ↗';
  } else {
    $('#privacy-link').addEventListener('click', event => { event.preventDefault(); openDialog('privacy-dialog'); });
  }
  if (ready) {
    $('#order-availability').textContent = commerce.shippingDescription;
    $('#submit-order').disabled = false;
    $('#submit-order').innerHTML = `CONFIRMAR PEDIDO CONTRA ENTREGA ${icon('arrow')}`;
    $('#conditions-dialog').querySelector('p:last-child').textContent = `Vendedor: ${commerce.merchantName}. ${commerce.shippingDescription} Consulta sus condiciones completas antes de enviar el pedido.`;
  }
  function updateSummary() {
    const item = getPackage(selected);
    const totals = calculateOrder(selected, quantity, commerce.shippingFee);
    $$('input[name="package"]').forEach(input => { input.checked = input.value === selected; input.closest('.package-card').classList.toggle('is-selected', input.checked); });
    $('#packageId').value = selected;
    $('#quantity').value = String(quantity);
    $('#quantity-less').disabled = quantity <= 1 || sending || confirmed;
    $('#quantity-more').disabled = quantity >= commerce.maxQuantity || sending || confirmed;
    $('#sticky-package').textContent = `${item.name} · ${item.sachets} sobres`;
    $('#sticky-price').textContent = money(item.price);
    $('#sticky-reference').textContent = money(item.referencePrice);
    $('#selected-package-name').textContent = item.name;
    $('#selected-package-price').textContent = money(item.price);
    const selectedPhoto = item.id === 'individual' && productMedia.individual ? productMedia.individual : { src: 'assets/family.webp', alt: 'Pack familiar de seis cajas MultyDrink', width: 567, height: 594 };
    applyImage($('.sticky-inner > img'), { ...selectedPhoto, src: selectedPhoto.thumbnail || selectedPhoto.src, variants: undefined, alt: '' }, '54px');
    applyImage($('.order-preview img'), selectedPhoto, '120px');
    $('#summary-package').textContent = `${quantity} × ${item.name}`;
    $('#summary-unit').textContent = money(item.price) + ' c/u';
    $('#summary-count').textContent = `${totals.boxes} ${totals.boxes === 1 ? 'caja' : 'cajas'} · ${totals.sachets} sobres en total`;
    $('#summary-subtotal').textContent = money(totals.subtotal);
    $('#summary-savings').textContent = money(totals.savings);
    $('#summary-shipping').textContent = totals.shippingFee === null ? 'Por confirmar' : totals.shippingFee === 0 ? 'Incluido' : money(totals.shippingFee);
    $('#summary-total').textContent = totals.total === null ? 'Por confirmar' : money(totals.total);
    if (totals.total !== null) $('#shipping-note').textContent = commerce.shippingDescription || 'Pago contra entrega. No se cobra desde esta página.';
  }
  function selectPackage(value) {
    if (!getPackage(value) || sending || confirmed) return;
    selected = value;
    updateSummary();
  }
  $$('input[name="package"]').forEach(input => input.addEventListener('change', () => selectPackage(input.value)));
  $('#packageId').addEventListener('change', event => selectPackage(event.target.value));
  function setQuantity(value) {
    if (sending || confirmed) return;
    quantity = Math.min(commerce.maxQuantity, Math.max(1, value));
    updateSummary();
    showFieldError('quantity', '');
  }
  $('#quantity-less').addEventListener('click', () => setQuantity(quantity - 1));
  $('#quantity-more').addEventListener('click', () => setQuantity(quantity + 1));
  $('#quantity').addEventListener('input', event => {
    const error = validateField('quantity', event.target.value);
    showFieldError('quantity', error);
    if (!error) { quantity = Number(event.target.value); updateSummary(); }
    else {
      $('#summary-total').textContent = 'Revisa la cantidad';
      $('#summary-subtotal').textContent = '—';
      $('#summary-savings').textContent = '—';
      $('#summary-count').textContent = 'Selecciona una cantidad válida para calcular tu pedido.';
    }
  });
  function displayGallery(index) {
    galleryIndex = (index + gallery.length) % gallery.length;
    const item = gallery[galleryIndex];
    const hero = $('#hero-image');
    applyImage(hero, item, '(max-width: 800px) 85vw, 480px');
    $('.gallery-stage').classList.toggle('is-botanical', item.src === 'assets/product.webp');
    $('#gallery-caption').textContent = item.caption;
    $('#gallery-count').textContent = `${String(galleryIndex + 1).padStart(2, '0')} / ${String(gallery.length).padStart(2, '0')}`;
    $$('[data-gallery]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.gallery) === galleryIndex)));
    $$('[data-presentation]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.presentation === (item.presentation || 'caja'))));
  }
  $$('[data-gallery]').forEach(button => button.addEventListener('click', () => displayGallery(Number(button.dataset.gallery))));
  $$('[data-presentation]').forEach(button => {
    const presentation = button.dataset.presentation;
    const index = presentation === 'caja' ? 0 : gallery.findIndex(item => item.presentation === presentation);
    button.disabled = index < 0;
    if (index >= 0) button.setAttribute('aria-label', `Ver ${presentation}`);
    button.addEventListener('click', () => { if (index >= 0) displayGallery(index); });
  });
  const momentTabs = $$('#moment-tabs [role="tab"]');
  function selectMoment(tab, focus = false) {
    momentTabs.forEach(button => {
      const active = button === tab;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      doc.getElementById(button.getAttribute('aria-controls')).hidden = !active;
    });
    const photo = productMedia.lifestyle[tab.id.replace('tab-', '')];
    const image = $('#benefit-image');
    // Until real lifestyle media is supplied, retain the identified product photo.
    applyImage(image, photo || { src: 'assets/family.webp', alt: 'Pack familiar MultyDrink', width: 567, height: 594 }, '(max-width: 560px) 90vw, 440px');
    image.closest('.moments-visual').classList.toggle('has-lifestyle', Boolean(photo));
    $('#benefit-image-caption').textContent = photo ? tab.textContent.trim() : 'MultyDrink · pack familiar';
    if (focus) tab.focus();
  }
  momentTabs.forEach(tab => tab.addEventListener('click', () => selectMoment(tab)));
  $('#moment-tabs').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const index = momentTabs.indexOf(event.target);
    if (index < 0) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? momentTabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + momentTabs.length) % momentTabs.length;
    selectMoment(momentTabs[next], true);
  });
  $('#gallery-prev').addEventListener('click', () => displayGallery(galleryIndex - 1));
  $('#gallery-next').addEventListener('click', () => displayGallery(galleryIndex + 1));
  $('#gallery-thumbs').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    displayGallery(event.key === 'Home' ? 0 : event.key === 'End' ? gallery.length - 1 : galleryIndex + (event.key === 'ArrowRight' ? 1 : -1));
    $(`[data-gallery="${galleryIndex}"]`).focus();
  });
  const menu = $('.menu-toggle');
  function closeMenu() { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Abrir menú'); $('#navigation').classList.remove('is-open'); }
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú'); $('#navigation').classList.toggle('is-open', open); });
  $$('#navigation a').forEach(link => link.addEventListener('click', closeMenu));
  doc.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
  doc.addEventListener('click', event => { if (!event.target.closest('.nav-inner')) closeMenu(); });
  $$('a[href="#pedido"]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault(); closeMenu();
    if (link.dataset.orderPackage) selectPackage(link.dataset.orderPackage);
    $('#order-title').focus({ preventScroll: true });
    $('#pedido').scrollIntoView({ behavior: win.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    win.history.replaceState(null, '', '#pedido');
  }));
  const sticky = $('.sticky-purchase');
  if (win.IntersectionObserver) {
    const visibility = new Map();
    const observer = new win.IntersectionObserver(entries => {
      entries.forEach(entry => visibility.set(entry.target, entry.isIntersecting));
      const hide = [...visibility.values()].some(Boolean);
      sticky.classList.toggle('is-hidden', hide);
      sticky.inert = hide;
      sticky.setAttribute('aria-hidden', String(hide));
    }, { rootMargin: '0px 0px 0px 0px', threshold: 0 });
    observer.observe($('#pedido')); observer.observe($('.footer'));
  }
  if (win.ResizeObserver) new win.ResizeObserver(() => doc.documentElement.style.setProperty('--sticky-height', `${Math.ceil(sticky.getBoundingClientRect().height)}px`)).observe(sticky);
  function openDialog(id) { const dialog = doc.getElementById(id); if (dialog && !dialog.open) dialog.showModal(); }
  $$('[data-dialog]').forEach(button => button.addEventListener('click', () => openDialog(button.dataset.dialog)));
  $$('dialog').forEach(dialog => {
    dialog.querySelector('[data-close]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  });
  function values() {
    return Object.fromEntries(['fullName', 'phone', 'department', 'city', 'address', 'instructions', 'packageId', 'quantity', 'privacy'].map(name => [name, name === 'privacy' ? $('#privacy').checked : doc.getElementById(name).value]));
  }
  function showFieldError(name, error) {
    const field = doc.getElementById(name);
    field.setAttribute('aria-invalid', String(Boolean(error)));
    doc.getElementById(`${name}-error`).textContent = error;
  }
  $$('#order-form input, #order-form select').forEach(input => {
    input.addEventListener('blur', () => { touched.add(input.name); showFieldError(input.name, validateField(input.name, values()[input.name])); });
    input.addEventListener('input', () => { if (touched.has(input.name)) showFieldError(input.name, validateField(input.name, values()[input.name])); });
    input.addEventListener('change', () => { touched.add(input.name); showFieldError(input.name, validateField(input.name, values()[input.name])); });
  });
  $('#order-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || confirmed) return;
    const message = $('#form-message');
    message.hidden = true;
    if (!ready) { message.textContent = 'Los pedidos aún no están habilitados. No hemos enviado tus datos.'; message.hidden = false; message.focus(); return; }
    const data = values();
    const errors = validateOrder(data);
    Object.keys(data).forEach(name => { touched.add(name); showFieldError(name, errors[name] || ''); });
    if (Object.keys(errors).length) { message.textContent = 'Revisa los campos señalados para continuar.'; message.hidden = false; doc.getElementById(Object.keys(errors)[0]).focus(); return; }
    sending = true;
    $('#order-fields').disabled = true;
    $('#package-selector').disabled = true;
    $('#submit-order').disabled = true;
    $('#submit-order').textContent = 'Enviando tu solicitud…';
    $('#order-form').setAttribute('aria-busy', 'true');
    try {
      const result = await client.submit(data);
      confirmed = true;
      $('#confirmation-detail').textContent = `Solicitud ${result.orderId}. Total confirmado: ${money(result.total)} COP.`;
      $('#order-form').hidden = true;
      $('#order-availability').hidden = true;
      $('#order-confirmation').hidden = false;
      $('#order-confirmation').focus();
    } catch (error) {
      message.textContent = error.message || 'No pudimos confirmar el pedido. Intenta nuevamente.';
      message.hidden = false; message.focus();
    } finally {
      sending = false;
      $('#order-form').setAttribute('aria-busy', 'false');
      if (!confirmed) {
        $('#order-fields').disabled = false;
        $('#package-selector').disabled = false;
        $('#submit-order').disabled = false;
        $('#submit-order').innerHTML = `CONFIRMAR PEDIDO CONTRA ENTREGA ${icon('arrow')}`;
      }
    }
  });
  updateSummary();
  displayGallery(0);
  selectMoment(momentTabs[0]);
  return { selectPackage, displayGallery, getState: () => ({ selected, quantity, galleryIndex, confirmed }) };
}

if (typeof document !== 'undefined' && document.querySelector('#order-form')) initApp();
