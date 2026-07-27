import {
  BackendProduct,
  BackendProductVariant,
  Cart,
  CartItem,
  CatalogProduct,
  ProductVariant,
} from "../types";
import { getApiBaseUrl } from "../config/api";
import { normalizeImageUrl } from "../utils/imageUrl";
import {
  buildCustomerAuthHeaders,
  clearCustomerToken,
} from "./customerAuthService";

const API_BASE_URL = getApiBaseUrl();

type ApiCartItem = {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  product: BackendProduct | null;
  variant: BackendProductVariant | null;
  unit_price: number | string;
  line_total: number | string;
  available: boolean;
};

type ApiCart = {
  id: string;
  items: ApiCartItem[];
  total_quantity: number;
  subtotal: number | string;
};

function mapVariant(variant: BackendProductVariant | null): ProductVariant | null {
  if (!variant) return null;

  return {
    id: variant.id,
    productId: variant.product_id,
    sku: variant.sku,
    label: variant.label,
    karat: variant.karat ?? null,
    widthMm:
      variant.width_mm === null || variant.width_mm === undefined
        ? null
        : Number(variant.width_mm),
    profile: variant.profile ?? null,
    closureType: variant.closure_type ?? null,
    price: Number(variant.price),
    active: variant.active,
    sortOrder: variant.sort_order,
    metadata: variant.metadata || {},
  };
}

function mapProduct(product: BackendProduct): CatalogProduct {
  return {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    image: normalizeImageUrl(product.image_url),
    description: product.description || "",
    productCode: product.product_code ?? null,
    category: product.category,
    categorySlug: product.category_slug,
    collection: product.collection ?? null,
    collectionSlug: product.collection_slug ?? null,
    variants: [],
  };
}

function mapCart(data: ApiCart): Cart {
  const items: CartItem[] = [];

  for (const item of data.items || []) {
    if (!item.product) {
      continue;
    }

    const variant = mapVariant(item.variant);
    items.push({
      id: item.id,
      productId: item.product_id,
      variantId: item.variant_id ?? null,
      quantity: item.quantity,
      product: mapProduct(item.product),
      variant,
      unitPrice: Number(item.unit_price),
      lineTotal: Number(item.line_total),
      available: item.available,
    });
  }

  return {
    id: data.id,
    items,
    totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: Number(data.subtotal),
  };
}

async function parseError(response: Response) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || `HTTP error: ${response.status}`;
  } catch {
    return `HTTP error: ${response.status}`;
  }
}

async function requestCart(path: string, init?: RequestInit): Promise<Cart> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: buildCustomerAuthHeaders(init?.headers),
  });

  if (response.status === 401) {
    clearCustomerToken();
  }

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return mapCart((await response.json()) as ApiCart);
}

export function getUserCart() {
  return requestCart("/api/cart");
}

export function addUserCartItem(
  productId: string,
  variantId: string | null,
  quantity = 1,
) {
  return requestCart("/api/cart/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: productId,
      variant_id: variantId,
      quantity,
    }),
  });
}

export function updateUserCartItem(itemId: string, quantity: number) {
  return requestCart(`/api/cart/items/${itemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
}

export function deleteUserCartItem(itemId: string) {
  return requestCart(`/api/cart/items/${itemId}`, {
    method: "DELETE",
  });
}
