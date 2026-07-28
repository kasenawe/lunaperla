import { motion } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { Category } from "../types";
import { LOGO_SIMPLE_URL } from "../constants";
import { useCart } from "../cart/CartContext";

interface NavbarProps {
  categories?: Category[];
}

export default function Navbar({ categories = [] }: NavbarProps) {
  const catalogHref = categories.length > 0 ? "#productos" : "/#productos";
  const { enabled, cart } = useCart();

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

      <div className="flex items-center gap-5 text-white mix-blend-difference">
        <div className="hidden md:flex gap-8 text-xs uppercase tracking-widest">
          <a href={catalogHref} className="hover:opacity-70 transition-opacity">
            Catalogo
          </a>
          <a
            href="/account/addresses"
            className="hover:opacity-70 transition-opacity"
          >
            Mi cuenta
          </a>
          {categories.slice(0, 4).map((category) => (
            <a
              key={category.slug}
              href={`#categoria-${category.slug}`}
              className="hover:opacity-70 transition-opacity"
            >
              {category.name}
            </a>
          ))}
        </div>

        {enabled ? (
          <Link
            to="/cart"
            aria-label={`Carrito con ${cart.totalQuantity} productos`}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-current transition-opacity hover:opacity-70"
          >
            <ShoppingBag className="h-5 w-5" />
            {cart.totalQuantity > 0 ? (
              <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black">
                {cart.totalQuantity > 99 ? "99+" : cart.totalQuantity}
              </span>
            ) : null}
          </Link>
        ) : null}
      </div>
    </motion.nav>
  );
}
