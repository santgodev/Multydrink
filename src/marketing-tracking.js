// Meta advertising measurement is optional and never part of checkout security.
// No Meta request, script or pixel is inserted until the visitor accepts.
export const META_PIXEL_ID = '1615961720211982';
export const COOKIE_NOTICE_VERSION = 'cookies-2026-11-10';
const CHOICE_KEY = 'multydrink-marketing-consent-v2';

function isLocalPreview(hostname) {
  const host = hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host === '::1' || host === '[::1]') return true;
  if (!/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host)) return false;
  const parts = host.split('.').map(Number);
  if (parts.some(part => part > 255)) return false;
  return parts[0] === 10
    || parts[0] === 127
    || (parts[0] === 192 && parts[1] === 168)
    || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
    || (parts[0] === 169 && parts[1] === 254);
}

export function initMarketingTracking({ doc = document, win = window, enabled = true } = {}) {
  let accepted = false;
  let started = false;
  // The local simulation and automated tests must never generate production events.
  const local = isLocalPreview(win.location.hostname);
  if (!enabled) return { checkout() {}, lead() {}, getConsent: () => 'disabled' };

  function savedChoice() {
    try {
      const record = JSON.parse(win.localStorage.getItem(CHOICE_KEY) || 'null');
      if (record?.version !== COOKIE_NOTICE_VERSION) return null;
      return ['accepted', 'rejected'].includes(record.decision) ? record.decision : null;
    } catch { return null; }
  }
  function saveChoice(choice) {
    try {
      win.localStorage.setItem(CHOICE_KEY, JSON.stringify({
        decision: choice,
        version: COOKIE_NOTICE_VERSION,
        decidedAt: new Date().toISOString(),
      }));
    } catch { /* session choice only; no personal data collected */ }
  }
  function track(name, data) {
    if (!accepted || !started || typeof win.fbq !== 'function') return;
    try {
      if (data) win.fbq('track', name, data);
      else win.fbq('track', name);
    } catch { /* Advertising must never interrupt the checkout. */ }
  }
  function startPixel() {
    if (local || started) return;
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
  banner.innerHTML = '<div class="marketing-consent__content"><div class="marketing-consent__heading"><svg class="marketing-consent__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg><strong>Tu privacidad importa</strong></div><p>Usamos cookies opcionales para medir nuestras campañas publicitarias y mejorar tu experiencia en MultyDrink. <button type="button" data-marketing-policy>Conoce más sobre las cookies.</button></p></div><div class="marketing-consent__actions"><button type="button" data-marketing-reject>Rechazar</button><button type="button" data-marketing-accept>Aceptar</button></div>';
  const footerLinks = doc.querySelector('.footer-columns > div:nth-child(2)');
  const preferences = doc.createElement('button');
  preferences.type = 'button';
  preferences.className = 'legal-button';
  preferences.textContent = 'Preferencias de cookies';
  preferences.addEventListener('click', () => { banner.hidden = false; });
  footerLinks?.append(preferences);
  banner.querySelector('[data-marketing-policy]').addEventListener('click', () => {
    const privacy = doc.getElementById('privacy-dialog');
    if (!privacy) return;
    if (!privacy.open) privacy.showModal();
    const section = privacy.querySelector('#privacy-cookies');
    if (section?.scrollIntoView) section.scrollIntoView({ block: 'start' });
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
