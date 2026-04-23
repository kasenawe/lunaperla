import React, { useState, useEffect } from "react";
import { BACKEND_URL_LOCAL } from "../constants";
import { BackendProduct } from "../types";
import { ProductForm } from "../components/ProductForm";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
import { normalizeImageUrl } from "../utils/imageUrl";

export const Admin: React.FC = () => {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<BackendProduct | null>(
    null,
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${BACKEND_URL_LOCAL}/api/products?all=true`,
      );
      if (!response.ok) {
        throw new Error("Error al cargar productos");
      }
      const data: BackendProduct[] = await response.json();
      setProducts(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar productos",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (data: Omit<BackendProduct, "id">) => {
    try {
      const response = await fetch(`${BACKEND_URL_LOCAL}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al crear producto");
      }

      setMessage({ type: "success", text: "Producto creado" });
      setShowForm(false);
      await fetchProducts();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error al crear producto",
      });
      throw err;
    }
  };

  const handleUpdateProduct = async (data: Omit<BackendProduct, "id">) => {
    if (!editingProduct) return;

    try {
      const response = await fetch(
        `${BACKEND_URL_LOCAL}/api/products/${editingProduct.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        throw new Error("Error al actualizar producto");
      }

      setMessage({ type: "success", text: "Producto actualizado" });
      setEditingProduct(null);
      await fetchProducts();
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "Error al actualizar producto",
      });
      throw err;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este producto?")) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL_LOCAL}/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar producto");
      }

      setMessage({ type: "success", text: "Producto eliminado" });
      await fetchProducts();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error al eliminar producto",
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-black mb-2">
            Panel de Administración
          </h1>
          <p className="text-zinc-600">Gestiona los productos de la tienda</p>
        </div>

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg border bg-red-50 border-red-200 text-red-700">
            {error}
          </div>
        )}

        {!showForm && !editingProduct && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-8 bg-black text-white px-6 py-3 rounded hover:bg-black/90 transition-colors uppercase text-sm font-medium tracking-widest"
          >
            + Nuevo Producto
          </button>
        )}

        {(showForm || editingProduct) && (
          <div className="mb-8 max-w-xl">
            <ProductForm
              initialData={editingProduct || undefined}
              onSubmit={
                editingProduct ? handleUpdateProduct : handleCreateProduct
              }
              onCancel={handleCancel}
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">No hay productos. Crea uno nuevo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left py-3 px-4 font-semibold text-black">
                    Nombre
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-black">
                    Precio
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-black">
                    Imagen
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-black">
                    Estado
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-black">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-zinc-100">
                    <td className="py-3 px-4 text-black">{product.name}</td>
                    <td className="py-3 px-4 text-black font-medium">
                      ${product.price}
                    </td>
                    <td className="py-3 px-4">
                      <img
                        src={normalizeImageUrl(product.image_url)}
                        alt={product.name}
                        className="h-12 w-12 object-cover rounded border border-zinc-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "";
                          (e.target as HTMLImageElement).alt =
                            "Imagen no disponible";
                        }}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          product.active
                            ? "bg-green-100 text-green-700"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {product.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="px-3 py-1 border border-black text-black rounded hover:bg-black/5 transition-colors text-xs font-medium uppercase"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium uppercase"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Admin;
