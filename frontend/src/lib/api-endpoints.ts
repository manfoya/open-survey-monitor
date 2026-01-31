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
    BY_ID: (id: number) => `/variables/${id}`,
  },
  SETTINGS: {
    GLOBAL: "/api/global-settings",
  },
  MESSAGES: {
    BASE: "/messages/",
    SENT: "/messages/sent",
  },
  STATS: {
    DASHBOARD: "/stats/dashboard",
  },
  QUOTAS: {
    BASE: "/quotas/",
    BY_ID: (id: number) => `/quotas/${id}`,
  },
} as const;
