"use server";

import { apiClient } from "@/lib/api-client";
import { GlobalSettings } from "./types";
import { getAccessToken } from "../auth/services/auth";

export async function getGlobalSettings(): Promise<GlobalSettings> {
  const token = await getAccessToken();
  return apiClient<GlobalSettings>("/settings", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateGlobalSettings(
  settings: Omit<GlobalSettings, "id">,
): Promise<GlobalSettings> {
  const token = await getAccessToken();
  return apiClient<GlobalSettings>("/settings", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(settings),
  });
}

export async function getTables(): Promise<string[]> {
  const token = await getAccessToken();
  return apiClient<string[]>("/settings/tables", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}
