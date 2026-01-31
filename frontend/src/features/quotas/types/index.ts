import { OperatorType } from "@/features/variables/types";

export type QuotaCombinator = "and" | "or";

export interface QuotaRule {
  id?: string; // Internal UI ID, not sent to API
  field: string; // Variable slug
  operator: OperatorType;
  value: string | number | boolean;
}

export interface QuotaGroup {
  id?: string; // Internal UI ID
  combinator: QuotaCombinator;
  rules: (QuotaRule | QuotaGroup)[];
}

export interface QuotaDefinition {
  combinator: QuotaCombinator;
  rules: (QuotaRule | QuotaGroup)[];
}

export interface CreateQuotaDTO {
  description: string;
  is_active: boolean;
  definition: QuotaDefinition;
}

export interface UserQuota {
  user_id: number;
  username: string; // Assuming basic info provided, need to verify or handle if it's nested
  full_name?: string;
  effectif_actuel: number;
  taux_completion: number;
}

export interface Quota extends CreateQuotaDTO {
  id: number;
  effectif_cible_total: number;
  effectif_actuel_total: number;
  taux_completion_global: number;
  user_quotas: UserQuota[];
  created_at?: string;
  updated_at?: string;
}
