"use server";

import { apiClient } from "@/lib/api-client";
import { getAccessToken } from "@/features/auth/services/auth";
import { Zone, CreateZoneData, UpdateZoneData } from "./types";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { PaginatedResponse, PaginationQuery } from "@/lib/api-types";

export const getZones = async (params: PaginationQuery = {}): Promise<PaginatedResponse<Zone>> => {
  const token = await getAccessToken();
  if (!token) {
    return {
      items: [],
      meta: {
        current_page: 1,
        page_size: 50,
        total_items: 0,
        total_pages: 0,
      }
    };
  }

  // Construire les paramètres de requête
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page);
  if (params.size) searchParams.set('size', params.size);
  if (params.sort_by) searchParams.set('sort_by', params.sort_by);
  if (params.sort_order) searchParams.set('sort_order', params.sort_order);
  if (params.search) searchParams.set('search', params.search);

  const url = `${API_ENDPOINTS.ZONES.BASE}?${searchParams.toString()}`;

  try {
    return await apiClient<PaginatedResponse<Zone>>(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des zones:\n", error);
    return {
      items: [],
      meta: {
        current_page: Number(params.page) || 1,
        page_size: Number(params.size) || 50,
        total_items: 0,
        total_pages: 0,
      }
    };
  }
};

export const getAllZones = async (): Promise<Zone[]> => {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    return await apiClient<Zone[]>(API_ENDPOINTS.ZONES.ALL, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de toutes les zones:\n", error);
    return [];
  }
}

export const getZoneById = async (id: number): Promise<Zone | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    return await apiClient<Zone>(API_ENDPOINTS.ZONES.BY_ID(id), {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de la zone avec l'ID ${id}:\n`,
      error,
    );
    return null;
  }
};

export const postZone = async (
  zoneData: CreateZoneData,
): Promise<Zone | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  return await apiClient<Zone>(API_ENDPOINTS.ZONES.BASE, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(zoneData),
  });
};

export const updateZone = async (
  id: number,
  zoneData: UpdateZoneData,
): Promise<Zone | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  return await apiClient<Zone>(API_ENDPOINTS.ZONES.BY_ID(id), {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(zoneData),
  });
};

export const deleteZone = async (id: number): Promise<Zone | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  return await apiClient<Zone>(API_ENDPOINTS.ZONES.BY_ID(id), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};
