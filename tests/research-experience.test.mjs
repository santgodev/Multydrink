import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';

test('WhatsApp uses the approved number and exact prefilled message outside the checkout', async () => {
  const win = new Window({ settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true } });
  try {
    win.document.write(await readFile(new URL('../index.html', import.meta.url), 'utf8'));
    const contact = win.document.querySelector('a.floating-whatsapp');
    assert.ok(contact, 'WhatsApp contact remains available outside the checkout');
    assert.equal(contact.getAttribute('aria-label'), 'Hablar por WhatsApp (abre una pestaña nueva)');
    assert.equal(win.document.querySelectorAll('a.floating-whatsapp').length, 1);
    const url = new URL(contact.href);
    assert.equal(url.origin + url.pathname, 'https://wa.me/573108232738');
    assert.equal(url.searchParams.get('text'), 'Hola, estoy visitando la página de MultyDrink y me gustaría recibir más información sobre el producto.');
    assert.ok(contact.relList.contains('noopener'));
    assert.equal(contact.closest('dialog, .sticky-purchase'), null);
    assert.equal(contact.target, '_blank');
    assert.equal(win.document.querySelectorAll('#para-ti').length, 1);
  } finally { await win.happyDOM.abort(); }
});
