"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { updateQuotaAssignment } from "../services";

const updateAssignmentSchema = z.object({
  id: z.coerce.number().min(1, "L'ID est requis"),
  effectif_cible: z.coerce
    .number()
    .min(0, "L'effectif cible doit être positif"),
  effectif_actuel: z.coerce
    .number()
    .min(0, "L'effectif actuel doit être positif"),
  is_active: z.coerce.boolean(),
});

export type UpdateAssignmentState = {
  errors?: {
    id?: string[];
    effectif_cible?: string[];
    effectif_actuel?: string[];
    is_active?: string[];
  };
  message?: string;
  success?: boolean;
};

export async function updateQuotaAssignmentAction(
  prevState: UpdateAssignmentState,
  formData: FormData,
): Promise<UpdateAssignmentState> {
  const validatedFields = updateAssignmentSchema.safeParse({
    id: formData.get("id"),
    effectif_cible: formData.get("effectif_cible"),
    effectif_actuel: formData.get("effectif_actuel"),
    is_active: formData.get("is_active") === "on",
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Veuillez corriger les erreurs.",
      success: false,
    };
  }

  const { id, ...data } = validatedFields.data;
  const result = await updateQuotaAssignment(id, data);

  if (!result) {
    return {
      message:
        "Une erreur est survenue lors de la modification de l'assignation.",
      success: false,
    };
  }

  revalidatePath("/quotas-assignments");
  return {
    success: true,
    message: "Assignation modifiée avec succès.",
  };
}
