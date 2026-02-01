"use server";

import { revalidatePath } from "next/cache";
import { deleteQuotaAssignment } from "../services";

export async function deleteQuotaAssignmentAction(
  id: number,
  prevState: any,
  formData: FormData,
) {
  try {
    await deleteQuotaAssignment(id);
    revalidatePath("/quotas-assignments");
    return { success: true, message: "Assignation supprimée avec succès" };
  } catch (error) {
    console.error("Failed to delete assignment:", error);
    return { success: false, message: "Erreur lors de la suppression" };
  }
}
