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
}
