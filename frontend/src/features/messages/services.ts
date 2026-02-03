"use server";

import { apiClient } from "@/lib/api-client";
import { getAccessToken } from "@/features/auth/services/auth";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { Message, MessageCreate, MessageOut } from "./types";

export const sendMessage = async (
  messageData: MessageCreate,
): Promise<MessageOut | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    return await apiClient<MessageOut>(API_ENDPOINTS.MESSAGES.BASE, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(messageData),
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:\n", error);
    return null;
  }
};

export const getSentMessages = async (
  limit: number = 20,
): Promise<MessageOut[]> => {
  const token = await getAccessToken();
  if (!token) return [];

  const url = `${API_ENDPOINTS.MESSAGES.SENT}?limit=${limit}`;

  try {
    return await apiClient<MessageOut[]>(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des messages envoyés:\n",
      error,
    );
    return [];
  }
};

export const getMyMessages = async (
  limit: number = 20,
): Promise<MessageOut[]> => {
  const token = await getAccessToken();
  if (!token) return [];

  const url = `${API_ENDPOINTS.MESSAGES.BASE}?limit=${limit}`;

  try {
    return await apiClient<MessageOut[]>(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:\n", error);
    return [];
  }
};

export const getDayMessage = async (): Promise<string | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    return await apiClient<string>(API_ENDPOINTS.MESSAGES.DAY, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du message du jour:\n",
      error,
    );
    return null;
  }
};
