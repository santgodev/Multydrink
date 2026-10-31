import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';
import { initLegalDrafts } from '../src/legal.js';
import { commerce, packages } from '../src/config.js';
import { money } from '../src/order.js';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
function setup(url) {
  const win = new Window({ url, settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true } });
  win.document.write(html);
  return win;
}

test('Legal drafts remain local even with a public-host preview query', () => {
  for (const url of ['https://example.com/?revision-legal=1', 'https://localhost.example.com/', 'http://192.168.1.2/']) {
    const win = setup(url);
    const before = win.document.body.innerHTML;
    assert.equal(initLegalDrafts(win.document, win), false);
    assert.equal(win.document.body.innerHTML, before);
    win.happyDOM.abort();
  }
});

test('Five local legal dialogs resolve footer links without changing checkout or enabling orders', () => {
  const win = setup('http://127.0.0.1:4175/');
  const doc = win.document;
  const checkout = doc.querySelector('#pedido').outerHTML;
  assert.equal(initLegalDrafts(doc, win), true);
  assert.equal(doc.querySelectorAll('.legal-dialog').length, 5);
  assert.equal(doc.querySelectorAll('.legal-dialog details').length, 0);
  assert.doesNotMatch([...doc.querySelectorAll('.legal-dialog')].map(dialog => dialog.textContent).join(' '), /Fuentes oficiales consultadas/);
  const authority = doc.querySelector('#contact-dialog a[href="https://www.sic.gov.co/"]');
  assert.ok(authority);
  assert.match(authority.textContent, /Superintendencia de Industria y Comercio/);
  assert.equal(authority.rel, 'noopener noreferrer');
  for (const button of doc.querySelectorAll('.footer [data-dialog]')) {
    const dialog = doc.getElementById(button.dataset.dialog);
    assert.ok(dialog.querySelector('.legal-draft-note'));
    assert.ok(doc.getElementById(dialog.getAttribute('aria-labelledby')));
    assert.equal(doc.querySelectorAll('#' + dialog.id).length, 1);
  }
  assert.equal(doc.querySelector('#pedido').outerHTML, checkout);
  assert.equal(doc.querySelector('#submit-order').disabled, true);
  assert.equal(commerce.orderEndpoint, null);
  assert.equal(doc.querySelector('a[href*="[" ]'), null);
  for (const dialog of doc.querySelectorAll('.legal-dialog')) assert.doesNotMatch(dialog.textContent, /\[[A-Z_]+\]/);
  assert.equal(doc.querySelectorAll('#conditions-dialog .legal-fields dt').length, 7);
  assert.equal(doc.querySelectorAll('#conditions-dialog .legal-pending').length, 7);
  assert.equal(doc.querySelectorAll('#conditions-dialog .legal-products li').length, packages.length);
  for (const item of packages) {
    assert.ok(doc.querySelector('#conditions-dialog').textContent.includes(money(item.price)));
    assert.ok(doc.querySelector('#conditions-dialog').textContent.includes(money(item.referencePrice)));
  }
  win.happyDOM.abort();
});

test('Existing published policy is never overwritten; untrusted factual text is escaped', () => {
  const win = setup('http://localhost:4175/');
  const doc = win.document;
  const before = doc.body.innerHTML;
  assert.equal(initLegalDrafts(doc, win, { ...commerce, privacyPolicyUrl: 'https://example.com/privacy' }), false);
  assert.equal(doc.body.innerHTML, before);
  const merchantName = '<img src=x onerror=alert(1)>';
  assert.equal(initLegalDrafts(doc, win, { ...commerce, merchantName }), true);
  assert.equal(doc.querySelector('.legal-dialog img'), null);
  assert.ok(doc.querySelector('#privacy-dialog').textContent.includes(merchantName));
  win.happyDOM.abort();
});
