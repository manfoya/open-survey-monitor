"use server";

import { z } from "zod";
import { updateZone } from "../services";
import { ApiError } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

const updateZoneSchema = z.object({
  nom_zone: z
    .string()
    .trim()
    .min(1, "Nom de zone requis")
    .min(3, "3 caractères minimum")
    .max(100, "100 caractères maximum")
    .optional(),
  latitude_centrale: z
    .number()
    .min(-90, "Latitude invalide (minimum -90)")
    .max(90, "Latitude invalide (maximum 90)")
    .optional(),
  longitude_centrale: z
    .number()
    .min(-180, "Longitude invalide (minimum -180)")
    .max(180, "Longitude invalide (maximum 180)")
    .optional(),
  rayon_tolerance_metres: z
    .number()
    .int("Le rayon doit être un nombre entier")
    .min(1, "Le rayon doit être au minimum de 1 mètre")
    .max(50000, "Le rayon ne peut pas dépasser 50 km")
    .optional(),
});

type UpdateZoneValues = z.infer<typeof updateZoneSchema>;

export type UpdateZoneState = {
  success: boolean;
  errors?: {
    nom_zone?: string[];
    latitude_centrale?: string[];
    longitude_centrale?: string[];
    rayon_tolerance_metres?: string[];
  };
  message?: string | null;
  data?: Partial<UpdateZoneValues>;
};

export async function updateZoneAction(
  zoneId: number,
  prevState: UpdateZoneState,
  values: FormData,
): Promise<UpdateZoneState> {
  const rawData = {
    nom_zone: values.get("nom_zone") as string | undefined,
    latitude_centrale: values.get("latitude_centrale") ? Number(values.get("latitude_centrale")) : undefined,
    longitude_centrale: values.get("longitude_centrale") ? Number(values.get("longitude_centrale")) : undefined,
    rayon_tolerance_metres: values.get("rayon_tolerance_metres") ? Number(values.get("rayon_tolerance_metres")) : undefined,
  };

  // Filtrer les valeurs undefined pour ne mettre à jour que les champs modifiés
  const filteredData = Object.fromEntries(
    Object.entries(rawData).filter(([, value]) => value !== undefined && value !== "")
  );

  const parsedData = updateZoneSchema.safeParse(filteredData);

  if (!parsedData.success) {
    return {
      success: false,
      errors: parsedData.error.flatten().fieldErrors,
      message: "Veuillez vérifier les informations du formulaire.",
      data: filteredData,
    };
  }

  try {
    console.log("Données validées pour mise à jour zone :", parsedData.data);
    await updateZone(zoneId, parsedData.data);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la zone :", error);
    return {
      success: false,
      message:
        error instanceof ApiError
          ? error.message
          : "Une erreur est survenue lors de la mise à jour de la zone.",
      data: filteredData,
    };
  }

  revalidatePath(`/zones/${zoneId}/edit`);
  revalidatePath(`/zones/${zoneId}`);
  revalidatePath("/zones");
  return { success: true };
}