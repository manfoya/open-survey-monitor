
export interface ProgressionQuota {
  id: number;
  nom: string;
  cible: number;
  fait: number;
  pourcentage: number;
  est_atteint: boolean;
}

export type RepartitionErreurs = Record<string, number> | null;

export interface DashboardStats {
  total_reçus: number;
  total_complet: number;
  total_partiel: number;
  total_refus: number;
  total_valide: number;
  total_suspect: number;
  progression_quotas: ProgressionQuota[];
  repartition_erreurs: RepartitionErreurs;
}

export type SurveyStatus = "complet" | "partiel" | "refus";

export interface SurveyQCResult {
  status: "pass" | "fail" | "warn";
  val: number | string | boolean;
}

export interface SurveyAnswerData extends Record<string, any> {
  id: number;
}

export interface SurveyItem {
  id: number;
  questionnaire_uuid: string;
  agent_code: string | null;
  agent_name: string;
  status: SurveyStatus;
  respondent_sex: string;
  latitude: number | null;
  longitude: number | null;
  duree_minutes: number;
  date_entretien: string;
  date_synchro: string;
  is_valid: boolean;
  qc_results: Record<string, SurveyQCResult>;
  answers: SurveyAnswerData;
}

export interface SurveyListResponse {
  items: SurveyItem[];
  meta: {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
}

export type SurveyPoint = {
  id: number;
  latitude: number;
  longitude: number;
  status: SurveyStatus;
}


