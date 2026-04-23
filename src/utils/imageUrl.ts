const SUPABASE_STORAGE_BASE_URL =
  import.meta.env.VITE_SUPABASE_STORAGE_PUBLIC_BASE_URL?.trim() ?? "";

export function normalizeImageUrl(imageValue?: string): string {
  if (!imageValue) {
    return "";
  }

  if (/^https?:\/\//i.test(imageValue)) {
    return imageValue;
  }

  if (!SUPABASE_STORAGE_BASE_URL) {
    return imageValue;
  }

  const normalizedBase = SUPABASE_STORAGE_BASE_URL.replace(/\/$/, "");
  const normalizedPath = imageValue.replace(/^\//, "");
  return `${normalizedBase}/${normalizedPath}`;
}
