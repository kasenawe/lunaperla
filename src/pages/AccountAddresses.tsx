import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
import { Address } from "../types";
import {
  clearCustomerToken,
  getCurrentCustomer,
  isCustomerAuthenticated,
  loginCustomer,
  registerCustomer,
} from "../services/customerAuthService";
import {
  createAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  updateAddress,
  type AddressPayload,
} from "../services/addressService";

type FlashMessage = {
  type: "success" | "error";
  text: string;
};

type AuthMode = "login" | "register";

type AddressFormState = AddressPayload;

const EMPTY_ADDRESS_FORM: AddressFormState = {
  label: "",
  recipient_name: "",
  phone: "",
  street: "",
  number: "",
  apartment: "",
  city: "",
  state: "",
  postal_code: "",
  country: "Uruguay",
  is_default: false,
};

function buildAddressForm(address?: Address | null): AddressFormState {
  if (!address) {
    return EMPTY_ADDRESS_FORM;
  }

  return {
    label: address.label || "",
    recipient_name: address.recipient_name,
    phone: address.phone,
    street: address.street,
    number: address.number,
    apartment: address.apartment || "",
    city: address.city,
    state: address.state || "",
    postal_code: address.postal_code || "",
    country: address.country,
    is_default: address.is_default,
  };
}

