// Turnstile is loaded only when the real checkout opens. No client-side secret.
const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export function createOrderTurnstile({ win = window, doc = document, siteKey, container }) {
  let widgetId = null;
  let token = '';
  let loading = null;
  const status = doc.getElementById('turnstile-status');

  function update(message) {
    if (status) status.textContent = message;
  }

  function loadScript() {
    if (win.turnstile?.render) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise((resolve, reject) => {
      const script = doc.createElement('script');
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = () => win.turnstile?.render ? resolve() : reject(new Error('Turnstile no está disponible.'));
      script.onerror = () => reject(new Error('No fue posible cargar la verificación.'));
      doc.head.append(script);
    }).catch(error => { loading = null; throw error; });
    return loading;
  }

  return {
    async mount() {
      if (!siteKey || !container) throw new Error('Falta la configuración de verificación.');
      if (widgetId !== null) return;
      update('Preparando verificación de seguridad…');
      await loadScript();
      widgetId = win.turnstile.render(container, {
        sitekey: siteKey,
        action: 'multydrink_order',
        theme: 'auto',
        callback(value) { token = value; update('Verificación completada.'); },
        'expired-callback'() { token = ''; update('La verificación caducó. Complétala nuevamente.'); },
        'error-callback'() { token = ''; update('No se pudo verificar. Intenta nuevamente.'); },
        'timeout-callback'() { token = ''; update('La verificación tardó demasiado. Intenta nuevamente.'); }
      });
      if (widgetId === null || widgetId === undefined) throw new Error('No fue posible iniciar la verificación.');
    },
    getToken() { return token; },
    reset() {
      token = '';
      if (widgetId !== null && win.turnstile?.reset) win.turnstile.reset(widgetId);
      update('Completa la verificación para enviar un pedido.');
    }
  };
}
