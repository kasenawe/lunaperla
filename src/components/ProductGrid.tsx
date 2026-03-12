import { motion } from 'motion/react';
import { PRODUCTS } from '../constants';
import { Product } from '../types';

interface ProductGridProps {
  onBuy: (product: Product) => void;
}

export default function ProductGrid({ onBuy }: ProductGridProps) {
  return (
    <section id="productos" className="py-24 px-4 bg-zinc-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4">Colección Esencial</h2>
          <p className="text-zinc-500 uppercase tracking-widest text-xs">Uruguay Exclusive</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          {PRODUCTS.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-white mb-8">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl mb-2">{product.name}</h3>
                <p className="text-zinc-500 font-light mb-4">{product.description}</p>
                <p className="text-xl mb-6 font-medium">USD {product.price}</p>
                
                <button
                  onClick={() => onBuy(product)}
                  className="inline-block border border-black px-12 py-3 text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300"
                >
                  Comprar
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
