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

// Publish only approved, sourced testimonials; no placeholder reviews are rendered.
export const testimonials = [];

export const moments = [
  { id: 'enfoque', tab: 'Enfoque', icon: 'focus', title: 'Dale un momento a lo importante.', text: 'Trabajo, estudio, proyectos. Haz de preparar tu bebida una pausa consciente antes de volver a la tarea que te importa.', points: ['Una presentación práctica para tu escritorio.', 'Un sobre en 250 mL de agua.', 'Cinco grupos de ingredientes de origen botánico.', 'Acompaña tus pausas; no sustituye el descanso.'] },
  { id: 'energia', tab: 'Energía', icon: 'sun', title: 'Para los días que más te exigen.', text: 'Lleva MultyDrink contigo y prepara tu bebida cuando encuentres tu momento. Cada sobre aporta la energía declarada en su etiqueta.', points: ['21 kcal por porción de 10 g.', '5,3 g de carbohidratos por porción.', '0,2 g de azúcares añadidos por porción.', 'Un formato individual para tu rutina.'] },
  { id: 'memoria', tab: 'Memoria', icon: 'focus', title: 'Conocer también es parte del bienestar.', text: 'La memoria forma parte de las conversaciones sobre bienestar cognitivo. La investigación de un ingrediente no demuestra que esta bebida mejore la memoria.', points: ['Distingue el ingrediente de la fórmula completa.', 'Consulta las publicaciones y sus métodos.', 'No extrapoles dosis de estudios a tu sobre.', 'No se promete una mejora de memoria con MultyDrink.'] },
  { id: 'bienestar', tab: 'Bienestar', icon: 'leaf', title: 'Un pequeño ritual, a tu ritmo.', text: 'Conoce lo que tomas y elige una rutina que también incluya alimentación equilibrada, descanso y actividad cotidiana.', points: ['Mucílago de café, uva, agave, ganoderma y té.', '30 mg de vitamina C por porción.', '188 mg de potasio por porción.', 'Consulta siempre las advertencias del empaque.'] },
];

export const gallery = [
  ...(productMedia.individual ? [{ ...productMedia.individual, caption: 'Caja individual · 21 sobres', label: 'Caja', presentation: 'caja' }] : []),
  { src: 'assets/family.webp', alt: 'Fotografía oficial de seis cajas MultyDrink de 21 sobres cada una', caption: 'Pack familiar · 6 cajas · 126 sobres', label: 'Pack familiar', width: 567, height: 594 },
  { src: 'assets/product.webp', alt: 'Imagen de marca MultyDrink con café, uvas, agave, ganoderma y té', caption: 'Universo botánico · imagen de marca, presentación de 126 porciones', label: 'Ingredientes', width: 873, height: 418 },
  ...(productMedia.alternateBox ? [{ ...productMedia.alternateBox, caption: 'MultyDrink · vista del empaque', label: 'Otra vista', presentation: 'caja' }] : []),
  ...(productMedia.sachet ? [{ ...productMedia.sachet, caption: 'Sobre individual · 10 g', label: 'Sobre', presentation: 'sobres' }] : []),
  ...(productMedia.preparedDrink ? [{ ...productMedia.preparedDrink, caption: 'MultyDrink preparado', label: 'Preparación' }] : []),
  ...(productMedia.composition ? [{ ...productMedia.composition, caption: 'Composición de ingredientes suministrada · imagen de marca', label: 'Composición', presentation: 'caja' }] : []),
];

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
export const productFaqs = ['includes', 'preparation', 'caffeine', 'precautions', 'payment'].map(id => faqs.find(item => item.id === id));

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
  { year: '2000', label: 'Composición del mucílago', source: 'Journal of Food Science', url: 'https://ift.onlinelibrary.wiley.com/doi/abs/10.1111/j.1365-2621.2000.tb10602.x', description: 'Caracterización de polisacáridos del mucílago de café. Investigación sobre materia prima, no sobre MultyDrink.' },
  { year: '2001', label: 'Compuestos del té negro', source: 'The Journal of Nutrition', url: 'https://pubmed.ncbi.nlm.nih.gov/11533262/', description: 'Evaluación de teaflavinas en un modelo de oxidación de laboratorio. No es un ensayo de consumo de MultyDrink.' },
  { year: '2023', label: 'Procesamiento del mucílago', source: 'Food and Humanity', url: 'https://www.sciencedirect.com/science/article/pii/S2949824423000848', description: 'Estudio de clarificación y composición del mucílago como materia prima. No mide energía ni concentración en personas.' },
];
