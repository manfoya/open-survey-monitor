export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    ME: "/users/me",
  },
  USERS: {
    BASE: "/users",
    BY_ID: (id: number) => `/users/${id}`,
  },
  ZONES: {
    BASE: "/maps/zones/",
    BY_ID: (id: number) => `/maps/zones/${id}`,
  },
  SETTINGS: {
    GLOBAL: "/api/global-settings",
  },
} as const;
