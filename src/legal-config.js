// Public factual information only. Never store credentials or customer data here.
// null means unconfirmed. Completing these fields does NOT approve publication.
// Prices, packages, shipping fee and merchantName remain in config.js.
export const legalBusiness = Object.freeze({
  TAX_IDENTIFICATION: null,
  BUSINESS_DOMICILE: null,
  BUSINESS_ADDRESS: null,
  CUSTOMER_SUPPORT_EMAIL: null,
  CUSTOMER_SUPPORT_PHONE: null,
  CUSTOMER_SUPPORT_HOURS: null,
  PRIVACY_CONTACT_EMAIL: null,
  PRIVACY_RESPONSIBLE_AREA: null,
  SHIPPING_COVERAGE: null,
  LOGISTICS_PROVIDER: null,
  DELIVERY_TIMEFRAMES: null,
  DELIVERY_INCIDENT_PROCESS: null,
  COD_PAYMENT_METHODS: null,
  RETURNS_CONTACT: null,
  RETURNS_ADDRESS: null,
  REFUND_METHODS: null,
  PROMOTION_VALIDITY: null,
  PROCESSORS_AND_LOCATIONS: null,
  DATA_RETENTION_CRITERIA: null,
  DATABASE_DURATION: null,
  POLICY_EFFECTIVE_DATE: null,
});

export const legalDraftVersion = 'borrador-2026-10-29';

// Plain text, never a speculative mailto:, telephone or external link.
export function legalFact(key, commerce, business = legalBusiness) {
  const value = key === 'LEGAL_BUSINESS_NAME' ? commerce.merchantName : business[key];
  return typeof value === 'string' && value.trim() ? value.trim() : `[${key}] (pendiente de confirmar)`;
}

// Client-approved public policy. Other legal documents remain drafts.
export const approvedPrivacyPolicy = Object.freeze({
  "version": "2026-11-03",
  "url": "#privacy-dialog",
  "title": "Política de Tratamiento de Datos Personales",
  "businessName": "MultyDrink Colombia",
  "updated": "3 de noviembre de 2026",
  "sections": [
    [
      "Responsable del tratamiento",
      "MultyDrink Colombia se compromete a proteger la información personal de sus clientes conforme a la Ley 1581 de 2012 y demás normas aplicables en Colombia.",
      {
        "type": "list",
        "items": [
          "Responsable: Dora Patricia Ortiz",
          "Nombre comercial: MultyDrink Colombia",
          "Dirección: Cra. 24B #33B-125, barrio Santa Mónica Popular, Cali, Valle del Cauca, Colombia",
          "Correo electrónico: dorapatriciaortiz4@gmail.com",
          "Teléfono y WhatsApp: +57 310 823 2738",
          "Sitio web: https://multydrincolombia.com"
        ]
      }
    ],
    [
      "Información que recopilamos",
      "Al realizar un pedido, solicitamos nombre completo, número de documento, teléfono y dirección de entrega, incluyendo ciudad, departamento y barrio.",
      "También podemos recopilar información sobre los productos solicitados y los datos adicionales que proporciones voluntariamente para facilitar la entrega."
    ],
    [
      "Uso de la información",
      "Utilizamos tus datos exclusivamente para:",
      {
        "type": "list",
        "items": [
          "Registrar y gestionar tus pedidos.",
          "Contactarte para informar novedades de tu compra.",
          "Coordinar el despacho y la entrega de los productos.",
          "Atender consultas, solicitudes y reclamaciones.",
          "Cumplir las obligaciones legales aplicables."
        ]
      },
      "No utilizamos tus datos para enviar publicidad sin tu autorización adicional."
    ],
    [
      "Protección de tus datos",
      "Tu información se almacena mediante herramientas digitales de acceso restringido y se utiliza únicamente para las finalidades indicadas.",
      "Podremos compartir los datos necesarios con los proveedores encargados de gestionar las entregas y prestar servicios relacionados con tu pedido.",
      "No vendemos ni comercializamos tus datos personales. Los conservamos durante el tiempo necesario para gestionar las compras y cumplir las obligaciones legales, y los eliminamos cuando corresponda."
    ],
    [
      "Cookies, medición publicitaria y seguridad",
      "Utilizamos Cloudflare Turnstile en el formulario de pedidos para proteger el servicio frente a envíos automatizados y actividades abusivas. Esta verificación puede implicar el tratamiento de información técnica del navegador y la conexión con fines de seguridad.",
      "Con tu autorización independiente, podemos activar el píxel de Meta (Facebook e Instagram) para medir visitas, consultas del producto, aperturas del formulario y pedidos registrados correctamente. Esta tecnología puede utilizar cookies e identificadores del navegador y transmitir información técnica y de interacción a Meta para la medición de campañas publicitarias.",
      "Las cookies de medición de Meta son opcionales. Puedes aceptarlas o rechazarlas desde el aviso del sitio y revisar o cambiar posteriormente tu decisión en «Preferencias de cookies», disponible en el pie de página. Rechazarlas no impide navegar, realizar pedidos ni utilizar las verificaciones de seguridad.",
      "No incluimos nombre, documento de identidad, teléfono, correo ni dirección del comprador en los eventos publicitarios que enviamos explícitamente desde el sitio. Para consultar el tratamiento realizado por Meta puedes revisar su política en https://www.facebook.com/privacy/policy/."
    ],
    [
      "Tus derechos",
      "Puedes conocer, actualizar, corregir y solicitar la eliminación de tus datos personales, así como revocar tu autorización cuando corresponda legalmente.",
      "Para ejercer estos derechos, puedes escribir a dorapatriciaortiz4@gmail.com o comunicarte al +57 310 823 2738.",
      "Las consultas se atenderán en un plazo máximo de 10 días hábiles y los reclamos en 15 días hábiles, con las prórrogas previstas por la ley.",
      "También puedes presentar una queja ante la Superintendencia de Industria y Comercio, una vez agotado el trámite correspondiente ante el responsable."
    ],
    [
      "Autorización",
      "Al aceptar la política de privacidad en el formulario de pedido, autorizas el tratamiento de tus datos personales para las finalidades descritas en este documento.",
      "Esta autorización no incluye el envío de publicidad."
    ],
    [
      "Vigencia y modificaciones",
      "Esta política entra en vigor a partir de su publicación en nuestra página web.",
      "Podrá actualizarse cuando sea necesario, y su versión vigente estará disponible para consulta en el sitio web."
    ]
  ]
});

