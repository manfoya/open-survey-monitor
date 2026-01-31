"use server";

import { apiClient } from "@/lib/api-client";
import { getAccessToken } from "@/features/auth/services/auth";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { DashboardStats } from "./types";

export const getDashboardStats = async (): Promise<DashboardStats | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    return await apiClient<DashboardStats>(API_ENDPOINTS.STATS.DASHBOARD, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques du dashboard:",
      error,
    );
    return null;
  }
};
