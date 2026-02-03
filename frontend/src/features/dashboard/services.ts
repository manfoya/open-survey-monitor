"use server";

import { apiClient } from "@/lib/api-client";
import { getAccessToken } from "@/features/auth/services/auth";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { DashboardStats, SurveyListResponse, SurveyPoint, SurveyStatus } from "./types";

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

export const getSurveys = async (params: {
  page?: number;
  size?: number;
  sort_order?: "asc" | "desc";
} = {}): Promise<SurveyListResponse | null> => {
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
  return MOCK_SURVEYS_POINTS;
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

const MOCK_SURVEYS_POINTS: SurveyPoint[] = [
  { id: 1, latitude: 9.3372, longitude: 2.6303, status: "complet" },
  { id: 2, latitude: 9.3400, longitude: 2.6320, status: "partiel" },
  { id: 3, latitude: 9.3350, longitude: 2.6280, status: "refus" },
  { id: 4, latitude: 9.3420, longitude: 2.6350, status: "complet" },
  { id: 5, latitude: 9.3320, longitude: 2.6250, status: "complet" },
  { id: 6, latitude: 9.3390, longitude: 2.6290, status: "partiel" },
  { id: 7, latitude: 9.3360, longitude: 2.6310, status: "complet" },
  { id: 8, latitude: 9.3410, longitude: 2.6330, status: "refus" },
  { id: 9, latitude: 9.3340, longitude: 2.6270, status: "partiel" },
  { id: 10, latitude: 9.3380, longitude: 2.6340, status: "complet" },
];
