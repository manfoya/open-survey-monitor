export interface Affectation {
  id: number;
  controleur_id: number;
  zone_id: number;
  date_debut: string | null;
  date_fin: string | null;
  est_actif: boolean;
  nom_zone: string;
  nom_controleur: string;
}

export interface CreateAffectationDTO {
  controleur_id: number;
  zone_id: number;
  date_debut?: string | null;
  date_fin?: string | null;
  est_actif?: boolean;
}
