"use server";

import { z } from "zod";
import { updateAffectation } from "../services";
import { revalidatePath } from "next/cache";
import { CreateAffectationDTO } from "../types";

const updateAffectationSchema = z.object({
  date_debut: z.string().nullable().optional(),
  date_fin: z.string().nullable().optional(),
  est_actif: z.coerce.boolean().optional().default(true),
});

export type UpdateAffectationState = {
  success: boolean;
  errors?: {
    date_debut?: string[];
    date_fin?: string[];
    est_actif?: string[];
  };
  message?: string | null;
  data?: Partial<CreateAffectationDTO>;
};

export async function updateAffectationAction(
  id: number,
  prevState: UpdateAffectationState,
  formData: FormData,
): Promise<UpdateAffectationState> {
  const rawData = {
    date_debut: formData.get("date_debut") || null,
    date_fin: formData.get("date_fin") || null,
    est_actif: formData.get("est_actif") === "on",
  };

  const parsed = updateAffectationSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Veuillez vérifier les informations du formulaire.",
      data: {
        date_debut: rawData.date_debut as string | null,
        date_fin: rawData.date_fin as string | null,
        est_actif: rawData.est_actif,
      },
    };
  }

  try {
    await updateAffectation(id, parsed.data);
    revalidatePath("/affectations-zones");
    revalidatePath(`/affectations-zones/${id}`);
    return {
      success: true,
      message: "Affectation mise à jour avec succès !",
    };
  } catch (error) {
    console.error("Erreur mise à jour affectation:", error);
    return {
      success: false,
      message:
        "Une erreur est survenue lors de la mise à jour de l'affectation.",
      data: parsed.data,
    };
  }
}
