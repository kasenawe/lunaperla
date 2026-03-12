import { Product, FAQItem } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'luna-classic',
    name: 'Caravanas Luna Classic',
    price: 250,
    image: '/p1.png',
    description: 'Perlas naturales seleccionadas con montura en oro 18k.'
  },
  {
    id: 'perla-aura',
    name: 'Caravanas Perla Aura',
    price: 250,
    image: '/p2.png',
    description: 'Diseño minimalista que resalta la pureza de la perla y el brillo del oro.'
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
