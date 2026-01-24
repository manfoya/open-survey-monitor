export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export enum UserRole {
  DIRECTEUR = "directeur",
  SUPERVISEUR = "superviseur",
  CONTROLEUR = "controleur",
  AGENT = "agent",
}

export interface UserProfile {
  id: number;
  username: string;
  role: UserRole;
  cspro_code: string | null;
  chef: {
    id: number;
    username: string;
  } | null;
};

export interface UserCreatePayload {
  username: string;
  password: string;
  role: UserRole;
  cspro_code?: string | null;
  chef_id?: number | null;
}
