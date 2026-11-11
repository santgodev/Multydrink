// Order-only, coarse attribution. No cookies, persistent storage or advertising IDs.
// This value is not sent to Meta, and is independent of marketing consent.
export const UNKNOWN_ORIGIN = 'Directo / desconocido';

function classify(value) {
  const s = String(value || '').toLowerCase().trim();
  if (!s) return null;
  if (/(^|[.\-_])instagram([.\-_]|$)|^ig$/.test(s)) return 'Instagram';
  if (/(^|[.\-_])facebook([.\-_]|$)|^fb$|^m\.facebook$|^l\.facebook$|^fb\.me$/.test(s)) return 'Facebook';
  if (/(^|[.\-_])whatsapp([.\-_]|$)|^wa$|^wa\.me$/.test(s)) return 'WhatsApp';
  if (/(^|[.\-_])tiktok([.\-_]|$)/.test(s)) return 'TikTok';
  if (/(^|[.\-_])google([.\-_]|$)/.test(s)) return 'Google';
  return null;
}

export function detectOrderOrigin(url, referrer = '') {
  let current;
  try { current = new URL(url); } catch { return UNKNOWN_ORIGIN; }
  const source = current.searchParams.get('utm_source');
  if (source && source.trim()) return classify(source) || 'Otro enlace identificado';
  try {
    if (!referrer) return UNKNOWN_ORIGIN;
    const previous = new URL(referrer);
    if (!['http:', 'https:'].includes(previous.protocol) || previous.hostname === current.hostname) return UNKNOWN_ORIGIN;
    return classify(previous.hostname) || 'Otro sitio web';
  } catch { return UNKNOWN_ORIGIN; }
}
