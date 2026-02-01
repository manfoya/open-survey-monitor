"use server";

import { z } from "zod";
import { createAffectation } from "../services";
import { revalidatePath } from "next/cache";
import { CreateAffectationDTO } from "../types";

const createAffectationSchema = z.object({
  controleur_id: z.coerce
    .number()
    .int()
    .positive("Veuillez sélectionner un contrôleur"),
  zone_id: z.coerce.number().int().positive("Veuillez sélectionner une zone"),
  date_debut: z.string().nullable().optional(),
  date_fin: z.string().nullable().optional(),
  est_actif: z.coerce.boolean().optional().default(true),
});

export type CreateAffectationState = {
  success: boolean;
  errors?: {
    controleur_id?: string[];
    zone_id?: string[];
    date_debut?: string[];
    date_fin?: string[];
    est_actif?: string[];
  };
  message?: string | null;
  data?: Partial<CreateAffectationDTO>;
};

export async function createAffectationAction(
  prevState: CreateAffectationState,
  formData: FormData,
): Promise<CreateAffectationState> {
  const rawData = {
    controleur_id: formData.get("controleur_id"),
    zone_id: formData.get("zone_id"),
    date_debut: formData.get("date_debut") || null,
    date_fin: formData.get("date_fin") || null,
    est_actif: formData.get("est_actif") === "on",
  };

  const parsed = createAffectationSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Veuillez vérifier les informations du formulaire.",
      data: {
        controleur_id: Number(rawData.controleur_id) || 0,
        zone_id: Number(rawData.zone_id) || 0,
        date_debut: rawData.date_debut as string | null,
        date_fin: rawData.date_fin as string | null,
        est_actif: rawData.est_actif,
      },
    };
  }

  try {
    await createAffectation(parsed.data);
    revalidatePath("/affectations-zones");
    return {
      success: true,
      message: "Affectation créée avec succès !",
    };
  } catch (error) {
    console.error("Erreur création affectation:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la création de l'affectation.",
      data: parsed.data,
    };
  }
}
