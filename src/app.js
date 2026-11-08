import { commerce as defaultCommerce, packages, gallery, productFaqs } from './config.js';
import { calculateOrder, createOrderClient, getPackage, isOrderingEnabled, money, validateField, validateOrder } from './order.js';
import { icon, renderDepartments, renderProductFaqs, renderField, renderGallery, renderPackages } from './components.js';
import { productMedia, comparisonMedia, videoTestimonials } from './media.js';
import { archivedTestimonials } from './archived-testimonials.js';
import { serializeStructuredData } from './seo.js';
import { applyImage } from './images.js';
import { initLegalDrafts } from './legal.js';
import { createOrderTurnstile } from './turnstile.js';
import { renderResearch, renderNutrition, renderFinalOffers, renderFaqCategories, renderFaqPanels, bindTabs, bindIngredientCounter, renderComparison, bindComparison, renderCustomerReviewSection, bindCustomerPhotoCarousel, bindVideoCarousel } from './editorial.js';

export function initApp(doc = document, win = window, options = {}) {
  const commerce = options.commerce || defaultCommerce;
  const $ = selector => doc.querySelector(selector);
  const $$ = selector => [...doc.querySelectorAll(selector)];
  let selected = commerce.defaultPackage;
  let quantity = 1;
  let galleryIndex = 0;
  let sending = false;
  let confirmed = false;
  // Explicit opt-in on loopback only. This path never creates a network client.
  const localDemo = ['localhost', '127.0.0.1', '[::1]'].includes(win.location.hostname)
    && ['http:', 'https:'].includes(win.location.protocol)
    && new URLSearchParams(win.location.search).get('pedido-demo') === '1';
  const client = localDemo ? null : createOrderClient(commerce, options.fetcher || globalThis.fetch);
  const touched = new Set();
  const ready = isOrderingEnabled(commerce);
  const turnstile = !localDemo && ready ? (options.turnstile || createOrderTurnstile({ win, doc, siteKey: commerce.turnstileSiteKey, container: $('#order-turnstile') })) : null;
  if (turnstile) {
    $('#order-turnstile').hidden = false;
    $('#turnstile-status').hidden = false;
  }
  // Production HTML already contains the authoritative build-time schema.
  // Populate only the empty source-preview placeholder; never overwrite it.
  const schema = $('#product-schema');
  if (!schema.textContent.trim() || schema.textContent.trim() === '{}') schema.textContent = serializeStructuredData();
  $('#package-selector').insertAdjacentHTML('beforeend', renderPackages(selected));
  $('#gallery-thumbs').innerHTML = renderGallery();
  $('#product-accordions').innerHTML = renderProductFaqs(productFaqs);
  // Keep existing ingredient links useful after removing the separate ingredient section.
  const ingredientsDetail = $('#product-accordions [data-detail="ingredients"]');
  ingredientsDetail.id = 'ingredientes';
  const revealIngredients = () => { if (win.location.hash === '#ingredientes') ingredientsDetail.open = true; };
  win.addEventListener('hashchange', revealIngredients);
  $$('a[href="#ingredientes"]').forEach(link => link.addEventListener('click', () => { ingredientsDetail.open = true; }));
  revealIngredients();
  $('#faq-categories').innerHTML = renderFaqCategories();
  $('#faq-list').innerHTML = renderFaqPanels();
  $('#research-sources').innerHTML = renderResearch();
  $('#nutrition-composition').innerHTML = renderNutrition();
  $('#final-offers').innerHTML = renderFinalOffers();
  bindTabs($('#faq-categories'), { vertical: true });
  bindTabs($('#nutrition-tabs'), { onSelect: tab => {
    $('#nutrition-cta-label').textContent = tab.getAttribute('aria-controls') === 'nutrition-preparation'
      ? 'ELIGE TU PREPARACIÓN' : 'ELIGE TU PRESENTACIÓN';
  } });
  bindTabs($('#moment-tabs'), { onSelect: tab => {
    const panelId = tab.getAttribute('aria-controls');
    $$('#tu-momento [data-chapter-image]').forEach(image => {
      image.hidden = image.dataset.chapterImage !== panelId;
    });
  } });
  $('#comparacion').innerHTML = renderComparison(comparisonMedia);
  $('#comparacion').hidden = !$('#comparacion').children.length;
  bindComparison($('#comparacion'));
  bindIngredientCounter($('.ingredient-story'), win);
  // Reveal the preparation steps in order when the section enters view.
  // Keep all content visible if observers are unavailable or motion is reduced.
  const ritualSteps = $('.preparation-steps');
  if (ritualSteps && typeof win.IntersectionObserver === 'function' &&
      !win.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    ritualSteps.classList.add('ritual-animate-ready');
    const ritualObserver = new win.IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      ritualSteps.classList.add('ritual-is-visible');
      ritualObserver.disconnect();
    }, { threshold: 0.18 });
    ritualObserver.observe(ritualSteps);
  }
  const videoReview = { localReview: ['127.0.0.1', 'localhost', '[::1]'].includes(win.location.hostname) && new URLSearchParams(win.location.search).get('revision-videos') === '1' };
  $('#video-carousel').innerHTML = renderCustomerReviewSection(archivedTestimonials, videoTestimonials, videoReview);
  $('#video-testimonials').hidden = !$('#video-carousel').children.length;
  bindCustomerPhotoCarousel($('#video-carousel'));
  bindVideoCarousel($('#video-carousel'), videoTestimonials, videoReview);
  $('#customer-fields').innerHTML = [
    renderField({ name: 'fullName', label: 'Nombre completo', autocomplete: 'name', placeholder: 'Nombre y apellidos', full: true }),
    renderField({ name: 'documentNumber', label: 'Número de documento de identidad', inputmode: 'numeric', maxLength: 30, full: true }),
    renderField({ name: 'phone', label: 'Celular', type: 'tel', autocomplete: 'tel', placeholder: '300 123 4567', maxLength: 20, full: true }),
    `<div class="field"><label for="department">Departamento</label><select id="department" name="department" autocomplete="address-level1" required aria-describedby="department-error"><option value="">Selecciona</option>${renderDepartments()}</select><span id="department-error" class="field-error"></span></div>`,
    renderField({ name: 'city', label: 'Ciudad o municipio', autocomplete: 'address-level2', placeholder: 'Tu ciudad', maxLength: 80 }),
    renderField({ name: 'address', label: 'Dirección completa de entrega', autocomplete: 'address-line1', placeholder: 'Calle o carrera, número de vía y casa', full: true, maxLength: 180 }),
    renderField({ name: 'neighborhood', label: 'Barrio', placeholder: 'Nombre de tu barrio', maxLength: 100 }),
    renderField({ name: 'unit', label: 'Apartamento, torre o interior', autocomplete: 'address-line2', placeholder: 'Detalles de tu vivienda', optional: true, maxLength: 120 }),
    renderField({ name: 'instructions', label: 'Referencia o instrucciones de entrega', placeholder: 'Un punto de referencia o indicación adicional', optional: true, full: true, maxLength: 300 }),
    renderField({ name: 'email', label: 'Correo electrónico', type: 'email', autocomplete: 'email', placeholder: 'nombre@correo.com', optional: true, full: true, maxLength: 254 }),
  ].join('');
  $('#packageId').innerHTML = packages.map(item => `<option value="${item.id}">${item.name} · ${item.sachets} sobres</option>`).join('');
  $$('[data-icon]').forEach(element => { element.innerHTML = icon(element.dataset.icon); });
  $('#year').textContent = String(new Date().getFullYear());
  if (commerce.sanitaryRegistration && commerce.sanitarySourceUrl) {
    $('#registration').hidden = false;
    const link = doc.createElement('a');
    link.href = commerce.sanitarySourceUrl;
    link.textContent = `Notificación sanitaria INVIMA ${commerce.sanitaryRegistration}`;
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    $('#registration').append(link);
  }
  if (commerce.privacyPolicyUrl && commerce.privacyPolicyUrl !== '#privacy-dialog') {
    $('#privacy-link').href = commerce.privacyPolicyUrl;
    $('#privacy-link').target = '_blank';
    $('#privacy-link').rel = 'noopener noreferrer';
    $('#privacy-help').textContent = 'Consulta quién recibe tus datos y cómo ejercer tus derechos.';
    $('#privacy-dialog').querySelector('p:not(.eyebrow)').textContent = `Consulta la política de ${commerce.merchantName || 'el vendedor'} antes de enviar tus datos.`;
    $('#privacy-dialog').querySelectorAll('p:not(.eyebrow)').forEach((p, index) => { if (index > 0) p.hidden = true; });
    const privacyAnchor = $('#privacy-dialog').querySelector('a') || doc.createElement('a');
    privacyAnchor.className = 'text-link';
    if (!privacyAnchor.isConnected) $('#privacy-dialog').append(privacyAnchor);
    privacyAnchor.href = commerce.privacyPolicyUrl; privacyAnchor.textContent = 'Leer la política del vendedor ↗';
  } else {
    $('#privacy-help').textContent = 'Consulta quién recibe tus datos y cómo ejercer tus derechos.';
    $('#privacy-link').addEventListener('click', event => { event.preventDefault(); openDialog('privacy-dialog'); });
  }
  if (localDemo) {
    $('#order-availability').textContent = 'SIMULACIÓN LOCAL · Usa datos ficticios. No se crea un pedido real, no se envían ni guardan datos y no se realizan pagos ni notificaciones.';
    $('#order-availability').hidden = false;
    $('#submit-order').disabled = false;
    $('#submit-order').textContent = 'SIMULAR PEDIDO · SIN ENVÍO DE DATOS';
    $('#privacy-help').textContent = 'Validación de prueba con datos ficticios. Esta simulación no registra consentimiento ni sustituye la política definitiva del vendedor.';
    $('#order-form').setAttribute('autocomplete', 'off');
    $$('#order-form input').forEach(input => input.setAttribute('autocomplete', 'off'));
  } else if (ready) {
    // Delivery price and conditions appear once inside the order summary.
    $('#submit-order').disabled = false;
    $('#submit-order').innerHTML = `CONFIRMAR PEDIDO · PAGO EN CASA ${icon('arrow')}`;
    $('#conditions-dialog').querySelector('p:last-child').textContent = `Vendedor: ${commerce.merchantName}. ${commerce.shippingDescription} Consulta sus condiciones completas antes de enviar el pedido.`;
  }
  initLegalDrafts(doc, win, commerce);
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
    $('#sticky-reference').textContent = item.id === 'individual' ? '' : money(item.referencePrice);
    $('#sticky-reference').hidden = item.id === 'individual';
    const selectedPhoto = item.id === 'individual' ? productMedia.individual : productMedia.family;
    applyImage($('.sticky-inner > img'), { ...selectedPhoto, src: selectedPhoto.thumbnail || selectedPhoto.src, variants: undefined, alt: '' }, '54px');
    $('.sticky-inner > img').dataset.package = selected;
    applyImage($('.order-preview img'), selectedPhoto, '120px');
    $('#summary-package').textContent = `${quantity} × ${item.name}`;
    $('#summary-unit').textContent = money(item.price) + ' c/u';
    $('#summary-count').textContent = `${totals.boxes} ${totals.boxes === 1 ? 'caja' : 'cajas'} · ${totals.sachets} sobres en total`;
    $('#summary-subtotal').textContent = money(totals.subtotal);
    $('#summary-savings').textContent = money(totals.savings);
    $('.order-summary .summary-saving').hidden = item.id === 'individual';
    $('#summary-shipping').textContent = totals.shippingFee === null ? 'Por confirmar' : totals.shippingFee === 0 ? 'Incluido' : money(totals.shippingFee);
    $('#summary-total').textContent = totals.total === null ? 'Por confirmar' : money(totals.total);
    if (totals.total !== null) $('#shipping-note').textContent = 'Pago contra entrega, sin anticipos. La cobertura y el plazo de entrega se confirman según tu dirección.';
  }
  function selectPackage(value) {
    if (!getPackage(value) || sending || confirmed) return;
    selected = value;
    updateSummary();
    showQuantityError('');
  }
  $$('input[name="package"]').forEach(input => input.addEventListener('change', () => selectPackage(input.value)));
  $('#packageId').addEventListener('change', event => selectPackage(event.target.value));
  function setQuantity(value) {
    if (sending || confirmed) return;
    quantity = Math.min(commerce.maxQuantity, Math.max(1, value));
    updateSummary();
    showQuantityError('');
  }
  function showQuantityError(error) {
    showFieldError('quantity', error);
  }
  $('#quantity-less').addEventListener('click', () => setQuantity(quantity - 1));
  $('#quantity-more').addEventListener('click', () => setQuantity(quantity + 1));
  function handleQuantityInput(event) {
    if (sending || confirmed) return;
    const value = event.target.value;
    const error = validateField('quantity', value);
    $('#quantity').value = value;
    showQuantityError(error);
    if (!error) { quantity = Number(value); updateSummary(); }
    else {
      $('#summary-total').textContent = 'Revisa la cantidad';
      $('#summary-subtotal').textContent = '—';
      $('#summary-savings').textContent = '—';
      $('#summary-count').textContent = 'Selecciona una cantidad válida para calcular tu pedido.';
    }
  }
  $('#quantity').addEventListener('input', handleQuantityInput);
  function displayGallery(index) {
    galleryIndex = (index + gallery.length) % gallery.length;
    const item = gallery[galleryIndex];
    const hero = $('#hero-image');
    const video = $('#gallery-video');
    if (!video.paused) video.pause();
    const isVideo = item.type === 'video';
    hero.hidden = isVideo;
    video.hidden = !isVideo;
    if (isVideo) {
      video.setAttribute('poster', item.src);
      video.setAttribute('aria-label', item.label);
      video.muted = true;
      // Native controls start playback explicitly; preload=none defers the MP4.
      if (video.getAttribute('src') !== item.videoSrc) video.src = item.videoSrc;
    }
    applyImage(hero, item, "(max-width: 560px) calc(100vw - 48px), (max-width: 800px) 520px, (max-width: 1100px) 44vw, 520px");
    $('#gallery-full').href = isVideo ? item.videoSrc : item.src;
    $('#gallery-full').textContent = isVideo ? 'Abrir video ↗' : 'Ampliar ↗';
    $('#gallery-full').setAttribute('aria-label', `${isVideo ? 'Abrir video' : 'Ampliar'}: ${item.label}. Abre en una pestaña nueva`);
    $('#gallery-count').textContent = `${String(galleryIndex + 1).padStart(2, '0')} / ${String(gallery.length).padStart(2, '0')}`;
    $$('[data-gallery]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.gallery) === galleryIndex)));
    const thumbs = $('#gallery-thumbs'), active = $(`[data-gallery="${galleryIndex}"]`);
    // Scroll only the thumbnail strip; never move the document when advancing images.
    if (active.offsetLeft < thumbs.scrollLeft) thumbs.scrollLeft = active.offsetLeft;
    else if (active.offsetLeft + active.offsetWidth > thumbs.scrollLeft + thumbs.clientWidth) thumbs.scrollLeft = active.offsetLeft + active.offsetWidth - thumbs.clientWidth;
  }
  $$('[data-gallery]').forEach(button => button.addEventListener('click', () => displayGallery(Number(button.dataset.gallery))));
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
  const checkout = $('#pedido');
  function setReceiptVisible(visible) {
    $('#order-entry').hidden = visible;
    $('#order-entry').inert = visible;
    $('#order-form').hidden = visible;
    $('#order-confirmation').hidden = !visible;
    checkout.classList.toggle('is-confirmed', visible);
    checkout.setAttribute('aria-labelledby', visible ? 'confirmation-heading' : 'order-title');
    checkout.scrollTop = 0;
  }
  let checkoutTrigger = null;
  let checkoutScroll = 0;
  let savedBodyStyle = null;
  function openCheckout(trigger = doc.activeElement) {
    if (checkout.open) return;
    checkoutTrigger = trigger;
    checkoutScroll = win.scrollY;
    savedBodyStyle = doc.body.getAttribute('style');
    checkout.showModal();
    Object.assign(doc.body.style, { position: 'fixed', top: `-${checkoutScroll}px`, width: '100%', overflow: 'hidden' });
    doc.documentElement.classList.add('checkout-open');
    checkout.scrollTop = 0;
    $(confirmed ? '#order-confirmation' : '#order-title').focus({ preventScroll: true });
    updateStickyVisibility();
    if (turnstile && !confirmed) turnstile.mount().catch(() => {
      $('#turnstile-status').textContent = 'No se pudo iniciar la verificación. Revisa tu conexión y abre nuevamente el pedido.';
    });
  }
  checkout.addEventListener('close', () => {
    if (savedBodyStyle === null) doc.body.removeAttribute('style');
    else doc.body.setAttribute('style', savedBodyStyle);
    doc.documentElement.classList.remove('checkout-open');
    win.scrollTo({ top: checkoutScroll, behavior: 'instant' });
    updateStickyVisibility();
    if (checkoutTrigger?.isConnected) checkoutTrigger.focus({ preventScroll: true });
    if (win.location.hash === '#pedido') win.history.replaceState(null, '', win.location.pathname + win.location.search);
  });
  checkout.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...checkout.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')]
      .filter(element => element.tabIndex >= 0 && !element.matches(':disabled') && element.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    const focusTarget = $(confirmed ? '#order-confirmation' : '#order-title');
    if (!first) { event.preventDefault(); focusTarget.focus(); return; }
    if (event.shiftKey && (doc.activeElement === first || doc.activeElement === focusTarget)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && doc.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  $$('a[href="#pedido"]').forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-controls', 'pedido');
    link.addEventListener('click', event => {
      event.preventDefault(); closeMenu();
      if (link.dataset.orderPackage) selectPackage(link.dataset.orderPackage);
      openCheckout(link);
    });
  });
  const sticky = $('.sticky-purchase');
  const primaryPurchaseCtas = $$('.package-cta');
  const footer = $('.footer');
  const whatsapp = $('.floating-whatsapp');
  const whatsappProtected = $$('.package-cta, .story-surface h2, .story-surface h3, .story-surface p, .final-offer .button');
  function updateWhatsappVisibility() {
    if (!whatsapp) return;
    let obstructs = checkout.open ? true : false;
    if (!obstructs && win.innerWidth <= 768) {
      const floating = whatsapp.getBoundingClientRect();
      obstructs = whatsappProtected.some(element => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0
          && rect.left < floating.right && rect.right > floating.left
          && rect.top < floating.bottom && rect.bottom > floating.top;
      });
    }
    whatsapp.classList.toggle('is-obscured', obstructs);
    whatsapp.inert = obstructs;
    whatsapp.setAttribute('aria-hidden', String(obstructs));
  }
  // The sticky purchase prompt appears only once the in-page purchase CTA has
  // passed above the viewport. It must never obscure the initial hero.
  function updateStickyVisibility() {
    const pastPurchaseCta = primaryPurchaseCtas.every(cta => cta.getBoundingClientRect().bottom <= 0);
    const footerRect = footer.getBoundingClientRect();
    const atFooter = footerRect.top < win.innerHeight && footerRect.bottom > 0;
    const hide = !pastPurchaseCta || checkout.open || atFooter;
    sticky.classList.toggle('is-hidden', hide);
    sticky.inert = hide;
    sticky.setAttribute('aria-hidden', String(hide));
    updateWhatsappVisibility();
  }
  sticky.classList.add('is-hidden');
  sticky.inert = true;
  sticky.setAttribute('aria-hidden', 'true');
  win.addEventListener('scroll', updateStickyVisibility, { passive: true });
  win.addEventListener('resize', updateStickyVisibility);
  updateStickyVisibility();
  if (win.ResizeObserver) new win.ResizeObserver(() => doc.documentElement.style.setProperty('--sticky-height', `${Math.ceil(sticky.getBoundingClientRect().height)}px`)).observe(sticky);
  function openDialog(id) { const dialog = doc.getElementById(id); if (dialog && !dialog.open) dialog.showModal(); }
  $$('[data-dialog]').forEach(button => button.addEventListener('click', () => openDialog(button.dataset.dialog)));
  $$('dialog').forEach(dialog => {
    dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  });
  function values() {
    return Object.fromEntries(['fullName', 'documentNumber', 'phone', 'department', 'city', 'address', 'neighborhood', 'unit', 'instructions', 'email', 'packageId', 'quantity', 'privacy'].map(name => [name, name === 'privacy' ? $('#privacy').checked : doc.getElementById(name).value]));
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
    if (!ready && !localDemo) { message.textContent = 'Los pedidos aún no están habilitados. No hemos enviado tus datos.'; message.hidden = false; message.focus(); return; }
    const data = values();
    const errors = validateOrder(data);
    Object.keys(data).forEach(name => { touched.add(name); showFieldError(name, errors[name] || ''); });
    if (Object.keys(errors).length) { message.textContent = 'Revisa los campos señalados para continuar.'; message.hidden = false; doc.getElementById(Object.keys(errors)[0]).focus(); return; }
    if (localDemo) {
      const totals = calculateOrder(selected, quantity, commerce.shippingFee);
      const confirmation = $('#order-confirmation');
      confirmation.querySelector('h3').textContent = 'Simulación completada · no es un pedido real';
      confirmation.querySelector('.confirmation-eyebrow').textContent = 'VISTA DE DEMOSTRACIÓN';
      confirmation.querySelector('.confirmation-mark').textContent = 'i';
      $('#confirmation-detail').textContent = 'SIN PEDIDO REAL';
      $('#confirmation-total').textContent = `${money(totals.total)} COP · simulado`;
      confirmation.querySelector('.confirmation-lead').textContent = 'No se enviaron ni guardaron datos. No se creó ningún pedido y no habrá entrega ni cobro.';
      checkout.classList.add('is-demo-confirmation');
      $('#order-form').reset();
      touched.clear();
      confirmed = true;
      updateSummary();
      setReceiptVisible(true);
      confirmation.tabIndex = -1;
      if (!confirmation.querySelector('[data-demo-reset]')) {
        const again = doc.createElement('button');
        again.type = 'button';
        again.className = 'button button-outline';
        again.dataset.demoReset = '';
        again.textContent = 'HACER OTRA SIMULACIÓN';
        again.addEventListener('click', () => {
          confirmed = false;
          setReceiptVisible(false);
          checkout.classList.remove('is-demo-confirmation');
          confirmation.querySelector('.confirmation-eyebrow').textContent = '¡GRACIAS POR ELEGIR MULTYDRINK!';
          confirmation.querySelector('.confirmation-mark').textContent = '✓';
          confirmation.querySelector('h3').textContent = 'Tu pedido quedó registrado';
          confirmation.querySelector('.confirmation-lead').textContent = 'Recibimos tu solicitud correctamente.';
          updateSummary();
          $('#fullName').focus();
        });
        confirmation.append(again);
      }
      confirmation.focus();
      return;
    }
    const verificationToken = turnstile?.getToken();
    if (!verificationToken) {
      message.textContent = 'Completa la verificación de seguridad antes de enviar el pedido.';
      message.hidden = false;
      message.focus();
      return;
    }
    sending = true;
    updateSummary();
    $('#order-fields').disabled = true;
    $('#package-selector').disabled = true;
    $('#submit-order').disabled = true;
    $('#submit-order').textContent = 'Enviando tu solicitud…';
    $('#order-form').setAttribute('aria-busy', 'true');
    try {
      const result = await client.submit(data, verificationToken);
      confirmed = true;
      $('#confirmation-detail').textContent = result.orderId;
      $('#confirmation-total').textContent = `${money(result.total)} COP`;
      setReceiptVisible(true);
      $('#order-confirmation').focus();
    } catch (error) {
      turnstile?.reset();
      message.textContent = error.message || 'No pudimos confirmar el pedido. Intenta nuevamente.';
      message.hidden = false; message.focus();
    } finally {
      sending = false;
      updateSummary();
      $('#order-form').setAttribute('aria-busy', 'false');
      if (!confirmed) {
        $('#order-fields').disabled = false;
        $('#package-selector').disabled = false;
        $('#submit-order').disabled = false;
        $('#submit-order').innerHTML = `CONFIRMAR PEDIDO · PAGO EN CASA ${icon('arrow')}`;
      }
    }
  });
  updateSummary();
  displayGallery(0);

  if (win.location.hash === '#pedido') openCheckout($('.nav-purchase'));
  win.addEventListener('hashchange', () => { if (win.location.hash === '#pedido') openCheckout($('.nav-purchase')); });
  return { selectPackage, displayGallery, getState: () => ({ selected, quantity, galleryIndex, confirmed }) };
}

if (typeof document !== 'undefined' && document.querySelector('#order-form')) initApp();
