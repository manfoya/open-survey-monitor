export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    ME: "/users/me",
  },
  USERS: {
    BASE: "/users/",
    ALL: "/users/all",
    BY_ID: (id: number) => `/users/${id}`,
  },
  ZONES: {
    BASE: "/maps/zones/",
    ALL: "/maps/zones/all",
    BY_ID: (id: number) => `/maps/zones/${id}`,
  },
  VARIABLES: {
    BASE: "/variables/",
    ALL: "/variables/all",
    BY_ID: (id: number) => `/variables/${id}`, // ID is uuid? or number?
  },
  SETTINGS: {
    GLOBAL: "/api/global-settings",
  },
  STATS: {
    DASHBOARD: "/stats/dashboard",
  },
  QUOTAS: {
    BASE: "/api/v1/quotas/",
    BY_ID: (id: number) => `/api/v1/quotas/${id}`,
  },
} as const;
