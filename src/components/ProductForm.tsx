import React, { useState, useEffect } from "react";
import { BackendProduct } from "../types";
import { uploadProductImage } from "../services/storageService";
import { normalizeImageUrl } from "../utils/imageUrl";

interface ProductFormProps {
  initialData?: BackendProduct;
  onSubmit: (data: Omit<BackendProduct, "id">) => Promise<void>;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    price: initialData?.price || 0,
    image_url: initialData?.image_url || "",
    description: initialData?.description || "",
    active: initialData?.active ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string>("");

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? parseFloat(value) || 0
            : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      setLocalPreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Selecciona un archivo de imagen valido");
      e.target.value = "";
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError("La imagen debe pesar menos de 5MB");
      e.target.value = "";
      return;
    }

    setError(null);
    setSelectedFile(file);
    setLocalPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let imageUrl = formData.image_url;
      if (selectedFile) {
        imageUrl = await uploadProductImage(selectedFile);
      }

      if (!imageUrl) {
        throw new Error("Debes subir una imagen");
      }

      await onSubmit({
        ...formData,
        image_url: imageUrl,
      });
      setSuccess(true);
      setFormData({
        name: "",
        price: 0,
        image_url: "",
        description: "",
        active: true,
      });
      setSelectedFile(null);
      setLocalPreview("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar el producto",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-zinc-100 p-6 space-y-4"
    >
      <h3 className="text-lg font-serif font-semibold text-black">
        {initialData ? "Editar Producto" : "Nuevo Producto"}
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded">
          Producto guardado exitosamente
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Nombre *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/50"
          placeholder="Ej: Canasta trenzada"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Precio *
        </label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
          step="0.01"
          min="0"
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/50"
          placeholder="299"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Imagen del producto *
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/50"
        />
        <p className="text-xs text-zinc-500 mt-1">
          Formatos: JPG, PNG, WEBP. Maximo 5MB.
        </p>
        {(localPreview || formData.image_url) && (
          <div className="mt-2">
            <img
              src={localPreview || normalizeImageUrl(formData.image_url)}
              alt="Preview"
              className="h-20 w-20 object-cover rounded border border-zinc-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "";
              }}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Descripción *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={3}
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/50"
          placeholder="Descripción del producto..."
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="active"
          id="active"
          checked={formData.active}
          onChange={handleChange}
          className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-2 focus:ring-black/50"
        />
        <label htmlFor="active" className="text-sm font-medium text-zinc-700">
          Activo
        </label>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-black text-white py-2 rounded hover:bg-black/90 disabled:bg-zinc-400 transition-colors uppercase text-sm font-medium tracking-widest"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-black text-black py-2 rounded hover:bg-black/5 transition-colors uppercase text-sm font-medium tracking-widest"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};
