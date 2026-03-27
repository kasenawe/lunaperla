import { motion } from 'motion/react';

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center mix-blend-difference"
    >
      <div className="text-white">
        <a href="/" className="text-2xl font-serif tracking-tighter hover:opacity-70 transition-opacity">
          Luna Perla
        </a>
      </div>
      
      <div className="hidden md:flex gap-8 text-white text-xs uppercase tracking-widest">
        <a href="#productos" className="hover:opacity-70 transition-opacity">Colección</a>
        <a href="#contacto" className="hover:opacity-70 transition-opacity">Contacto</a>
      </div>
    </motion.nav>
  );
}
