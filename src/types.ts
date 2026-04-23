export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export interface BackendProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  active: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export type PaymentMethod = "mercadopago" | "transfer" | "cash";
