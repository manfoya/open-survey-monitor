"use server";

import { ApiError } from "@/lib/api-client";
import z from "zod";
import { updateUser } from "@/features/users/services";
import { revalidatePath } from "next/cache";

const updateUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Nom d'utilisateur requis")
    .min(3, "3 caractères minimum")
    .max(50, "50 caractères maximum")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Caractères invalides dans le nom d'utilisateur",
    )
    .optional(),
  password: z
    .string()
    .min(1, "Mot de passe requis")
    .min(6, "6 caractères minimum")
    .max(100, "100 caractères maximum")
    .optional(),
  //! ajout de la validation du password si besoin
  chef_id: z
    .preprocess((val) => {
      if (val === "" || val === undefined || val === null) return null;
      const n = typeof val === "number" ? val : Number(val);
      return Number.isNaN(n) ? val : n;
    }, z.number().int("Chef invalide").positive("Chef invalide").nullable())
    .optional(),
});

type UpdateUserState = {
  success: boolean;
  errors?: {
    username?: string[];
    password?: string[];
    chef_id?: string[];
  };
  message?: string;
  data?: {
    username?: string | null;
    password?: string | null;
    chef_id?: number | null;
  };
};

type UpdateUserValues = z.infer<typeof updateUserSchema>;

// Action pour mettre à jour un utilisateur
export async function updateUserAction(
  id: number,
  prevState: UpdateUserState,
  values: FormData,
): Promise<UpdateUserState> {
  try {
    // Extraction sécurisée des données du FormData
    const rawUsername = values.get("username");
    const rawPassword = values.get("password");
    const rawChefId = values.get("chef_id");

    const rawData = {} as UpdateUserValues;

    // Ajout conditionnel des champs non vides
    if (rawUsername && rawUsername !== "") {
      rawData.username = String(rawUsername);
    }
    if (rawPassword && rawPassword !== "") {
      rawData.password = String(rawPassword);
    }
    if (rawChefId && rawChefId !== "") {
      const numericChefId = Number(rawChefId);
      if (!isNaN(numericChefId) && numericChefId > 0) {
        rawData.chef_id = numericChefId;
      }
    }

    console.log("Données extraites:", rawData);

    // Vérification qu'il y a au moins une donnée à mettre à jour
    if (Object.keys(rawData).length === 0) {
      return {
        success: false,
        message: "Aucune donnée à mettre à jour.",
        data: {},
      };
    }

    // Validation Zod
    const parsedData = updateUserSchema.safeParse(rawData);

    if (!parsedData.success) {
      console.log("[x] Erreur de validation:", parsedData.error);
      return {
        success: false,
        errors: parsedData.error.flatten().fieldErrors,
        message: "Veuillez vérifier les informations du formulaire.",
        data: {
          username: (rawData.username as string) || null,
          password: null, // Ne jamais retourner le password
          chef_id: (rawData.chef_id as number) || null,
        },
      };
    }

    console.log(" Données validées:", parsedData.data);

    // Appel au service de mise à jour
    await updateUser(id, parsedData.data);
  } catch (error) {
    console.error("Erreur dans updateUserAction:", error);

    // Gestion spécifique des erreurs API
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message,
        data: {
          username: (values.get("username") as string) || null,
          password: null,
          chef_id: values.get("chef_id") ? Number(values.get("chef_id")) : null,
        },
      };
    }

    // Erreur générique
    return {
      success: false,
      message: "Une erreur inattendue est survenue lors de la mise à jour.",
      data: {
        username: (values.get("username") as string) || null,
        password: null,
        chef_id: values.get("chef_id") ? Number(values.get("chef_id")) : null,
      },
    };
  }

  revalidatePath("/users");
  revalidatePath(`/users/${id}`);
  return {
    success: true,
    message: "Utilisateur mis à jour avec succès",
  };
}
