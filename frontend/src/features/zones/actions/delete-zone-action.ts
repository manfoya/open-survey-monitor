"use server";

import { revalidatePath } from "next/cache";
import { deleteZone } from "../services";
import { ApiError } from "@/lib/api-client";
import { redirect } from "next/navigation";

export type DeleteZoneState = {
  success?: boolean;
  message?: string;
};


export async function deleteZoneAction(zoneId: number, prevState: DeleteZoneState, formData: FormData): Promise<DeleteZoneState> {
  try {
    console.log(`Suppression de la zone avec l'ID : ${zoneId}`);
    await deleteZone(zoneId);
    
    console.log(`Zone ${zoneId} supprimée avec succès`);
  } catch (error) {
    console.error("Erreur lors de la suppression de la zone:", error);
    return {
      success: false,
      message: error instanceof ApiError
        ? error.message
        : "Une erreur est survenue lors de la suppression de la zone."
    };
  }
  revalidatePath("/zones");
  if (formData.get("redirect") === "true") {
    redirect("/zones?deleted=true")
  }
  return { success: true, message: "Zone supprimée avec succès" }
}