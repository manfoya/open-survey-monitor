import { apiClient } from "@/lib/api-client";
import { LoginResponse } from "@/features/auth/types";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

export async function apiLogin(formData: FormData): Promise<LoginResponse> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  // Construction du corps au format x-www-form-urlencoded (exigé par OAuth2 / FastAPI)
  const body = new URLSearchParams();
  body.append("grant_type", "password"); // Valeur par défaut pour le flow password
  body.append("username", username);
  body.append("password", password);
  body.append("scope", "");

  return apiClient<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
    method: "POST",
    // On écrase le JSON par défaut de l'api-client
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
}