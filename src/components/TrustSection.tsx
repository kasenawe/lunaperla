import { Shield, Gem, Award, Truck } from 'lucide-react';

const features = [
  {
    icon: <Gem className="w-6 h-6" />,
    title: 'Oro 18k',
    description: 'Calidad certificada en cada pieza.'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Perlas Naturales',
    description: 'Seleccionadas por su brillo y forma.'
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: 'Garantía',
    description: 'Respaldo total en tu compra.'
  },
  {
    icon: <Truck className="w-6 h-6" />,
    title: 'Envíos Uruguay',
    description: 'Llegamos a todo el país.'
  }
];

export default function TrustSection() {
  return (
    <section className="py-24 px-4 bg-white border-y border-zinc-100">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center flex flex-col items-center">
              <div className="mb-6 text-gold">
                {feature.icon}
              </div>
              <h3 className="text-lg mb-2 uppercase tracking-wider font-medium">{feature.title}</h3>
              <p className="text-sm text-zinc-500 font-light">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
