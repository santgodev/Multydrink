/**
 * MultyDrink Orders API — prepared deployment candidate.
 * Existing Apps Script/Sheets contract preserved.
 * Public orders are rejected until ORDERS_ENABLED === "true".
 * No secrets belong in this file.
 */
const HOST = "multydrincolombia.com";
const ORIGIN = "https://" + HOST;
const CATALOGO = Object.freeze({
  individual: { precio: 110000 },
  familiar: { precio: 425000 }
});
const DEPARTAMENTOS = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico",
  "Bogotá, D. C.", "Bolívar", "Boyacá", "Caldas",
  "Caquetá", "Casanare", "Cauca", "Cesar",
  "Chocó", "Córdoba", "Cundinamarca", "Guainía",
  "Guaviare", "Huila", "La Guajira", "Magdalena",
  "Meta", "Nariño", "Norte de Santander",
  "Putumayo", "Quindío", "Risaralda",
  "San Andrés, Providencia y Santa Catalina",
  "Santander", "Sucre", "Tolima", "Valle del Cauca",
  "Vaupés", "Vichada"
];
const MAX_BODY_BYTES = 12000;
const texto = valor => typeof valor === "string" ? valor.trim() : "";
const normalizarCelular = valor => texto(valor).replace(/[\s().-]/g, "").replace(/^(\+57|0057)/, "");

function json(status, datos) {
  return new Response(JSON.stringify(datos), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
const error = (status, mensaje) => json(status, { ok: false, mensaje });

function conCors(response, origin) {
  const headers = new Headers(response.headers);
  headers.set("Vary", "Origin");
  if (origin === ORIGIN) {
    headers.set("Access-Control-Allow-Origin", ORIGIN);
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Idempotency-Key");
    headers.set("Access-Control-Max-Age", "600");
  }
  return new Response(response.body, { status: response.status, headers });
}

async function claveCorrecta(recibida, esperada) {
  if (typeof recibida !== "string" || typeof esperada !== "string" || esperada.length < 32) return false;
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(recibida)),
    crypto.subtle.digest("SHA-256", encoder.encode(esperada))
  ]);
  const x = new Uint8Array(a), y = new Uint8Array(b);
  let diferencia = 0;
  for (let i = 0; i < x.length; i++) diferencia |= x[i] ^ y[i];
  return diferencia === 0;
}

function validarPedido(datos, solicitudId, versionPolitica) {
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) throw new Error("Solicitud inválida.");
  if (!/^[A-Za-z0-9-]{8,80}$/.test(solicitudId)) throw new Error("Identificador de solicitud inválido.");
  const c = datos.customer;
  if (!c || typeof c !== "object" || Array.isArray(c)) throw new Error("Datos del cliente inválidos.");
  const obligatorios = ["fullName", "documentNumber", "phone", "department", "city", "address", "neighborhood"];
  for (const campo of obligatorios) {
    if (!texto(c[campo])) throw new Error("Falta información obligatoria: " + campo);
  }
  const limites = {
    fullName: 100, documentNumber: 30, phone: 20, department: 80, city: 80,
    address: 180, neighborhood: 100, unit: 120, instructions: 300, email: 254
  };
  for (const [campo, maximo] of Object.entries(limites)) {
    if (c[campo] != null && typeof c[campo] !== "string") throw new Error("Tipo de dato inválido: " + campo);
    if (texto(c[campo]).length > maximo || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(texto(c[campo]))) {
      throw new Error("Campo inválido: " + campo);
    }
  }
  const nombre = texto(c.fullName);
  if (nombre.length < 5 || !/^[\p{L}\p{M}' .-]+$/u.test(nombre) || nombre.split(/\s+/).length < 2) {
    throw new Error("Nombre y apellido inválidos.");
  }
  if (texto(c.documentNumber).length < 4 || !/^[\p{L}\p{N}]+(?:[ .-]?[\p{L}\p{N}]+)*$/u.test(texto(c.documentNumber))) {
    throw new Error("Documento inválido.");
  }
  const celular = normalizarCelular(c.phone);
  if (!/^3\d{9}$/.test(celular)) throw new Error("El celular debe tener 10 dígitos y comenzar por 3.");
  if (!DEPARTAMENTOS.includes(texto(c.department))) throw new Error("Departamento inválido.");
  if (texto(c.city).length < 2 || !/^[\p{L}\p{M} .'-]+$/u.test(texto(c.city))) throw new Error("Ciudad inválida.");
  if (texto(c.address).length < 8) throw new Error("Dirección inválida.");
  if (texto(c.neighborhood).length < 2) throw new Error("Barrio inválido.");
  if (texto(c.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto(c.email))) throw new Error("Correo electrónico inválido.");
  if (!Array.isArray(datos.items) || datos.items.length !== 1) throw new Error("Presentación inválida.");
  const item = datos.items[0];
  if (!item || typeof item !== "object" || Array.isArray(item) ||
      !Object.hasOwn(CATALOGO, item.packageId) || !Number.isInteger(item.quantity) ||
      item.quantity < 1 || item.quantity > 20) throw new Error("Producto o cantidad inválidos.");
  if (datos.paymentMethod !== "cash_on_delivery") throw new Error("Método de pago inválido.");
  if (!datos.consent || typeof datos.consent !== "object" || Array.isArray(datos.consent) ||
      datos.consent.accepted !== true) throw new Error("Debes aceptar la política de privacidad.");
  if (!versionPolitica || datos.consent.policyVersion !== versionPolitica) throw new Error("Versión de privacidad inválida.");

  return {
    accion: "registrarPedido",
    pedido: {
      solicitudId, nombre, documento: texto(c.documentNumber), celular,
      departamento: texto(c.department), ciudad: texto(c.city),
      direccion: texto(c.address), barrio: texto(c.neighborhood),
      interior: texto(c.unit), referencia: texto(c.instructions),
      correo: texto(c.email), presentacion: item.packageId,
      cantidad: item.quantity, aceptaPrivacidad: true,
      // Optional order-origin label only; never an advertising identifier or personal URL.
      origen: typeof datos.origin === 'string' && [
        'Instagram', 'Facebook', 'WhatsApp', 'TikTok', 'Google',
        'Otro sitio web', 'Otro enlace identificado', 'Directo / desconocido'
      ].includes(datos.origin) ? datos.origin : 'Directo / desconocido'
    },
    totalCalculado: CATALOGO[item.packageId].precio * item.quantity
  };
}

async function verificarTurnstile(token, ip, env) {
  if (!env.TURNSTILE_SECRET_KEY || typeof token !== "string" || !token || token.length > 2048) return false;
  try {
    const respuesta = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(10000)
    });
    if (!respuesta.ok) return false;
    const resultado = await respuesta.json();
    return resultado.success === true &&
      resultado.hostname === HOST &&
      resultado.action === "multydrink_order";
  } catch {
    return false;
  }
}

