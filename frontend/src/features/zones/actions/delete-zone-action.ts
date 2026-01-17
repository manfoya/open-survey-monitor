"use server";

import { deleteZone } from "../services";
import { ApiError } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export type DeleteZoneResult = {
  success: boolean;
  message?: string;
  zoneId?: number;
};

export async function deleteZoneAction(formData: FormData): Promise<DeleteZoneResult> {
  const zoneId = Number(formData.get("zoneId"));

  if (!zoneId) {
    return {
      success: false,
      message: "ID de zone requis"
    };
  }

  try {
    console.log(`Suppression de la zone avec l'ID : ${zoneId}`);
    await deleteZone(zoneId);
    
    revalidatePath("/zones");
    revalidatePath(`/zones/${zoneId}`);
    
    console.log(`Zone ${zoneId} supprimée avec succès`);
    
    return {
      success: true,
      zoneId: zoneId,
      message: "Zone supprimée avec succès"
    };
  } catch (error) {
    console.error("Erreur lors de la suppression de la zone :", error);
    return {
      success: false,
      message: error instanceof ApiError
        ? error.message
        : "Une erreur est survenue lors de la suppression de la zone."
    };
  }
}