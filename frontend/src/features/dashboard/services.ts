"use server";

import { apiClient } from "@/lib/api-client";
import { getAccessToken } from "@/features/auth/services/auth";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { DashboardStats, SurveyListResponse, SurveyPoint } from "./types";
import { PaginationQuery } from "@/lib/api-types";

export const getDashboardStats = async (
  scope: "me" | "team" = "team",
): Promise<DashboardStats | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const url = `${API_ENDPOINTS.STATS.DASHBOARD}?scope=${scope}`;
    return await apiClient<DashboardStats>(url, {
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
  params: PaginationQuery & { scope?: "me" | "team" } = {
    page: "1",
    size: "10",
    sort_order: "asc",
    sort_by: "id",
    scope: "team",
  },
): Promise<SurveyListResponse | null> => {
  const {
    page = "1",
    size = "10",
    sort_order = "asc",
    sort_by = "id",
    scope = "team",
  } = params;
  const token = await getAccessToken();
  if (!token) return null;

  const queryParams = new URLSearchParams({
    page,
    size,
    sort_order,
    sort_by,
    scope,
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

export const getSurveysPoints = async (
  scope: "me" | "team" = "team",
): Promise<SurveyPoint[] | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const url = `${API_ENDPOINTS.SURVEYS.POINTS}?scope=${scope}`;
    return await apiClient<SurveyPoint[]>(url, {
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
