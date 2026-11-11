import test from 'node:test';
import assert from 'node:assert/strict';
import { detectOrderOrigin, UNKNOWN_ORIGIN } from '../src/order-origin.js';

test('UTM source identifies the order channel without advertising identifiers', () => {
  for (const [source, expected] of [
    ['instagram', 'Instagram'], ['facebook', 'Facebook'], ['whatsapp', 'WhatsApp'],
    ['tiktok', 'TikTok'], ['google', 'Google'], ['ig', 'Instagram'],
    ['some-partner', 'Otro enlace identificado']
  ]) {
    assert.equal(detectOrderOrigin('https://multydrincolombia.com/?utm_source=' + source), expected);
  }
  assert.equal(detectOrderOrigin('https://multydrincolombia.com/?utm_source=instagram&fbclid=123'), 'Instagram');
});
test('Referrer is a best-effort fallback; direct traffic remains unknown', () => {
  assert.equal(detectOrderOrigin('https://multydrincolombia.com/', 'https://www.google.com/search?q=x'), 'Google');
  assert.equal(detectOrderOrigin('https://multydrincolombia.com/', 'https://l.facebook.com/path'), 'Facebook');
  assert.equal(detectOrderOrigin('https://multydrincolombia.com/', 'https://example.org/path'), 'Otro sitio web');
  assert.equal(detectOrderOrigin('https://multydrincolombia.com/', 'https://multydrincolombia.com/product'), UNKNOWN_ORIGIN);
  assert.equal(detectOrderOrigin('https://multydrincolombia.com/?fbclid=123'), UNKNOWN_ORIGIN);
  assert.equal(detectOrderOrigin('https://multydrincolombia.com/', ''), UNKNOWN_ORIGIN);
});
