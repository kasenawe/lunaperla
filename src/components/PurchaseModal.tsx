import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, CreditCard, Landmark, Banknote } from "lucide-react";
import { Product, PaymentMethod } from "../types";
import { BACKEND_URL, WHATSAPP_NUMBER } from "../constants";

interface PurchaseModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function PurchaseModal({
  product,
  onClose,
}: PurchaseModalProps) {
  const [step, setStep] = useState<"options" | "form">("options");
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  if (!product) return null;

  const handleMethodSelect = (selectedMethod: PaymentMethod) => {
    if (selectedMethod === "mercadopago") {
      // Crear preferencia de pago en el backend
      fetch(BACKEND_URL + "/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: product,
          customerData: {}, // Por ahora vacío, se puede agregar después
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.init_point) {
            // Redirigir a Mercado Pago
            window.location.href = data.init_point;
          } else {
            console.error("Error creando pago:", data);
            alert("Error al procesar el pago. Intente nuevamente.");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Error de conexión. Intente nuevamente.");
        });
    } else {
      setMethod(selectedMethod);
      setStep("form");
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const methodText =
      method === "transfer"
        ? "Transferencia Bancaria"
        : "Efectivo contra entrega";
    const message = encodeURIComponent(
      `*Nuevo Pedido - Luna Gold*\n\n` +
        `*Producto:* ${product.name}\n` +
        `*Precio:* USD ${product.price}\n` +
        `*Método de Pago:* ${methodText}\n\n` +
        `*Datos del Cliente:*\n` +
        `- Nombre: ${formData.name}\n` +
        `- Teléfono: ${formData.phone}\n` +
        `- Dirección: ${formData.address}`,
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-lg overflow-hidden shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-zinc-100 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 md:p-12">
            {step === "options" ? (
              <>
                <div className="mb-8 text-center">
                  <p className="text-gold uppercase tracking-widest text-xs mb-2">
                    Finalizar Compra
                  </p>
                  <h2 className="text-3xl mb-2">{product.name}</h2>
                  <p className="text-xl font-medium">USD {product.price}</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => handleMethodSelect("mercadopago")}
                    className="w-full flex items-center justify-between p-6 border border-zinc-100 hover:border-black transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <CreditCard className="w-6 h-6 text-zinc-400 group-hover:text-black" />
                      <div className="text-left">
                        <p className="font-medium">Mercado Pago</p>
                        <p className="text-xs text-zinc-500">
                          Tarjetas de crédito y débito
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  <button
                    onClick={() => handleMethodSelect("transfer")}
                    className="w-full flex items-center justify-between p-6 border border-zinc-100 hover:border-black transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <Landmark className="w-6 h-6 text-zinc-400 group-hover:text-black" />
                      <div className="text-left">
                        <p className="font-medium">Transferencia Bancaria</p>
                        <p className="text-xs text-zinc-500">
                          BROU, Santander, Itaú
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  <button
                    onClick={() => handleMethodSelect("cash")}
                    className="w-full flex items-center justify-between p-6 border border-zinc-100 hover:border-black transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <Banknote className="w-6 h-6 text-zinc-400 group-hover:text-black" />
                      <div className="text-left">
                        <p className="font-medium">Efectivo contra entrega</p>
                        <p className="text-xs text-zinc-500">Solo Montevideo</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="mb-8 text-center">
                  <button
                    type="button"
                    onClick={() => setStep("options")}
                    className="text-xs uppercase tracking-widest text-zinc-400 hover:text-black mb-4"
                  >
                    ← Volver a opciones
                  </button>
                  <h2 className="text-3xl">Datos de Envío</h2>
                  <p className="text-sm text-zinc-500 mt-2">
                    Completa tus datos para coordinar el pedido por WhatsApp.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border-b border-zinc-200 py-3 focus:border-black outline-none transition-colors font-light"
                      placeholder="Ej: María García"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
                      Teléfono de Contacto
                    </label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full border-b border-zinc-200 py-3 focus:border-black outline-none transition-colors font-light"
                      placeholder="Ej: 099 123 456"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
                      Dirección de Envío
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full border-b border-zinc-200 py-3 focus:border-black outline-none transition-colors font-light"
                      placeholder="Calle, Número, Apto / Ciudad"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white py-5 text-sm uppercase tracking-widest hover:bg-zinc-800 transition-colors mt-8"
                >
                  Enviar pedido por WhatsApp
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
