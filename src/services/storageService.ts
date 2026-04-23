import { BACKEND_URL, BACKEND_URL_LOCAL } from "../constants";

type UploadImageResponse = {
  image_url?: string;
  error?: string;
};

// Automatically detect backend URL based on environment
const getBackendUrl = () => {
  // In development: use localhost, in production: use Vercel URL
  return import.meta.env.DEV ? BACKEND_URL_LOCAL : BACKEND_URL;
};

export async function uploadProductImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecciona un archivo de imagen valido");
  }

  const maxSizeBytes = 5 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error("La imagen debe pesar menos de 5MB");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${getBackendUrl()}/api/upload-image`, {
    method: "POST",
    body: formData,
  });

  const result = (await response.json()) as UploadImageResponse;
  if (!response.ok) {
    throw new Error(result.error || "Error al subir imagen");
  }

  if (!result.image_url) {
    throw new Error("No se recibio la ruta de imagen desde el backend");
  }

  return result.image_url;
}
