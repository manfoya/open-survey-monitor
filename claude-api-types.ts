/**
 * Types TypeScript pour Open Survey Monitor API
 * Générés à partir des schémas Pydantic FastAPI
 * 
 * API Base URL: http://127.0.0.1:8000
 * Documentation: http://127.0.0.1:8000/docs
 * 
 * @version 1.0.0
 * @generated 2026-01-11
 */

// =============================================================================
// ENUMS
// =============================================================================

/** Rôles utilisateurs dans la hiérarchie */
export enum RoleEnum {
  DIRECTEUR = "directeur",
  SUPERVISEUR = "superviseur",
  CONTROLEUR = "controleur",
  AGENT = "agent"
}

/** Types de variables du questionnaire CSPro */
export enum VariableType {
  CHOIX_UNIQUE = "SelectOne",
  CHOIX_MULTIPLE = "SelectMany",
  ENTIER = "Integer",
  TEXTE = "Text"
}

/** Statuts des enquêtes terrain */
export enum SurveyStatus {
  COMPLET = "complet",
  PARTIEL = "partiel",
  REFUS = "refus"
}

/** Genre des répondants */
export enum GenderEnum {
  M = "M",
  F = "F",
  INCONNU = "Inconnu"
}

// =============================================================================
// AUTHENTICATION & TOKENS
// =============================================================================

/** Réponse de login avec token JWT */
export interface Token {
  access_token: string;
  token_type: string; // toujours "bearer"
}

/** Données extraites du token JWT */
export interface TokenData {
  username?: string;
}

/** Payload de login */
export interface LoginRequest {
  username: string;
  password: string;
}

// =============================================================================
// USERS
// =============================================================================

/** Schéma de base utilisateur */
export interface UserBase {
  username: string;
  role: RoleEnum;
  cspro_code?: string;
}

/** Payload de création utilisateur */
export interface UserCreate extends UserBase {
  password: string;
  chef_id?: number;
}

/** Payload de mise à jour utilisateur */
export interface UserUpdate {
  username?: string;
  password?: string;
  chef_id?: number;
}

/** Réponse utilisateur (sans mot de passe) */
export interface UserOut extends UserBase {
  id: number;
  chef_id?: number;
}

// =============================================================================
// SETTINGS (Configuration Qualité)
// =============================================================================

/** Configuration des paramètres de contrôle qualité */
export interface SettingsBase {
  // Contrôles GPS
  check_gps: boolean;
  tolerance_gps_metres: number;
  
  // Contrôles durée
  check_duree: boolean;
  min_duree_minutes: number;
  
  // Contrôles horaires
  check_heure: boolean;
  heure_debut_travail?: string; // Format "HH:MM"
  heure_fin_travail?: string;   // Format "HH:MM"
  
  // Contrôles jours
  check_jours: boolean;
  jours_interdits: string[]; // Ex: ["Dimanche", "Samedi"]
  
  // Contrôles vitesse/productivité
  check_vitesse: boolean;
  max_enquetes_par_jour: number;
  
  // Communication
  message_du_jour?: string;
}

/** Payload de mise à jour des paramètres */
export interface SettingsUpdate extends SettingsBase {}

/** Réponse des paramètres avec ID */
export interface SettingsOut extends SettingsBase {
  id: number;
}

// =============================================================================
// MAPS & ZONES
// =============================================================================

/** Schéma de base zone géographique */
export interface ZoneBase {
  nom_zone: string;
  latitude_centrale: number;
  longitude_centrale: number;
  rayon_tolerance_metres: number; // défaut: 500
}

/** Payload de création zone */
export interface ZoneCreate extends ZoneBase {}

/** Réponse zone avec ID */
export interface ZoneOut extends ZoneBase {
  id: number;
}

// =============================================================================
// QUOTAS
// =============================================================================

/** Règle de quota individuelle */
export interface QuotaRule {
  description?: string; // Ex: "Femmes Noires"
  conditions: Record<string, any>; // Ex: {"SEXE": "F", "ETHNIE": "NOIR"}
  cible: number; // Objectif à atteindre
  actuel: number; // Progression actuelle
}

/** Configuration complète des quotas */
export interface QuotaConfig {
  type: "global" | "croise";
  cible_globale?: number; // Utilisé si type = "global"
  regles: QuotaRule[]; // Utilisé si type = "croise"
}

// =============================================================================
// AFFECTATIONS (Missions)
// =============================================================================

/** Schéma de base affectation */
export interface AffectationBase {
  controleur_id: number;
  zone_id: number;
  date_debut?: string; // ISO datetime
  date_fin?: string;   // ISO datetime
  est_actif: boolean;
  objectifs_quota?: QuotaConfig;
}

/** Payload de création affectation */
export interface AffectationCreate extends AffectationBase {}

/** Payload de mise à jour affectation */
export interface AffectationUpdate {
  date_fin?: string;
  est_actif?: boolean;
  objectifs_quota?: QuotaConfig;
}

/** Réponse affectation avec noms enrichis */
export interface AffectationOut extends AffectationBase {
  id: number;
  nom_zone?: string; // Nom de la zone (enrichi)
  nom_controleur?: string; // Nom du contrôleur (enrichi)
}

