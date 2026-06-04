const DEFAULT_PROD_API_BASE_URL = "https://lunaperla-backend.vercel.app";

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, "");
}

export function getApiBaseUrl() {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  // In local dev we keep relative API calls to leverage Vite proxy (/api -> localhost:3001).
  if (!envBaseUrl && import.meta.env.DEV) {
    return "";
  }

  return normalizeBaseUrl(envBaseUrl || DEFAULT_PROD_API_BASE_URL);
}
