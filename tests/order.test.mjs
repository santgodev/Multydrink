import test from 'node:test';
import assert from 'node:assert/strict';
import { commerce, packages } from '../src/config.js';
import { calculateOrder, createOrderClient, isOrderingEnabled, money, normalizePhone, validateField, validateOrder } from '../src/order.js';

const configured = { ...commerce, orderEndpoint: '/test-orders', merchantName: 'Test merchant', privacyPolicyUrl: '/test-policy', privacyPolicyVersion: 'test-v1', shippingFee: 0, shippingDescription: 'Test shipping' };
const valid = { fullName: 'María Pérez', documentNumber: '0012345678', phone: '+57 300 123 4567', department: 'Bogotá, D. C.', city: 'Bogotá', address: 'Calle 10 # 15-20', neighborhood: 'Centro', instructions: '', packageId: 'familiar', quantity: '2', privacy: true };
const receipt = { status: 'received', orderId: 'test-order-1', total: 850000, currency: 'COP' };

test('Exactly two offers with correct quantities, savings and Colombian prices', () => {
  assert.equal(packages.length, 2);
  assert.deepEqual(calculateOrder('individual', 1), { subtotal: 110000, savings: 15000, boxes: 1, sachets: 21, shippingFee: 0, total: 110000 });
  assert.equal(calculateOrder('individual', 1, null).total, null);
  assert.deepEqual(calculateOrder('familiar', 2, 0), { subtotal: 850000, savings: 470000, boxes: 12, sachets: 252, shippingFee: 0, total: 850000 });
  assert.equal(calculateOrder('individual', 3, 12000).total, 342000);
  assert.equal(money(425000), '$425.000');
});
test('Calculations reject unknown packages, non-integer quantities and invalid shipping', () => {
  for (const quantity of [0, -1, 1.5, 21, NaN, Infinity, '2']) assert.throws(() => calculateOrder('familiar', quantity), RangeError);
  assert.throws(() => calculateOrder('three-box', 1));
  assert.throws(() => calculateOrder('familiar', 1, -1));
});
test('Colombian phone validation accepts formatting and rejects invalid length or country', () => {
  for (const phone of ['3001234567', '+57 300 123 4567', '0057 (300) 123-4567']) assert.equal(validateField('phone', phone), '');
  for (const phone of ['123', '2001234567', '+1 3001234567', '30012345678']) assert.ok(validateField('phone', phone));
  assert.equal(normalizePhone(valid.phone), '3001234567');
});
test('Required fields, Colombian department, consent and length constraints are enforced', () => {
  assert.deepEqual(validateOrder(valid), {});
  for (const documentNumber of ['', '123', '1'.repeat(31), '<script>']) assert.ok(validateOrder({ ...valid, documentNumber }).documentNumber);
  for (const documentNumber of ['0012345678', 'AB-123456', '1234', '12 345 678']) assert.equal(validateField('documentNumber', documentNumber), '');
  assert.ok(validateOrder({ ...valid, privacy: false }).privacy);
  assert.ok(validateOrder({ ...valid, neighborhood: '' }).neighborhood);
  assert.ok(validateOrder({ ...valid, email: 'invalid' }).email);
  assert.deepEqual(validateOrder({ ...valid, email: 'test@example.com', unit: 'Torre 2' }), {});
  assert.ok(validateOrder({ ...valid, unit: 'x'.repeat(121) }).unit);
  assert.ok(validateOrder({ ...valid, department: 'Invalid' }).department);
  assert.ok(validateOrder({ ...valid, fullName: 'A' }).fullName);
  assert.ok(validateOrder({ ...valid, city: '<script>' }).city);
  assert.ok(validateOrder({ ...valid, address: 'short', instructions: 'x'.repeat(301) }).address);
  assert.ok(validateOrder({ ...valid, quantity: '1.2' }).quantity);
});
test('Required checkout fields report precise empty-value errors', () => {
  const required = ['fullName', 'documentNumber', 'phone', 'department', 'city', 'address', 'neighborhood', 'packageId', 'quantity'];
  for (const field of required) {
    assert.ok(validateOrder({ ...valid, [field]: '' })[field], `Expected error for missing ${field}`);
  }
  assert.match(validateField('phone', ''), /celular/i);
  assert.match(validateField('phone', '300123456'), /10 dígitos/);
  assert.match(validateField('phone', '2001234567'), /comenzar por 3/);
  assert.equal(validateField('phone', '3001234567'), '');
  assert.ok(validateOrder({ ...valid, privacy: false }).privacy);
  assert.deepEqual(validateOrder({ ...valid, unit: '', instructions: '', email: '' }), {});
});

test('HTTP 400, 429 and 503 do not confirm orders and show specific feedback', async () => {
  for (const [status, expected] of [[400, /datos enviados no son válidos/i], [429, /muchas solicitudes/i], [503, /no están disponibles/i]]) {
    const client = createOrderClient(configured, async () => new Response('{}', { status }));
    await assert.rejects(client.submit(valid, 'test-turnstile-token'), error => error.code === 'HTTP' && expected.test(error.message));
  }
});

