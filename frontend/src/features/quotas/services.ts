import { apiClient } from "@/lib/api-client";
import { CreateQuotaDTO, Quota } from "./types";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { getAccessToken } from "../auth/services/auth";

const getHeaders = async () => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("No token found");
  }
  return { Authorization: `Bearer ${token}` };
};

export async function createQuota(data: CreateQuotaDTO): Promise<Quota> {
  console.log(JSON.stringify(data));
  const headers = await getHeaders();

  return apiClient<Quota>(API_ENDPOINTS.QUOTAS.BASE, {
    method: "POST",
    body: JSON.stringify(data),
    headers: headers,
  });
}

export async function getQuotas(): Promise<Quota[]> {
  const headers = await getHeaders();
  return apiClient<Quota[]>(API_ENDPOINTS.QUOTAS.BASE, {
    headers: headers,
  });
}

export async function getQuotaById(id: number): Promise<Quota> {
  const headers = await getHeaders();
  return apiClient<Quota>(`${API_ENDPOINTS.QUOTAS.BASE}${id}`, {
    headers: headers,
  });
}

export async function updateQuota(
  id: number,
  data: Partial<CreateQuotaDTO>,
): Promise<Quota> {
  const headers = await getHeaders();

  return apiClient<Quota>(`${API_ENDPOINTS.QUOTAS.BASE}${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: headers,
  });
}

export async function deleteQuota(id: number): Promise<void> {
  const headers = await getHeaders();
  return apiClient<void>(`${API_ENDPOINTS.QUOTAS.BASE}${id}`, {
    method: "DELETE",
    headers: headers,
  });
}
