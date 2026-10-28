import { productMedia } from './media.js';
// All commercial data lives here. Never put credentials in this public file.
export const packages = Object.freeze([
  Object.freeze({ id: 'individual', name: 'Caja individual', boxes: 1, sachets: 21, price: 110000, referencePrice: 125000 }),
  Object.freeze({ id: 'familiar', name: 'Pack familiar', boxes: 6, sachets: 126, price: 425000, referencePrice: 660000 }),
]);

export const commerce = Object.freeze({
  defaultPackage: 'familiar',
  currency: 'COP',
  maxQuantity: 20,
  orderEndpoint: null,
  merchantName: null,
  privacyPolicyUrl: null,
  privacyPolicyVersion: null,
  // null = not confirmed; 0 means explicitly confirmed free delivery.
  shippingFee: 0,
  shippingDescription: 'Envío incluido en ambos paquetes. La cobertura y el plazo se confirman para tu dirección. Pago contra entrega.',
  // Confirmed by the user's Phase 1 brief and supplied label transcription.
  sanitaryRegistration: 'NSA-0019488-2025',
  sanitarySourceUrl: 'https://unasolavision.co/wp-content/uploads/2026/10/1759543524407-gen_pdf-multy-drink.pdf',
  contactUrl: 'https://multydrink.com/',
});

// User-supplied transcript excerpts, not purchase-verified reviews.
// Source videos and publication consent must be checked before public deployment.
// Quotes below are short verbatim fragments from the supplied transcripts.
export const testimonials = Object.freeze([
  Object.freeze({
    id: 'manuela',
    name: 'Manuela',
    location: 'Experiencia compartida',
    comment: 'Yo me sentí en esa reunión como tan chévere, como con energía, con aliento.',
    topic: 'Cansancio y ánimo',
    sourceNote: 'Fragmento de testimonio en video · 05:01–05:09',
    transcriptProvided: true,
    verifiedPurchase: false,
  }),
  Object.freeze({
    id: 'juan-alcantara',
    name: 'Juan Alcántara Medina',
    location: 'Santo Domingo, República Dominicana',
    comment: 'Me siento más vigoroso.',
    topic: 'Vitalidad',
    sourceNote: 'Fragmento de testimonio en video · 00:54',
    transcriptProvided: true,
    verifiedPurchase: false,
  }),
  Object.freeze({
    id: 'kim-cuervo',
    name: 'Kim Cuervo',
    location: 'Practicante de jiu-jitsu',
    comment: 'Estoy más activo.',
    topic: 'Energía',
    sourceNote: 'Fragmento de testimonio en video · 01:16–01:24',
    transcriptProvided: true,
    verifiedPurchase: false,
  }),
]);

export const moments = [
  { id: 'enfoque', tab: 'Enfoque', title: 'Dale un momento a lo importante.', text: 'MultyDrink le da a tu cuerpo los nutrientes que necesita para mantenerse en modo concentración — sin picos, sin caídas, sin tener que forzarlo.', points: ['Mente clara desde la mañana hasta el cierre del día', 'Sin la niebla mental de media tarde', 'Fluyes en lo que tienes que hacer — sin batalla interna', 'Presente de verdad en cada reunión y cada tarea'] },
  { id: 'energia', tab: 'Energía', title: 'Energía que acompaña tu ritmo.', text: 'MultyDrink combina ingredientes botánicos pensados para acompañar tus jornadas con una energía más estable y amable con tu rutina, sin depender de sensaciones artificiales.', points: ['Acompaña tus mañanas y tus jornadas exigentes', 'Una bebida práctica para integrar a tu rutina', 'Ideal para una pausa consciente en medio del día', 'Sin convertir tu bienestar en algo complicado'] },
  { id: 'memoria', tab: 'Memoria', title: 'Más claridad para retener y seguir.', text: 'MultyDrink acompaña tu rutina con ingredientes botánicos pensados para favorecer una experiencia de mayor claridad mental, ayudándote a sostener la atención y seguir el ritmo de tus actividades.', points: ['Mejor continuidad en tus tareas del día', 'Más facilidad para seguir ideas y pendientes', 'Un apoyo práctico para jornadas de estudio o trabajo', 'Pensado para acompañar hábitos de enfoque y organización'] },
  { id: 'bienestar', tab: 'Bienestar', title: 'Tu cerebro hoy y a largo plazo', text: 'Todos los nutrientes que tu cuerpo necesita para funcionar bien no solo hoy, sino de forma sostenida en el tiempo. Sin ingredientes raros, sin artificiales.', points: ['Sin ingredientes raros ni artificiales', 'Formulado para el largo plazo', 'Notificación sanitaria INVIMA NSA-0019488-2025'] },
];

// Ten supplied gallery images, in the approved numerical order.
export const gallery = productMedia.gallery;

export const departments = ['Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá, D. C.', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés, Providencia y Santa Catalina', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'];

