"use server";

import { apiClient } from "@/lib/api-client";
import { getAccessToken, UserProfile } from "../auth/services/auth";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

export const getUsers = async (): Promise<UserProfile[]> => {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    return await apiClient<UserProfile[]>(API_ENDPOINTS.USERS.BASE, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:\n", error);
    return [];
  }
};

export const postUser = async (
  userData: Omit<UserProfile, "id">
): Promise<UserProfile | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  return await apiClient<UserProfile>(API_ENDPOINTS.USERS.BASE, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(userData),
  });
};