test('Unconfigured checkout never calls a network service or fakes success', async () => {
  const unavailable = { ...commerce, orderEndpoint: null };
  assert.equal(isOrderingEnabled(unavailable), false);
  let called = false;
  await assert.rejects(createOrderClient(unavailable, async () => { called = true; }).submit(valid, 'test-turnstile-token'), { code: 'UNAVAILABLE' });
  assert.equal(called, false);
  assert.equal(isOrderingEnabled({ ...configured, privacyPolicyUrl: null }), false);
  assert.equal(isOrderingEnabled({ ...configured, shippingFee: null }), false);
});
test('Submission sends only product IDs and quantity; backend owns authoritative pricing', async () => {
  let options;
  const client = createOrderClient(configured, async (url, request) => { assert.equal(url, '/test-orders'); options = request; return new Response(JSON.stringify(receipt)); });
  assert.deepEqual(await client.submit(valid, 'test-turnstile-token'), { orderId: 'test-order-1', total: 850000, currency: 'COP' });
  const payload = JSON.parse(options.body);
  assert.deepEqual(payload.items, [{ packageId: 'familiar', quantity: 2 }]);
  assert.equal(payload.customer.phone, '+573001234567');
  assert.equal(payload.customer.documentNumber, '0012345678');
  assert.equal(payload.paymentMethod, 'cash_on_delivery');
  assert.equal(payload.consent.policyVersion, 'test-v1');
  assert.ok(options.headers['Idempotency-Key']);
  assert.equal(payload.total, undefined);
});
test('Public checkout refuses to send an order without a Turnstile token', async () => {
  let calls = 0;
  const client = createOrderClient(configured, async () => { calls++; return new Response(JSON.stringify(receipt)); });
  await assert.rejects(client.submit(valid), { code: 'TURNSTILE' });
  await assert.rejects(client.submit(valid, '  '), { code: 'TURNSTILE' });
  assert.equal(calls, 0);
});
test('One-time Turnstile token changes on retry without changing the order idempotency key', async () => {
  const sent = [];
  const client = createOrderClient(configured, async (_, request) => {
    sent.push({ key: request.headers['Idempotency-Key'], body: JSON.parse(request.body) });
    if (sent.length === 1) throw new Error('Network lost');
    return new Response(JSON.stringify(receipt));
  });
  await assert.rejects(client.submit(valid, 'initial-token'), { code: 'NETWORK' });
  await client.submit(valid, 'fresh-token');
  assert.equal(sent[0].key, sent[1].key);
  assert.equal(sent[0].body.turnstileToken, 'initial-token');
  assert.equal(sent[1].body.turnstileToken, 'fresh-token');
});
test('Double submissions are blocked and successful receipt is reused', async () => {
  let resolveRequest;
  let calls = 0;
  const client = createOrderClient(configured, () => { calls++; return new Promise(resolve => { resolveRequest = resolve; }); });
  const pending = client.submit(valid, 'test-turnstile-token');
  await assert.rejects(client.submit(valid, 'test-turnstile-token'), { code: 'BUSY' });
  resolveRequest(new Response(JSON.stringify(receipt)));
  await pending;
  await client.submit(valid, 'test-turnstile-token');
  assert.equal(calls, 1);
});
test('Network uncertainty reuses the idempotency key and blocks changed details', async () => {
  const keys = [];
  const client = createOrderClient(configured, async (_, request) => { keys.push(request.headers['Idempotency-Key']); if (keys.length === 1) throw new Error('Network lost'); return new Response(JSON.stringify(receipt)); });
  await assert.rejects(client.submit(valid, 'test-turnstile-token'), { code: 'NETWORK' });
  await assert.rejects(client.submit({ ...valid, quantity: '3' }, 'test-turnstile-token'), { code: 'UNKNOWN' });
  await client.submit(valid, 'test-turnstile-token');
  assert.equal(keys[0], keys[1]);
});
test('HTTP errors and malformed receipts cannot produce a confirmed order', async () => {
  await assert.rejects(createOrderClient(configured, async () => new Response('{}', { status: 500 })).submit(valid, 'test-turnstile-token'), { code: 'HTTP' });
  await assert.rejects(createOrderClient(configured, async () => new Response('{}', { status: 429 })).submit(valid, 'test-turnstile-token'), { code: 'HTTP' });
  for (const body of [{}, { ...receipt, status: 'ok' }, { ...receipt, total: '850000' }, { ...receipt, currency: 'USD' }, { ...receipt, orderId: '' }]) {
    await assert.rejects(createOrderClient(configured, async () => new Response(JSON.stringify(body))).submit(valid, 'test-turnstile-token'), { code: 'RECEIPT' });
  }
});

test('Approved policy version reaches the Worker contract through a mocked order only', async () => {
  let payload;
  const client=createOrderClient({...configured,privacyPolicyVersion:commerce.privacyPolicyVersion},async (_,request)=>{payload=JSON.parse(request.body);return new Response(JSON.stringify(receipt));});
  await client.submit(valid,'test-turnstile-token');
  assert.deepEqual(payload.consent,{accepted:true,policyVersion:commerce.privacyPolicyVersion});
  assert.equal(commerce.privacyPolicyVersion,'2026-11-10');
  assert.equal(isOrderingEnabled(commerce),true);
  assert.equal(commerce.orderEndpoint,'https://multydrink-orders-api.santgodev.workers.dev/orders');
});
