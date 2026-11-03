import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';
import { initLegalDrafts } from '../src/legal.js';
import { commerce } from '../src/config.js';
import { approvedPrivacyPolicy } from '../src/legal-config.js';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
function setup(url) {
  const win = new Window({ url, settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true } });
  win.document.write(html);
  return win;
}

test('All five approved legal documents render publicly without draft placeholders', () => {
  for (const url of ['https://example.com/?revision-legal=1', 'https://localhost.example.com/', 'http://192.168.1.2/']) {
    const win = setup(url);
    const others = [...win.document.querySelectorAll('dialog:not(.legal-dialog)')].map(d => d.outerHTML);
    assert.equal(initLegalDrafts(win.document, win), true);
    assert.deepEqual([...win.document.querySelectorAll('dialog:not(.legal-dialog)')].map(d => d.outerHTML), others);
    assert.equal(win.document.querySelector('#privacy-dialog [data-policy-version]').dataset.policyVersion, approvedPrivacyPolicy.version);
    assert.equal(win.document.querySelector('.legal-draft-note'), null);
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
    assert.equal(dialog.querySelector('.legal-draft-note'), null);
    assert.ok(dialog.querySelector('[data-policy-version]'));
    assert.ok(doc.getElementById(dialog.getAttribute('aria-labelledby')));
    assert.equal(doc.querySelectorAll('#' + dialog.id).length, 1);
  }
  assert.equal(doc.querySelector('#pedido').outerHTML, checkout);
  assert.equal(doc.querySelector('#submit-order').disabled, true);
  assert.equal(commerce.orderEndpoint, null);
  assert.equal(doc.querySelector('a[href*="[" ]'), null);
  for (const dialog of doc.querySelectorAll('.legal-dialog')) assert.doesNotMatch(dialog.textContent, /\[[A-Z_]+\]/);
  assert.equal(doc.querySelectorAll('#conditions-dialog .legal-fields, #conditions-dialog .legal-products').length, 0);
  assert.equal(doc.querySelectorAll('#conditions-dialog .legal-content section').length, 5);
  win.happyDOM.abort();
});

test('External privacy policy is never overwritten; merchant configuration cannot inject content into approved policies', () => {
  const win = setup('http://localhost:4175/');
  const doc = win.document;
  const before = doc.querySelector('#privacy-dialog').outerHTML;
  assert.equal(initLegalDrafts(doc, win, { ...commerce, privacyPolicyUrl: 'https://example.com/privacy' }), true);
  assert.equal(doc.querySelector('#privacy-dialog').outerHTML, before);
  assert.ok(doc.querySelector('#shipping-dialog [data-policy-version]'));
  const merchantName = '<img src=x onerror=alert(1)>';
  assert.equal(initLegalDrafts(doc, win, { ...commerce, merchantName }), true);
  assert.equal(doc.querySelector('.legal-dialog img'), null);
  assert.equal(doc.querySelector('#contact-dialog').textContent.includes(merchantName), false);
  win.happyDOM.abort();
});

 test('Approved privacy contains the supplied identity, purposes, rights and version without draft placeholders', () => {
  const win=setup('https://multydrincolombia.com/');
  initLegalDrafts(win.document,win);
  const policy=win.document.querySelector('#privacy-dialog');
  assert.equal(policy.querySelectorAll('.legal-content section').length,7);
  for(const text of ['Dora Patricia Ortiz','Cra. 24B #33B-125','dorapatriciaortiz4@gmail.com','+57 310 823 2738','https://multydrincolombia.com','10 días hábiles','15 días hábiles','Esta autorización no incluye el envío de publicidad.','3 de noviembre de 2026']) assert.ok(policy.textContent.includes(text),text);
  assert.doesNotMatch(policy.textContent,/pendiente de confirmar|BORRADOR|No vigente/);
  assert.equal(commerce.privacyPolicyVersion,approvedPrivacyPolicy.version);
  assert.equal(commerce.privacyPolicyVersion,'2026-11-03');
  win.happyDOM.abort();
});

test('Approved shipping policy preserves delivery, cancellation, warranty and contact terms without enabling orders', () => {
  for (const url of ['http://127.0.0.1:4173/','https://multydrincolombia.com/']) {
    const win=setup(url); const doc=win.document;
    const checkout=doc.querySelector('#pedido').outerHTML;
    initLegalDrafts(doc,win);
    const dialog=doc.querySelector('#shipping-dialog');
    assert.equal(dialog.querySelector('h2').textContent,'Política de Envíos y Entregas');
    assert.equal(dialog.querySelector('.eyebrow').textContent,'MultyDrink Colombia');
    assert.equal(dialog.querySelectorAll('.legal-content section').length,4);
    for (const phrase of ['3 a 5 días hábiles','sujeto a disponibilidad y cobertura.','Para otros destinos, la disponibilidad y los tiempos de entrega están sujetos a validación.','recibirás un número de confirmación','El envío está incluido y el pago se realiza en efectivo contra entrega.','Las cancelaciones podrán gestionarse antes del despacho.','derechos del consumidor establecidos por la legislación colombiana.','también podrás comunicarte para solicitar la atención de la garantía legal.','Por seguridad, no consumas productos con sellos alterados o señales de deterioro.']) assert.ok(dialog.textContent.includes(phrase),phrase);
    assert.equal(dialog.querySelector('a[href^="mailto:"]').getAttribute('href'),'mailto:dorapatriciaortiz4@gmail.com');
    assert.equal(dialog.querySelector('a[href^="https://wa.me/"]').getAttribute('href'),'https://wa.me/573108232738');
    assert.doesNotMatch(dialog.textContent,/BORRADOR|pendiente de confirmar|undefined|No vigente/);
    assert.equal(doc.querySelector('#pedido').outerHTML,checkout);
    assert.equal(doc.querySelector('#submit-order').disabled,true);
    assert.equal(commerce.orderEndpoint,null);
    win.happyDOM.abort();
  }
});

