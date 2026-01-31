export interface GlobalSettings {
  id?: number;
  check_heure: boolean;
  heure_debut_travail?: string;
  heure_fin_travail?: string;
  check_jours: boolean;
  jours_interdits: string[];
  check_gps: boolean;
  tolerance_gps_metres: number;
  check_duree: boolean;
  min_duree_minutes: number;
  check_vitesse: boolean;
  max_enquetes_par_jour: number;
  message_du_jour?: string;

  // Mapping Variables
  target_table_name?: string;
  variable_duree_start?: string;
  variable_duree_end?: string;
  variable_gps_lat?: string;
  variable_gps_lon?: string;
  variable_date_enquete?: string;
  variable_heure_enquete?: string;
  variable_indicateur_partiel?: string;
  valeur_partiel?: string;
  variable_id_interne?: string;
  variable_code_agent?: string;
}

export interface GlobalSettingsFormData {
  check_heure: boolean;
  heure_debut_travail?: string;
  heure_fin_travail?: string;
  check_jours: boolean;
  jours_interdits: string[];
  check_gps: boolean;
  tolerance_gps_metres: number;
  check_duree: boolean;
  min_duree_minutes: number;
  check_vitesse: boolean;
  max_enquetes_par_jour: number;
  message_du_jour?: string;
  target_table_name?: string;
  variable_duree_start?: string;
  variable_duree_end?: string;
  variable_gps_lat?: string;
  variable_gps_lon?: string;
  variable_date_enquete?: string;
  variable_heure_enquete?: string;
  variable_indicateur_partiel?: string;
  valeur_partiel?: string;
  variable_id_interne?: string;
  variable_code_agent?: string;
}
