import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WhatsAppButton from '../components/WhatsAppButton';
import { LOGO_SIMPLE_URL, WHATSAPP_NUMBER } from '../constants';

export default function Success() {
  const message = encodeURIComponent(
    `*¡Pago Exitoso!*\n\n` +
    `¡Gracias por tu compra en Luna Gold Creaciones!\n\n` +
    `Tu pago ha sido procesado correctamente. ` +
    `Nos pondremos en contacto contigo pronto para coordinar el envío.\n\n` +
    `¿Tienes alguna pregunta sobre tu pedido?`
  );

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl font-serif mb-4 text-green-600">
              ¡Pago Exitoso!
            </h1>
            <p className="text-xl text-zinc-600 mb-8">
              Tu pago ha sido procesado correctamente
            </p>
          </div>

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-serif mb-4 text-green-800">
              ¡Gracias por tu compra!
            </h2>
            <p className="text-zinc-600 mb-6">
              Hemos recibido tu pago exitosamente. Nos pondremos en contacto
              contigo a través de WhatsApp para coordinar los detalles del envío
              y confirmar tu pedido.
            </p>

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-sm text-zinc-500 mb-2">
                Tiempo estimado de entrega:
              </p>
              <p className="font-medium text-zinc-700">
                Montevideo: 24-48 horas hábiles<br />
                Interior: 48-72 horas hábiles
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
              Seguir Comprando
            </Link>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-green-700 transition-all duration-300"
            >
              Contactar por WhatsApp
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