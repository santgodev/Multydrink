import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { initMarketingTracking, META_PIXEL_ID, COOKIE_NOTICE_VERSION } from '../src/marketing-tracking.js';

function fixture(url = 'https://multydrincolombia.com/') {
  const win = new Window({ url, settings: { disableJavaScriptFileLoading: true, disableCSSFileLoading: true } });
  win.document.body.innerHTML = '<footer><div class="footer-columns"><div></div><div></div></div></footer><dialog id="privacy-dialog"></dialog>';
  const calls = [];
  // The stub records calls without downloading Meta resources.
  win.fbq = (...args) => calls.push(args);
  return { win, calls, doc: win.document };
}

test('Meta tracking is disabled by default, no events until acceptance, and refusal never tracks', () => {
  const { win, calls, doc } = fixture();
  try {
    const tracker = initMarketingTracking({ doc, win });
    assert.equal(tracker.getConsent(), 'pending');
    assert.equal(doc.querySelector('.marketing-consent').hidden, false);
    assert.equal(doc.querySelectorAll('script[src*="fbevents"]').length, 0);
    assert.match(doc.querySelector('.marketing-consent').textContent, /Usamos cookies opcionales para medir nuestras campañas publicitarias/);
    assert.match(doc.querySelector('.footer-columns button').textContent, /Preferencias de cookies/);
    doc.getElementById('privacy-dialog').innerHTML = '<div class="legal-content"><section id="privacy-cookies">Cookies</section></div>';
    doc.querySelector('[data-marketing-policy]').click();
    assert.equal(doc.getElementById('privacy-dialog').open, true);
    tracker.checkout({ packageId: 'individual', value: 110000 });
    tracker.lead({ packageId: 'individual', value: 110000 });
    assert.equal(calls.length, 0);
    doc.querySelector('[data-marketing-reject]').click();
    assert.equal(tracker.getConsent(), 'rejected');
    assert.equal(doc.querySelector('.marketing-consent').hidden, true);
    tracker.checkout({ packageId: 'individual', value: 110000 });
    assert.equal(calls.length, 0);
    doc.querySelector('.footer-columns button').click();
    assert.equal(doc.querySelector('.marketing-consent').hidden, false);
  } finally { win.happyDOM.abort(); }
});

test('Acceptance initializes exactly once and emits only non-personal events', () => {
  const { win, calls, doc } = fixture();
  try {
    const tracker = initMarketingTracking({ doc, win });
    doc.querySelector('[data-marketing-accept]').click();
    assert.deepEqual(calls.slice(0, 3), [
      ['init', META_PIXEL_ID],
      ['track', 'PageView'],
      ['track', 'ViewContent', { content_name: 'MultyDrink', content_type: 'product' }],
    ]);
    tracker.checkout({ packageId: 'familiar', value: 425000 });
    tracker.lead({ packageId: 'familiar', value: 425000 });
    assert.equal(calls.filter(call => call[1] === 'InitiateCheckout').length, 1);
    assert.equal(calls.filter(call => call[1] === 'Lead').length, 1);
    assert.deepEqual(calls.at(-1), ['track', 'Lead', { content_ids: ['familiar'], content_type: 'product', currency: 'COP', value: 425000 }]);
    tracker.lead({ packageId: 'invalid', value: 110000 });
    assert.equal(calls.length, 5);
    assert.ok(!JSON.stringify(calls).includes('phone'));
  } finally { win.happyDOM.abort(); }
});

test('A saved decision prevents repeated consent prompts', () => {
  const { win, calls, doc } = fixture();
  try {
    win.localStorage.setItem('multydrink-marketing-consent-v2', JSON.stringify({ decision: 'accepted', version: COOKIE_NOTICE_VERSION, decidedAt: '2026-11-10T16:00:00.000Z' }));
    const tracker = initMarketingTracking({ doc, win });
    assert.equal(tracker.getConsent(), 'accepted');
    assert.equal(doc.querySelector('.marketing-consent').hidden, true);
    assert.equal(calls.filter(call => call[1] === 'PageView').length, 1);
  } finally { win.happyDOM.abort(); }
});

