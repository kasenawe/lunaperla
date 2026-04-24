import React, { useEffect, useMemo, useState } from "react";
import { BACKEND_URL } from "../constants";
import { BackendProduct, Category, Collection } from "../types";
import { ProductForm } from "../components/ProductForm";
import CategoryForm from "../components/CategoryForm";
import CollectionForm from "../components/CollectionForm";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
import { normalizeImageUrl } from "../utils/imageUrl";
import {
  createCategory,
  createCollection,
  deleteCategory,
  deleteCollection,
  getCategories,
  getCollections,
  updateCategory,
  updateCollection,
} from "../services/catalogService";

const API_BASE_URL = import.meta.env.DEV ? "" : BACKEND_URL;

type AdminSection = "products" | "categories" | "collections";

type FlashMessage = {
  type: "success" | "error";
  text: string;
};

async function parseErrorMessage(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || fallback;
  } catch {
    return fallback;
  }
}

export const Admin: React.FC = () => {
  const [section, setSection] = useState<AdminSection>("products");
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<FlashMessage | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<BackendProduct | null>(
    null,
  );
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null,
  );

  useEffect(() => {
    void fetchProducts();
    void fetchCategories();
    void fetchCollections();
  }, []);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const activeCategories = useMemo(
    () => categories.filter((category) => category.active),
    [categories],
  );

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/products?all=true`);
      if (!response.ok) {
        throw new Error(
          await parseErrorMessage(response, "Error al cargar productos"),
        );
      }
      const data: BackendProduct[] = await response.json();
      setProducts(data);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Error al cargar productos",
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await getCategories({ includeAll: true });
      setCategories(data);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Error al cargar categorias",
      );
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchCollections = async () => {
    try {
      setLoadingCollections(true);
      const data = await getCollections({ includeAll: true });
      setCollections(data);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Error al cargar colecciones",
      );
      setCollections([]);
    } finally {
      setLoadingCollections(false);
    }
  };

  const resetForms = () => {
    setShowProductForm(false);
    setShowCategoryForm(false);
    setShowCollectionForm(false);
    setEditingProduct(null);
    setEditingCategory(null);
    setEditingCollection(null);
  };

  const handleCreateProduct = async (data: Omit<BackendProduct, "id">) => {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        await parseErrorMessage(response, "Error al crear producto"),
      );
    }

    setMessage({ type: "success", text: "Producto creado" });
    resetForms();
    await fetchProducts();
  };

  const handleUpdateProduct = async (data: Omit<BackendProduct, "id">) => {
    if (!editingProduct) {
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/products/${editingProduct.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error(
        await parseErrorMessage(response, "Error al actualizar producto"),
      );
    }

    setMessage({ type: "success", text: "Producto actualizado" });
    resetForms();
    await fetchProducts();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este producto?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          await parseErrorMessage(response, "Error al eliminar producto"),
        );
      }

      setMessage({ type: "success", text: "Producto eliminado" });
      await fetchProducts();
    } catch (deleteError) {
      setMessage({
        type: "error",
        text:
          deleteError instanceof Error
            ? deleteError.message
            : "Error al eliminar producto",
      });
    }
  };

  const handleCreateCategory = async (payload: {
    slug: string;
    name: string;
    description: string;
    active: boolean;
    sortOrder: number;
  }) => {
    await createCategory(payload);
    setMessage({ type: "success", text: "Categoria creada" });
    resetForms();
    await Promise.all([fetchCategories(), fetchCollections(), fetchProducts()]);
  };

  const handleUpdateCategory = async (payload: {
    slug: string;
    name: string;
    description: string;
    active: boolean;
    sortOrder: number;
  }) => {
    if (!editingCategory) {
      return;
    }

    await updateCategory(editingCategory.slug, payload);
    setMessage({ type: "success", text: "Categoria actualizada" });
    resetForms();
    await Promise.all([fetchCategories(), fetchCollections(), fetchProducts()]);
  };

  const handleDeleteCategory = async (slug: string) => {
    if (!confirm("¿Está seguro de que desea eliminar esta categoria?")) {
      return;
    }

    try {
      await deleteCategory(slug);
      setMessage({ type: "success", text: "Categoria eliminada" });
      await Promise.all([
        fetchCategories(),
        fetchCollections(),
        fetchProducts(),
      ]);
    } catch (deleteError) {
      setMessage({
        type: "error",
        text:
          deleteError instanceof Error
            ? deleteError.message
            : "Error al eliminar categoria",
      });
    }
  };

  const handleCreateCollection = async (payload: {
    slug: string;
    name: string;
    description: string;
    categorySlug: string;
    active: boolean;
    sortOrder: number;
  }) => {
    await createCollection(payload);
    setMessage({ type: "success", text: "Coleccion creada" });
    resetForms();
    await Promise.all([fetchCollections(), fetchProducts()]);
  };

  const handleUpdateCollection = async (payload: {
    slug: string;
    name: string;
    description: string;
    categorySlug: string;
    active: boolean;
    sortOrder: number;
  }) => {
    if (!editingCollection) {
      return;
    }

    await updateCollection(editingCollection.slug, payload);
    setMessage({ type: "success", text: "Coleccion actualizada" });
    resetForms();
    await Promise.all([fetchCollections(), fetchProducts(), fetchCategories()]);
  };

  const handleDeleteCollection = async (slug: string) => {
    if (!confirm("¿Está seguro de que desea eliminar esta coleccion?")) {
      return;
    }

    try {
      await deleteCollection(slug);
      setMessage({ type: "success", text: "Coleccion eliminada" });
      await Promise.all([fetchCollections(), fetchProducts()]);
    } catch (deleteError) {
      setMessage({
        type: "error",
        text:
          deleteError instanceof Error
            ? deleteError.message
            : "Error al eliminar coleccion",
      });
    }
  };

  const currentLoading =
    section === "products"
      ? loadingProducts
      : section === "categories"
        ? loadingCategories
        : loadingCollections;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar categories={activeCategories} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-black mb-2">
            Panel de Administración
          </h1>
          <p className="text-zinc-600">
            Gestiona productos, categorias y colecciones del catalogo.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {[
            { key: "products", label: "Productos" },
            { key: "categories", label: "Categorias" },
            { key: "collections", label: "Colecciones" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => {
                resetForms();
                setSection(item.key as AdminSection);
              }}
              className={`px-5 py-2 border text-xs uppercase tracking-[0.2em] transition-colors ${
                section === item.key
                  ? "border-black bg-black text-white"
                  : "border-zinc-300 text-zinc-700 hover:border-black"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {message ? (
          <div
            className={`mb-6 px-4 py-3 rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 px-4 py-3 rounded-lg border bg-red-50 border-red-200 text-red-700">
            {error}
          </div>
        ) : null}

        {section === "products" && !showProductForm && !editingProduct ? (
          <button
            onClick={() => setShowProductForm(true)}
            className="mb-8 bg-black text-white px-6 py-3 rounded hover:bg-black/90 transition-colors uppercase text-sm font-medium tracking-widest"
          >
            + Nuevo Producto
          </button>
        ) : null}

        {section === "categories" && !showCategoryForm && !editingCategory ? (
          <button
            onClick={() => setShowCategoryForm(true)}
            className="mb-8 bg-black text-white px-6 py-3 rounded hover:bg-black/90 transition-colors uppercase text-sm font-medium tracking-widest"
          >
            + Nueva Categoria
          </button>
        ) : null}

        {section === "collections" &&
        !showCollectionForm &&
        !editingCollection ? (
          <button
            onClick={() => setShowCollectionForm(true)}
            className="mb-8 bg-black text-white px-6 py-3 rounded hover:bg-black/90 transition-colors uppercase text-sm font-medium tracking-widest"
          >
            + Nueva Coleccion
          </button>
        ) : null}

        {section === "products" && (showProductForm || editingProduct) ? (
          <div className="mb-8 max-w-xl">
            <ProductForm
              initialData={editingProduct || undefined}
              categories={categories}
              collections={collections}
              onSubmit={
                editingProduct ? handleUpdateProduct : handleCreateProduct
              }
              onCancel={resetForms}
            />
          </div>
        ) : null}

        {section === "categories" && (showCategoryForm || editingCategory) ? (
          <div className="mb-8 max-w-xl">
            <CategoryForm
              initialData={editingCategory || undefined}
              onSubmit={
                editingCategory ? handleUpdateCategory : handleCreateCategory
              }
              onCancel={resetForms}
            />
          </div>
        ) : null}

        {section === "collections" &&
        (showCollectionForm || editingCollection) ? (
          <div className="mb-8 max-w-xl">
            <CollectionForm
              categories={categories}
              initialData={editingCollection || undefined}
              onSubmit={
                editingCollection
                  ? handleUpdateCollection
                  : handleCreateCollection
              }
              onCancel={resetForms}
            />
          </div>
        ) : null}

        {currentLoading ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">Cargando {section}...</p>
          </div>
        ) : null}

        {!currentLoading && section === "products" ? (
          products.length === 0 ? (
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
                      Categoria
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-black">
                      Coleccion
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
                      <td className="py-3 px-4 text-zinc-600">
                        {product.category}
                      </td>
                      <td className="py-3 px-4 text-zinc-500">
                        {product.collection || "Sin coleccion"}
                      </td>
                      <td className="py-3 px-4">
                        <img
                          src={normalizeImageUrl(product.image_url)}
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded border border-zinc-200"
                          onError={(event) => {
                            (event.target as HTMLImageElement).src = "";
                            (event.target as HTMLImageElement).alt =
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
          )
        ) : null}

        {!currentLoading && section === "categories" ? (
          categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-500">No hay categorias cargadas.</p>
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
                      Slug
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-black">
                      Orden
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
                  {categories.map((category) => (
                    <tr
                      key={category.slug}
                      className="border-b border-zinc-100"
                    >
                      <td className="py-3 px-4 text-black">{category.name}</td>
                      <td className="py-3 px-4 text-zinc-500">
                        {category.slug}
                      </td>
                      <td className="py-3 px-4 text-zinc-500">
                        {category.sortOrder}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            category.active
                              ? "bg-green-100 text-green-700"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {category.active ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingCategory(category)}
                            className="px-3 py-1 border border-black text-black rounded hover:bg-black/5 transition-colors text-xs font-medium uppercase"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.slug)}
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
          )
        ) : null}

        {!currentLoading && section === "collections" ? (
          collections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-500">No hay colecciones cargadas.</p>
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
                      Slug
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-black">
                      Categoria
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-black">
                      Orden
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
                  {collections.map((collection) => {
                    const category = categories.find(
                      (item) => item.slug === collection.categorySlug,
                    );

                    return (
                      <tr
                        key={collection.slug}
                        className="border-b border-zinc-100"
                      >
                        <td className="py-3 px-4 text-black">
                          {collection.name}
                        </td>
                        <td className="py-3 px-4 text-zinc-500">
                          {collection.slug}
                        </td>
                        <td className="py-3 px-4 text-zinc-600">
                          {category?.name || collection.categorySlug}
                        </td>
                        <td className="py-3 px-4 text-zinc-500">
                          {collection.sortOrder}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              collection.active
                                ? "bg-green-100 text-green-700"
                                : "bg-zinc-100 text-zinc-600"
                            }`}
                          >
                            {collection.active ? "Activa" : "Inactiva"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingCollection(collection)}
                              className="px-3 py-1 border border-black text-black rounded hover:bg-black/5 transition-colors text-xs font-medium uppercase"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteCollection(collection.slug)
                              }
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium uppercase"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : null}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Admin;
