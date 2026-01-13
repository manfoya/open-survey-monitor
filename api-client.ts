// @/app/lib/src/api-client.ts

import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

// 1. Définition de l'URL de base via les variables d'environnement
// Dans .env.local : NEXT_PUBLIC_API_URL=http://localhost:3000/api (si proxy) ou http://localhost:8000
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// 2. Création de l'instance Axios
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true, // Décommente si ton backend Python attend des cookies HttpOnly
  timeout: 10000, // Timeout après 10 secondes
});

// 3. Intercepteur de REQUÊTE (Request Interceptor)
// C'est ici qu'on injecte le token JWT automatiquement avant chaque appel
apiClient.interceptors.request.use(
  (config) => {
    // Si tu stockes le token en localStorage (méthode simple)
    // Note : Pour plus de sécurité, privilégie les Cookies HttpOnly gérés par le backend
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 4. Intercepteur de RÉPONSE (Response Interceptor)
// C'est ici qu'on gère les erreurs globales (ex: session expirée)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Gestion des erreurs spécifiques
    if (error.response) {
      // Cas 401 : Non autorisé (Token expiré ou invalide)
      if (error.response.status === 401) {
        // Ici, tu peux tenter un "Refresh Token" ou déconnecter l'utilisateur
        console.warn('Session expirée, redirection vers login...');
        if (typeof window !== 'undefined') {
            // Nettoyage et redirection
            localStorage.removeItem('access_token'); 
            window.location.href = '/login'; 
        }
      }
      
      // Cas 403 : Accès interdit
      if (error.response.status === 403) {
        console.error('Vous n\'avez pas les droits pour cette action.');
      }
      
      // Cas 500 : Erreur serveur Python
      if (error.response.status >= 500) {
        console.error('Erreur critique côté serveur Python.');
      }
    } else if (error.request) {
      // Le backend ne répond pas (ex: serveur éteint)
      console.error('Impossible de contacter le serveur.');
    }

    return Promise.reject(error);
  }
);

// Helper générique pour simplifier les appels dans les composants
// T = le type de la donnée attendue en retour
export const api = {
  get: <T>(url: string, params?: object) => 
    apiClient.get<T>(url, { params }).then((res) => res.data),

  post: <T>(url: string, data: any) => 
    apiClient.post<T>(url, data).then((res) => res.data),

  put: <T>(url: string, data: any) => 
    apiClient.put<T>(url, data).then((res) => res.data),

  delete: <T>(url: string) => 
    apiClient.delete<T>(url).then((res) => res.data),
};
