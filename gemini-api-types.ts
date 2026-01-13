// --- Enums ---

export type RoleEnum = 'directeur' | 'superviseur' | 'controleur' | 'agent';

export type VariableType = 'SelectOne' | 'SelectMany' | 'Integer' | 'Text';

// --- Interfaces de Base ---

export interface Token {
  access_token: string;
  token_type: string;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

// --- Users (Utilisateurs) ---

export interface UserCreate {
  username: string;
  password: string;
  role?: RoleEnum; // default: agent
  cspro_code?: string | null;
  chef_id?: number | null;
}

export interface UserUpdate {
  username?: string | null;
  password?: string | null;
  chef_id?: number | null;
}

export interface UserOut {
  id: number;
  username: string;
  role: RoleEnum; // default: agent
  cspro_code?: string | null;
  chef_id?: number | null;
}

// --- Maps & Zones ---

export interface ZoneCreate {
  nom_zone: string;
  latitude_centrale: number;
  longitude_centrale: number;
  rayon_tolerance_metres?: number; // default: 500
}

export interface ZoneOut {
  id: number;
  nom_zone: string;
  latitude_centrale: number;
  longitude_centrale: number;
  rayon_tolerance_metres: number; // default: 500
}

// --- Quotas & Affectations ---

export interface QuotaRule {
  description?: string | null;
  conditions: Record<string, any>; // Ex: {"SEXE": "F"}
  cible: number;
  actuel?: number; // default: 0
}

export interface QuotaConfig {
  type?: string; // default: global
  cible_globale?: number | null;
  regles?: QuotaRule[]; // default: []
}

export interface AffectationCreate {
  controleur_id: number;
  zone_id: number;
  est_actif?: boolean; // default: true
  date_debut?: string | null; // format: date-time
  date_fin?: string | null; // format: date-time
  objectifs_quota?: QuotaConfig | null;
}

export interface AffectationUpdate {
  est_actif?: boolean | null;
  date_fin?: string | null; // format: date-time
  objectifs_quota?: QuotaConfig | null;
}

export interface AffectationOut {
  id: number;
  controleur_id: number;
  zone_id: number;
  nom_controleur?: string | null;
  nom_zone?: string | null;
  est_actif: boolean; // default: true
  date_debut?: string | null; // format: date-time
  date_fin?: string | null; // format: date-time
  objectifs_quota?: QuotaConfig | null;
}

// --- Settings (Configuration Globale) ---

export interface SettingsUpdate {
  check_gps?: boolean; // default: true
  tolerance_gps_metres?: number; // default: 500
  check_duree?: boolean; // default: true
  min_duree_minutes?: number; // default: 10
  check_heure?: boolean; // default: false
  heure_debut_travail?: string | null; // format: time
  heure_fin_travail?: string | null; // format: time
  check_jours?: boolean; // default: false
  jours_interdits?: string[]; // default: []
  check_vitesse?: boolean; // default: true
  max_enquetes_par_jour?: number; // default: 20
  message_du_jour?: string | null;
}

export interface SettingsOut extends SettingsUpdate {
  id: number;
}

// --- Dictionary (Variables) ---

export interface ModaliteCreate {
  code: string;
  label: string;
}

export interface ModaliteOut extends ModaliteCreate {
  id: number;
  variable_id: number;
}

export interface VariableCreate {
  name: string;
  label: string;
  type?: VariableType; // default: SelectOne
  est_quota?: boolean; // default: false
  modalites?: ModaliteCreate[]; // default: []
}

export interface VariableOut {
  id: number;
  name: string;
  label: string;
  type: VariableType; // default: SelectOne
  est_quota: boolean; // default: false
  modalites: ModaliteOut[]; // default: []
}

// --- Auth Body (Login) ---

export interface LoginBody {
  username: string;
  password: string;
  grant_type?: string | null;
  scope?: string;
  client_id?: string | null;
  client_secret?: string | null;
}
