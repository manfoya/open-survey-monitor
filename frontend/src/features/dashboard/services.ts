"use server";

import { apiClient } from "@/lib/api-client";
import { getAccessToken } from "@/features/auth/services/auth";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { DashboardStats } from "./types";
import { generateDashboardStats } from "@/mockdata/dashboard";

export const getDashboardStats = async (): Promise<DashboardStats | null> => {
  // Simulation d'un délai réseau
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  // Retourner les données mockées pour le moment
  // TODO: Rétablir l'appel API quand le backend sera prêt
  return generateDashboardStats();
  
  /* 
  const token = await getAccessToken();
  if (!token) return null;

  try {
    return await apiClient<DashboardStats>(API_ENDPOINTS.STATS.DASHBOARD, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques du dashboard:", error);
    return null;
  }
  */
};