// =============================================================================
// DICTIONARY (Variables & Modalités)
// =============================================================================

/** Schéma de base modalité */
export interface ModaliteBase {
  code: string; // Ex: "1"
  label: string; // Ex: "Masculin"
}

/** Payload de création modalité */
export interface ModaliteCreate extends ModaliteBase {}

/** Réponse modalité avec IDs */
export interface ModaliteOut extends ModaliteBase {
  id: number;
  variable_id: number;
}

/** Schéma de base variable */
export interface VariableBase {
  name: string; // Ex: "Q01_SEXE"
  label: string; // Ex: "Sexe du chef de ménage"
  type: VariableType;
  est_quota: boolean; // Peut être utilisée pour les quotas
}

/** Payload de création variable avec modalités */
export interface VariableCreate extends VariableBase {
  modalites: ModaliteCreate[];
}

/** Réponse variable avec modalités */
export interface VariableOut extends VariableBase {
  id: number;
  modalites: ModaliteOut[];
}

// =============================================================================
// SURVEY DATA (Données terrain)
// =============================================================================

/** Données d'enquête synchronisées depuis CSPro */
export interface SurveyData {
  id: number;
  questionnaire_uuid: string; // UUID unique CSPro
  agent_code?: string; // Code de l'agent (ex: "AG045")
  status: SurveyStatus;
  respondent_sex: GenderEnum;
  
  // Géolocalisation
  latitude?: number;
  longitude?: number;
  
  // Horodatage
  date_entretien?: string; // ISO datetime
  date_synchro?: string; // ISO datetime
  
  // Contrôle qualité
  duree_minutes?: number;
}

// =============================================================================
// API RESPONSES & ERRORS
// =============================================================================

/** Structure standard d'erreur API */
export interface APIError {
  detail: string;
  status_code: number;
}

/** Réponse avec pagination */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/** Paramètres de pagination pour les requêtes */
export interface PaginationParams {
  skip?: number;
  limit?: number;
}

// =============================================================================
// API CLIENT TYPES
// =============================================================================

/** Configuration du client API */
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}

/** Headers d'authentification */
export interface AuthHeaders {
  Authorization: string; // "Bearer {token}"
}

/** Paramètres de requête pour les filtres */
export interface QueryParams {
  quota_only?: boolean; // Pour /dictionary
  skip?: number;
  limit?: number;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/** Type pour les sélections dans les formulaires */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

/** Type pour les statistiques du dashboard */
export interface DashboardStats {
  total_users: number;
  total_zones: number;
  active_missions: number;
  completed_surveys: number;
  quality_score: number; // Pourcentage 0-100
}

/** Réponse de succès générique */
export interface SuccessResponse {
  message: string;
  success: boolean;
}

// =============================================================================
// API ENDPOINTS MAP
// =============================================================================

/** Mapping des endpoints API */
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/v1/auth/login",
  
  // Users
  USERS_ME: "/api/v1/users/me",
  USERS: "/api/v1/users/",
  USERS_BY_ID: (id: number) => `/api/v1/users/${id}`,
  USERS_BY_CODE: (code: string) => `/api/v1/users/code/${code}`,
  
  // Maps
  ZONES: "/api/v1/maps/zones/",
  AFFECTATIONS: "/api/v1/maps/affectations/",
  AFFECTATIONS_BY_ID: (id: number) => `/api/v1/maps/affectations/${id}`,
  
  // Settings
  SETTINGS: "/api/v1/settings/",
  
  // Dictionary
  DICTIONARY: "/api/v1/dictionary/",
  DICTIONARY_BY_ID: (id: number) => `/api/v1/dictionary/${id}`,
} as const;

// =============================================================================
// HTTP METHODS
// =============================================================================

/** Méthodes HTTP supportées */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Configuration d'une requête API */
export interface RequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: QueryParams;
  headers?: Record<string, string>;
}

// =============================================================================
// FORM VALIDATION TYPES
// =============================================================================

/** Erreurs de validation de formulaire */
export interface FormErrors {
  [field: string]: string | string[];
}

/** État d'un formulaire */
export interface FormState<T> {
  data: T;
  errors: FormErrors;
  isLoading: boolean;
  isValid: boolean;
}

// =============================================================================
// EXPORTS par défaut pour une importation facile
// =============================================================================

export default {
  // Enums
  RoleEnum,
  VariableType,
  SurveyStatus,
  GenderEnum,
  
  // Endpoints
  API_ENDPOINTS,
};

/**
 * Usage Examples:
 * 
 * // Import types
 * import type { UserOut, ZoneCreate, Token } from './api-types';
 * 
 * // Use with axios
 * const response = await axios.post<Token>('/api/v1/auth/login', loginData);
 * 
 * // Use with React Query
 * const { data: users } = useQuery<UserOut[]>(['users'], fetchUsers);
 * 
 * // Form validation
 * const userForm: FormState<UserCreate> = {
 *   data: { username: '', password: '', role: RoleEnum.AGENT },
 *   errors: {},
 *   isLoading: false,
 *   isValid: false
 * };
 */