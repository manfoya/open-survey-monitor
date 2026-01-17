"use server";

import { apiClient } from "@/lib/api-client";
import { getAccessToken } from "@/features/auth/services/auth";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { UserProfile } from "@/features/auth/types";

export const getSubordinates = async (): Promise<UserProfile[]> => {
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

export const getUserById = async (id: number): Promise<UserProfile | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    return await apiClient<UserProfile>(`${API_ENDPOINTS.USERS.BASE}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de l'utilisateur avec l'ID ${id}:\n`,
      error,
    );
    return null;
  }
};

export const postUser = async (
  userData: Omit<UserProfile, "id">,
): Promise<UserProfile | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  return await apiClient<UserProfile>(API_ENDPOINTS.USERS.BASE, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(userData),
  });
};

export const updateUser = async (
  id: number,
  userData: Partial<Omit<UserProfile, "id">>,
): Promise<UserProfile | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  return await apiClient<UserProfile>(`${API_ENDPOINTS.USERS.BASE}/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(userData),
  });
};

export const deleteUser = async (id: number): Promise<UserProfile | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  return await apiClient<UserProfile>(`${API_ENDPOINTS.USERS.BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};
