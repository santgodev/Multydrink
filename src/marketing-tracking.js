// Meta advertising measurement is optional and never part of checkout security.
// No Meta request, script or pixel is inserted until the visitor accepts.
export const META_PIXEL_ID = '1615961720211982';
const CHOICE_KEY = 'multydrink-marketing-consent-v1';

export function initMarketingTracking({ doc = document, win = window, enabled = true } = {}) {
  let accepted = false;
  let started = false;
  // The local simulation and automated tests must never generate production events.
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(win.location.hostname);
  if (!enabled || local) return { checkout() {}, lead() {}, getConsent: () => 'disabled' };

  function savedChoice() {
    try { return win.localStorage.getItem(CHOICE_KEY); } catch { return null; }
  }
  function saveChoice(choice) {
    try { win.localStorage.setItem(CHOICE_KEY, choice); } catch { /* session choice only */ }
  }
  function track(name, data) {
    if (!accepted || !started || typeof win.fbq !== 'function') return;
    try {
      if (data) win.fbq('track', name, data);
      else win.fbq('track', name);
    } catch { /* Advertising must never interrupt the checkout. */ }
  }
  function startPixel() {
    if (started) return;
    started = true;
    // Bootstrap from the advertiser-provided Meta Pixel code; without noscript,
    // so rejecting cookies never produces a fallback tracking request.
    if (!win.fbq) {
      const fbq = function (...args) {
        if (fbq.callMethod) fbq.callMethod.apply(fbq, args);
        else fbq.queue.push(args);
      };
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = '2.0';
      win.fbq = fbq;
      win._fbq = fbq;
      const script = doc.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      doc.head.append(script);
    }
    try { win.fbq('init', META_PIXEL_ID); }
    catch { return; }
    track('PageView');
    track('ViewContent', { content_name: 'MultyDrink', content_type: 'product' });
  }

  const banner = doc.createElement('section');
  banner.className = 'marketing-consent';
  banner.setAttribute('aria-label', 'Preferencias de cookies');
  banner.innerHTML = '<div class="marketing-consent__content"><strong>Tu privacidad importa</strong><p>Utilizamos cookies opcionales de Meta para medir nuestras campañas en Facebook e Instagram. Puedes aceptarlas o rechazarlas; tu compra funcionará igual. <button type="button" data-marketing-policy>Ver política de privacidad</button>.</p></div><div class="marketing-consent__actions"><button type="button" data-marketing-reject>Rechazar</button><button type="button" data-marketing-accept>Aceptar</button></div>';
  const footerLinks = doc.querySelector('.footer-columns > div:nth-child(2)');
  const preferences = doc.createElement('button');
  preferences.type = 'button';
  preferences.className = 'legal-button';
  preferences.textContent = 'Configurar cookies';
  preferences.addEventListener('click', () => { banner.hidden = false; });
  footerLinks?.append(preferences);
  banner.querySelector('[data-marketing-policy]').addEventListener('click', () => {
    const privacy = doc.getElementById('privacy-dialog');
    if (privacy && !privacy.open) privacy.showModal();
  });
  function choose(value) {
    accepted = value === 'accepted';
    saveChoice(value);
    banner.hidden = true;
    if (accepted) startPixel();
    // After withdrawal, reload to discard the already-loaded Meta library.
    if (!accepted && started) win.location.reload();
  }
  banner.querySelector('[data-marketing-accept]').addEventListener('click', () => choose('accepted'));
  banner.querySelector('[data-marketing-reject]').addEventListener('click', () => choose('rejected'));
  doc.body.append(banner);

  const choice = savedChoice();
  if (choice === 'accepted') {
    accepted = true;
    banner.hidden = true;
    startPixel();
  } else if (choice === 'rejected') {
    banner.hidden = true;
  }
  return {
    checkout({ packageId, value }) {
      if (!['individual', 'familiar'].includes(packageId)) return;
      track('InitiateCheckout', { content_ids: [packageId], content_type: 'product', currency: 'COP', value });
    },
    lead({ packageId, value }) {
      if (!['individual', 'familiar'].includes(packageId)) return;
      track('Lead', { content_ids: [packageId], content_type: 'product', currency: 'COP', value });
    },
    getConsent: () => accepted ? 'accepted' : savedChoice() === 'rejected' ? 'rejected' : 'pending',
  };
}
