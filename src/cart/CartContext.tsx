import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Cart, CatalogProduct, ProductVariant } from "../types";
import { features } from "../config/features";
import {
  CUSTOMER_AUTH_CHANGED_EVENT,
  isCustomerAuthenticated,
} from "../services/customerAuthService";
import {
  addUserCartItem,
  deleteUserCartItem,
  getUserCart,
  updateUserCartItem,
} from "../services/cartService";
import {
  addGuestCartItem,
  createEmptyCart,
  GUEST_CART_STORAGE_KEY,
  persistGuestCart,
  readGuestCart,
  removeGuestCartItem,
  updateGuestCartItem,
} from "./guestCart";

type CartMode = "guest" | "authenticated";

type CartContextValue = {
  enabled: boolean;
  cart: Cart;
  mode: CartMode;
  loading: boolean;
  updatingItemId: string | null;
  error: string | null;
  addItem: (
    product: CatalogProduct,
    variant?: ProductVariant | null,
    quantity?: number,
  ) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "No se pudo actualizar el carrito";
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(createEmptyCart);
  const [mode, setMode] = useState<CartMode>("guest");
  const [loading, setLoading] = useState(features.persistentCart);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!features.persistentCart) {
      setCart(createEmptyCart());
      setMode("guest");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isCustomerAuthenticated()) {
        setMode("authenticated");
        setCart(await getUserCart());
      } else {
        setMode("guest");
        setCart(readGuestCart(window.localStorage));
      }
    } catch (cause) {
      if (!isCustomerAuthenticated()) {
        setMode("guest");
        setCart(readGuestCart(window.localStorage));
      } else {
        setCart(createEmptyCart());
      }
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const handleAuthChange = () => {
      void refresh();
    };
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === GUEST_CART_STORAGE_KEY &&
        !isCustomerAuthenticated()
      ) {
        setCart(readGuestCart(window.localStorage));
      }
    };

    window.addEventListener(CUSTOMER_AUTH_CHANGED_EVENT, handleAuthChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        CUSTOMER_AUTH_CHANGED_EVENT,
        handleAuthChange,
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, [refresh]);

  const addItem = useCallback(
    async (
      product: CatalogProduct,
      variant: ProductVariant | null = null,
      quantity = 1,
    ) => {
      if (!features.persistentCart) {
        throw new Error("El carrito persistente está desactivado");
      }

      const operationId = `${product.id}:${variant?.id || "base"}`;

      try {
        setUpdatingItemId(operationId);
        setError(null);

        if (isCustomerAuthenticated()) {
          setMode("authenticated");
          setCart(
            await addUserCartItem(product.id, variant?.id ?? null, quantity),
          );
        } else {
          setMode("guest");
          const nextCart = addGuestCartItem(
            readGuestCart(window.localStorage),
            product,
            variant,
            quantity,
          );
          persistGuestCart(window.localStorage, nextCart);
          setCart(nextCart);
        }
      } catch (cause) {
        setError(errorMessage(cause));
        throw cause;
      } finally {
        setUpdatingItemId(null);
      }
    },
    [],
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        setUpdatingItemId(itemId);
        setError(null);

        if (isCustomerAuthenticated()) {
          setCart(await updateUserCartItem(itemId, quantity));
        } else {
          const nextCart = updateGuestCartItem(
            readGuestCart(window.localStorage),
            itemId,
            quantity,
          );
          persistGuestCart(window.localStorage, nextCart);
          setCart(nextCart);
        }
      } catch (cause) {
        setError(errorMessage(cause));
        throw cause;
      } finally {
        setUpdatingItemId(null);
      }
    },
    [],
  );

  const removeItem = useCallback(async (itemId: string) => {
    try {
      setUpdatingItemId(itemId);
      setError(null);

      if (isCustomerAuthenticated()) {
        setCart(await deleteUserCartItem(itemId));
      } else {
        const nextCart = removeGuestCartItem(
          readGuestCart(window.localStorage),
          itemId,
        );
        persistGuestCart(window.localStorage, nextCart);
        setCart(nextCart);
      }
    } catch (cause) {
      setError(errorMessage(cause));
      throw cause;
    } finally {
      setUpdatingItemId(null);
    }
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      enabled: features.persistentCart,
      cart,
      mode,
      loading,
      updatingItemId,
      error,
      addItem,
      updateQuantity,
      removeItem,
      refresh,
      clearError: () => setError(null),
    }),
    [
      addItem,
      cart,
      error,
      loading,
      mode,
      refresh,
      removeItem,
      updateQuantity,
      updatingItemId,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }

  return context;
}
