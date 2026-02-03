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
    BASE: "/settings",
    TABLES: "/settings/tables",
  },
  AFFECTATIONS: {
    BASE: "/maps/affectations/",
    BY_ID: (id: number) => `/maps/affectations/${id}`,
    BY_USER_ID: (id: number) => `/maps/affectations/user/${id}`,
  },
  MESSAGES: {
    BASE: "/messages/",
    SENT: "/messages/sent",
    DAY: "/messages/day-message",
  },
  STATS: {
    DASHBOARD: "/stats/dashboard",
  },
  QUOTAS: {
    BASE: "/quotas/",
    BY_ID: (id: number) => `/quotas/${id}`,
    ASSIGNMENTS: "/quotas/assignments",
    ASSIGNMENT_BY_ID: (id: number) => `/quotas/assignments/${id}`,
    BULK_ASSIGNMENTS: "/quotas/assignments/bulk",
  },
  SURVEYS: {
    BASE: "/surveys/",
    POINTS: "/surveys/map",
  },
} as const;
