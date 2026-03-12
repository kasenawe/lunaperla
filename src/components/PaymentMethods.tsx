import { CreditCard, Landmark, Banknote } from 'lucide-react';

export default function PaymentMethods() {
  return (
    <section className="py-24 px-4 bg-zinc-50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl mb-12">Formas de Pago</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 border border-zinc-100 flex flex-col items-center">
            <CreditCard className="w-8 h-8 mb-4 text-zinc-400" />
            <h3 className="font-medium mb-2">Mercado Pago</h3>
            <p className="text-sm text-zinc-500">Tarjetas de crédito y débito hasta en 12 cuotas.</p>
          </div>
          <div className="bg-white p-8 border border-zinc-100 flex flex-col items-center">
            <Landmark className="w-8 h-8 mb-4 text-zinc-400" />
            <h3 className="font-medium mb-2">Transferencia</h3>
            <p className="text-sm text-zinc-500">BROU, Santander o Itaú.</p>
          </div>
          <div className="bg-white p-8 border border-zinc-100 flex flex-col items-center">
            <Banknote className="w-8 h-8 mb-4 text-zinc-400" />
            <h3 className="font-medium mb-2">Efectivo</h3>
            <p className="text-sm text-zinc-500">Pago contra entrega (Solo Montevideo).</p>
          </div>
        </div>
      </div>
    </section>
  );
}
