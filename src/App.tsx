import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import TrustSection from './components/TrustSection';
import PaymentMethods from './components/PaymentMethods';
import FAQ from './components/FAQ';
import WhatsAppButton from './components/WhatsAppButton';
import PurchaseModal from './components/PurchaseModal';
import { Product } from './types';

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleBuy = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <main className="min-h-screen selection:bg-gold/30">
      <Navbar />
      {/* Hero Section */}
      <Hero />

      {/* Products Section */}
      <ProductGrid onBuy={handleBuy} />

      {/* Trust & Quality Section */}
      <TrustSection />

      {/* Payment Methods */}
      <PaymentMethods />

      {/* FAQ Section */}
      <FAQ />

      {/* Footer */}
      <footer className="py-12 px-4 bg-white border-t border-zinc-100 text-center">
        <div className="max-w-6xl mx-auto">
          <p className="text-2xl font-serif mb-4">Luna Perla</p>
          <p className="text-zinc-400 text-xs uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} Luna Perla Uruguay. Todos los derechos reservados.
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

