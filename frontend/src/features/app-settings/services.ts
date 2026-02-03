"use server";

import { apiClient } from "@/lib/api-client";
import { GlobalSettings } from "./types";
import { getAccessToken } from "../auth/services/auth";

import { API_ENDPOINTS } from "@/lib/api-endpoints";

export async function getGlobalSettings(): Promise<GlobalSettings> {
  const token = await getAccessToken();
  return apiClient<GlobalSettings>(API_ENDPOINTS.SETTINGS.BASE, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateGlobalSettings(
  settings: Omit<GlobalSettings, "id">,
): Promise<GlobalSettings> {
  const token = await getAccessToken();
  return apiClient<GlobalSettings>(API_ENDPOINTS.SETTINGS.BASE, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(settings),
  });
}

export async function getTables(): Promise<string[]> {
  const token = await getAccessToken();
  return apiClient<string[]>(API_ENDPOINTS.SETTINGS.TABLES, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}