export const ingredients = [
  { name: 'Mucílago de café', subtitle: 'El origen de la mezcla', image: 'coffee', text: 'La capa que rodea el grano de café forma parte de esta combinación de origen botánico.' },
  { name: 'Uva morada', subtitle: 'Piel y semilla', image: 'grape', text: 'La fórmula incorpora piel y semillas de uvas moradas, según la información de la marca.' },
  { name: 'Agave azul', subtitle: 'Un toque de dulzura', image: 'agave', text: 'El sirope de agave azul es uno de los cinco ingredientes destacados por MultyDrink.' },
  { name: 'Ganoderma lucidum', subtitle: 'También conocido como reishi', image: 'ganoderma', text: 'Un hongo que se integra a la mezcla junto con los demás ingredientes botánicos.' },
  { name: 'Té negro', subtitle: 'El complemento de la fórmula', image: 'tea', text: 'El té negro completa la combinación. Revisa la etiqueta para conocer su composición y advertencias.' },
];

export const faqs = [
  { id: 'includes', category: 'uso', question: '¿Qué incluye MultyDrink?', answer: 'La caja individual incluye 21 sobres de 10 g. El pack familiar reúne 6 cajas, para un total de 126 sobres. Son las dos opciones disponibles en esta página.' },
  { id: 'preparation', category: 'uso', question: '¿Cómo se prepara?', answer: 'Mezcla un sobre de 10 g en 250 mL de agua. Sigue las indicaciones y advertencias de tu empaque. La porción declarada no establece una frecuencia médica de consumo.' },
  { id: 'ingredients', category: 'ingredientes', question: '¿Cuáles son sus ingredientes?', answer: 'La marca destaca mucílago de café, piel y semillas de uva morada, sirope de agave azul, Ganoderma lucidum y té negro. Consulta la etiqueta para la lista completa y posibles alérgenos.' },
  { id: 'caffeine', category: 'seguridad', question: '¿Contiene cafeína?', answer: 'La fórmula incluye té negro. No contamos con una cantidad de cafeína verificada por sobre y no lo presentamos como un producto libre de cafeína. Si eres sensible, consulta la etiqueta y a un profesional de salud antes de consumirlo.' },
  { id: 'frequency', category: 'uso', question: '¿Cuándo puedo tomarlo?', answer: 'Puedes incorporarlo a tu rutina siguiendo el modo de uso del empaque. No se establece aquí un horario ni una dosis diaria recomendada.' },
  { id: 'payment', category: 'pedidos', question: '¿Cómo funciona el pago contra entrega?', answer: 'Pagas al recibir el producto. El envío está incluido en los precios publicados. La recepción de pedidos de esta página aún está deshabilitada; cuando se habilite, se confirmarán la disponibilidad y las condiciones de entrega para tu dirección.' },
  { id: 'delivery', category: 'pedidos', question: '¿Dónde realizan envíos y cuánto cuestan?', answer: 'El envío está incluido tanto en la caja individual como en el pack familiar. La cobertura y el plazo deben confirmarse para tu dirección en Colombia. Seleccionar un departamento no garantiza cobertura.' },
  { id: 'notification', category: 'seguridad', question: '¿Cuál es su notificación sanitaria?', answer: 'La notificación sanitaria colombiana indicada para MultyDrink es NSA-0019488-2025. Es información sanitaria del alimento; no constituye prueba de eficacia clínica.' },
  { id: 'precautions', category: 'seguridad', question: '¿Qué debo revisar antes de consumirlo?', answer: 'Revisa ingredientes, alérgenos y advertencias del empaque. Si estás en embarazo o lactancia, tomas medicamentos o tienes una condición de salud, consulta a un profesional antes de incorporarlo a tu alimentación. MultyDrink es un alimento, no un medicamento.' },
  { id: 'sugar', category: 'ingredientes', question: '¿Tiene azúcares añadidos?', answer: 'Sí. La etiqueta declara 0,4 g de azúcares totales y 0,2 g de azúcares añadidos por sobre de 10 g. No es un producto anunciado como cero azúcares añadidos.' },
  { id: 'evidence', category: 'ingredientes', question: '¿Los estudios de ingredientes prueban los efectos de MultyDrink?', answer: 'No. Un estudio sobre un ingrediente usa una preparación, dosis y método específicos. No equivale a un ensayo de la fórmula completa ni demuestra una mejora de memoria, concentración o rendimiento con MultyDrink.' },
];

