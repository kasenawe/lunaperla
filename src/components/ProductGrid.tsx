import { useState } from "react";
import { motion } from "motion/react";
import { CatalogProduct, ProductVariant } from "../types";

interface ProductGridProps {
  title: string;
  subtitle?: string;
  sectionId?: string;
  products: CatalogProduct[];
  onBuy: (product: CatalogProduct) => void;
  onAddToCart?: (
    product: CatalogProduct,
    variant: ProductVariant | null,
  ) => Promise<void>;
}

export default function ProductGrid({
  title,
  subtitle,
  sectionId,
  products,
  onBuy,
  onAddToCart,
}: ProductGridProps) {
  const [selectedVariantIds, setSelectedVariantIds] = useState<
    Record<string, string>
  >({});
  const [addingProductKey, setAddingProductKey] = useState<string | null>(null);

  if (products.length === 0) {
    return null;
  }

  return (
    <section id={sectionId} className="py-16 px-4 bg-zinc-50 scroll-mt-28">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4 font-serif text-black">{title}</h2>
          {subtitle ? (
            <p className="text-zinc-500 uppercase tracking-widest text-xs max-w-2xl mx-auto">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          {products.map((product, index) => {
            const activeVariants = (product.variants || []).filter(
              (variant) => variant.active,
            );
            const selectedVariantId =
              selectedVariantIds[product.id] || activeVariants[0]?.id || "";
            const selectedVariant =
              activeVariants.find(
                (variant) => variant.id === selectedVariantId,
              ) || null;
            const displayPrice = selectedVariant?.price ?? product.price;
            const addKey = `${product.id}:${selectedVariant?.id || "base"}`;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="group"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-white mb-8 border border-zinc-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-105"
                    loading="eager"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                </div>

                <div className="text-center">
                  {product.collection ? (
                    <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-3">
                      {product.collection}
                    </p>
                  ) : null}
                  <h3 className="text-2xl mb-2">{product.name}</h3>
                  <p className="text-zinc-500 font-light mb-4">
                    {product.description}
                  </p>

                  {activeVariants.length > 0 && onAddToCart ? (
                    <label className="mx-auto mb-4 block max-w-xs text-left">
                      <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                        Variante
                      </span>
                      <select
                        value={selectedVariantId}
                        onChange={(event) =>
                          setSelectedVariantIds((current) => ({
                            ...current,
                            [product.id]: event.target.value,
                          }))
                        }
                        className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm"
                      >
                        {activeVariants.map((variant) => (
                          <option key={variant.id} value={variant.id}>
                            {variant.label} — USD {variant.price}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}

                  <p className="text-xl mb-6 font-medium">
                    USD {displayPrice}
                  </p>

                  <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    {onAddToCart ? (
                      <button
                        type="button"
                        disabled={addingProductKey === addKey}
                        onClick={() => {
                          setAddingProductKey(addKey);
                          void onAddToCart(product, selectedVariant).finally(
                            () => setAddingProductKey(null),
                          );
                        }}
                        className="border border-black bg-black px-8 py-3 text-sm uppercase tracking-widest text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                      >
                        {addingProductKey === addKey
                          ? "Agregando..."
                          : "Agregar al carrito"}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onBuy(product)}
                      className="border border-black px-8 py-3 text-sm uppercase tracking-widest transition-all duration-300 hover:bg-black hover:text-white"
                    >
                      Comprar ahora
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
