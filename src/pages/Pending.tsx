import { Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WhatsAppButton from '../components/WhatsAppButton';
import { LOGO_SIMPLE_URL, WHATSAPP_NUMBER } from '../constants';

export default function Pending() {
  const message = encodeURIComponent(
    `*Pago Pendiente*\n\n` +
    `Hola, mi pago está en estado pendiente.\n` +
    `¿Me puedes confirmar cuando se procese?\n\n` +
    `Gracias.`
  );

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Pending Icon */}
          <div className="mb-8">
            <Clock className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-serif mb-4 text-yellow-600">
              Pago Pendiente
            </h1>
            <p className="text-xl text-zinc-600 mb-8">
              Tu pago está siendo procesado
            </p>
          </div>

          {/* Pending Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-serif mb-4 text-yellow-800">
              Procesando tu pago
            </h2>
            <p className="text-zinc-600 mb-6">
              Tu pago está en proceso de verificación. Esto puede tomar unos minutos.
              Te notificaremos cuando se complete exitosamente.
            </p>

            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-zinc-500 mb-2">
                ¿Qué significa "pendiente"?
              </p>
              <p className="font-medium text-zinc-700">
                El pago está siendo verificado por tu banco o Mercado Pago.
                Una vez aprobado, recibirás confirmación.
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
              Volver al Inicio
            </Link>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-yellow-600 text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-yellow-700 transition-all duration-300"
            >
              Consultar Estado
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