import { UserRole } from "@/features/auth/types";

export interface QuotaAssignment {
  id: number;
  user_id: number;
  quota_id: number;
  effectif_cible: number;
  effectif_actuel: number;
  taux_completion: number;
  is_active: boolean;
  is_complete: boolean;
  quota: {
    id: number;
    description: string;
    is_active: boolean;
  };
  user: {
    id: number;
    username: string;
    role: UserRole;
    cspro_code: string;
  };
}

export interface CreateQuotaAssignmentDTO {
  user_id: number;
  quota_id: number;
  effectif_cible: number;
  is_active: boolean;
}

export interface UpdateQuotaAssignmentDTO {
  effectif_cible: number;
  effectif_actuel: number;
  is_active: boolean;
}

export interface BulkQuotaAssignmentDTO {
  quota_id: number;
  user_ids: number[];
  effectif_cible: number;
  is_active: boolean;
}
