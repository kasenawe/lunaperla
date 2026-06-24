import { useEffect, useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, CreditCard, Landmark, Banknote } from "lucide-react";
import { CatalogProduct, PaymentMethod, Address } from "../types";
import { WHATSAPP_NUMBER } from "../constants";
import { getApiBaseUrl } from "../config/api";
import { getAddresses } from "../services/addressService";
import { isCustomerAuthenticated } from "../services/customerAuthService";

const API_BASE_URL = getApiBaseUrl();

interface PurchaseModalProps {
  product: CatalogProduct | null;
  onClose: () => void;
}

export default function PurchaseModal({
  product,
  onClose,
}: PurchaseModalProps) {
  const [step, setStep] = useState<"options" | "form">("options");
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const formatAddress = (address: Address) => {
    return [
      address.street,
      address.number,
      address.apartment,
      address.city,
      address.state,
      address.postal_code,
      address.country,
    ]
      .filter(Boolean)
      .join(", ");
  };

  useEffect(() => {
    if (!product || !isCustomerAuthenticated()) {
      return;
    }

    let isMounted = true;

    const loadAddresses = async () => {
      setIsLoadingAddresses(true);

      try {
        const addresses = await getAddresses();

        if (!isMounted) return;

        setSavedAddresses(addresses || []);

        if (addresses?.length) {
          const defaultAddress =
            addresses.find((address) => address.is_default) || addresses[0];
          setSelectedAddressId(defaultAddress.id);
          setFormData((current) => ({
            ...current,
            name: current.name || defaultAddress.recipient_name || "",
            phone: current.phone || defaultAddress.phone || "",
            address: current.address || formatAddress(defaultAddress),
          }));
        }
      } catch (error) {
        console.error("No se pudieron cargar las direcciones guardadas:", error);
      } finally {
        if (isMounted) {
          setIsLoadingAddresses(false);
        }
      }
    };

    loadAddresses();

    return () => {
      isMounted = false;
    };
  }, [product]);

  if (!product) return null;

  const activeVariants = (product.variants || []).filter(
    (variant) => variant.active,
  );
  const selectedVariant =
    activeVariants.find((variant) => variant.id === selectedVariantId) ||
    activeVariants[0] ||
    null;
  const displayPrice = selectedVariant?.price ?? product.price;
  const selectedProductCode =
    selectedVariant?.sku || product.productCode || null;

  const handleMethodSelect = (selectedMethod: PaymentMethod) => {
    setMethod(selectedMethod);
    setSelectedVariantId((current) => current || activeVariants[0]?.id || "");
    setStep("form"); // Siempre ir al formulario primero para recopilar datos
  };

  const handleAddressSelection = (addressId: string) => {
    setSelectedAddressId(addressId);

    const selectedAddress = savedAddresses.find((address) => address.id === addressId);

    if (!selectedAddress) {
      return;
    }

    setFormData((current) => ({
      ...current,
      name: selectedAddress.recipient_name || current.name,
      phone: selectedAddress.phone || current.phone,
      address: formatAddress(selectedAddress),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      alert("Por favor complete nombre y teléfono");
      return;
    }

    if (method === "mercadopago" && !formData.email) {
      alert("Por favor complete su email para el pago con Mercado Pago");
      return;
    }

    if (method !== "mercadopago" && !formData.address) {
      alert("Por favor complete la dirección de envío");
      return;
    }

    const selectedAddress = savedAddresses.find(
      (address) => address.id === selectedAddressId,
    );

    if (method === "mercadopago") {
      // Procesar pago con Mercado Pago
      try {
        const response = await fetch(`${API_BASE_URL}/api/create-payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product: {
              ...product,
              price: displayPrice,
              product_code: selectedProductCode,
            },
            productVariant: selectedVariant
              ? {
                  id: selectedVariant.id,
                  sku: selectedVariant.sku,
                  label: selectedVariant.label,
                  karat: selectedVariant.karat,
                  width_mm: selectedVariant.widthMm,
                  profile: selectedVariant.profile,
                  closure_type: selectedVariant.closureType,
                  price: selectedVariant.price,
                  metadata: selectedVariant.metadata,
                }
              : null,
            customerData: {
              name: formData.name,
              phone: formData.phone,
              email: formData.email,
              address: formData.address || undefined,
            },
            shippingAddress: selectedAddress
              ? {
                  label: selectedAddress.label,
                  recipient_name: selectedAddress.recipient_name,
                  phone: selectedAddress.phone,
                  street: selectedAddress.street,
                  number: selectedAddress.number,
                  apartment: selectedAddress.apartment,
                  city: selectedAddress.city,
                  state: selectedAddress.state,
                  postal_code: selectedAddress.postal_code,
                  country: selectedAddress.country,
                }
              : null,
          }),
        });

        const data = await response.json();

        if (data.init_point) {
          // Redirigir a Mercado Pago
          window.location.href = data.init_point;
        } else {
          console.error("Error creando pago:", data);
          alert("Error al procesar el pago. Intente nuevamente.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión. Intente nuevamente.");
      }
    } else {
      // Procesar otros métodos (WhatsApp)
      const methodText =
        method === "transfer"
          ? "Transferencia Bancaria"
          : "Efectivo contra entrega";

      const message = encodeURIComponent(
        `*Nuevo Pedido - Luna Gold*\n\n` +
          `*Producto:* ${product.name}\n` +
          `${selectedVariant ? `*Variante:* ${selectedVariant.label}\n` : ""}` +
          `*Precio:* USD ${displayPrice}\n` +
          `*Método de Pago:* ${methodText}\n\n` +
          `*Datos del Cliente:*\n` +
          `- Nombre: ${formData.name}\n` +
          `- Teléfono: ${formData.phone}\n` +
          `- Dirección: ${formData.address}`,
      );

      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
      onClose();
    }
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
                  {selectedVariant ? (
                    <p className="text-sm text-zinc-500 uppercase tracking-[0.2em] mb-2">
                      {selectedVariant.label}
                    </p>
                  ) : null}
                  <p className="text-xl font-medium">USD {displayPrice}</p>
                </div>

                {activeVariants.length > 0 ? (
                  <div className="mb-8">
                    <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
                      Seleccioná una variante
                    </label>
                    <select
                      value={selectedVariantId || activeVariants[0]?.id || ""}
                      onChange={(event) =>
                        setSelectedVariantId(event.target.value)
                      }
                      className="w-full border border-zinc-200 px-4 py-3 bg-white"
                    >
                      {activeVariants.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.label} — USD {variant.price}
                        </option>
                      ))}
                    </select>

                    <div className="mt-3 text-sm text-zinc-500 space-y-1">
                      {selectedVariant?.karat ? (
                        <p>Kilates: {selectedVariant.karat}</p>
                      ) : null}
                      {selectedVariant?.widthMm !== null &&
                      selectedVariant?.widthMm !== undefined ? (
                        <p>Ancho: {selectedVariant.widthMm} mm</p>
                      ) : null}
                      {selectedVariant?.profile ? (
                        <p>Perfil: {selectedVariant.profile}</p>
                      ) : null}
                      {selectedVariant?.closureType ? (
                        <p>Cierre: {selectedVariant.closureType}</p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

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
                  <h2 className="text-3xl">
                    {method === "mercadopago"
                      ? "Datos de Pago"
                      : "Datos de Envío"}
                  </h2>
                  <p className="text-sm text-zinc-500 mt-2">
                    {method === "mercadopago"
                      ? "Completa tus datos para procesar el pago con Mercado Pago."
                      : "Completa tus datos para coordinar el pedido por WhatsApp."}
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
                  {method === "mercadopago" && (
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
                        Email
                      </label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full border-b border-zinc-200 py-3 focus:border-black outline-none transition-colors font-light"
                        placeholder="Ej: maria@email.com"
                      />
                    </div>
                  )}
                  {savedAddresses.length > 0 && (
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
                        Dirección Guardada
                      </label>
                      <select
                        value={selectedAddressId}
                        onChange={(e) => handleAddressSelection(e.target.value)}
                        className="w-full border border-zinc-200 px-4 py-3 bg-white"
                        disabled={isLoadingAddresses}
                      >
                        <option value="">Seleccionar una dirección guardada</option>
                        {savedAddresses.map((address) => (
                          <option key={address.id} value={address.id}>
                            {address.label || address.recipient_name} — {address.city}
                            {address.is_default ? " • Predeterminada" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {method !== "mercadopago" && (
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
                  )}
                  {method === "mercadopago" && formData.address && (
                    <p className="text-xs text-zinc-500">
                      Se enviará la dirección seleccionada junto con el pago.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white py-5 text-sm uppercase tracking-widest hover:bg-zinc-800 transition-colors mt-8"
                >
                  {method === "mercadopago"
                    ? "Pagar con Mercado Pago"
                    : "Enviar pedido por WhatsApp"}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
