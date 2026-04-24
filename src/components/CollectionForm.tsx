import { useEffect, useMemo, useState } from "react";
import { Category, Collection } from "../types";
import { CollectionPayload } from "../services/catalogService";

interface CollectionFormProps {
  categories: Category[];
  initialData?: Collection;
  onSubmit: (payload: CollectionPayload) => Promise<void>;
  onCancel: () => void;
}

function slugifyValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function buildState(initialData?: Collection, categories: Category[] = []) {
  return {
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    categorySlug:
      initialData?.categorySlug ||
      categories.find((category) => category.active)?.slug ||
      "",
    active: initialData?.active ?? true,
    sortOrder: initialData?.sortOrder ?? 0,
  };
}

export default function CollectionForm({
  categories,
  initialData,
  onSubmit,
  onCancel,
}: CollectionFormProps) {
  const [formData, setFormData] = useState(buildState(initialData, categories));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSlugDirty, setIsSlugDirty] = useState(Boolean(initialData?.slug));

  useEffect(() => {
    setFormData(buildState(initialData, categories));
    setIsSlugDirty(Boolean(initialData?.slug));
    setError(null);
  }, [initialData, categories]);

  const availableCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.active || category.slug === formData.categorySlug,
      ),
    [categories, formData.categorySlug],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit({
        ...formData,
        slug: slugifyValue(formData.slug || formData.name),
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Error al guardar la coleccion",
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
        {initialData ? "Editar Coleccion" : "Nueva Coleccion"}
      </h3>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      ) : null}

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Nombre *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(event) =>
            setFormData((prev) => ({
              ...prev,
              name: event.target.value,
              slug: isSlugDirty ? prev.slug : slugifyValue(event.target.value),
            }))
          }
          required
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Slug *
        </label>
        <input
          type="text"
          value={formData.slug}
          onChange={(event) => {
            setIsSlugDirty(true);
            setFormData((prev) => ({
              ...prev,
              slug: slugifyValue(event.target.value),
            }));
          }}
          required
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Categoria *
        </label>
        <select
          value={formData.categorySlug}
          onChange={(event) =>
            setFormData((prev) => ({
              ...prev,
              categorySlug: event.target.value,
            }))
          }
          required
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/50"
        >
          <option value="">Selecciona una categoria</option>
          {availableCategories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Descripcion
        </label>
        <textarea
          value={formData.description}
          onChange={(event) =>
            setFormData((prev) => ({
              ...prev,
              description: event.target.value,
            }))
          }
          rows={3}
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Orden
        </label>
        <input
          type="number"
          value={formData.sortOrder}
          onChange={(event) =>
            setFormData((prev) => ({
              ...prev,
              sortOrder: Number(event.target.value) || 0,
            }))
          }
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/50"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="collection-active"
          checked={formData.active}
          onChange={(event) =>
            setFormData((prev) => ({
              ...prev,
              active: event.target.checked,
            }))
          }
          className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-2 focus:ring-black/50"
        />
        <label
          htmlFor="collection-active"
          className="text-sm font-medium text-zinc-700"
        >
          Activa
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
}
