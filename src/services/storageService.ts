import { getApiBaseUrl } from "../config/api";
import { buildAuthHeaders, clearAdminToken } from "./adminAuthService";

type UploadTokenResponse = {
  signed_url?: string;
  path?: string;
  public_url?: string;
  error?: string;
};

const API_BASE_URL = getApiBaseUrl();

// El upload se hace en dos pasos para evitar el limite de payload de Vercel
// (4.5 MB en funciones serverless):
//   1. El backend genera una signed URL de Supabase Storage (request ~100 bytes).
//   2. El frontend sube el binario directamente a Supabase usando esa URL.
//      El archivo nunca pasa por la funcion serverless de Vercel.
export async function uploadProductImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecciona un archivo de imagen valido");
  }

  // Step 1: Request a signed upload URL from the backend.
  const tokenResponse = await fetch(`${API_BASE_URL}/api/upload-image-token`, {
    method: "POST",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ filename: file.name, content_type: file.type }),
  });

  if (tokenResponse.status === 401) {
    clearAdminToken();
    throw new Error("Tu sesion expiro. Volve a iniciar sesion.");
  }

  const tokenData = (await tokenResponse.json()) as UploadTokenResponse;
  if (!tokenResponse.ok) {
    throw new Error(tokenData.error || "Error al obtener URL de subida");
  }

  if (!tokenData.signed_url || !tokenData.path) {
    throw new Error("Respuesta invalida del servidor al generar URL de subida");
  }

  // Step 2: PUT the binary directly to Supabase Storage (bypasses Vercel).
  const uploadResponse = await fetch(tokenData.signed_url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadResponse.ok) {
    let detail = "";
    try {
      const errorBody = (await uploadResponse.json()) as { message?: string };
      detail = errorBody.message ? `: ${errorBody.message}` : "";
    } catch {
      // ignore parse error
    }
    throw new Error(`Error al subir imagen a Supabase${detail}`);
  }

  return tokenData.path;
}
