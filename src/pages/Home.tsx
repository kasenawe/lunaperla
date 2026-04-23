import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";
import TrustSection from "../components/TrustSection";
import PaymentMethods from "../components/PaymentMethods";
import FAQ from "../components/FAQ";
import WhatsAppButton from "../components/WhatsAppButton";
import PurchaseModal from "../components/PurchaseModal";
import { Product } from "../types";
import { LOGO_URL, LOGO_SIMPLE_URL } from "../constants";
import { getProducts } from "../services/productService";

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data);
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

  return (
    <main className="min-h-screen selection:bg-gold/30">
      <Navbar />
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
        <ProductGrid products={products} onBuy={handleBuy} />
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
