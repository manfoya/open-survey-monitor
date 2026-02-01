"use server";

import { apiClient } from "@/lib/api-client";
import { getAccessToken } from "@/features/auth/services/auth";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import {
  QuotaAssignment,
  CreateQuotaAssignmentDTO,
  UpdateQuotaAssignmentDTO,
  BulkQuotaAssignmentDTO,
} from "./types";

const getHeaders = async () => {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : null;
};

export const createQuotaAssignment = async (
  data: CreateQuotaAssignmentDTO,
): Promise<QuotaAssignment | null> => {
  const headers = await getHeaders();
  if (!headers) return null;

  return apiClient<QuotaAssignment>(API_ENDPOINTS.QUOTAS.ASSIGNMENTS, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
};

export const updateQuotaAssignment = async (
  id: number,
  data: UpdateQuotaAssignmentDTO,
): Promise<QuotaAssignment | null> => {
  const headers = await getHeaders();
  if (!headers) return null;

  return apiClient<QuotaAssignment>(API_ENDPOINTS.QUOTAS.ASSIGNMENT_BY_ID(id), {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
};

export const deleteQuotaAssignment = async (id: number): Promise<void> => {
  const headers = await getHeaders();
  if (!headers) return;

  await apiClient(API_ENDPOINTS.QUOTAS.ASSIGNMENT_BY_ID(id), {
    method: "DELETE",
    headers,
  });
};

export const bulkAssignQuotas = async (
  data: BulkQuotaAssignmentDTO,
): Promise<QuotaAssignment[] | null> => {
  const headers = await getHeaders();
  if (!headers) return null;

  return apiClient<QuotaAssignment[]>(API_ENDPOINTS.QUOTAS.BULK_ASSIGNMENTS, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
};

export const getQuotaAssignments = async (
  active_only?: boolean,
): Promise<QuotaAssignment[]> => {
  const headers = await getHeaders();
  if (!headers) return [];

  const searchParams = new URLSearchParams();
  if (active_only) searchParams.set("active_only", "true");

  const url = `${API_ENDPOINTS.QUOTAS.ASSIGNMENTS}?${searchParams.toString()}`;

  try {
    return await apiClient<QuotaAssignment[]>(url, {
      headers,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des assignations de quotas:",
      error,
    );
    return [];
  }
};