test('Approved purchase terms render locally and publicly without invented tax data or duplicated policies', () => {
  for(const url of ['http://127.0.0.1:4173/','https://multydrincolombia.com/']){
    const win=setup(url);const doc=win.document;const checkout=doc.querySelector('#pedido').outerHTML;
    initLegalDrafts(doc,win);const dialog=doc.querySelector('#conditions-dialog');
    assert.equal(dialog.querySelector('h2').textContent,'Términos y Condiciones de Compra');
    assert.equal(dialog.querySelector('.eyebrow').textContent,'MultyDrink Colombia');
    assert.equal(dialog.querySelector('.legal-policy-meta').textContent,'Última actualización: 3 de noviembre de 2026');
    assert.deepEqual([...dialog.querySelectorAll('h3')].map(h=>h.lastChild.textContent),['Información general','Productos y condiciones comerciales','Registro de pedidos','Condiciones de entrega y derechos del consumidor','Vigencia y aceptación']);
    for(const text of ['Dora Patricia Ortiz','pesos colombianos (COP)','el cliente recibirá un número de pedido como constancia de su registro.','Política de Tratamiento de Datos Personales','Política de Envíos y Entregas','garantía, retracto','sin perjuicio de sus derechos legales.'])assert.ok(dialog.textContent.includes(text),text);
    assert.doesNotMatch(dialog.textContent,/BORRADOR|pendiente de confirmar|TAX_IDENTIFICATION|Identificación tributaria|3 a 5 días|30 días/);
    assert.equal(doc.querySelector('#pedido').outerHTML,checkout);assert.equal(doc.querySelector('#submit-order').disabled,true);assert.equal(commerce.orderEndpoint,null);
    win.happyDOM.abort();
  }
});


test('Approved returns and contact preserve supplied rights, channels and SIC access locally and publicly', () => {
  for (const url of ['http://127.0.0.1:4173/', 'https://multydrincolombia.com/']) {
    const win=setup(url); const doc=win.document;
    initLegalDrafts(doc,win);
    const returns=doc.querySelector('#returns-dialog'); const contact=doc.querySelector('#contact-dialog');
    assert.equal(returns.querySelector('h2').textContent,'Devoluciones, Retracto y Garantía');
    assert.equal(contact.querySelector('h2').textContent,'Contacto y Atención al Cliente');
    assert.equal(returns.querySelector('.legal-policy-meta').textContent,'Última actualización: 3 de noviembre de 2026');
    assert.equal(contact.querySelector('.legal-policy-meta'),null);
    for(const dialog of [returns,contact]) {
      assert.equal(dialog.querySelector('.eyebrow').textContent,'MultyDrink Colombia');
      assert.equal(dialog.querySelectorAll('.legal-content section').length,3);
      assert.equal(dialog.querySelector('a[href^="https://wa.me/"]').getAttribute('href'),'https://wa.me/573108232738');
      assert.equal(dialog.querySelector('a[href^="mailto:"]').getAttribute('href'),'mailto:dorapatriciaortiz4@gmail.com');
      assert.doesNotMatch(dialog.textContent,/BORRADOR|pendiente|No vigente|undefined|RETURNS_|CUSTOMER_|Identificación tributaria/);
    }
    for(const phrase of ['adjuntando fotografías cuando sea posible.','cinco (5) días hábiles siguientes a la entrega.','La apertura del empaque no elimina los derechos de garantía por defectos de calidad.','Cuando corresponda legalmente una reposición o devolución del dinero, se informará al cliente el procedimiento aplicable.']) assert.ok(returns.textContent.includes(phrase),phrase);
    for(const phrase of ['WhatsApp y teléfono:','Cali, Valle del Cauca, Colombia.','Las solicitudes y reclamaciones se atenderán conforme a los plazos legales aplicables.','Gracias por confiar en MultyDrink Colombia.']) assert.ok(contact.textContent.includes(phrase),phrase);
    assert.ok(contact.querySelector('a[href="https://www.sic.gov.co/"]'));
    assert.equal(doc.querySelectorAll('.legal-dialog [data-policy-version]').length,5);
    assert.equal(doc.querySelector('#submit-order').disabled,true);
    assert.equal(commerce.orderEndpoint,null);
    win.happyDOM.abort();
  }
});
