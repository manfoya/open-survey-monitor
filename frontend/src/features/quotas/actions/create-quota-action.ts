"use server";

import { z } from "zod";
import { createQuota } from "../services";
import { createQuotaSchema, CreateQuotaValues } from "../schemas/quota-schema";
import { revalidatePath } from "next/cache";

// Type de l'état du formulaire
export type CreateQuotaState = {
  success: boolean;
  errors?: {
    description?: string[];
    is_active?: string[];
    definition?: string[];
    _form?: string[];
  };
  message?: string | null;
  data?: Partial<CreateQuotaValues>;
};

export async function createQuotaAction(
  prevState: CreateQuotaState,
  values: CreateQuotaValues,
): Promise<CreateQuotaState> {
  // Validation avec Zod
  const parsedData = createQuotaSchema.safeParse(values);

  if (!parsedData.success) {
    return {
      success: false,
      errors: parsedData.error.flatten().fieldErrors,
      message: "Veuillez vérifier les informations du formulaire.",
      data: values,
    };
  }

  try {
    await createQuota(parsedData.data);
  } catch (error) {
    console.error("Erreur action createQuota:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la création du quota.",
      data: values,
    };
  }

  revalidatePath("/quotas");
  return { success: true, message: "Quota créé avec succès" };
}
