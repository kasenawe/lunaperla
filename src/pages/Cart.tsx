import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
import { useCart } from "../cart/CartContext";
import { MAX_CART_QUANTITY } from "../cart/guestCart";

function formatUsd(value: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function CartPage() {
  const {
    enabled,
    cart,
    mode,
    loading,
    updatingItemId,
    error,
    updateQuantity,
    removeItem,
    clearError,
  } = useCart();

  return (
    <main className="min-h-screen bg-zinc-50">
      <Navbar />
      <section className="px-4 pb-20 pt-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-zinc-500">
                Carrito Luna Gold
              </p>
              <h1 className="text-4xl text-black md:text-5xl">Tu selección</h1>
              {enabled ? (
                <p className="mt-3 text-sm text-zinc-600">
                  {mode === "authenticated"
                    ? "Guardado en tu cuenta."
                    : "Guardado en este navegador."}
                </p>
              ) : null}
            </div>
            <Link
              to="/#productos"
              className="text-xs uppercase tracking-[0.2em] text-zinc-600 underline underline-offset-4"
            >
              Seguir viendo productos
            </Link>
          </div>

          {!enabled ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-amber-900">
              El carrito persistente todavía no está habilitado en este
              entorno. El flujo Comprar ahora continúa disponible.
            </div>
          ) : loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-zinc-500">
              Cargando tu carrito...
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
              <div className="space-y-4">
                {error ? (
                  <div
                    role="alert"
                    className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                  >
                    <span>{error}</span>
                    <button
                      type="button"
                      onClick={clearError}
                      className="font-semibold"
                    >
                      Cerrar
                    </button>
                  </div>
                ) : null}

                {cart.items.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
                    <ShoppingBag className="mx-auto mb-4 h-10 w-10 text-zinc-400" />
                    <h2 className="mb-2 text-2xl text-black">
                      Tu carrito está vacío
                    </h2>
                    <p className="mb-6 text-zinc-500">
                      Agrega una joya desde el catálogo para verla aquí.
                    </p>
                    <Link
                      to="/#productos"
                      className="inline-flex bg-black px-6 py-3 text-xs uppercase tracking-[0.2em] text-white"
                    >
                      Ir al catálogo
                    </Link>
                  </div>
                ) : null}

                {cart.items.map((item) => {
                  const itemBusy = updatingItemId === item.id;

                  return (
                    <article
                      key={item.id}
                      className="grid gap-5 rounded-2xl border border-zinc-200 bg-white p-5 sm:grid-cols-[130px_1fr]"
                    >
                      <div className="aspect-square overflow-hidden rounded-xl bg-zinc-50">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-contain p-3"
                        />
                      </div>

                      <div className="flex min-w-0 flex-col justify-between gap-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                              {item.product.category}
                            </p>
                            <h2 className="mt-1 text-2xl text-black">
                              {item.product.name}
                            </h2>
                            {item.variant ? (
                              <p className="mt-2 text-sm text-zinc-600">
                                {item.variant.label}
                                {item.variant.sku
                                  ? ` · ${item.variant.sku}`
                                  : ""}
                              </p>
                            ) : (
                              <p className="mt-2 text-sm text-zinc-500">
                                Sin variante
                              </p>
                            )}
                            {!item.available ? (
                              <p className="mt-2 text-sm font-medium text-red-600">
                                Producto o variante no disponible
                              </p>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            aria-label={`Eliminar ${item.product.name}`}
                            disabled={itemBusy}
                            onClick={() => void removeItem(item.id)}
                            className="rounded-full border border-zinc-200 p-2 text-zinc-500 transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                          <div className="inline-flex w-fit items-center rounded-full border border-zinc-300">
                            <button
                              type="button"
                              aria-label={`Disminuir cantidad de ${item.product.name}`}
                              disabled={itemBusy || item.quantity <= 1}
                              onClick={() =>
                                void updateQuantity(
                                  item.id,
                                  item.quantity - 1,
                                )
                              }
                              className="p-3 disabled:opacity-30"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span
                              aria-label={`Cantidad ${item.quantity}`}
                              className="min-w-10 text-center text-sm font-medium"
                            >
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label={`Aumentar cantidad de ${item.product.name}`}
                              disabled={
                                itemBusy ||
                                item.quantity >= MAX_CART_QUANTITY ||
                                !item.available
                              }
                              onClick={() =>
                                void updateQuantity(
                                  item.id,
                                  item.quantity + 1,
                                )
                              }
                              className="p-3 disabled:opacity-30"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-xs text-zinc-500">
                              {formatUsd(item.unitPrice)} c/u
                            </p>
                            <p className="text-xl font-medium text-black">
                              {formatUsd(item.lineTotal)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-6 lg:sticky lg:top-28">
                <h2 className="mb-6 text-2xl text-black">Resumen</h2>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between text-zinc-600">
                    <span>Productos</span>
                    <span>{cart.totalQuantity}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-200 pt-4 text-lg font-medium text-black">
                    <span>Subtotal</span>
                    <span>{formatUsd(cart.subtotal)}</span>
                  </div>
                </div>
                <p className="mt-6 text-xs leading-relaxed text-zinc-500">
                  El carrito conserva tu selección. Comprar ahora continúa
                  disponible desde cada producto mientras evoluciona el
                  checkout en fases posteriores.
                </p>
              </aside>
            </div>
          )}
        </div>
      </section>
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