export default function AccountAddresses() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [message, setMessage] = useState<FlashMessage | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] =
    useState<AddressFormState>(EMPTY_ADDRESS_FORM);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (!isCustomerAuthenticated()) {
      setAuthLoading(false);
      return;
    }

    void bootstrapAccount();
  }, []);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(() => setMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const bootstrapAccount = async () => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      const user = await getCurrentCustomer();
      setCustomerEmail(user?.email || "");
      setCustomerFirstName(user?.first_name || "");
      setCustomerLastName(user?.last_name || "");
      setCustomerPhone(user?.phone || "");
      setCustomerName(
        [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
          user?.email ||
          "",
      );
      await loadAddresses();
    } catch (error) {
      clearCustomerToken();
      setAuthError(
        error instanceof Error
          ? error.message
          : "No se pudo recuperar tu sesión",
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const data = await getAddresses();
      setAddresses(data);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "No se pudieron cargar tus direcciones",
      });
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setAuthSubmitting(true);
      setAuthError(null);

      const user =
        authMode === "register"
          ? await registerCustomer({
              email: customerEmail,
              password: customerPassword,
              first_name: customerFirstName,
              last_name: customerLastName,
              phone: customerPhone,
            })
          : await loginCustomer({
              email: customerEmail,
              password: customerPassword,
            });

      setCustomerPassword("");
      setCustomerName(
        [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
          user?.email ||
          "",
      );
      await loadAddresses();
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "No se pudo iniciar sesión",
      );
    } finally {
      setAuthSubmitting(false);
      setAuthLoading(false);
    }
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddressForm(EMPTY_ADDRESS_FORM);
  };

  const handleAddressSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSavingAddress(true);

      if (editingAddressId) {
        await updateAddress(editingAddressId, addressForm);
        setMessage({ type: "success", text: "Dirección actualizada" });
      } else {
        await createAddress(addressForm);
        setMessage({ type: "success", text: "Dirección guardada" });
      }

      resetAddressForm();
      await loadAddresses();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "No se pudo guardar la dirección",
      });
    } finally {
      setSavingAddress(false);
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddressId(address.id);
    setAddressForm(buildAddressForm(address));
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta dirección?")) {
      return;
    }

    try {
      await deleteAddress(addressId);
      setMessage({ type: "success", text: "Dirección eliminada" });
      if (editingAddressId === addressId) {
        resetAddressForm();
      }
      await loadAddresses();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "No se pudo eliminar la dirección",
      });
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      await setDefaultAddress(addressId);
      setMessage({ type: "success", text: "Dirección principal actualizada" });
      await loadAddresses();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar la dirección principal",
      });
    }
  };

  const handleLogout = () => {
    clearCustomerToken();
    setAddresses([]);
    setCustomerPassword("");
    setCustomerName("");
    setAuthLoading(false);
    resetAddressForm();
  };

  const isAuthenticated = isCustomerAuthenticated() && !authLoading;

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <section className="pt-28 pb-16 px-4">
          <div className="max-w-4xl mx-auto grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="border border-zinc-200 rounded-2xl p-8 bg-zinc-50">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500 mb-3">
                Cuenta Luna Gold
              </p>
              <h1 className="text-4xl text-black mb-4">
                Tus direcciones guardadas
              </h1>
              <p className="text-zinc-600 leading-relaxed">
                En esta fase ya puedes crear tu cuenta e iniciar sesión para
                administrar tus direcciones de envío. El checkout guest sigue
                funcionando sin cambios.
              </p>
              <div className="mt-8 space-y-3 text-sm text-zinc-600">
                <p>• Varias direcciones por cliente.</p>
                <p>• Una dirección principal por defecto.</p>
                <p>• Datos protegidos por tu sesión.</p>
              </div>
            </div>

            <div className="border border-zinc-200 rounded-2xl p-8 bg-white shadow-sm">
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className={`flex-1 py-3 text-xs uppercase tracking-[0.2em] border ${
                    authMode === "login"
                      ? "bg-black text-white border-black"
                      : "border-zinc-300 text-zinc-600"
                  }`}
                >
                  Ingresar
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className={`flex-1 py-3 text-xs uppercase tracking-[0.2em] border ${
                    authMode === "register"
                      ? "bg-black text-white border-black"
                      : "border-zinc-300 text-zinc-600"
                  }`}
                >
                  Crear cuenta
                </button>
              </div>

              {authError ? (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {authError}
                </div>
              ) : null}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === "register" ? (
                  <>
                    <input
                      type="text"
                      value={customerFirstName}
                      onChange={(event) =>
                        setCustomerFirstName(event.target.value)
                      }
                      placeholder="Nombre"
                      className="w-full border border-zinc-300 px-4 py-3"
                    />
                    <input
                      type="text"
                      value={customerLastName}
                      onChange={(event) =>
                        setCustomerLastName(event.target.value)
                      }
                      placeholder="Apellido"
                      className="w-full border border-zinc-300 px-4 py-3"
                    />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      placeholder="Teléfono"
                      className="w-full border border-zinc-300 px-4 py-3"
                    />
                  </>
                ) : null}

                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  placeholder="Email"
                  className="w-full border border-zinc-300 px-4 py-3"
                />
                <input
                  type="password"
                  required
                  value={customerPassword}
                  onChange={(event) => setCustomerPassword(event.target.value)}
                  placeholder="Contraseña"
                  className="w-full border border-zinc-300 px-4 py-3"
                />

                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full bg-black text-white py-4 text-sm uppercase tracking-[0.2em] disabled:opacity-60"
                >
                  {authSubmitting
                    ? "Procesando..."
                    : authMode === "register"
                      ? "Crear cuenta"
                      : "Ingresar"}
                </button>
              </form>
            </div>
          </div>
        </section>
        <Footer />
        <WhatsAppButton />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500 mb-2">
                Mi cuenta
              </p>
              <h1 className="text-4xl text-black mb-2">Direcciones de envío</h1>
              <p className="text-zinc-600">
                {customerName
                  ? `Gestiona tus direcciones, ${customerName}.`
                  : "Gestiona tus direcciones guardadas."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/"
                className="border border-zinc-300 px-5 py-3 text-xs uppercase tracking-[0.2em] text-zinc-700"
              >
                Volver al catálogo
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="border border-black px-5 py-3 text-xs uppercase tracking-[0.2em] text-black"
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          {message ? (
            <div
              className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
                message.type === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            <div className="border border-zinc-200 rounded-2xl p-6 bg-zinc-50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-black">Mis direcciones</h2>
                {loadingAddresses ? (
                  <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Cargando...
                  </span>
                ) : null}
              </div>

              <div className="space-y-4">
                {addresses.length === 0 && !loadingAddresses ? (
                  <div className="border border-dashed border-zinc-300 rounded-xl p-6 text-sm text-zinc-600">
                    Aún no tienes direcciones guardadas.
                  </div>
                ) : null}

                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="rounded-xl border border-zinc-200 bg-white p-5"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                          {address.label || "Dirección"}
                        </p>
                        <h3 className="text-xl text-black mt-1">
                          {address.recipient_name}
                        </h3>
                      </div>
                      {address.is_default ? (
                        <span className="border border-black px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-black">
                          Principal
                        </span>
                      ) : null}
                    </div>

                    <div className="space-y-1 text-sm text-zinc-600">
                      <p>
                        {address.street} {address.number}
                        {address.apartment ? `, apto ${address.apartment}` : ""}
                      </p>
                      <p>
                        {address.city}
                        {address.state ? `, ${address.state}` : ""}
                        {address.postal_code ? ` (${address.postal_code})` : ""}
                      </p>
                      <p>{address.country}</p>
                      <p>{address.phone}</p>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-5">
                      <button
                        type="button"
                        onClick={() => handleEditAddress(address)}
                        className="border border-zinc-300 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-zinc-700"
                      >
                        Editar
                      </button>
                      {!address.is_default ? (
                        <button
                          type="button"
                          onClick={() =>
                            void handleSetDefaultAddress(address.id)
                          }
                          className="border border-black px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-black"
                        >
                          Marcar principal
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => void handleDeleteAddress(address.id)}
                        className="border border-red-200 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-zinc-200 rounded-2xl p-6 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-black">
                  {editingAddressId ? "Editar dirección" : "Nueva dirección"}
                </h2>
                {editingAddressId ? (
                  <button
                    type="button"
                    onClick={resetAddressForm}
                    className="text-xs uppercase tracking-[0.2em] text-zinc-500"
                  >
                    Cancelar edición
                  </button>
                ) : null}
              </div>

              <form
                onSubmit={handleAddressSubmit}
                className="grid gap-4 md:grid-cols-2"
              >
                <input
                  type="text"
                  value={addressForm.label}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      label: event.target.value,
                    }))
                  }
                  placeholder="Etiqueta (ej: Casa, Trabajo)"
                  className="border border-zinc-300 px-4 py-3 md:col-span-2"
                />
                <input
                  type="text"
                  required
                  value={addressForm.recipient_name}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      recipient_name: event.target.value,
                    }))
                  }
                  placeholder="Destinatario"
                  className="border border-zinc-300 px-4 py-3 md:col-span-2"
                />
                <input
                  type="tel"
                  required
                  value={addressForm.phone}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="Teléfono"
                  className="border border-zinc-300 px-4 py-3 md:col-span-2"
                />
                <input
                  type="text"
                  required
                  value={addressForm.street}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      street: event.target.value,
                    }))
                  }
                  placeholder="Calle"
                  className="border border-zinc-300 px-4 py-3"
                />
                <input
                  type="text"
                  required
                  value={addressForm.number}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      number: event.target.value,
                    }))
                  }
                  placeholder="Número"
                  className="border border-zinc-300 px-4 py-3"
                />
                <input
                  type="text"
                  value={addressForm.apartment}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      apartment: event.target.value,
                    }))
                  }
                  placeholder="Apartamento"
                  className="border border-zinc-300 px-4 py-3"
                />
                <input
                  type="text"
                  required
                  value={addressForm.city}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      city: event.target.value,
                    }))
                  }
                  placeholder="Ciudad"
                  className="border border-zinc-300 px-4 py-3"
                />
                <input
                  type="text"
                  value={addressForm.state}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      state: event.target.value,
                    }))
                  }
                  placeholder="Departamento / Estado"
                  className="border border-zinc-300 px-4 py-3"
                />
                <input
                  type="text"
                  value={addressForm.postal_code}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      postal_code: event.target.value,
                    }))
                  }
                  placeholder="Código postal"
                  className="border border-zinc-300 px-4 py-3"
                />
                <input
                  type="text"
                  required
                  value={addressForm.country}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      country: event.target.value,
                    }))
                  }
                  placeholder="País"
                  className="border border-zinc-300 px-4 py-3 md:col-span-2"
                />

                <label className="md:col-span-2 inline-flex items-center gap-3 text-sm text-zinc-600">
                  <input
                    type="checkbox"
                    checked={addressForm.is_default}
                    onChange={(event) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        is_default: event.target.checked,
                      }))
                    }
                  />
                  Usar como dirección principal
                </label>

                <button
                  type="submit"
                  disabled={savingAddress}
                  className="md:col-span-2 bg-black text-white py-4 text-sm uppercase tracking-[0.2em] disabled:opacity-60"
                >
                  {savingAddress
                    ? "Guardando..."
                    : editingAddressId
                      ? "Actualizar dirección"
                      : "Guardar dirección"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
