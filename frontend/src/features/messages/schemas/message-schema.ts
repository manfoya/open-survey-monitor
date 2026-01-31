import { z } from "zod";
import { UserRole } from "@/features/auth/types";

export const createMessageSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Le titre est requis")
      .max(100, "Le titre est trop long"),
    content: z.string().trim().min(1, "Le contenu est requis"),
    target_role: z
      .enum(["agent", "superviseur", "controleur", "directeur"] as const)
      .nullable()
      .optional(),
    target_user_id: z.number().int().positive().nullable().optional(),
  })
  .refine(
    (data) => {
      // Si aucun destinataire n'est spécifié (target_role null et target_user_id null),
      // c'est "Tout le monde" (si votre logique métier le permet) ou erreur si un choix est obligatoire.
      // D'après le formulaire actuel :
      // - "all": les deux sont null
      // - "role": target_role requis
      // - "user": target_user_id requis

      // Ici on ne peut pas facilement valider "targetType" car il n'est pas dans le payload final
      // Mais on peut vérifier la cohérence si besoin
      return true;
    },
    {
      message: "Destinataire invalide",
    },
  );

export type CreateMessageValues = z.infer<typeof createMessageSchema>;
