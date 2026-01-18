"use server";

import { z } from "zod";
import { postZone } from "../services";
import { ApiError } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

const createZoneSchema = z.object({
  nom_zone: z
    .string()
    .trim()
    .min(1, "Nom de zone requis")
    .min(3, "3 caractères minimum")
    .max(100, "100 caractères maximum"),
  latitude_centrale: z
    .number()
    .min(-90, "Latitude invalide (minimum -90)")
    .max(90, "Latitude invalide (maximum 90)"),
  longitude_centrale: z
    .number()
    .min(-180, "Longitude invalide (minimum -180)")
    .max(180, "Longitude invalide (maximum 180)"),
  rayon_tolerance_metres: z
    .number()
    .int("Le rayon doit être un nombre entier")
    .min(1, "Le rayon doit être au minimum de 1 mètre")
    .max(50000, "Le rayon ne peut pas dépasser 50 km")
    .default(500),
});

type CreateZoneValues = z.infer<typeof createZoneSchema>;

// Définition du CreateZoneState
export type CreateZoneState = {
  success: boolean;
  errors?: {
    nom_zone?: string[];
    latitude_centrale?: string[];
    longitude_centrale?: string[];
    rayon_tolerance_metres?: string[];
  };
  message?: string | null;
  data?: Partial<CreateZoneValues>;
};

// Action pour créer une zone
export async function createZoneAction(
  prevState: CreateZoneState,
  values: FormData,
): Promise<CreateZoneState> {
  // Validation avec Zod
  const rawData = {
    nom_zone: values.get("nom_zone") as string,
    latitude_centrale: Number(values.get("latitude_centrale")),
    longitude_centrale: Number(values.get("longitude_centrale")),
    rayon_tolerance_metres: Number(values.get("rayon_tolerance_metres")) || 500,
  };

  const parsedData = createZoneSchema.safeParse(rawData);

  if (!parsedData.success) {
    return {
      success: false,
      errors: parsedData.error.flatten().fieldErrors,
      message: "Veuillez vérifier les informations du formulaire.",
      data: rawData,
    };
  }

  // Appel au backend pour créer la zone
  try {
    console.log("Données validées pour création zone :", parsedData.data);
    await postZone(parsedData.data);
  } catch (error) {
    console.error("Erreur lors de la création de la zone :", error);
    return {
      success: false,
      message:
        error instanceof ApiError
          ? error.message
          : "Une erreur est survenue lors de la création de la zone.",
      data: rawData,
    };
  }

  revalidatePath("/zones/create");
  revalidatePath("/zones");
  return { success: true };
}
