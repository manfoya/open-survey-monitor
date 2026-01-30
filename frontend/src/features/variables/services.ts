"use server";

import { apiClient } from "@/lib/api-client";
import { getAccessToken } from "@/features/auth/services/auth";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { CreateVariableDataType, VariableDataType } from "./types";
import { PaginatedResponse, PaginationQuery } from "@/lib/api-types";


// Helper to handle empty tokens consistently
const getHeaders = async () => {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : null;
};

export const getVariables = async (params: PaginationQuery = {}): Promise<PaginatedResponse<VariableDataType>> => {
  const headers = await getHeaders();
  if (!headers) {
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

  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.size) searchParams.set('size', params.size.toString());
  if (params.sort_by) searchParams.set('sort_by', params.sort_by);
  if (params.sort_order) searchParams.set('sort_order', params.sort_order);
  if (params.search) searchParams.set('search', params.search);

  const url = `${API_ENDPOINTS.VARIABLES.BASE}?${searchParams.toString()}`;

  try {
    return await apiClient<PaginatedResponse<VariableDataType>>(url, { headers });
  } catch (error) {
    console.error("Erreur lors de la récupération des variables:", error);
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

export const getAllVariables = async (): Promise<VariableDataType[]> => {
  const headers = await getHeaders();
  if (!headers) return [];

  try {
    return await apiClient<VariableDataType[]>(API_ENDPOINTS.VARIABLES.ALL, { headers });
  } catch (error) {
    console.error("Erreur lors de la récupération de toutes les variables:", error);
    return [];
  }
};

export const getVariableById = async (id: number): Promise<VariableDataType | null> => {
  const headers = await getHeaders();
  if (!headers) return null;

  try {
    return await apiClient<VariableDataType>(API_ENDPOINTS.VARIABLES.BY_ID(id), { headers });
  } catch (error) {
    console.error(`Erreur lors de la récupération de la variable ${id}:`, error);
    return null;
  }
};

export const createVariable = async (
  data: CreateVariableDataType
): Promise<VariableDataType | null> => {
  const headers = await getHeaders();
  if (!headers) return null;

  return await apiClient<VariableDataType>(API_ENDPOINTS.VARIABLES.BASE, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
};

export const updateVariable = async (
  id: number,
  data: Partial<CreateVariableDataType>
): Promise<VariableDataType | null> => {
  const headers = await getHeaders();
  if (!headers) return null;

  return await apiClient<VariableDataType>(API_ENDPOINTS.VARIABLES.BY_ID(id), {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
};

export const deleteVariable = async (id: number): Promise<VariableDataType | null> => {
  const headers = await getHeaders();
  if (!headers) return null;

  return await apiClient<VariableDataType>(API_ENDPOINTS.VARIABLES.BY_ID(id), {
    method: "DELETE",
    headers,
  });
};

