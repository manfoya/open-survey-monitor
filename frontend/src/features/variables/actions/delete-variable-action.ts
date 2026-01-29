"use server";

import { revalidatePath } from "next/cache";
import { deleteVariable } from "../services";

export async function deleteVariableAction(id: string) {
  try {
    await deleteVariable(id);
    revalidatePath("/variables");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de la variable", error);
    return { success: false, error: "Impossible de supprimer la variable" };
  }
}
