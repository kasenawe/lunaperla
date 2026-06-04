import { CatalogProduct, ProductVariant } from "../types";
import { PRODUCTS } from "../constants";
import { getApiBaseUrl } from "../config/api";
import { normalizeImageUrl } from "../utils/imageUrl";

const API_BASE_URL = getApiBaseUrl();

type ProductApiItem = {
  id?: string;
  name?: string;
  price?: number | string;
  description?: string;
  product_code?: string | null;
  image?: string;
  image_url?: string;
  category?: string;
  category_slug?: string;
  collection?: string | null;
  collection_slug?: string | null;
  variants?: ProductVariantApiItem[];
};

type ProductVariantApiItem = {
  id?: string;
  product_id?: string;
  sku?: string;
  label?: string;
  karat?: string | null;
  width_mm?: number | string | null;
  profile?: string | null;
  closure_type?: string | null;
  price?: number | string;
  active?: boolean;
  sort_order?: number;
  metadata?: Record<string, unknown>;
};

function normalizeCategoryName(name?: string, slug?: string) {
  if (name?.trim()) {
    return name.trim();
  }

  if (slug?.trim()) {
    return slug
      .split("-")
      .filter(Boolean)
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join(" ");
  }

  return "Coleccion Bebe";
}

function normalizeVariant(item: ProductVariantApiItem): ProductVariant | null {
  const normalizedPrice = Number(item.price);
  if (
    !item.id ||
    !item.product_id ||
    !item.sku ||
    Number.isNaN(normalizedPrice)
  ) {
    return null;
  }

  return {
    id: item.id,
    productId: item.product_id,
    sku: item.sku,
    label: item.label || item.sku,
    karat: item.karat ?? null,
    widthMm:
      item.width_mm === null || item.width_mm === undefined
        ? null
        : Number(item.width_mm),
    profile: item.profile ?? null,
    closureType: item.closure_type ?? null,
    price: normalizedPrice,
    active: item.active ?? true,
    sortOrder: item.sort_order ?? 0,
    metadata: item.metadata ?? {},
  };
}

export async function getProducts(): Promise<CatalogProduct[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = (await response.json()) as ProductApiItem[];

    const mappedProducts: CatalogProduct[] = [];

    for (const item of data) {
      const normalizedPrice = Number(item.price);
      if (!item.id || !item.name || Number.isNaN(normalizedPrice)) {
        continue;
      }

      const normalizedVariants: ProductVariant[] = [];
      for (const variantItem of item.variants || []) {
        const normalizedVariant = normalizeVariant(variantItem);
        if (normalizedVariant) {
          normalizedVariants.push(normalizedVariant);
        }
      }

      const mappedProduct = {
        id: item.id,
        name: item.name,
        price: normalizedPrice,
        image: normalizeImageUrl(item.image ?? item.image_url),
        description: item.description ?? "",
        productCode: item.product_code ?? null,
        category: normalizeCategoryName(item.category, item.category_slug),
        categorySlug: item.category_slug ?? "bebe",
        collection: item.collection?.trim() || null,
        collectionSlug: item.collection_slug ?? null,
        variants: normalizedVariants,
      };

      mappedProducts.push(mappedProduct);
    }

    return (
      mappedProducts.length > 0 ? mappedProducts : PRODUCTS
    ) as CatalogProduct[];
  } catch {
    return PRODUCTS;
  }
}