// Approved shipping copy; independent of privacy consent and checkout settings.
export const approvedShippingPolicy = Object.freeze({
  "version": "shipping-2026-11-03",
  "title": "Política de Envíos y Entregas",
  "businessName": "MultyDrink Colombia",
  "sections": [
    [
      "Envíos y tiempos de entrega",
      {
        "type": "paragraph",
        "parts": [
          "Realizamos envíos a las principales ciudades de Colombia, con un tiempo estimado de entrega de ",
          {
            "strong": "3 a 5 días hábiles"
          },
          ", sujeto a disponibilidad y cobertura."
        ]
      },
      "Para otros destinos, la disponibilidad y los tiempos de entrega están sujetos a validación.",
      "Una vez realizado tu pedido, recibirás un número de confirmación. Si se presenta alguna novedad, nos comunicaremos contigo a través de los datos registrados.",
      {
        "type": "paragraph",
        "parts": [
          {
            "strong": "El envío está incluido y el pago se realiza en efectivo contra entrega."
          }
        ]
      }
    ],
    [
      "Cancelación de pedidos",
      "Si deseas cancelar tu pedido, comunícate con nuestro canal oficial de atención e indica tu número de pedido.",
      "Las cancelaciones podrán gestionarse antes del despacho. Si el pedido ya fue enviado, la solicitud estará sujeta al estado de la entrega y a los derechos del consumidor establecidos por la legislación colombiana."
    ],
    [
      "Productos dañados o en mal estado",
      "Si al momento de recibir tu pedido observas que el paquete está abierto, deteriorado o presenta señales de manipulación, te recomendamos no recibirlo y tomar fotografías como evidencia.",
      "Comunícate con nuestro canal de atención, indicando tu número de pedido y la novedad presentada, para gestionar la solución correspondiente.",
      "Si identificas un defecto de calidad después de recibir el producto, también podrás comunicarte para solicitar la atención de la garantía legal.",
      {
        "type": "paragraph",
        "parts": [
          {
            "strong": "Por seguridad, no consumas productos con sellos alterados o señales de deterioro."
          }
        ]
      }
    ],
    [
      "Atención al cliente",
      {
        "type": "contact",
        "phone": "+57 310 823 2738",
        "email": "dorapatriciaortiz4@gmail.com"
      }
    ]
  ]
});

