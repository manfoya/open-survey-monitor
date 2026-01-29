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
