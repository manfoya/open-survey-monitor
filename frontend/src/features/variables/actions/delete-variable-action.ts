"use server";

import { revalidatePath } from "next/cache";
import { deleteVariable } from "../services";
import { ApiError } from "@/lib/api-client";
import { redirect } from "next/navigation";

export type DeleteVariableState = {
  success?: boolean;
  message?: string;
};

export async function deleteVariableAction(
  variableId: number,
  prevState: DeleteVariableState,
  formData: FormData,
): Promise<DeleteVariableState> {
  try {
    await deleteVariable(variableId);
    console.log(`Variable ${variableId} supprimée avec succès`);
  } catch (error) {
    console.error("Erreur lors de la suppression de la variable:", error);
    return {
      success: false,
      message:
        error instanceof ApiError
          ? error.message
          : "Une erreur est survenue lors de la suppression de la variable.",
    };
  }
  revalidatePath("/variables");

  // Support for optional redirect logic if added to form later
  if (formData && formData.get("redirectOnSuccess") === "true") {
    redirect("/variables");
  }

  return { success: true, message: "Variable supprimée avec succès" };
}
