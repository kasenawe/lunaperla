import { getApiBaseUrl } from "../config/api";

const API_BASE_URL = getApiBaseUrl();
const ADMIN_TOKEN_KEY = "lunaperla_admin_token";

type LoginResponse = {
  accessToken?: string;
  error?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

function hasWindow() {
  return typeof window !== "undefined";
}

export function getAdminToken() {
  if (!hasWindow()) {
    return null;
  }

  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function isAdminAuthenticated() {
  return Boolean(getAdminToken());
}

export function buildAuthHeaders(initHeaders?: HeadersInit) {
  const headers = new Headers(initHeaders || {});
  const token = getAdminToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

export async function loginAdmin(payload: LoginPayload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as LoginResponse;

  if (!response.ok || !data.accessToken) {
    throw new Error(data.error || "No se pudo iniciar sesión");
  }

  setAdminToken(data.accessToken);
  return data.accessToken;
}
