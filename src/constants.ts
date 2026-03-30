import { Product, FAQItem } from './types';

// Logo completo (con texto) para el hero
export const LOGO_URL = new URL('./assets/images/luna-gold-logo-trim.png', import.meta.url).href;
// Logo simple (sin texto inferior) para navbar y footer
export const LOGO_SIMPLE_URL = new URL('./assets/images/luna-gold-logo-simple.png', import.meta.url).href;

const canastaImage = new URL('./assets/images/canasta.PNG', import.meta.url).href;
const bolitaImage = new URL('./assets/images/bolita.PNG', import.meta.url).href;
const simpleImage = new URL('./assets/images/simple.PNG', import.meta.url).href;
const coronitaImage = new URL('./assets/images/coronita.PNG', import.meta.url).href;

export const PRODUCTS: Product[] = [
  {
    id: 'canasta-trenzada',
    name: 'Canasta trenzada',
    price: 250,
    image: canastaImage,
    description: 'Caravanas tix bebe abridores en oro amarillo 18 k y perla de cultivo 4 mm.'
  },
  {
    id: 'bolita-mediana',
    name: 'Bolita mediana',
    price: 250,
    image: bolitaImage,
    description: 'Caravanas tix bebe abridores en oro amarillo 18 k y bolitas 3 1/2 mm'
  },
  {
    id: 'modelo-simple',
    name: 'Modelo simple',
    price: 250,
    image: simpleImage,
    description: 'Caravanas tix bebe abridores en oro amarillo 18 k y perla de cultivo 4 mm.'
  },
  {
    id: 'modelo-coronita',
    name: 'Modelo coronita',
    price: 250,
    image: coronitaImage,
    description: 'Caravanas tix bebe abridores en oro amarillo 18 k y perla de cultivo 4 mm.'
  }
];

export const FAQS: FAQItem[] = [
  {
    question: '¿Cuánto demora el envío?',
    answer: 'Los envíos en Montevideo demoran entre 24 y 48 horas hábiles. Para el interior del país, el plazo es de 48 a 72 horas.'
  },
  {
    question: '¿Hacen envíos a todo Uruguay?',
    answer: 'Sí, realizamos envíos a todos los departamentos de Uruguay a través de agencias de confianza.'
  },
  {
    question: '¿Se puede cambiar el producto?',
    answer: 'Sí, aceptamos cambios dentro de los 15 días posteriores a la compra, siempre que la joya se encuentre en su estado original y con su empaque.'
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos tarjetas de crédito y débito a través de Mercado Pago, transferencia bancaria y efectivo contra entrega.'
  }
];

export const WHATSAPP_NUMBER = '59899000000'; // Número de ejemplo para Uruguay
