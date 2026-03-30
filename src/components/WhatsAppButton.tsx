import { MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../constants';

export default function WhatsAppButton() {
  const handleClick = () => {
    const message = encodeURIComponent('Hola Luna Gold, me gustaría recibir más información sobre sus joyas.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-8 right-8 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-500 whitespace-nowrap text-sm font-medium">
        ¿En qué podemos ayudarte?
      </span>
    </button>
  );
}