async function registrarEnAppsScript(datos, env) {
  const respuesta = await fetch(env.APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      accion: datos.accion,
      claveServidor: env.APPS_SCRIPT_SHARED_SECRET,
      pedido: datos.pedido
    }),
    redirect: "follow"
  });
  if (!respuesta.ok) throw new Error("Error de comunicación con Apps Script");
  const resultado = await respuesta.json();
  if (resultado.ok !== true || typeof resultado.numero !== "string" ||
      !/^MD-[A-Za-z0-9-]+$/.test(resultado.numero)) {
    throw new Error("Registro no confirmado por Apps Script");
  }
  return {
    status: "received",
    orderId: resultado.numero,
    total: datos.totalCalculado,
    currency: "COP"
  };
}

async function procesarPedido(request, env) {
  const pathname = new URL(request.url).pathname;
  if (pathname !== "/orders") return error(404, "Ruta no encontrada.");
  if (request.method !== "POST") return error(405, "Método no permitido.");

  const origin = request.headers.get("Origin");
  const devHeader = request.headers.get("X-Dev-Test-Token");
  const esPrueba = devHeader !== null;

  if (esPrueba) {
    if (env.DEV_TEST_MODE !== "true" ||
        !await claveCorrecta(devHeader, env.DEV_TEST_TOKEN)) {
      return error(403, "Acceso de pruebas no autorizado.");
    }
  } else {
    if (env.ORDERS_ENABLED !== "true") return error(503, "Los pedidos no están habilitados.");
    if (origin !== ORIGIN) return error(403, "Origen no autorizado.");
  }

  const ip = request.headers.get("CF-Connecting-IP");
  if (!ip) return error(503, "Origen no disponible.");

  try {
    const limite = await env.ORDERS_RATE_LIMITER.limit({ key: "orders:" + ip });
    if (!limite.success) return error(429, "Demasiados intentos.");
  } catch {
    return error(503, "Control de solicitudes no disponible.");
  }

  const longitud = Number(request.headers.get("Content-Length") || 0);
  if (longitud > MAX_BODY_BYTES) return error(413, "Solicitud demasiado grande.");
  let datos;
  try {
    const cuerpo = await request.text();
    if (new TextEncoder().encode(cuerpo).length > MAX_BODY_BYTES) {
      return error(413, "Solicitud demasiado grande.");
    }
    datos = JSON.parse(cuerpo);
  } catch {
    return error(400, "JSON inválido.");
  }

  let preparado;
  try {
    preparado = validarPedido(datos, request.headers.get("Idempotency-Key") || "",
      esPrueba ? env.DEV_POLICY_VERSION : env.POLICY_VERSION);
  } catch (e) {
    return error(400, e.message);
  }

  if (!esPrueba) {
    if (!env.POLICY_VERSION || !env.TURNSTILE_SECRET_KEY) {
      return error(503, "Servicio público no configurado.");
    }
    if (!await verificarTurnstile(datos.turnstileToken, ip, env)) {
      return error(403, "No se pudo completar la verificación de seguridad.");
    }
  }
  if (!env.APPS_SCRIPT_URL || !env.APPS_SCRIPT_SHARED_SECRET) {
    return error(503, "Servicio no configurado.");
  }
  try {
    return json(200, await registrarEnAppsScript(preparado, env));
  } catch {
    return error(503, "No se pudo confirmar el registro. Reintenta con el mismo identificador.");
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const pathname = new URL(request.url).pathname;
    if (request.method === "OPTIONS" && pathname === "/orders") {
      if (origin !== ORIGIN) return error(403, "Origen no autorizado.");
      return conCors(new Response(null, { status: 204 }), origin);
    }
    return conCors(await procesarPedido(request, env), origin);
  }
};
