import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { initMarketingTracking, META_PIXEL_ID } from '../src/marketing-tracking.js';

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
    win.localStorage.setItem('multydrink-marketing-consent-v1', 'accepted');
    const tracker = initMarketingTracking({ doc, win });
    assert.equal(tracker.getConsent(), 'accepted');
    assert.equal(doc.querySelector('.marketing-consent').hidden, true);
    assert.equal(calls.filter(call => call[1] === 'PageView').length, 1);
  } finally { win.happyDOM.abort(); }
});

test('Local and demo environments never generate marketing events', () => {
  const { win, calls, doc } = fixture('http://localhost:4173/?pedido-demo=1');
  try {
    const tracker = initMarketingTracking({ doc, win });
    tracker.checkout({ packageId: 'familiar', value: 425000 });
    tracker.lead({ packageId: 'familiar', value: 425000 });
    assert.equal(tracker.getConsent(), 'disabled');
    assert.equal(calls.length, 0);
    assert.equal(doc.querySelector('.marketing-consent'), null);
  } finally { win.happyDOM.abort(); }
});
