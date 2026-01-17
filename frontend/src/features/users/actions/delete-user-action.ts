"use server";

import { revalidatePath } from "next/cache";
import { deleteUser } from "../services";
import { ApiError } from "@/lib/api-client";

export type DeleteUserResult = {
  success: boolean;
  message?: string;
  userId?: number;
};

export async function deleteUserAction(formData: FormData): Promise<DeleteUserResult> {
  const userId = Number(formData.get("userId"));

  if (!userId) {
    return {
      success: false,
      message: "ID utilisateur requis"
    };
  }

  try {
    console.log(`Suppression de l'utilisateur avec l'ID : ${userId}`);
    await deleteUser(userId);

    revalidatePath("/users");
    revalidatePath(`/users/${userId}`);
    
    console.log(`Utilisateur ${userId} supprimé avec succès`);
    
    return {
      success: true,
      userId: userId,
      message: "Utilisateur supprimé avec succès"
    };
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    return {
      success: false,
      message: error instanceof ApiError
        ? error.message
        : "Une erreur est survenue lors de la suppression de l'utilisateur."
    };
  }
}