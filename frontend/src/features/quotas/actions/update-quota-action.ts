"use server";

import { revalidatePath } from "next/cache";
import { updateQuota } from "../services";
import { createQuotaSchema, CreateQuotaValues } from "../schemas/quota-schema";

export type UpdateQuotaState = {
  success?: boolean;
  message?: string;
  errors?: {
    description?: string[];
    is_active?: string[];
    definition?: string[];
    _form?: string[];
  };
};

export async function updateQuotaAction(
  id: number,
  prevState: UpdateQuotaState | null,
  values: CreateQuotaValues,
): Promise<UpdateQuotaState> {
  // Update usually requires full valid payload or partial.
  // Here we validate against the schema to ensure integrity if full payload is sent.
  // If we wanted partial validation, we'd use createQuotaSchema.partial().safeParse(values)
  const parsedData = createQuotaSchema.safeParse(values);

  if (!parsedData.success) {
    return {
      success: false,
      message: "Erreur de validation",
      errors: parsedData.error.flatten()
        .fieldErrors as UpdateQuotaState["errors"],
    };
  }

  try {
    const result = await updateQuota(id, parsedData.data);

    if (!result) {
      return {
        success: false,
        message: "Une erreur est survenue lors de la mise à jour du quota.",
      };
    }

    revalidatePath("/quotas");

    return {
      success: true,
      message: "Quota mis à jour avec succès !",
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    return {
      success: false,
      message: "Une erreur inattendue est survenue.",
    };
  }
}
