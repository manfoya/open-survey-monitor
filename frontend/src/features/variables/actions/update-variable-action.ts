"use server";

import { revalidatePath } from "next/cache";
import { updateVariable } from "../services";
import { CreateVariableDataType } from "../types";

export type ActionState = {
  success?: boolean;
  message?: string;
  errors?: {
    [K in keyof CreateVariableDataType]?: string[];
  };
};

export async function updateVariableAction(
  id: string,
  prevState: ActionState | null,
  data: Partial<CreateVariableDataType>
): Promise<ActionState> {
  const result = await updateVariable(id, data);

  if (!result) {
    return {
      success: false,
      message: "Une erreur est survenue lors de la modification de la variable.",
    };
  }

  revalidatePath("/variables");
  
  return {
    success: true,
    message: "Variable modifiée avec succès !",
  };
}
