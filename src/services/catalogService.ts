import { BACKEND_URL, DEFAULT_CATEGORIES } from "../constants";
import { Category, Collection } from "../types";

const API_BASE_URL = import.meta.env.DEV ? "" : BACKEND_URL;

type ApiErrorResponse = {
  error?: string;
};

type CategoryApiItem = {
  slug?: string;
  name?: string;
  description?: string;
  active?: boolean;
  sort_order?: number;
};

type CollectionApiItem = {
  slug?: string;
  name?: string;
  description?: string;
  category_slug?: string;
  active?: boolean;
  sort_order?: number;
};

export type CategoryPayload = Pick<
  Category,
  "slug" | "name" | "description" | "active" | "sortOrder"
>;

export type CollectionPayload = Pick<
  Collection,
  "slug" | "name" | "description" | "categorySlug" | "active" | "sortOrder"
>;

function mapCategory(item: CategoryApiItem, index = 0): Category | null {
  if (!item.slug || !item.name) {
    return null;
  }

  return {
    slug: item.slug,
    name: item.name,
    description: item.description ?? "",
    active: item.active ?? true,
    sortOrder: item.sort_order ?? index,
  };
}

function mapCollection(item: CollectionApiItem, index = 0): Collection | null {
  if (!item.slug || !item.name || !item.category_slug) {
    return null;
  }

  return {
    slug: item.slug,
    name: item.name,
    description: item.description ?? "",
    categorySlug: item.category_slug,
    active: item.active ?? true,
    sortOrder: item.sort_order ?? index,
  };
}

async function parseError(response: Response) {
  try {
    const data = (await response.json()) as ApiErrorResponse;
    return data.error || `HTTP error: ${response.status}`;
  } catch {
    return `HTTP error: ${response.status}`;
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function getCategories(options?: {
  includeAll?: boolean;
}): Promise<Category[]> {
  try {
    const search = options?.includeAll ? "?all=true" : "";
    const data = await requestJson<CategoryApiItem[]>(
      `/api/categories${search}`,
    );
    const mapped = data
      .map((item, index) => mapCategory(item, index))
      .filter((item): item is Category => item !== null);

    return mapped.length > 0
      ? mapped
      : DEFAULT_CATEGORIES.map((item, index) => ({
          ...item,
          active: true,
          sortOrder: index,
        }));
  } catch {
    return DEFAULT_CATEGORIES.map((item, index) => ({
      ...item,
      active: true,
      sortOrder: index,
    }));
  }
}

export async function getCollections(options?: {
  includeAll?: boolean;
  categorySlug?: string;
}): Promise<Collection[]> {
  const params = new URLSearchParams();

  if (options?.includeAll) {
    params.set("all", "true");
  }

  if (options?.categorySlug) {
    params.set("category_slug", options.categorySlug);
  }

  const search = params.toString();
  const data = await requestJson<CollectionApiItem[]>(
    `/api/collections${search ? `?${search}` : ""}`,
  );

  return data
    .map((item, index) => mapCollection(item, index))
    .filter((item): item is Collection => item !== null);
}

export async function createCategory(payload: CategoryPayload) {
  return requestJson<CategoryApiItem>("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slug: payload.slug,
      name: payload.name,
      description: payload.description,
      active: payload.active,
      sort_order: payload.sortOrder,
    }),
  });
}

export async function updateCategory(
  currentSlug: string,
  payload: CategoryPayload,
) {
  return requestJson<CategoryApiItem>(`/api/categories/${currentSlug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slug: payload.slug,
      name: payload.name,
      description: payload.description,
      active: payload.active,
      sort_order: payload.sortOrder,
    }),
  });
}

export async function deleteCategory(slug: string) {
  return requestJson<void>(`/api/categories/${slug}`, {
    method: "DELETE",
  });
}

export async function createCollection(payload: CollectionPayload) {
  return requestJson<CollectionApiItem>("/api/collections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slug: payload.slug,
      name: payload.name,
      description: payload.description,
      category_slug: payload.categorySlug,
      active: payload.active,
      sort_order: payload.sortOrder,
    }),
  });
}

export async function updateCollection(
  currentSlug: string,
  payload: CollectionPayload,
) {
  return requestJson<CollectionApiItem>(`/api/collections/${currentSlug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slug: payload.slug,
      name: payload.name,
      description: payload.description,
      category_slug: payload.categorySlug,
      active: payload.active,
      sort_order: payload.sortOrder,
    }),
  });
}

export async function deleteCollection(slug: string) {
  return requestJson<void>(`/api/collections/${slug}`, {
    method: "DELETE",
  });
}
