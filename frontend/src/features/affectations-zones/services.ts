"use server";

import { apiClient } from "@/lib/api-client";
import { getAccessToken } from "@/features/auth/services/auth";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { Affectation, CreateAffectationDTO } from "./types";
import { PaginatedResponse, PaginationQuery } from "@/lib/api-types";

const getHeaders = async () => {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : null;
};

export const createAffectation = async (
  data: CreateAffectationDTO,
): Promise<Affectation | null> => {
  const headers = await getHeaders();
  if (!headers) return null;

  return await apiClient<Affectation>(API_ENDPOINTS.AFFECTATIONS.BASE, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
};

export const getAffectationById = async (
  id: number,
): Promise<Affectation | null> => {
  const headers = await getHeaders();
  if (!headers) return null;

  try {
    return await apiClient<Affectation>(API_ENDPOINTS.AFFECTATIONS.BY_ID(id), {
      headers,
    });
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de l'affectation ${id}:`,
      error,
    );
    return null;
  }
};

export const updateAffectation = async (
  id: number,
  data: Partial<CreateAffectationDTO>,
): Promise<Affectation | null> => {
  const headers = await getHeaders();
  if (!headers) return null;

  return await apiClient<Affectation>(API_ENDPOINTS.AFFECTATIONS.BY_ID(id), {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
};

export const deleteAffectation = async (id: number): Promise<void> => {
  const headers = await getHeaders();
  if (!headers) return;

  await apiClient(API_ENDPOINTS.AFFECTATIONS.BY_ID(id), {
    method: "DELETE",
    headers,
  });
};

export const getAffectations = async (
  query?: string,
  active_only?: boolean,
): Promise<Affectation[]> => {
  const headers = await getHeaders();
  if (!headers) {
    return [];
  }

  const searchParams = new URLSearchParams();
  if (query) searchParams.set("search", query);
  if (active_only) searchParams.set("active_only", "true");

  const url = `${API_ENDPOINTS.AFFECTATIONS.BASE}?${searchParams.toString()}`;

  try {
    return await apiClient<Affectation[]>(url, {
      headers,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des affectations:", error);
    return [];
  }
};

export const getAffectationsById = async (
  id: number,
): Promise<Affectation[]> => {
  const headers = await getHeaders();
  if (!headers) return [];

  try {
    return await apiClient<Affectation[]>(
      API_ENDPOINTS.AFFECTATIONS.BY_USER_ID(id),
      {
        headers,
      },
    );
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de l'affectation ${id}:`,
      error,
    );
    return [];
  }
};
