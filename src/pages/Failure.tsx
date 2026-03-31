import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WhatsAppButton from '../components/WhatsAppButton';
import { LOGO_SIMPLE_URL, WHATSAPP_NUMBER } from '../constants';

export default function Failure() {
  const message = encodeURIComponent(
    `*Problema con el Pago*\n\n` +
    `Hola, tuve un problema con el pago en Mercado Pago.\n` +
    `¿Me puedes ayudar a resolverlo?\n\n` +
    `Gracias.`
  );

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Failure Icon */}
          <div className="mb-8">
            <XCircle className="w-24 h-24 text-red-500 mx-auto mb-4" />
            <h1 className="text-4xl font-serif mb-4 text-red-600">
              Pago No Procesado
            </h1>
            <p className="text-xl text-zinc-600 mb-8">
              Hubo un problema al procesar tu pago
            </p>
          </div>

          {/* Failure Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-serif mb-4 text-red-800">
              No se pudo completar el pago
            </h2>
            <p className="text-zinc-600 mb-6">
              El pago no pudo ser procesado. Esto puede deberse a:
            </p>

            <ul className="text-left text-zinc-600 mb-6 space-y-2">
              <li>• Fondos insuficientes en la tarjeta</li>
              <li>• Tarjeta expirada o bloqueada</li>
              <li>• Error en los datos de pago</li>
              <li>• Problema temporal del sistema</li>
            </ul>

            <div className="bg-white rounded-lg p-4 border border-red-200">
              <p className="text-sm text-zinc-500 mb-2">
                ¿Necesitas ayuda?
              </p>
              <p className="font-medium text-zinc-700">
                Contáctanos por WhatsApp para resolver cualquier problema
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 border border-black px-8 py-3 text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Intentar
            </Link>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-red-700 transition-all duration-300"
            >
              Contactar Soporte
            </a>
          </div>
        </div>
      </div>

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
            © {new Date().getFullYear()} Luna Gold Creaciones Uruguay. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      <WhatsAppButton />
    </main>
  );
}