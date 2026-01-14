"use server";

import { z } from "zod";
import { apiLogin } from "./services/login";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api-client";
import { DEFAULT_LOGIN_REDIRECT, LOGOUT_REDIRECT } from "@/lib/routes";

// Type pour le retour de l'action
type LoginState = {
  success: boolean;
  errors?: {
    username?: string[];
    password?: string[];
  };
  message?: string | null;
  data?: { username?: string };
};

// Schéma de validation Zod
const LoginFormSchema = z.object({
  username: z
    .string()
    .min(3, "Le nom d'utilisateur doit faire au moins 3 caractères"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export async function authenticate(
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // Validation "fail-fast" avec Zod (Côté serveur Next.js)
  const validatedFields = LoginFormSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  const callbackUrl =
    (formData.get("callbackUrl") as string) || DEFAULT_LOGIN_REDIRECT;

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Veuillez vérifier vos informations.",
      data: { username: formData.get("username") as string },
    };
  }

  try {
    // Appel au backend
    const response = await apiLogin(formData);

    // Stockage du JWT dans un cookie HTTP-only (Sécurité Max)
    const cookieStore = await cookies();
    cookieStore.set("access_token", response.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge:
        (Number(process.env?.ACCESS_TOKEN_EXPIRE_MINUTES) || 24 * 60) * 60, // en secondes
    });

    // Pas de return ici si on redirige car redirect() lève une erreur interne gérée par Next (laquelle serait attrapé)
  } catch (error) {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 401:
          return {
            success: false,
            message: "Nom d'utilisateur ou mot de passe incorrect.",
            data: { username: formData.get("username") as string },
          };
        case 422:
          return {
            success: false,
            message: "Format de données invalide.",
            errors: { username: ["Vérifiez ce champ"] },
            data: { username: formData.get("username") as string },
          };
        case 503:
          return {
            success: false,
            message: "Maintenance en cours. Réessayez plus tard.",
          };
        default:
          return {
            success: false,
            message: `Erreur serveur (${error.status})`,
          };
      }
    }

    return { success: false, message: "Une erreur inattendue est survenue." };
  }

  // Redirection vers le dashboard après succès
  redirect(callbackUrl);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  redirect(LOGOUT_REDIRECT);
}
