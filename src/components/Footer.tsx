import { LOGO_SIMPLE_URL } from "../constants";

export default function Footer() {
  return (
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
  );
}
