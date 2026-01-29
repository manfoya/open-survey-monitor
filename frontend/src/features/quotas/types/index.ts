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

export interface Quota extends CreateQuotaDTO {
  id: number;
  created_at?: string;
  updated_at?: string;
}
