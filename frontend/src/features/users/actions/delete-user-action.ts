"use server";

import { revalidatePath } from "next/cache";
import { deleteUser } from "../services";
import { ApiError } from "@/lib/api-client";
import { redirect } from "next/navigation";

export type DeleteUserState = {
  success?: boolean;
  message?: string;
};

export async function deleteUserAction(
  userId: number,
  prevState: DeleteUserState,
  formData: FormData,
): Promise<DeleteUserState> {
  try {
    console.log(`Suppression de l'utilisateur avec l'ID : ${userId}`);
    await deleteUser(userId);

    console.log(`Utilisateur ${userId} supprimé avec succès`);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    return {
      success: false,
      message:
        error instanceof ApiError
          ? error.message
          : "Une erreur est survenue lors de la suppression de l'utilisateur.",
    };
  }
  revalidatePath("/users");
  if (formData.get("redirectOnSuccess") === "true") {
    redirect("/users/?deleted=true");
  }
  return { success: true, message: "Utilisateur supprimé avec succès" };
}