export const faqCategories = [
  { id: 'uso', label: 'Uso y preparación' }, { id: 'ingredientes', label: 'Ingredientes y beneficios' },
  { id: 'seguridad', label: 'Seguridad y precauciones' }, { id: 'pedidos', label: 'Pedidos y entregas' },
];
// Product-detail copy is independent of the general FAQ section.
export const productFaqs = [
  { id: 'includes', icon: 'box', question: 'QUÉ INCLUYE', intro: 'Elige la presentación que mejor se adapte a ti.', stacked: true, items: [
    { label: 'Caja individual', text: '21 sobres de 10 g cada uno.' },
    { label: 'Pack familiar', text: '6 cajas con 21 sobres cada una, para un total de 126 sobres.' },
  ], footer: 'Una presentación práctica para llevar MultyDrink contigo.' },
  { id: 'preparation', icon: 'glass', question: 'CÓMO LO PREPARO', intro: 'Disfruta MultyDrink como más te guste. Su presentación en sobres te permite incorporarlo fácilmente a tu rutina.', items: [
    { icon: 'drop', label: 'Con agua:', text: 'mezcla un sobre de 10 g en 250 mL de agua fría o a temperatura ambiente.' },
    { icon: 'glass', label: 'Con tus jugos favoritos:', text: 'incorpóralo a tu bebida habitual.' },
    { icon: 'apple', label: 'Con frutas:', text: 'intégralo a tus preparaciones favoritas.' },
  ] },
  { id: 'caffeine', icon: 'leaf', question: '¿Contiene cafeína?', intro: 'MultyDrink contiene ingredientes derivados del café y extracto de té negro, fuentes naturales de cafeína. Su fórmula combina estos ingredientes con extracto de uva, Ganoderma lucidum y miel de agave azul.' },
  { id: 'precautions', icon: 'shield', question: '¿ES SEGURO?', items: [
    { text: `Notificación sanitaria INVIMA ${commerce.sanitaryRegistration}.` },
    { text: 'No consumir junto con warfarina.' },
    { text: 'No recomendado durante el embarazo o la lactancia.' },
    { text: 'Consultar con un profesional de salud en caso de enfermedades o consumo de medicamentos.' },
  ] },
  { id: 'payment', icon: 'truck', question: 'PAGO CONTRA ENTREGA', intro: 'Compra con tranquilidad y paga únicamente cuando recibas tu MultyDrink.', items: [
    { label: 'Pagas al recibir:', text: 'no necesitas realizar pagos anticipados.' },
    { label: 'Envío incluido:', text: 'el precio publicado ya contempla el envío.' },
    { label: 'Confirmación del pedido:', text: 'verificaremos los datos y las condiciones de entrega de tu dirección.' },
  ] },
];

// Label values confirmed explicitly in the Phase 1 brief; not an invented full label.
export const nutrition = {
  servings: 21, servingGrams: 10, waterMl: 250,
  rows: [['Energía', '21 kcal'], ['Carbohidratos totales', '5,3 g'], ['Azúcares totales', '0,4 g'], ['Azúcares añadidos', '0,2 g'], ['Vitamina C', '30 mg'], ['Potasio', '188 mg']],
};
export const ingredientGroups = [
  { title: 'El origen está en el café.', name: 'Mucílago de café', images: ['coffee'], text: 'La capa que rodea el grano de café es uno de los cinco ingredientes destacados en la mezcla. Su composición se estudia como materia prima alimentaria.' },
  { title: 'Un hongo con identidad propia.', name: 'Ganoderma lucidum', images: ['ganoderma'], text: 'También conocido como reishi. Forma parte de la composición de MultyDrink, sin que su presencia permita atribuir a la bebida resultados de estudios sobre extractos aislados.' },
  { title: 'Dos orígenes que se encuentran.', name: 'Uva morada + té negro', images: ['grape', 'tea'], text: 'Piel y semillas de uva morada y té negro forman dos de los grupos de ingredientes. La investigación de sus compuestos es distinta de estudiar la fórmula terminada.' },
  { title: 'El toque del agave azul.', name: 'Sirope de agave azul', images: ['agave'], text: 'Completa los cinco grupos de ingredientes. La etiqueta declara 0,2 g de azúcares añadidos por porción de 10 g.' },
];
export const research = [
  { year: '2013', label: 'Polifenoles de la uva', source: 'Ensayo clínico · Cardiovascular Drugs and Therapy', url: 'https://pubmed.ncbi.nlm.nih.gov/23224687/', description: 'En 75 personas con enfermedad coronaria, un extracto de uva enriquecido con resveratrol se estudió por sus efectos sobre biomarcadores inflamatorios.' },
  { year: '2014', label: 'Té negro', source: 'Metaanálisis · PLOS ONE', url: 'https://pubmed.ncbi.nlm.nih.gov/25079225/', description: 'Un análisis de 11 estudios controlados con 378 participantes observó pequeñas reducciones promedio de presión arterial al consumir té negro.' },
  { year: '2021', label: 'Pulpa de café', source: 'Estudio de laboratorio · Food Chemistry', url: 'https://pubmed.ncbi.nlm.nih.gov/33516995/', description: 'Durante una digestión simulada, un extracto de pulpa de café mostró disminución de algunos compuestos bioactivos y de su actividad antioxidante.' },
];
