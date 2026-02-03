"use server";

import { apiClient } from "@/lib/api-client";
import { getAccessToken } from "@/features/auth/services/auth";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import {
  UserCreatePayload,
  UserProfile,
  UserRole,
} from "@/features/auth/types";
import { PaginatedResponse, PaginationQuery } from "@/lib/api-types";
import { Affectation } from "../affectations-zones/types";

export const getSubordinates = async (
  params: PaginationQuery = {},
): Promise<PaginatedResponse<UserProfile>> => {
  const token = await getAccessToken();
  if (!token) {
    return {
      items: [],
      meta: {
        current_page: 1,
        page_size: 50,
        total_items: 0,
        total_pages: 0,
      },
    };
  }

  // Construire les paramètres de requête
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page);
  if (params.size) searchParams.set("size", params.size);
  if (params.sort_by) searchParams.set("sort_by", params.sort_by);
  if (params.sort_order) searchParams.set("sort_order", params.sort_order);
  if (params.search) searchParams.set("search", params.search);

  const url = `${API_ENDPOINTS.USERS.BASE}?${searchParams.toString()}`;

  try {
    return await apiClient<PaginatedResponse<UserProfile>>(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:\n", error);
    return {
      items: [],
      meta: {
        current_page: Number(params.page) || 1,
        page_size: Number(params.size) || 50,
        total_items: 0,
        total_pages: 0,
      },
    };
  }
};

export const getAllSubordinates = async (): Promise<UserProfile[]> => {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    return await apiClient<UserProfile[]>(API_ENDPOINTS.USERS.ALL, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de tous les utilisateurs:\n",
      error,
    );
    return [];
  }
};

export const getUsersByRole = async (role: string): Promise<UserProfile[]> => {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    return await apiClient<UserProfile[]>(
      `${API_ENDPOINTS.USERS.ALL}?role=${role}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des contrôleurs:\n", error);
    return [];
  }
};

export const getAgents = async (): Promise<UserProfile[]> => {
  return getUsersByRole(UserRole.AGENT);
};

export const getControllers = async (): Promise<UserProfile[]> => {
  return getUsersByRole(UserRole.CONTROLEUR);
};

export const getUserById = async (id: number): Promise<UserProfile | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    return await apiClient<UserProfile>(`${API_ENDPOINTS.USERS.BASE}${id}`, {
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
  userData: UserCreatePayload,
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

  return await apiClient<UserProfile>(`${API_ENDPOINTS.USERS.BASE}${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(userData),
  });
};

export const deleteUser = async (id: number): Promise<UserProfile | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  return await apiClient<UserProfile>(`${API_ENDPOINTS.USERS.BASE}${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getUserZonesAffectations = async (): Promise<Affectation[]> => {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    return await apiClient<Affectation[]>(API_ENDPOINTS.AFFECTATIONS.BASE, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des affectations des zones:\n",
      error,
    );
    return [];
  }
};
