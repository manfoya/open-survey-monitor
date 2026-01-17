"use server";

import { apiClient } from "@/lib/api-client";
import { getAccessToken } from "@/features/auth/services/auth";
import { Zone, CreateZoneData, UpdateZoneData } from "./types";

export const getZones = async (skip: number = 0, limit: number = 100): Promise<Zone[]> => {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const url = `/maps/zones/?skip=${skip}&limit=${limit}`;
    return await apiClient<Zone[]>(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des zones:\n", error);
    return [];
  }
};

export const getZoneById = async (id: number): Promise<Zone | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    return await apiClient<Zone>(`/maps/zones/${id}`, {
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

  return await apiClient<Zone>("/maps/zones/", {
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

  return await apiClient<Zone>(`/maps/zones/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(zoneData),
  });
};

export const deleteZone = async (id: number): Promise<Zone | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  return await apiClient<Zone>(`/maps/zones/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};