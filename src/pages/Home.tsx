import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";
import TrustSection from "../components/TrustSection";
import PaymentMethods from "../components/PaymentMethods";
import FAQ from "../components/FAQ";
import WhatsAppButton from "../components/WhatsAppButton";
import PurchaseModal from "../components/PurchaseModal";
import { Category, Product } from "../types";
import { LOGO_URL, LOGO_SIMPLE_URL } from "../constants";
import { getCategories } from "../services/catalogService";
import { getProducts } from "../services/productService";

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategorySlug, setActiveCategorySlug] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([productData, categoryData]) => {
        setProducts(productData);
        setCategories(categoryData);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const handleBuy = (product: Product) => {
    setSelectedProduct(product);
  };

  const categoriesWithProducts = categories.filter((category) =>
    products.some((product) => product.categorySlug === category.slug),
  );

  const visibleCategories =
    activeCategorySlug === "all"
      ? categoriesWithProducts
      : categoriesWithProducts.filter(
          (category) => category.slug === activeCategorySlug,
        );

  return (
    <main className="min-h-screen selection:bg-gold/30">
      <Navbar categories={categoriesWithProducts} />
      {/* Hero Section */}
      <Hero />

      {/* Products Section */}
      {loading ? (
        <section id="productos" className="py-24 px-4 bg-zinc-50 text-center">
          <p className="text-zinc-500 uppercase tracking-widest text-xs">
            Cargando productos...
          </p>
        </section>
      ) : error ? (
        <section id="productos" className="py-24 px-4 bg-zinc-50 text-center">
          <p className="text-zinc-500 uppercase tracking-widest text-xs">
            No se pudieron cargar los productos
          </p>
        </section>
      ) : (
        <>
          <section
            id="productos"
            className="px-4 pt-24 pb-10 bg-zinc-50 scroll-mt-28"
          >
            <div className="max-w-6xl mx-auto text-center">
              <p className="text-zinc-500 uppercase tracking-[0.3em] text-xs mb-4">
                Nuestras colecciones
              </p>
              <h2 className="text-4xl md:text-5xl font-serif text-black mb-4">
                Joyas para cada momento
              </h2>
              <p className="text-zinc-600 max-w-2xl mx-auto mb-10">
                Descubre piezas para bebe, alianzas y mas colecciones
                seleccionadas con la calidad y delicadeza de Luna Gold.
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setActiveCategorySlug("all")}
                  className={`px-5 py-2 border text-xs uppercase tracking-[0.2em] transition-colors ${
                    activeCategorySlug === "all"
                      ? "border-black bg-black text-white"
                      : "border-zinc-300 text-zinc-700 hover:border-black"
                  }`}
                >
                  Todas
                </button>
                {categoriesWithProducts.map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => setActiveCategorySlug(category.slug)}
                    className={`px-5 py-2 border text-xs uppercase tracking-[0.2em] transition-colors ${
                      activeCategorySlug === category.slug
                        ? "border-black bg-black text-white"
                        : "border-zinc-300 text-zinc-700 hover:border-black"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {visibleCategories.map((category) => (
            <ProductGrid
              key={category.slug}
              sectionId={`categoria-${category.slug}`}
              title={category.name}
              subtitle={category.description}
              products={products.filter(
                (product) => product.categorySlug === category.slug,
              )}
              onBuy={handleBuy}
            />
          ))}
        </>
      )}

      {/* Trust & Quality Section */}
      <TrustSection />

      {/* Payment Methods */}
      <PaymentMethods />

      {/* FAQ Section */}
      <FAQ />

      {/* Footer */}
      <footer className="py-12 px-4 bg-white border-t border-zinc-100 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 flex justify-center">
            <img
              src={LOGO_SIMPLE_URL}
              alt="Luna Gold Creaciones"
              className="h-14 w-auto object-contain opacity-90"
            />
          </div>
          <p className="text-zinc-400 text-xs uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} Luna Gold Creaciones Uruguay. Todos los
            derechos reservados.
          </p>
        </div>
      </footer>

      {/* Floating Elements */}
      <WhatsAppButton />

      {/* Modals */}
      {selectedProduct && (
        <PurchaseModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </main>
  );
}
