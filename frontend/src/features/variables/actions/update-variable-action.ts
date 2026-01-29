"use server";

import { revalidatePath } from "next/cache";
import { updateVariable } from "../services";
import { CreateVariableDataType, DataType } from "../types";
import { z } from "zod";

// Schema de validation pour la mise à jour
const updateVariableSchema = z.object({
  label: z.string().min(1, "Le libellé est requis").max(100),
  slug: z.string().min(1, "Le code technique est requis").regex(/^[a-z0-9_]+$/, "Format invalide (lettres minuscules, chiffres, underscores uniquement)"),
  data_type: z.nativeEnum(DataType),
  is_quota: z.boolean(),
  ui_config: z.record(z.string(), z.any()).optional(),
  modalites: z.array(z.object({
    id: z.string().optional(), // ID peut être présent pour les updates
    value: z.string(),
    label: z.string(),
    order: z.number(),
  })).optional(),
  excluded_operators: z.array(z.string()).optional(),
});

export type UpdateVariableState = {
  success?: boolean;
  message?: string;
  errors?: {
    [K in keyof CreateVariableDataType]?: string[];
  };
};

export async function updateVariableAction(
  id: number,
  prevState: UpdateVariableState | null,
  data: CreateVariableDataType
): Promise<UpdateVariableState> {
  
  // Validation Zod
  const validationResult = updateVariableSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      message: "Erreur de validation",
      errors: validationResult.error.flatten().fieldErrors as UpdateVariableState["errors"],
    };
  }

  try {
    const result = await updateVariable(id, data);

    if (!result) {
      return {
        success: false,
        message: "Une erreur est survenue lors de la mise à jour de la variable.",
      };
    }

    revalidatePath("/variables");
    revalidatePath(`/variables/${id}`);
    
    return {
      success: true,
      message: "Variable mise à jour avec succès !",
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    return {
      success: false,
      message: "Une erreur inattendue est survenue.",
    };
  }
}
