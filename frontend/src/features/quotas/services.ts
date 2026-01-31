import { apiClient } from "@/lib/api-client";
import { CreateQuotaDTO, Quota } from "./types";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

export async function createQuota(data: CreateQuotaDTO): Promise<Quota> {
  return apiClient<Quota>(API_ENDPOINTS.QUOTAS.BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getQuotas(): Promise<Quota[]> {
  // This assumes a list endpoint exists, typically needed for index pages
  // Adjust endpoint as needed if it differs
  return apiClient<Quota[]>(API_ENDPOINTS.QUOTAS.BASE);
}

export async function getQuotaById(id: number): Promise<Quota> {
  return apiClient<Quota>(`${API_ENDPOINTS.QUOTAS.BASE}/${id}`);
}
