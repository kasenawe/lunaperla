export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export type PaymentMethod = 'mercadopago' | 'transfer' | 'cash';
