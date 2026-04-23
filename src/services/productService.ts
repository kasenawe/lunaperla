import { Product } from "../types";
import { BACKEND_URL_LOCAL, PRODUCTS } from "../constants";
import { normalizeImageUrl } from "../utils/imageUrl";

type ProductApiItem = {
  id?: string;
  name?: string;
  price?: number | string;
  description?: string;
  image?: string;
  image_url?: string;
};

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${BACKEND_URL_LOCAL}/api/products`);
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
        } satisfies Product;
      })
      .filter((item): item is Product => item !== null);

    return mappedProducts.length > 0 ? mappedProducts : PRODUCTS;
  } catch {
    // Fallback to static products
    //return PRODUCTS;
  }
}
