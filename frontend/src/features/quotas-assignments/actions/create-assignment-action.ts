"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createQuotaAssignment } from "../services";
import { ApiError } from "@/lib/api-client";

const createAssignmentSchema = z.object({
  user_id: z.coerce.number().min(1, "L'agent est requis"),
  quota_id: z.coerce.number().min(1, "Le quota est requis"),
  effectif_cible: z.coerce
    .number()
    .min(1, "L'effectif cible doit être au moins 1"),
  is_active: z.coerce.boolean().default(true),
});

export type CreateAssignmentState = {
  errors?: {
    user_id?: string[];
    quota_id?: string[];
    effectif_cible?: string[];
    is_active?: string[];
  };
  message?: string;
  success?: boolean;
};

export async function createQuotaAssignmentAction(
  prevState: CreateAssignmentState,
  formData: FormData,
): Promise<CreateAssignmentState> {
  const validatedFields = createAssignmentSchema.safeParse({
    user_id: formData.get("user_id"),
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
    await createQuotaAssignment(validatedFields.data);
    revalidatePath("/quotas-assignments");
    return {
      success: true,
      message: "Assignation créée avec succès.",
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        message: error.message,
        success: false,
      };
    }
    return {
      message: "Une erreur est survenue lors de la création de l'assignation.",
      success: false,
    };
  }
}
