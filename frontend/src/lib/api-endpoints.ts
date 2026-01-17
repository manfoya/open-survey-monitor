export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    ME: "/users/me",
  },
  USERS: {
    BASE: "/users",
  },
  SETTINGS: {
    GLOBAL: "/api/global-settings",
  },
} as const;
