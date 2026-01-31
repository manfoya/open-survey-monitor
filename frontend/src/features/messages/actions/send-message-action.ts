"use server";

import { z } from "zod";
import { UserRole } from "@/features/auth/types";
import { sendMessage } from "../services";
import {
  createMessageSchema,
  CreateMessageValues,
} from "../schemas/message-schema";
import { revalidatePath } from "next/cache";

// Type de l'état du formulaire
export type SendMessageState = {
  success: boolean;
  errors?: {
    title?: string[];
    content?: string[];
    target_role?: string[];
    target_user_id?: string[];
  };
  message?: string | null;
  data?: Partial<CreateMessageValues>;
};

export async function sendMessageAction(
  prevState: SendMessageState,
  values: CreateMessageValues,
): Promise<SendMessageState> {
  // Validation avec Zod
  const parsedData = createMessageSchema.safeParse(values);

  if (!parsedData.success) {
    return {
      success: false,
      errors: parsedData.error.flatten().fieldErrors,
      message: "Veuillez vérifier les informations du formulaire.",
      data: values, // Renvoi des données pour pré-remplissage en cas d'erreur
    };
  }

  try {
    const payload = {
      ...parsedData.data,
      target_role: (parsedData.data.target_role as UserRole) ?? null,
      target_user_id: parsedData.data.target_user_id ?? null,
    };
    const result = await sendMessage(payload);
    if (!result) {
      throw new Error("Échec de l'envoi du message");
    }
  } catch (error) {
    console.error("Erreur action sendMessage:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de l'envoi du message.",
      data: values,
    };
  }

  revalidatePath("/messages");
  return { success: true, message: "Message envoyé avec succès" };
}
