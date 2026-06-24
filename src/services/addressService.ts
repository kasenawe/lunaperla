import { getApiBaseUrl } from "../config/api";
import { Address } from "../types";
import {
  buildCustomerAuthHeaders,
  clearCustomerToken,
} from "./customerAuthService";

const API_BASE_URL = getApiBaseUrl();

type AddressApiResponse = Address | { error?: string };

export type AddressPayload = {
  label: string;
  recipient_name: string;
  phone: string;
  street: string;
  number: string;
  apartment: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

async function parseError(response: Response) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || `HTTP error: ${response.status}`;
  } catch {
    return `HTTP error: ${response.status}`;
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: buildCustomerAuthHeaders(init?.headers),
  });

  if (response.status === 401) {
    clearCustomerToken();
  }

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function getAddresses() {
  return requestJson<Address[]>("/api/addresses");
}

export async function createAddress(payload: AddressPayload) {
  return requestJson<AddressApiResponse>("/api/addresses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateAddress(
  addressId: string,
  payload: AddressPayload,
) {
  return requestJson<AddressApiResponse>(`/api/addresses/${addressId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function setDefaultAddress(addressId: string) {
  return requestJson<AddressApiResponse>(
    `/api/addresses/${addressId}/default`,
    {
      method: "PUT",
    },
  );
}

export async function deleteAddress(addressId: string) {
  return requestJson<void>(`/api/addresses/${addressId}`, {
    method: "DELETE",
  });
}