test('Local preview shows consent controls but never generates Meta events', () => {
  const { win, calls, doc } = fixture('http://localhost:4173/?pedido-demo=1');
  try {
    const tracker = initMarketingTracking({ doc, win });
    tracker.checkout({ packageId: 'familiar', value: 425000 });
    tracker.lead({ packageId: 'familiar', value: 425000 });
    assert.equal(tracker.getConsent(), 'pending');
    assert.equal(doc.querySelector('.marketing-consent').hidden, false);
    doc.querySelector('[data-marketing-accept]').click();
    assert.equal(tracker.getConsent(), 'accepted');
    tracker.checkout({ packageId: 'familiar', value: 425000 });
    tracker.lead({ packageId: 'familiar', value: 425000 });
    assert.equal(calls.length, 0);
    assert.equal(doc.querySelectorAll('script[src*="fbevents"]').length, 0);
  } finally { win.happyDOM.abort(); }
});

test('Private LAN previews never initialize Meta even after explicit cookie acceptance', () => {
  for (const host of ['192.168.1.40', '10.0.0.15', '172.16.1.2', '172.31.255.254', '127.0.0.1']) {
    const { win, calls, doc } = fixture('http://' + host + ':4174/');
    try {
      const tracker = initMarketingTracking({ doc, win });
      doc.querySelector('[data-marketing-accept]').click();
      tracker.checkout({ packageId: 'individual', value: 110000 });
      tracker.lead({ packageId: 'individual', value: 110000 });
      assert.equal(tracker.getConsent(), 'accepted', host);
      assert.deepEqual(calls, [], host);
      assert.equal(doc.querySelectorAll('script[src*="fbevents"]').length, 0, host);
    } finally { win.happyDOM.abort(); }
  }
});

test('Consent choice saves a timestamp and notice version without customer data', () => {
  const { win, doc } = fixture();
  try {
    initMarketingTracking({ doc, win });
    doc.querySelector('[data-marketing-reject]').click();
    const record = JSON.parse(win.localStorage.getItem('multydrink-marketing-consent-v2'));
    assert.equal(record.decision, 'rejected');
    assert.equal(record.version, COOKIE_NOTICE_VERSION);
    assert.ok(Number.isFinite(Date.parse(record.decidedAt)));
    assert.deepEqual(Object.keys(record).sort(), ['decidedAt', 'decision', 'version'].sort());
  } finally { win.happyDOM.abort(); }
});

test('Obsolete, corrupt or mismatched consent cannot automatically activate Meta', () => {
  for (const value of ['not-json', JSON.stringify({ decision: 'accepted', version: 'old-version' }), JSON.stringify({ decision: 'unexpected', version: COOKIE_NOTICE_VERSION })]) {
    const { win, doc, calls } = fixture();
    try {
      win.localStorage.setItem('multydrink-marketing-consent-v2', value);
      const tracker = initMarketingTracking({ doc, win });
      assert.equal(tracker.getConsent(), 'pending');
      assert.equal(doc.querySelector('.marketing-consent').hidden, false);
      assert.equal(calls.length, 0);
    } finally { win.happyDOM.abort(); }
  }
});

test('Meta script bootstrap is withheld until consent on a public domain', () => {
  const { win, doc } = fixture();
  try {
    delete win.fbq;
    const tracker = initMarketingTracking({ doc, win });
    assert.equal(doc.querySelectorAll('script[src*="fbevents"]').length, 0);
    tracker.checkout({ packageId: 'individual', value: 110000 });
    doc.querySelector('[data-marketing-reject]').click();
    assert.equal(doc.querySelectorAll('script[src*="fbevents"]').length, 0);
    doc.querySelector('.footer-columns button').click();
    doc.querySelector('[data-marketing-accept]').click();
    assert.equal(doc.querySelectorAll('script[src*="fbevents"]').length, 1);
    assert.equal(win.fbq.queue.length >= 3, true);
  } finally { win.happyDOM.abort(); }
});
