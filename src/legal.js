import { commerce as defaultCommerce } from './config.js';
import { isOrderingEnabled, money } from './order.js';
import { legalDraftVersion, approvedPrivacyPolicy, approvedShippingPolicy, approvedPurchaseTerms, approvedReturnsPolicy, approvedContactPolicy } from './legal-config.js';

// Approved customer-facing policies. No forms, analytics or network calls.
export function legalDocuments() {
  return [
    { ...approvedPrivacyPolicy, id: 'privacy', approved: true },
    { ...approvedPurchaseTerms, id: 'conditions', approved: true },
    { ...approvedShippingPolicy, id: 'shipping', approved: true },
    { ...approvedReturnsPolicy, id: 'returns', approved: true },
    { ...approvedContactPolicy, id: 'contact', approved: true },
  ];
}

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const pendingFact = /^\[[A-Z_]+\] \(pendiente de confirmar\)$/;
const readable = text => escape(String(text).replace(/\[[A-Z_]+\] \(pendiente de confirmar\)/g, 'Pendiente de confirmar'));

function renderLegalBlock(block) {
  if (typeof block === 'string') return `<p>${readable(block)}</p>`;
  if (block.type === 'paragraph') return `<p>${block.parts.map(part => typeof part === 'string' ? readable(part) : `<strong>${escape(part.strong)}</strong>`).join('')}</p>`;
  if (block.type === 'contact') return `<p><strong>${escape(block.phoneLabel || 'WhatsApp')}:</strong> <a href="https://wa.me/${block.phone.replace(/\D/g, '')}" target="_blank" rel="noopener noreferrer">${escape(block.phone)}</a><br><strong>Correo electrónico:</strong> <a href="mailto:${escape(block.email)}">${escape(block.email)}</a></p>`;
  if (block.type === 'list') return `<ul>${block.items.map(item => `<li>${readable(item)}</li>`).join('')}</ul>`;
  if (block.type === 'fields') return `${block.intro ? `<p>${escape(block.intro)}</p>` : ''}
    <dl class="legal-fields">${block.fields.map(([label, value]) => `<div><dt>${escape(label)}</dt><dd${pendingFact.test(value) ? ' class="legal-pending"' : ''}>${readable(value)}</dd></div>`).join('')}</dl><p>${escape(block.note)}</p>`;
  if (block.type === 'products') return `<ul class="legal-products" aria-label="Presentaciones y precios">${block.items.map(item => `<li><h4>${escape(item.name)}</h4><dl>
    <div><dt>Contenido</dt><dd>${item.boxes} ${item.boxes === 1 ? 'caja' : 'cajas'} · ${item.sachets} sobres</dd></div>
    <div><dt>Precio por presentación</dt><dd>${escape(money(item.price))} COP</dd></div>
    <div><dt>Referencia comercial</dt><dd>${escape(money(item.referencePrice))} COP</dd></div>
    </dl></li>`).join('')}</ul>`;
  return '';
}

export function initLegalDrafts(doc, win, commerce = defaultCommerce) {
  const localPolicy = commerce.privacyPolicyUrl === approvedPrivacyPolicy.url;
  const localDrafts = ['localhost', '127.0.0.1', '[::1]'].includes(win.location.hostname)
    && !isOrderingEnabled(commerce) && (!commerce.privacyPolicyUrl || localPolicy);
  let rendered = false;
  for (const policy of legalDocuments(commerce)) {
    if (policy.id === 'privacy' && !localPolicy && !localDrafts) continue;
    if (!policy.approved && !localDrafts) continue;
    const dialog = doc.getElementById(`${policy.id}-dialog`);
    if (!dialog) continue;
    rendered = true;
    dialog.classList.add('legal-dialog');
    dialog.innerHTML = `<header class="legal-header"><p class="eyebrow">${policy.approved ? escape(policy.businessName) : 'BORRADOR · REVISIÓN LOCAL'}</p><h2 id="${policy.id}-title">${escape(policy.title)}</h2><button type="button" class="dialog-close" aria-label="Cerrar ${escape(policy.title)}" data-close autofocus>×</button></header>
      <div class="legal-content" ${policy.approved ? 'data-policy-version' : 'data-draft-version'}="${escape(policy.approved ? policy.version : legalDraftVersion)}">${policy.approved ? (policy.updated ? `<p class="legal-policy-meta">Última actualización: ${escape(policy.updated)}</p>` : '') : '<p class="legal-draft-note">Pendiente de aprobación jurídica y comercial. No vigente. La información marcada como pendiente aún no está confirmada. Los pedidos siguen deshabilitados.</p>'}
      ${policy.sections.map(([title, ...blocks], index) => `<section${policy.id === 'privacy' && title === 'Cookies, medición publicitaria y seguridad' ? ' id="privacy-cookies"' : ''}><h3><span class="legal-section-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>${escape(title)}</h3>${blocks.map(renderLegalBlock).join('')}</section>`).join('')}
      ${policy.id === 'contact' ? '<p><a href="https://www.sic.gov.co/" target="_blank" rel="noopener noreferrer">Superintendencia de Industria y Comercio (abre otra pestaña)</a></p>' : ''}
      </div>`;
  }
  return rendered;
}
