import { z } from "zod";
import { OperatorType } from "@/features/variables/types";

// Enum pour les combinateurs
const QuotaCombinatorEnum = z.enum(["and", "or"]);

// Enum pour les opérateurs (à maintenir synchro avec OperatorType)
// On utilise une validation plus large string mais on peut restreindre si besoin
const OperatorSchema = z.string() as z.ZodType<OperatorType>;

// Schéma de base pour une règle simple
const QuotaRuleSchema = z.object({
  id: z.string().optional(), // UI ID
  field: z.string().min(1, "Le champ est requis"),
  operator: OperatorSchema,
  value: z.union([z.string(), z.number(), z.boolean()]),
});

// Schéma pour un groupe de règles (récursif)
// Zod nécessite une définition lazy pour la récursion
export type QuotaGroupSchemaType = {
  id?: string;
  combinator: "and" | "or";
  rules: (z.infer<typeof QuotaRuleSchema> | QuotaGroupSchemaType)[];
};

const QuotaGroupSchema: z.ZodType<QuotaGroupSchemaType> = z.lazy(() =>
  z.object({
    id: z.string().optional(),
    combinator: QuotaCombinatorEnum,
    rules: z.array(z.union([QuotaRuleSchema, QuotaGroupSchema])),
  }),
);

// Schéma complet de création de quota
export const createQuotaSchema = z.object({
  description: z
    .string()
    .trim()
    .min(3, "La description doit contenir au moins 3 caractères")
    .max(255, "La description est trop longue"),
  is_active: z.boolean().default(true),
  definition: z.object({
    combinator: QuotaCombinatorEnum,
    rules: z
      .array(z.union([QuotaRuleSchema, QuotaGroupSchema]))
      .min(1, "Au moins une règle est requise"),
  }),
});

export type CreateQuotaValues = z.infer<typeof createQuotaSchema>;
