import { OperatorType } from "@/features/variables/types";
import { QuotaAssignment } from "@/features/quotas-assignments/types";

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

export interface Quota extends CreateQuotaDTO {
  id: number;
  effectif_cible_total: number;
  effectif_actuel_total: number;
  taux_completion_global: number;
  user_quotas: QuotaAssignment[];
  created_at?: string;
  updated_at?: string;
}
