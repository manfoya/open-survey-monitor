"use server";

import { revalidatePath } from "next/cache";
import { deleteQuota } from "../services";
import { ApiError } from "@/lib/api-client";
import { redirect } from "next/navigation";

export type DeleteQuotaState = {
  success?: boolean;
  message?: string;
};

export async function deleteQuotaAction(
  quotaId: number,
  prevState: DeleteQuotaState,
  formData: FormData,
): Promise<DeleteQuotaState> {
  try {
    await deleteQuota(quotaId);
  } catch (error) {
    console.error("Erreur lors de la suppression du quota:", error);
    return {
      success: false,
      message:
        error instanceof ApiError
          ? error.message
          : "Une erreur est survenue lors de la suppression du quota.",
    };
  }
  revalidatePath("/quotas");

  if (formData && formData.get("redirectOnSuccess") === "true") {
    redirect("/quotas");
  }

  return { success: true, message: "Quota supprimé avec succès" };
}
