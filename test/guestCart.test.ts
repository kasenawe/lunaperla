import assert from "node:assert/strict";
import test from "node:test";
import {
  addGuestCartItem,
  createEmptyCart,
  GUEST_CART_STORAGE_KEY,
  persistGuestCart,
  readGuestCart,
  removeGuestCartItem,
  updateGuestCartItem,
} from "../src/cart/guestCart";
import { CatalogProduct, ProductVariant } from "../src/types";

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const product: CatalogProduct = {
  id: "product-1",
  name: "Alianza",
  price: 200,
  image: "alianza.png",
  description: "Alianza clásica",
  productCode: "ALI-001",
  category: "Alianzas",
  categorySlug: "alianzas",
  collection: null,
  collectionSlug: null,
  variants: [],
};

const variant: ProductVariant = {
  id: "variant-18k",
  productId: product.id,
  sku: "ALI-18K",
  label: "18K",
  karat: "18K",
  widthMm: 3,
  profile: null,
  closureType: null,
  price: 260,
  active: true,
  sortOrder: 0,
  metadata: {},
};

test("carrito guest persiste después de recargar", () => {
  const storage = new MemoryStorage();
  const cart = addGuestCartItem(createEmptyCart(), product, null, 2);

  persistGuestCart(storage, cart);
  const reloadedCart = readGuestCart(storage);

  assert.equal(reloadedCart.items.length, 1);
  assert.equal(reloadedCart.items[0].quantity, 2);
  assert.equal(reloadedCart.totalQuantity, 2);
  assert.equal(reloadedCart.subtotal, 400);
  assert.ok(storage.getItem(GUEST_CART_STORAGE_KEY));
});

test("producto con y sin variante son ítems separados y el badge suma cantidades", () => {
  let cart = addGuestCartItem(createEmptyCart(), product, null, 1);
  cart = addGuestCartItem(cart, product, null, 2);
  cart = addGuestCartItem(cart, product, variant, 1);

  assert.equal(cart.items.length, 2);
  assert.equal(
    cart.items.find((item) => item.variantId === null)?.quantity,
    3,
  );
  assert.equal(
    cart.items.find((item) => item.variantId === variant.id)?.unitPrice,
    260,
  );
  assert.equal(cart.totalQuantity, 4);
  assert.equal(cart.subtotal, 860);
});

test("actualizar y eliminar recalcula cantidades y subtotal", () => {
  let cart = addGuestCartItem(createEmptyCart(), product, null, 1);
  const itemId = cart.items[0].id;

  cart = updateGuestCartItem(cart, itemId, 4);
  assert.equal(cart.totalQuantity, 4);
  assert.equal(cart.subtotal, 800);

  cart = removeGuestCartItem(cart, itemId);
  assert.deepEqual(cart, createEmptyCart());
});

test("rechaza cantidades inválidas y variantes de otro producto", () => {
  for (const quantity of [0, 1.5, 100]) {
    assert.throws(
      () => addGuestCartItem(createEmptyCart(), product, null, quantity),
      /cantidad/i,
    );
  }

  assert.throws(
    () =>
      addGuestCartItem(
        createEmptyCart(),
        product,
        { ...variant, productId: "product-2" },
        1,
      ),
    /no pertenece/i,
  );
});

test("descarta ítems manipulados o inconsistentes al restaurar localStorage", () => {
  const storage = new MemoryStorage();
  const validCart = addGuestCartItem(
    createEmptyCart(),
    product,
    variant,
    1,
  );
  const validItem = validCart.items[0];

  storage.setItem(
    GUEST_CART_STORAGE_KEY,
    JSON.stringify({
      items: [
        validItem,
        { ...validItem, id: "bad-quantity", quantity: 0 },
        {
          ...validItem,
          id: "bad-variant",
          variant: { ...variant, productId: "otro-producto" },
        },
      ],
    }),
  );

  const restored = readGuestCart(storage);
  assert.equal(restored.items.length, 1);
  assert.equal(restored.items[0].id, validItem.id);
});
