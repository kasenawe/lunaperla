import {
  Cart,
  CartItem,
  CatalogProduct,
  ProductVariant,
} from "../types";

export const GUEST_CART_STORAGE_KEY = "lunaperla_guest_cart_v1";
export const MAX_CART_QUANTITY = 99;

export type CartStorage = Pick<Storage, "getItem" | "setItem">;

export function createEmptyCart(): Cart {
  return {
    id: null,
    items: [],
    totalQuantity: 0,
    subtotal: 0,
  };
}

function assertQuantity(quantity: number) {
  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_CART_QUANTITY
  ) {
    throw new Error(
      `La cantidad debe ser un entero entre 1 y ${MAX_CART_QUANTITY}`,
    );
  }
}

function buildGuestItemId(productId: string, variantId: string | null) {
  return `guest:${productId}:${variantId || "base"}`;
}

function recalculate(items: CartItem[]): Cart {
  const normalizedItems = items.map((item) => ({
    ...item,
    unitPrice: item.variant?.price ?? item.product.price,
    lineTotal: Number(
      ((item.variant?.price ?? item.product.price) * item.quantity).toFixed(2),
    ),
  }));

  return {
    id: null,
    items: normalizedItems,
    totalQuantity: normalizedItems.reduce(
      (total, item) => total + item.quantity,
      0,
    ),
    subtotal: Number(
      normalizedItems
        .reduce((total, item) => total + item.lineTotal, 0)
        .toFixed(2),
    ),
  };
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<CartItem>;
  const hasValidProduct =
    Boolean(item.product) &&
    typeof item.product?.id === "string" &&
    item.product.id === item.productId &&
    typeof item.product?.name === "string" &&
    Number.isFinite(item.product?.price);
  const hasValidVariant =
    item.variantId === null
      ? item.variant === null
      : Boolean(item.variant) &&
        item.variant?.id === item.variantId &&
        item.variant?.productId === item.productId &&
        Number.isFinite(item.variant?.price);

  return (
    typeof item.id === "string" &&
    typeof item.productId === "string" &&
    (item.variantId === null || typeof item.variantId === "string") &&
    Number.isInteger(item.quantity) &&
    Number(item.quantity) >= 1 &&
    Number(item.quantity) <= MAX_CART_QUANTITY &&
    hasValidProduct &&
    hasValidVariant
  );
}

export function readGuestCart(storage: CartStorage): Cart {
  try {
    const storedValue = storage.getItem(GUEST_CART_STORAGE_KEY);
    if (!storedValue) {
      return createEmptyCart();
    }

    const parsed = JSON.parse(storedValue) as { items?: unknown[] };
    const items = Array.isArray(parsed.items)
      ? parsed.items.filter(isCartItem)
      : [];

    return recalculate(items);
  } catch {
    return createEmptyCart();
  }
}

export function persistGuestCart(storage: CartStorage, cart: Cart) {
  storage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(recalculate(cart.items)));
}

export function addGuestCartItem(
  cart: Cart,
  product: CatalogProduct,
  variant: ProductVariant | null,
  quantity = 1,
): Cart {
  assertQuantity(quantity);

  if (variant && variant.productId !== product.id) {
    throw new Error("La variante no pertenece al producto seleccionado");
  }

  const variantId = variant?.id ?? null;
  const itemId = buildGuestItemId(product.id, variantId);
  const existingItem = cart.items.find((item) => item.id === itemId);

  if (existingItem) {
    const nextQuantity = existingItem.quantity + quantity;
    assertQuantity(nextQuantity);

    return recalculate(
      cart.items.map((item) =>
        item.id === itemId ? { ...item, quantity: nextQuantity } : item,
      ),
    );
  }

  const unitPrice = variant?.price ?? product.price;
  return recalculate([
    ...cart.items,
    {
      id: itemId,
      productId: product.id,
      variantId,
      quantity,
      product,
      variant,
      unitPrice,
      lineTotal: Number((unitPrice * quantity).toFixed(2)),
      available: true,
    },
  ]);
}

export function updateGuestCartItem(
  cart: Cart,
  itemId: string,
  quantity: number,
): Cart {
  assertQuantity(quantity);

  if (!cart.items.some((item) => item.id === itemId)) {
    throw new Error("Ítem de carrito no encontrado");
  }

  return recalculate(
    cart.items.map((item) =>
      item.id === itemId ? { ...item, quantity } : item,
    ),
  );
}

export function removeGuestCartItem(cart: Cart, itemId: string): Cart {
  return recalculate(cart.items.filter((item) => item.id !== itemId));
}
