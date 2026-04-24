import { Product } from "../types";
import { BACKEND_URL, PRODUCTS } from "../constants";
import { normalizeImageUrl } from "../utils/imageUrl";

const API_BASE_URL = import.meta.env.DEV ? "" : BACKEND_URL;

type ProductApiItem = {
  id?: string;
  name?: string;
  price?: number | string;
  description?: string;
  image?: string;
  image_url?: string;
  category?: string;
  category_slug?: string;
  collection?: string | null;
  collection_slug?: string | null;
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

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = (await response.json()) as ProductApiItem[];

    const mappedProducts = data
      .map((item) => {
        const normalizedPrice = Number(item.price);
        if (!item.id || !item.name || Number.isNaN(normalizedPrice)) {
          return null;
        }

        return {
          id: item.id,
          name: item.name,
          price: normalizedPrice,
          image: normalizeImageUrl(item.image ?? item.image_url),
          description: item.description ?? "",
          category: normalizeCategoryName(item.category, item.category_slug),
          categorySlug: item.category_slug ?? "bebe",
          collection: item.collection?.trim() || null,
          collectionSlug: item.collection_slug ?? null,
        } satisfies Product;
      })
      .filter((item): item is Product => item !== null);

    return mappedProducts.length > 0 ? mappedProducts : PRODUCTS;
  } catch {
    return PRODUCTS;
  }
}
