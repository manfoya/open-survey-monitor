"use server";

import { apiClient } from "@/lib/api-client";
import { getAccessToken } from "@/features/auth/services/auth";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { QuotaAssignment } from "./types";

const getHeaders = async () => {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : null;
};

export const getQuotaAssignments = async (): Promise<QuotaAssignment[]> => {
  const headers = await getHeaders();
  if (!headers) return [];

  try {
    return await apiClient<QuotaAssignment[]>(
      API_ENDPOINTS.QUOTAS.ASSIGNMENTS,
      {
        headers,
      }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des assignations de quotas:", error);
    return [];
  }
};
