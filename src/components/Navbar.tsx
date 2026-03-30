import { motion } from 'motion/react';
import { LOGO_SIMPLE_URL } from '../constants';

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center"
    >
      <a
        href="/"
        className="isolate z-10 inline-flex items-center transition-opacity hover:opacity-90"
      >
        <img
          src={LOGO_SIMPLE_URL}
          alt="Luna Gold Creaciones"
          className="h-10 w-auto object-contain md:h-12 drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
        />
      </a>
      
      <div className="hidden md:flex gap-8 text-white text-xs uppercase tracking-widest mix-blend-difference">
        <a href="#productos" className="hover:opacity-70 transition-opacity">Colección</a>
        <a href="#contacto" className="hover:opacity-70 transition-opacity">Contacto</a>
      </div>
    </motion.nav>
  );
}