// Approved purchase terms; no change to order activation or consent configuration.
export const approvedPurchaseTerms = Object.freeze({
  "version": "terms-2026-11-03",
  "title": "Términos y Condiciones de Compra",
  "businessName": "MultyDrink Colombia",
  "updated": "3 de noviembre de 2026",
  "sections": [
    [
      "Información general",
      "MultyDrink Colombia es una tienda virtual dedicada a la comercialización de MultyDrink, bajo la responsabilidad de Dora Patricia Ortiz.",
      "Los datos de contacto del vendedor están disponibles en la página web y en la Política de Tratamiento de Datos Personales."
    ],
    [
      "Productos y condiciones comerciales",
      "Las características, presentaciones, cantidades y precios de MultyDrink se encuentran publicados en nuestra página web.",
      "Los precios están expresados en pesos colombianos (COP). Las compras están sujetas a la disponibilidad de los productos y a las condiciones informadas al momento de realizar el pedido.",
      "El cliente podrá revisar la información y el valor total antes de confirmar su compra."
    ],
    [
      "Registro de pedidos",
      "Al completar correctamente el formulario de compra, el cliente recibirá un número de pedido como constancia de su registro.",
      "Es responsabilidad del comprador proporcionar información correcta para facilitar la gestión y entrega del producto.",
      "Cualquier novedad relacionada con el pedido será comunicada mediante los datos de contacto registrados."
    ],
    [
      "Condiciones de entrega y derechos del consumidor",
      "Las condiciones de envío, pago contra entrega, cancelaciones y atención de productos deteriorados se encuentran disponibles en nuestra Política de Envíos y Entregas.",
      "Las compras se rigen por la legislación colombiana, incluida la Ley 1480 de 2011 y sus modificaciones. Se respetarán los derechos de garantía, retracto y demás mecanismos de protección al consumidor cuando sean legalmente aplicables."
    ],
    [
      "Vigencia y aceptación",
      "Al confirmar su pedido, el comprador acepta las condiciones comerciales que le hayan sido informadas, sin perjuicio de sus derechos legales.",
      "Estos términos podrán actualizarse y su versión vigente permanecerá disponible en nuestra página web."
    ]
  ]
});

// Approved returns and customer-service documents; independent of order activation.
export const approvedReturnsPolicy = Object.freeze({
  "version": "returns-2026-11-03",
  "title": "Devoluciones, Retracto y Garantía",
  "businessName": "MultyDrink Colombia",
  "updated": "3 de noviembre de 2026",
  "sections": [
    [
      "Productos en mal estado",
      "Si al recibir tu pedido observas que el paquete está abierto, deteriorado o presenta señales de manipulación, te recomendamos no aceptarlo y comunicarte con nuestro canal de atención.",
      "Si después de recibirlo identificas defectos de calidad, sobres dañados o alteraciones del producto, podrás presentar una reclamación indicando tu número de pedido y adjuntando fotografías cuando sea posible.",
      "Revisaremos la situación y gestionaremos la solución que corresponda conforme a la garantía legal."
    ],
    [
      "Devoluciones y retracto",
      "Por tratarse de un producto alimenticio, las solicitudes de devolución y retracto se evaluarán según la naturaleza y el estado del producto, de acuerdo con las condiciones y excepciones establecidas en la legislación colombiana.",
      "Las solicitudes de retracto, cuando legalmente procedan, podrán presentarse dentro de los cinco (5) días hábiles siguientes a la entrega.",
      "La apertura del empaque no elimina los derechos de garantía por defectos de calidad."
    ],
    [
      "Atención de solicitudes",
      "Para reportar cualquier novedad, comunícate con nosotros indicando tu número de pedido y el motivo de tu solicitud.",
      {
        "type": "contact",
        "phone": "+57 310 823 2738",
        "email": "dorapatriciaortiz4@gmail.com"
      },
      "Cuando corresponda legalmente una reposición o devolución del dinero, se informará al cliente el procedimiento aplicable."
    ]
  ]
});

export const approvedContactPolicy = Object.freeze({
  "version": "contact-2026-11-03",
  "title": "Contacto y Atención al Cliente",
  "businessName": "MultyDrink Colombia",
  "sections": [
    [
      "Estamos para ayudarte",
      "Si tienes preguntas sobre nuestros productos, necesitas información de tu pedido o deseas reportar alguna novedad, puedes comunicarte directamente con nosotros."
    ],
    [
      "Canales de atención",
      {
        "type": "contact",
        "phone": "+57 310 823 2738",
        "email": "dorapatriciaortiz4@gmail.com",
        "phoneLabel": "WhatsApp y teléfono"
      },
      {
        "type": "paragraph",
        "parts": [
          {
            "strong": "Ubicación:"
          },
          " Cali, Valle del Cauca, Colombia."
        ]
      }
    ],
    [
      "Consultas y solicitudes",
      "A través de nuestros canales oficiales puedes solicitar información sobre productos, pedidos, entregas y reclamaciones.",
      "Para consultas relacionadas con una compra, te recomendamos tener disponible tu número de pedido, lo que facilitará la atención.",
      "Las solicitudes y reclamaciones se atenderán conforme a los plazos legales aplicables.",
      {
        "type": "paragraph",
        "parts": [
          {
            "strong": "Gracias por confiar en MultyDrink Colombia."
          }
        ]
      }
    ]
  ]
});
