// On server-side, we use the internal Docker URL (API_URL)
// On client-side, we use the public URL (NEXT_PUBLIC_API_URL)
const IS_SERVER = typeof window === "undefined";
const API_URL = IS_SERVER
  ? process.env.API_URL || "http://localhost:8000/api/v1"
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public detail?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiClient<T>(
  endpoint: string,
  { params, ...customConfig }: FetchOptions = {},
): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...customConfig.headers,
  };

  // Gestion des Query Params si besoin
  const searchParams = params ? `?${new URLSearchParams(params)}` : "";
  const url = `${API_URL}${endpoint}${searchParams}`;

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  if (process.env.NODE_ENV === "development") {
    console.log(`[API Request] ${config.method || "GET"} ${url}`);
  }

  try {
    const response = await fetch(url, config);

    // On gère les erreurs HTTP (4xx, 5xx)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // On jette une erreur riche avec le status code
      throw new ApiError(
        response.status,
        errorData.detail || "Une erreur est survenue",
        errorData,
      );
    }

    // Si pas de contenu (204 No Content), on évite le crash du .json()
    if (response.status === 204) return {} as T;

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;

    // Log centralisé ou monitoring
    console.error(`[API Client Error] ${url}:`, error);

    // Erreur réseau (serveur éteint, DNS, etc.)
    throw new ApiError(503, "Le serveur de monitoring est injoignable.");
  }
}
