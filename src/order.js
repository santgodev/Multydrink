import { commerce, departments, packages } from './config.js';

export const money = value => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value).replace(/\s/g, '');
export const getPackage = id => packages.find(item => item.id === id);
export function calculateOrder(id, quantity, shippingFee = commerce.shippingFee) {
  const item = getPackage(id);
  if (!item || !Number.isInteger(quantity) || quantity < 1 || quantity > commerce.maxQuantity) throw new RangeError('Pedido inválido');
  if (shippingFee !== null && (!Number.isInteger(shippingFee) || shippingFee < 0)) throw new RangeError('Envío inválido');
  const subtotal = item.price * quantity;
  return { subtotal, savings: (item.referencePrice - item.price) * quantity, boxes: item.boxes * quantity, sachets: item.sachets * quantity, shippingFee, total: shippingFee === null ? null : subtotal + shippingFee };
}
export function normalizePhone(value) {
  return String(value).replace(/[\s().-]/g, '').replace(/^(\+57|0057)/, '');
}
export function validateField(name, value) {
  const text = String(value ?? '').trim();
  switch (name) {
    case 'fullName': if (!text) return 'Ingresa tu nombre y apellido.'; return text.length >= 5 && text.length <= 100 && /^[\p{L}\p{M}' .-]+$/u.test(text) && text.split(/\s+/).length > 1 ? '' : 'Escribe tu nombre y apellido completos.';
    case 'documentNumber': if (!text) return 'Ingresa tu número de documento.'; return text.length >= 4 && text.length <= 30 && /^[\p{L}\p{N}]+(?:[ .-]?[\p{L}\p{N}]+)*$/u.test(text) ? '' : 'Escribe tu documento de identidad (entre 4 y 30 caracteres; admite letras, números, espacios, puntos y guiones).';
    case 'phone': return !text ? 'Ingresa tu número de celular.' : /^3\d{9}$/.test(normalizePhone(text)) ? '' : 'El celular debe tener exactamente 10 dígitos y comenzar por 3.';
    case 'department': return departments.includes(text) ? '' : 'Selecciona tu departamento.';
    case 'city': if (!text) return 'Ingresa tu ciudad o municipio.'; return text.length >= 2 && text.length <= 80 && /^[\p{L}\p{M} .'-]+$/u.test(text) ? '' : 'Escribe una ciudad o municipio válido.';
    case 'address': if (!text) return 'Ingresa tu dirección de entrega.'; return text.length >= 8 && text.length <= 180 ? '' : 'Escribe una dirección completa, entre 8 y 180 caracteres.';
    case 'neighborhood': if (!text) return 'Ingresa tu barrio.'; return text.length >= 2 && text.length <= 100 ? '' : 'Escribe tu barrio, entre 2 y 100 caracteres.';
    case 'unit': return text.length <= 120 ? '' : 'Usa máximo 120 caracteres para los detalles de tu vivienda.';
    case 'email': return !text || (text.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) ? '' : 'Escribe un correo electrónico válido o deja el campo vacío.';
    case 'instructions': return text.length <= 300 ? '' : 'Usa máximo 300 caracteres.';
    case 'packageId': return getPackage(text) ? '' : 'Selecciona una presentación.';
    case 'quantity': return /^\d+$/.test(text) && Number(text) >= 1 && Number(text) <= commerce.maxQuantity ? '' : `Elige entre 1 y ${commerce.maxQuantity} paquetes.`;
    case 'privacy': return value === true ? '' : 'Debes aceptar la política de privacidad para enviar tu pedido.';
    default: return '';
  }
}
export function validateOrder(values) {
  return Object.fromEntries(['fullName', 'documentNumber', 'phone', 'department', 'city', 'address', 'neighborhood', 'unit', 'instructions', 'email', 'packageId', 'quantity', 'privacy'].map(key => [key, validateField(key, values[key])]).filter(([, error]) => error));
}
export function isOrderingEnabled(config = commerce) {
  return Boolean(config.orderEndpoint && config.merchantName && config.privacyPolicyUrl && config.privacyPolicyVersion && config.shippingFee !== null && config.shippingDescription);
}
export class OrderError extends Error { constructor(message, code) { super(message); this.name = 'OrderError'; this.code = code; } }

export function createOrderClient(config = commerce, fetcher = globalThis.fetch) {
  let pending = false;
  let retryKey = null;
  let retryFingerprint = null;
  let completed = null;
  let outcomeUnknown = false;
  return {
    async submit(values) {
      if (pending) throw new OrderError('Tu solicitud ya se está enviando.', 'BUSY');
      if (completed) return completed;
      if (!isOrderingEnabled(config)) throw new OrderError('Los pedidos en línea aún no están habilitados. No hemos enviado tus datos.', 'UNAVAILABLE');
      if (Object.keys(validateOrder(values)).length) throw new OrderError('Revisa los campos del formulario.', 'VALIDATION');
      const payload = {
        customer: { fullName: values.fullName.trim(), documentNumber: values.documentNumber.trim(), phone: '+57' + normalizePhone(values.phone), department: values.department, city: values.city.trim(), address: values.address.trim(), neighborhood: values.neighborhood.trim(), unit: (values.unit || '').trim(), instructions: (values.instructions || '').trim(), email: (values.email || '').trim() },
        items: [{ packageId: values.packageId, quantity: Number(values.quantity) }],
        paymentMethod: 'cash_on_delivery',
        consent: { accepted: true, policyVersion: config.privacyPolicyVersion },
      };
      const fingerprint = JSON.stringify(payload);
      if (outcomeUnknown && retryFingerprint !== fingerprint) throw new OrderError('No pudimos confirmar el resultado del intento anterior. Conserva sus datos para reintentar o contacta al vendedor antes de hacer otro pedido.', 'UNKNOWN');
      if (fingerprint !== retryFingerprint) { retryKey = crypto.randomUUID(); retryFingerprint = fingerprint; }
      pending = true;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetcher(config.orderEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': retryKey }, body: JSON.stringify(payload), signal: controller.signal, credentials: 'same-origin' });
        if (!response.ok) {
          outcomeUnknown = response.status >= 500 || response.status === 409;
          throw new OrderError(response.status === 400 ? 'Los datos enviados no son válidos. Revisa el formulario.' : response.status === 429 ? 'Hay muchas solicitudes. Espera un momento y vuelve a intentar.' : response.status === 503 ? 'Los pedidos no están disponibles en este momento. No se ha confirmado tu pedido.' : 'No pudimos confirmar tu solicitud. Reintenta con los mismos datos o consulta al vendedor.', 'HTTP');
        }
        const result = await response.json();
        // Only an explicit persisted order receipt counts as success.
        if (result.status !== 'received' || typeof result.orderId !== 'string' || !result.orderId.trim() || result.currency !== 'COP' || !Number.isSafeInteger(result.total) || result.total < 0) {
          outcomeUnknown = true;
          throw new OrderError('La respuesta no permite confirmar el pedido. Reintenta con los mismos datos o consulta al vendedor.', 'RECEIPT');
        }
        completed = { orderId: result.orderId, total: result.total, currency: result.currency };
        return completed;
      } catch (error) {
        if (error instanceof OrderError) throw error;
        outcomeUnknown = true;
        throw new OrderError('No pudimos confirmar si se recibió tu solicitud. Reintenta con los mismos datos para evitar duplicados.', 'NETWORK');
      } finally { clearTimeout(timer); pending = false; }
    },
  };
}
