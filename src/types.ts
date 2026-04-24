export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  categorySlug: string;
  collection: string | null;
  collectionSlug: string | null;
}

export interface BackendProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  active: boolean;
  category: string;
  category_slug: string;
  collection: string | null;
  collection_slug: string | null;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  active: boolean;
  sortOrder: number;
}

export interface Collection {
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  active: boolean;
  sortOrder: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export type PaymentMethod = "mercadopago" | "transfer" | "cash";
