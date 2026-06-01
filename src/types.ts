export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  productCode: string | null;
  category: string;
  categorySlug: string;
  collection: string | null;
  collectionSlug: string | null;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  label: string;
  karat: string | null;
  widthMm: number | null;
  profile: string | null;
  closureType: string | null;
  price: number;
  active: boolean;
  sortOrder: number;
  metadata: Record<string, unknown>;
}

export interface BackendProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  product_code?: string | null;
  active: boolean;
  category: string;
  category_slug: string;
  collection: string | null;
  collection_slug: string | null;
  variants?: BackendProductVariant[];
}

export interface BackendProductVariant {
  id: string;
  product_id: string;
  sku: string;
  label: string;
  karat: string | null;
  width_mm: number | string | null;
  profile: string | null;
  closure_type: string | null;
  price: number | string;
  active: boolean;
  sort_order: number;
  metadata: Record<string, unknown>;
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
