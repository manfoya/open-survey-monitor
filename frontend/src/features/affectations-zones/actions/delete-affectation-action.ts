"use server";

import { revalidatePath } from "next/cache";
import { deleteAffectation } from "../services";

export async function deleteAffectationAction(
  id: number,
  prevState: any,
  formData: FormData,
) {
  try {
    await deleteAffectation(id);
    revalidatePath("/affectations-zones");
    return { success: true, message: "Affectation supprimée avec succès" };
  } catch (error) {
    console.error("Failed to delete affectation:", error);
    return { success: false, message: "Erreur lors de la suppression" };
  }
}
