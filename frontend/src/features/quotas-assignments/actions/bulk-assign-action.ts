"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { bulkAssignQuotas } from "../services";
import { ApiError } from "@/lib/api-client";

const bulkAssignmentSchema = z.object({
  user_ids: z.array(z.coerce.number()).min(1, "Au moins un agent est requis"),
  quota_id: z.coerce.number().min(1, "Le quota est requis"),
  effectif_cible: z.coerce
    .number()
    .min(1, "L'effectif cible doit être au moins 1"),
  is_active: z.coerce.boolean().default(true),
});

export type BulkAssignmentState = {
  errors?: {
    user_ids?: string[];
    quota_id?: string[];
    effectif_cible?: string[];
    is_active?: string[];
  };
  message?: string;
  success?: boolean;
};

export async function bulkAssignQuotasAction(
  prevState: BulkAssignmentState,
  formData: FormData,
): Promise<BulkAssignmentState> {
  const userIdsRaw = formData.getAll("user_ids");

  const validatedFields = bulkAssignmentSchema.safeParse({
    user_ids: userIdsRaw,
    quota_id: formData.get("quota_id"),
    effectif_cible: formData.get("effectif_cible"),
    is_active: formData.get("is_active") === "on",
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Veuillez corriger les erreurs.",
      success: false,
    };
  }

  try {
    await bulkAssignQuotas(validatedFields.data);
    revalidatePath("/quotas-assignments");
    return {
      success: true,
      message: "Assignations créées avec succès.",
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        message: error.message,
        success: false,
      };
    }
    return {
      message: "Une erreur est survenue lors de la création en masse.",
      success: false,
    };
  }
}
