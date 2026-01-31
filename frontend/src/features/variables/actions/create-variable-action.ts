"use server";

import { revalidatePath } from "next/cache";
import { createVariable } from "../services";
import { CreateVariableDataType } from "../types";

export type ActionState = {
  success?: boolean;
  message?: string;
  errors?: {
    [K in keyof CreateVariableDataType]?: string[];
  };
};

export async function createVariableAction(
  prevState: ActionState | null,
  data: CreateVariableDataType,
): Promise<ActionState> {
  const result = await createVariable(data);

  if (!result) {
    return {
      success: false,
      message: "Une erreur est survenue lors de la création de la variable.",
    };
  }

  revalidatePath("/variables");

  return {
    success: true,
    message: "Variable créée avec succès !",
  };
}
