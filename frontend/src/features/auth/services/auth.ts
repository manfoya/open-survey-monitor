"use server";

import { cache } from "react";
import { apiClient, ApiError } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { cookies } from "next/headers";
import { UserProfile } from "../types";


export const isUserLoggedIn = async (): Promise<boolean> => {
  //! Si une route /auth/check-session/ existe côté backend, on pourrait l'utiliser ici.
  const user = await getMe();
  return user !== null;
};

export const getAccessToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return token || null;
};

// On enveloppe la fonction dans cache()
// Next.js va mémoriser le résultat pour TOUTE la durée d'une seule requête HTTP.
export const getMe = cache(async (): Promise<UserProfile | null> => {
  const token = await getAccessToken();

  if (!token) return null;

  try {
    return await apiClient<UserProfile>(API_ENDPOINTS.AUTH.ME, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      // Le token est invalide/expiré côté Backend
      console.warn("[WARNING] Token invalide/expiré détecté.");
    } // Ne devrait pas arriver si bien géré
    return null;
  }
});
