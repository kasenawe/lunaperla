import { getApiBaseUrl } from "../config/api";
import { AuthUser } from "../types";

const API_BASE_URL = getApiBaseUrl();
const CUSTOMER_TOKEN_KEY = "lunaperla_customer_token";

type AuthResponse = {
  accessToken?: string;
  tokenType?: string;
  expiresIn?: string;
  user?: AuthUser;
  error?: string;
};

type RegisterPayload = {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type UpdateProfilePayload = {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
};

function hasWindow() {
  return typeof window !== "undefined";
}

export function getCustomerToken() {
  if (!hasWindow()) {
    return null;
  }

  return window.localStorage.getItem(CUSTOMER_TOKEN_KEY);
}

export function setCustomerToken(token: string) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
}

export function clearCustomerToken() {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(CUSTOMER_TOKEN_KEY);
}

export function isCustomerAuthenticated() {
  return Boolean(getCustomerToken());
}

export function buildCustomerAuthHeaders(initHeaders?: HeadersInit) {
  const headers = new Headers(initHeaders || {});
  const token = getCustomerToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function parseAuthResponse(response: Response) {
  const data = (await response.json()) as AuthResponse;

  if (!response.ok) {
    throw new Error(data.error || "No se pudo completar la operación");
  }

  return data;
}

export async function registerCustomer(payload: RegisterPayload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseAuthResponse(response);

  if (data.accessToken) {
    setCustomerToken(data.accessToken);
  }

  return data.user || null;
}

export async function loginCustomer(payload: LoginPayload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseAuthResponse(response);

  if (data.accessToken) {
    setCustomerToken(data.accessToken);
  }

  return data.user || null;
}

export async function getCurrentCustomer() {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: buildCustomerAuthHeaders(),
  });

  if (response.status === 401) {
    clearCustomerToken();
  }

  const data = await parseAuthResponse(response);
  return data.user || null;
}

export async function updateCustomerProfile(payload: UpdateProfilePayload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: "PUT",
    headers: buildCustomerAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    clearCustomerToken();
  }

  const data = await parseAuthResponse(response);
  return data.user || null;
}
