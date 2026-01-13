"use server";

import { z } from "zod";
import { UserRole } from "../auth/services/auth";
import { postUser } from "./services";
import { ApiError } from "@/lib/api-client";

const createUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Nom d'utilisateur requis")
    .min(3, "3 caractères minimum")
    .max(50, "50 caractères maximum")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Caractères invalides dans le nom d'utilisateur"),
  password: z
    .string()
    .min(1, "Mot de passe requis")
    .min(6, "6 caractères minimum")
    .max(100, "100 caractères maximum"),
    //! ajout de la validation du password si besoin
  role: z
    .enum(["agent", "superviseur", "controleur", "directeur"] as const)
    .refine((role) => ["agent", "superviseur", "controleur", "directeur"].includes(role), {
      path: ["role"],
      message: "Le rôle est invalide",
    }) as z.ZodType<UserRole>,
  cspro_code: z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return null;
      return val;
    },
    z
      .string()
      .trim()
      .min(1, "Code CSPro requis")
      .max(50, "50 caractères maximum")
      .nullable()
  ),
  chef_id: z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return null;
      const n = typeof val === "number" ? val : Number(val);
      return Number.isNaN(n) ? val : n;
    },
    z
      .number()
      .int("Chef invalide")
      .positive("Chef invalide")
      .nullable()
  ),
});

type CreateUserValues = z.infer<typeof createUserSchema>;


// Définition du CreateUserState
export type CreateUserState = {
  success: boolean;
  errors?: {
    username?: string[];
    password?: string[];
    role?: string[];
    cspro_code?: string[];
    chef_id?: string[];
  };
  message?: string | null;
  data?: Partial<CreateUserValues>;
};

// Action pour créer un utilisateur
export async function createUserAction(
  prevState: CreateUserState,
  values: FormData
): Promise<CreateUserState> {
  // Validation avec Zod
  const rawData = {
    username: values.get("username") as string,
    password: values.get("password") as string,
    role: values.get("role") as UserRole,
    cspro_code: values.get("cspro_code") as string | null,
    chef_id: values.get("chef_id") as string | null,
  };
  const parsedData = createUserSchema.safeParse(rawData);

  if (!parsedData.success) {
    return {
      success: false,
      errors: parsedData.error.flatten().fieldErrors,
      message: "Veuillez vérifier les informations du formulaire.",
      data: {
        ...rawData,
        chef_id: Number(rawData.chef_id) || null,
      },
    };
  }

  // Appel au backend pour créer l'utilisateur
  try {
    console.log("Données validées pour création utilisateur :", parsedData.data);
    await postUser(parsedData.data);
  } catch (error) {
    console.log(rawData);
    console.log(parsedData.data);
    console.error("Erreur lors de la création de l'utilisateur :", error);
    return {
      success: false,
      message: (error instanceof ApiError) ? error.message: "Une erreur est survenue lors de la création de l'utilisateur.",
      data: {
        ...rawData,
        password: "", // Ne pas renvoyer le mot de passe
        chef_id: Number(rawData.chef_id) || null,
      },
    };
  }
  return { success: true };
}

type UpdateUserValues = Partial<CreateUserValues>;

// Action pour mettre à jour un utilisateur
export async function updateUserAction(
  id: number, //! garder un œil sur le type de l'ID
  prevState: CreateUserState,
  values: FormData
): Promise<CreateUserState> {
  // Pour l'instant, on réutilise la même logique que pour la création
  // À adapter si besoin
  const rawData = {
    username: values.get("username") as string,
    password: values.get("password") as string,
    role: values.get("role") as UserRole,
    cspro_code: values.get("cspro_code") as string | null,
    chef_id: values.get("chef_id") as string | null,
  };

  const parsedData = createUserSchema.partial({ password: true }).safeParse(rawData);

  if (!parsedData.success) {
    return {
      success: false,
      errors: parsedData.error.flatten().fieldErrors,
      message: "Veuillez vérifier les informations du formulaire.",
      data: {
        ...rawData,
        chef_id: Number(rawData.chef_id) || null,
      },
    };
  }

  // Appel au backend pour mettre à jour l'utilisateur
  try {
    console.log("Données validées pour mise à jour utilisateur :", parsedData.data);
    // await updateUser(parsedData.data as UpdateUserValues);
    // ! À implémenter côté service si besoin
  } catch (error) {
    console.log(rawData);
    console.log(parsedData.data);
    console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    return {
      success: false,
      message: (error instanceof ApiError) ? error.message: "Une erreur est survenue lors de la mise à jour de l'utilisateur.",
      data: {
        ...rawData,
        password: "", // Ne pas renvoyer le mot de passe
        chef_id: Number(rawData.chef_id) || null,
      },
    };
  }
  return { success: true };
}

// Prefixer par 'api' les fonctions d'appel API dans les services si besoin
