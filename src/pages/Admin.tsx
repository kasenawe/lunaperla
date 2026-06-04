import React, { useEffect, useMemo, useRef, useState } from "react";
import { getApiBaseUrl } from "../config/api";
import {
  BackendProduct,
  BackendProductVariant,
  Category,
  Collection,
} from "../types";
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
import {
  buildAuthHeaders,
  clearAdminToken,
  isAdminAuthenticated,
  loginAdmin,
} from "../services/adminAuthService";

const API_BASE_URL = getApiBaseUrl();

type AdminSection = "products" | "categories" | "collections";

type FlashMessage = {
  type: "success" | "error";
  text: string;
};

type VariantFormState = {
  id: string | null;
  sku: string;
  label: string;
  karat: string;
  width_mm: string;
  profile: string;
  closure_type: string;
  price: string;
  sort_order: string;
  active: boolean;
  metadata: string;
};

const EMPTY_VARIANT_FORM: VariantFormState = {
  id: null,
  sku: "",
  label: "",
  karat: "",
  width_mm: "",
  profile: "",
  closure_type: "",
  price: "",
  sort_order: "0",
  active: true,
  metadata: "{}",
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
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
  const [productVariants, setProductVariants] = useState<
    BackendProductVariant[]
  >([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [savingVariant, setSavingVariant] = useState(false);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [variantForm, setVariantForm] =
    useState<VariantFormState>(EMPTY_VARIANT_FORM);
  const productFormRef = useRef<HTMLDivElement | null>(null);
  const categoryFormRef = useRef<HTMLDivElement | null>(null);
  const collectionFormRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsAuthenticated(isAdminAuthenticated());
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoadingProducts(false);
      setLoadingCategories(false);
      setLoadingCollections(false);
      return;
    }

    void fetchProducts();
    void fetchCategories();
    void fetchCollections();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (section !== "products") {
      return;
    }

    if (!showProductForm && !editingProduct) {
      return;
    }

    const timer = window.setTimeout(() => {
      productFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [editingProduct, section, showProductForm]);

  useEffect(() => {
    if (section !== "products" || !editingProduct) {
      setProductVariants([]);
      setVariantError(null);
      setVariantForm(EMPTY_VARIANT_FORM);
      return;
    }

    void fetchProductVariants(editingProduct.id);
  }, [editingProduct, section]);

  useEffect(() => {
    if (section !== "categories") {
      return;
    }

    if (!showCategoryForm && !editingCategory) {
      return;
    }

    const timer = window.setTimeout(() => {
      categoryFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [editingCategory, section, showCategoryForm]);

  useEffect(() => {
    if (section !== "collections") {
      return;
    }

    if (!showCollectionForm && !editingCollection) {
      return;
    }

    const timer = window.setTimeout(() => {
      collectionFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [editingCollection, section, showCollectionForm]);

  const activeCategories = useMemo(
    () => categories.filter((category) => category.active),
    [categories],
  );

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/products?all=true`, {
        headers: buildAuthHeaders(),
      });

      if (response.status === 401) {
        clearAdminToken();
        setIsAuthenticated(false);
        setAuthError("Tu sesión expiró. Volvé a iniciar sesión.");
        return;
      }

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
    setProductVariants([]);
    setVariantError(null);
    setVariantForm(EMPTY_VARIANT_FORM);
  };

  const fetchProductVariants = async (productId: string) => {
    try {
      setLoadingVariants(true);
      setVariantError(null);

      const response = await fetch(
        `${API_BASE_URL}/api/products/${productId}/variants`,
        {
          headers: buildAuthHeaders(),
        },
      );

      if (response.status === 401) {
        clearAdminToken();
        setIsAuthenticated(false);
        setAuthError("Tu sesión expiró. Volvé a iniciar sesión.");
        return;
      }

      if (!response.ok) {
        throw new Error(
          await parseErrorMessage(response, "Error al cargar variantes"),
        );
      }

      const data: BackendProductVariant[] = await response.json();
      setProductVariants(data);
    } catch (fetchError) {
      setVariantError(
        fetchError instanceof Error
          ? fetchError.message
          : "Error al cargar variantes",
      );
      setProductVariants([]);
    } finally {
      setLoadingVariants(false);
    }
  };

  const startCreateVariant = () => {
    setVariantError(null);
    setVariantForm({
      ...EMPTY_VARIANT_FORM,
      price:
        editingProduct && Number.isFinite(Number(editingProduct.price))
          ? String(editingProduct.price)
          : "",
    });
  };

  const startEditVariant = (variant: BackendProductVariant) => {
    setVariantError(null);
    setVariantForm({
      id: variant.id,
      sku: variant.sku,
      label: variant.label,
      karat: variant.karat || "",
      width_mm:
        variant.width_mm === null || variant.width_mm === undefined
          ? ""
          : String(variant.width_mm),
      profile: variant.profile || "",
      closure_type: variant.closure_type || "",
      price: String(variant.price),
      sort_order: String(variant.sort_order ?? 0),
      active: variant.active,
      metadata: JSON.stringify(variant.metadata || {}, null, 2),
    });
  };

  const handleVariantFieldChange = (
    field: keyof VariantFormState,
    value: string | boolean,
  ) => {
    setVariantForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleVariantSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!editingProduct) {
      return;
    }

    try {
      setSavingVariant(true);
      setVariantError(null);

      let parsedMetadata: Record<string, unknown> = {};
      if (variantForm.metadata.trim()) {
        try {
          parsedMetadata = JSON.parse(variantForm.metadata);
        } catch {
          throw new Error("Metadata debe ser un JSON válido");
        }
      }

      const payload = {
        sku: variantForm.sku,
        label: variantForm.label,
        karat: variantForm.karat || null,
        width_mm: variantForm.width_mm.trim()
          ? Number(variantForm.width_mm)
          : null,
        profile: variantForm.profile || null,
        closure_type: variantForm.closure_type || null,
        price: Number(variantForm.price),
        sort_order: Number(variantForm.sort_order || 0),
        active: variantForm.active,
        metadata: parsedMetadata,
      };

      const isUpdate = Boolean(variantForm.id);
      const endpoint = isUpdate
        ? `${API_BASE_URL}/api/products/${editingProduct.id}/variants/${variantForm.id}`
        : `${API_BASE_URL}/api/products/${editingProduct.id}/variants`;

      const response = await fetch(endpoint, {
        method: isUpdate ? "PUT" : "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        clearAdminToken();
        setIsAuthenticated(false);
        throw new Error("Tu sesión expiró. Volvé a iniciar sesión.");
      }

      if (!response.ok) {
        throw new Error(
          await parseErrorMessage(
            response,
            isUpdate
              ? "Error al actualizar variante"
              : "Error al crear variante",
          ),
        );
      }

      setMessage({
        type: "success",
        text: isUpdate ? "Variante actualizada" : "Variante creada",
      });
      setVariantForm(EMPTY_VARIANT_FORM);
      await Promise.all([
        fetchProductVariants(editingProduct.id),
        fetchProducts(),
      ]);
    } catch (submitError) {
      setVariantError(
        submitError instanceof Error
          ? submitError.message
          : "Error al guardar variante",
      );
    } finally {
      setSavingVariant(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!editingProduct) {
      return;
    }

    if (!confirm("¿Está seguro de que desea eliminar esta variante?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/${editingProduct.id}/variants/${variantId}`,
        {
          method: "DELETE",
          headers: buildAuthHeaders(),
        },
      );

      if (response.status === 401) {
        clearAdminToken();
        setIsAuthenticated(false);
        throw new Error("Tu sesión expiró. Volvé a iniciar sesión.");
      }

      if (!response.ok) {
        throw new Error(
          await parseErrorMessage(response, "Error al eliminar variante"),
        );
      }

      setMessage({ type: "success", text: "Variante eliminada" });
      if (variantForm.id === variantId) {
        setVariantForm(EMPTY_VARIANT_FORM);
      }
      await Promise.all([
        fetchProductVariants(editingProduct.id),
        fetchProducts(),
      ]);
    } catch (deleteError) {
      setVariantError(
        deleteError instanceof Error
          ? deleteError.message
          : "Error al eliminar variante",
      );
    }
  };

  const handleCreateProduct = async (data: Omit<BackendProduct, "id">) => {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: buildAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      clearAdminToken();
      setIsAuthenticated(false);
      throw new Error("Tu sesión expiró. Volvé a iniciar sesión.");
    }

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
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
      },
    );

    if (response.status === 401) {
      clearAdminToken();
      setIsAuthenticated(false);
      throw new Error("Tu sesión expiró. Volvé a iniciar sesión.");
    }

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
        headers: buildAuthHeaders(),
      });

      if (response.status === 401) {
        clearAdminToken();
        setIsAuthenticated(false);
        throw new Error("Tu sesión expiró. Volvé a iniciar sesión.");
      }

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

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setAuthError(null);
      await loginAdmin(credentials);
      setCredentials({ username: "", password: "" });
      setIsAuthenticated(true);
    } catch (loginError) {
      setAuthError(
        loginError instanceof Error
          ? loginError.message
          : "No se pudo iniciar sesión",
      );
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    setIsAuthenticated(false);
    setProducts([]);
    setCategories([]);
    setCollections([]);
    setMessage(null);
    setError(null);
    resetForms();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <p className="text-zinc-600">Cargando panel admin...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar categories={[]} />
        <main className="flex-1 container mx-auto px-4 py-12 max-w-md w-full">
          <div className="border border-zinc-200 rounded-xl p-6">
            <h1 className="text-3xl font-serif font-bold text-black mb-2">
              Acceso Admin
            </h1>
            <p className="text-zinc-600 mb-6">
              Ingresá con tus credenciales para gestionar el catálogo.
            </p>

            {authError ? (
              <div className="mb-4 px-4 py-3 rounded-lg border bg-red-50 border-red-200 text-red-700">
                {authError}
              </div>
            ) : null}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Usuario
                </label>
                <input
                  type="text"
                  required
                  value={credentials.username}
                  onChange={(event) =>
                    setCredentials((prev) => ({
                      ...prev,
                      username: event.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={credentials.password}
                  onChange={(event) =>
                    setCredentials((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/50"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white px-6 py-3 rounded hover:bg-black/90 transition-colors uppercase text-sm font-medium tracking-widest"
              >
                Ingresar
              </button>
            </form>
          </div>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    );
  }

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
          <div className="mt-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-zinc-300 text-zinc-700 hover:border-black hover:text-black transition-colors uppercase text-xs tracking-[0.2em]"
            >
              Cerrar sesión
            </button>
          </div>
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
          <div ref={productFormRef} className="mb-8 max-w-xl scroll-mt-6">
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

        {section === "products" && editingProduct ? (
          <div className="mb-10 border border-zinc-200 rounded-xl p-5 bg-zinc-50">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-black">Variantes</h2>
                <p className="text-sm text-zinc-600">
                  Gestiona variantes para {editingProduct.name}
                </p>
              </div>
              <button
                type="button"
                onClick={startCreateVariant}
                className="px-4 py-2 border border-black text-black rounded hover:bg-black/5 transition-colors text-xs font-medium uppercase"
              >
                + Nueva Variante
              </button>
            </div>

            {variantError ? (
              <div className="mb-4 px-4 py-3 rounded-lg border bg-red-50 border-red-200 text-red-700 text-sm">
                {variantError}
              </div>
            ) : null}

            {loadingVariants ? (
              <p className="text-sm text-zinc-500 mb-4">
                Cargando variantes...
              </p>
            ) : (
              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
                  <thead>
                    <tr className="border-b border-zinc-200">
                      <th className="text-left py-2 px-3 text-xs uppercase tracking-[0.15em] text-zinc-600">
                        SKU
                      </th>
                      <th className="text-left py-2 px-3 text-xs uppercase tracking-[0.15em] text-zinc-600">
                        Etiqueta
                      </th>
                      <th className="text-left py-2 px-3 text-xs uppercase tracking-[0.15em] text-zinc-600">
                        Kilataje
                      </th>
                      <th className="text-left py-2 px-3 text-xs uppercase tracking-[0.15em] text-zinc-600">
                        Mm
                      </th>
                      <th className="text-left py-2 px-3 text-xs uppercase tracking-[0.15em] text-zinc-600">
                        Precio
                      </th>
                      <th className="text-left py-2 px-3 text-xs uppercase tracking-[0.15em] text-zinc-600">
                        Orden
                      </th>
                      <th className="text-left py-2 px-3 text-xs uppercase tracking-[0.15em] text-zinc-600">
                        Estado
                      </th>
                      <th className="text-left py-2 px-3 text-xs uppercase tracking-[0.15em] text-zinc-600">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {productVariants.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-4 px-3 text-sm text-zinc-500"
                        >
                          Este producto todavía no tiene variantes.
                        </td>
                      </tr>
                    ) : (
                      productVariants.map((variant) => (
                        <tr
                          key={variant.id}
                          className="border-b border-zinc-100"
                        >
                          <td className="py-2 px-3 font-mono text-xs text-zinc-700">
                            {variant.sku}
                          </td>
                          <td className="py-2 px-3 text-sm text-black">
                            {variant.label}
                          </td>
                          <td className="py-2 px-3 text-sm text-zinc-600">
                            {variant.karat || "-"}
                          </td>
                          <td className="py-2 px-3 text-sm text-zinc-600">
                            {variant.width_mm ?? "-"}
                          </td>
                          <td className="py-2 px-3 text-sm text-black font-medium">
                            ${variant.price}
                          </td>
                          <td className="py-2 px-3 text-sm text-zinc-600">
                            {variant.sort_order ?? 0}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                variant.active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-zinc-100 text-zinc-600"
                              }`}
                            >
                              {variant.active ? "Activa" : "Inactiva"}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEditVariant(variant)}
                                className="px-2 py-1 border border-black text-black rounded hover:bg-black/5 transition-colors text-[11px] font-medium uppercase"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteVariant(variant.id)}
                                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-[11px] font-medium uppercase"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <form
              onSubmit={handleVariantSubmit}
              className="grid gap-3 md:grid-cols-2"
            >
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-zinc-600 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  required
                  value={variantForm.sku}
                  onChange={(event) =>
                    handleVariantFieldChange("sku", event.target.value)
                  }
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-zinc-600 mb-1">
                  Etiqueta
                </label>
                <input
                  type="text"
                  required
                  value={variantForm.label}
                  onChange={(event) =>
                    handleVariantFieldChange("label", event.target.value)
                  }
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-zinc-600 mb-1">
                  Kilataje
                </label>
                <input
                  type="text"
                  value={variantForm.karat}
                  onChange={(event) =>
                    handleVariantFieldChange("karat", event.target.value)
                  }
                  placeholder="10K / 18K"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-zinc-600 mb-1">
                  Ancho (mm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={variantForm.width_mm}
                  onChange={(event) =>
                    handleVariantFieldChange("width_mm", event.target.value)
                  }
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-zinc-600 mb-1">
                  Perfil
                </label>
                <input
                  type="text"
                  value={variantForm.profile}
                  onChange={(event) =>
                    handleVariantFieldChange("profile", event.target.value)
                  }
                  placeholder="bombe / doble_bombe"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-zinc-600 mb-1">
                  Cierre
                </label>
                <input
                  type="text"
                  value={variantForm.closure_type}
                  onChange={(event) =>
                    handleVariantFieldChange("closure_type", event.target.value)
                  }
                  placeholder="rosca / pasante"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-zinc-600 mb-1">
                  Precio
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={variantForm.price}
                  onChange={(event) =>
                    handleVariantFieldChange("price", event.target.value)
                  }
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-zinc-600 mb-1">
                  Orden
                </label>
                <input
                  type="number"
                  step="1"
                  value={variantForm.sort_order}
                  onChange={(event) =>
                    handleVariantFieldChange("sort_order", event.target.value)
                  }
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-[0.15em] text-zinc-600 mb-1">
                  Metadata (JSON)
                </label>
                <textarea
                  rows={4}
                  value={variantForm.metadata}
                  onChange={(event) =>
                    handleVariantFieldChange("metadata", event.target.value)
                  }
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md font-mono text-xs"
                />
              </div>

              <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={variantForm.active}
                    onChange={(event) =>
                      handleVariantFieldChange("active", event.target.checked)
                    }
                    className="h-4 w-4"
                  />
                  Variante activa
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setVariantForm(EMPTY_VARIANT_FORM)}
                    className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded hover:border-black hover:text-black transition-colors text-xs font-medium uppercase"
                  >
                    Limpiar
                  </button>
                  <button
                    type="submit"
                    disabled={savingVariant}
                    className="px-4 py-2 bg-black text-white rounded hover:bg-black/90 transition-colors text-xs font-medium uppercase disabled:opacity-60"
                  >
                    {savingVariant
                      ? "Guardando..."
                      : variantForm.id
                        ? "Actualizar Variante"
                        : "Crear Variante"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : null}

        {section === "categories" && (showCategoryForm || editingCategory) ? (
          <div ref={categoryFormRef} className="mb-8 max-w-xl scroll-mt-6">
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
          <div ref={collectionFormRef} className="mb-8 max-w-xl scroll-mt-6">
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
                      Codigo
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
                      <td className="py-3 px-4 text-zinc-600 font-mono">
                        {product.product_code || "-"}
                      </td>
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
