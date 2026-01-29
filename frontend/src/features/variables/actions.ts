import { CreateVariableDataType } from "./types";

// Fonction d'action pour créer une variable
export async function createVariableAction(
  formData: CreateVariableDataType
) {
  const newVariable = 1; //await postVariable(formData);
  if (newVariable) {
    console.log("Variable créée avec succès:", formData);
  } else {
    console.error("Échec de la création de la variable.");
  }
  return {
    success: !!newVariable,
  };
}
