"use server";

import { apiClient } from "@/lib/api-client";
import { getAccessToken } from "@/features/auth/services/auth";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { DashboardStats, SurveyListResponse, SurveyPoint } from "./types";

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

export const getSurveys = async (
  params: {
    page?: number;
    size?: number;
    sort_order?: "asc" | "desc";
  } = {},
): Promise<SurveyListResponse | null> => {
  const { page = 1, size = 50, sort_order = "asc" } = params;
  const token = await getAccessToken();
  if (!token) return null;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort_order,
  });

  try {
    return await apiClient<SurveyListResponse>(
      `${API_ENDPOINTS.SURVEYS.BASE}?${queryParams.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des enquêtes:", error);
    return null;
  }
};

export const getSurveysPoints = async (): Promise<SurveyPoint[] | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    return await apiClient<SurveyPoint[]>(API_ENDPOINTS.SURVEYS.POINTS, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des points des enquêtes:",
      error,
    );
    return null;
  }
};
