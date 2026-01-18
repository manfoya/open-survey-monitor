"use server";

import { revalidatePath } from "next/cache";
import { updateGlobalSettings } from "./services";
import { ApiError } from "@/lib/api-client";

export type UpdateSettingsState = {
  success: boolean;
  message?: string;
  errors?: {
    tolerance_gps_metres?: string[];
    min_duree_minutes?: string[];
    max_enquetes_par_jour?: string[];
    heure_debut_travail?: string[];
    heure_fin_travail?: string[];
  };
};

export async function updateSettingsAction(
  prevState: UpdateSettingsState,
  formData: FormData
): Promise<UpdateSettingsState> {
  try {
    // Extraction et conversion des données du formulaire
    const settingsData = {
      check_heure: formData.get("check_heure") === "on",
      heure_debut_travail: formData.get("heure_debut_travail") as string || undefined,
      heure_fin_travail: formData.get("heure_fin_travail") as string || undefined,
      check_jours: formData.get("check_jours") === "on",
      jours_interdits: formData.get("jours_interdits")?.toString().split(",") || [],
      check_gps: formData.get("check_gps") === "on",
      tolerance_gps_metres: Number(formData.get("tolerance_gps_metres")) || 500,
      check_duree: formData.get("check_duree") === "on",
      min_duree_minutes: Number(formData.get("min_duree_minutes")) || 10,
      check_vitesse: formData.get("check_vitesse") === "on",
      max_enquetes_par_jour: Number(formData.get("max_enquetes_par_jour")) || 20,
      message_du_jour: formData.get("message_du_jour") as string || undefined,
    };

    // Validation basique
    const errors: UpdateSettingsState['errors'] = {};
    
    if (settingsData.tolerance_gps_metres < 0 || settingsData.tolerance_gps_metres > 50000) {
      errors.tolerance_gps_metres = ["La tolérance GPS doit être entre 0 et 50000 mètres"];
    }
    
    if (settingsData.min_duree_minutes < 1 || settingsData.min_duree_minutes > 1440) {
      errors.min_duree_minutes = ["La durée minimale doit être entre 1 et 1440 minutes"];
    }
    
    if (settingsData.max_enquetes_par_jour < 1 || settingsData.max_enquetes_par_jour > 200) {
      errors.max_enquetes_par_jour = ["Le maximum d'enquêtes par jour doit être entre 1 et 200"];
    }

    // Validation des heures si activée
    if (settingsData.check_heure) {
      if (!settingsData.heure_debut_travail) {
        errors.heure_debut_travail = ["L'heure de début est requise"];
      }
      if (!settingsData.heure_fin_travail) {
        errors.heure_fin_travail = ["L'heure de fin est requise"];
      }
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        errors,
        message: "Veuillez corriger les erreurs dans le formulaire."
      };
    }

    // Appel au service pour mettre à jour les paramètres
    await updateGlobalSettings(settingsData);
    
    // Invalider le cache de la page
    revalidatePath("/app-settings");
    
    return {
      success: true,
      message: "Paramètres mis à jour avec succès !"
    };

  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres:", error);
    
    return {
      success: false,
      message: error instanceof ApiError 
        ? error.message 
        : "Une erreur est survenue lors de la mise à jour des paramètres."
    };
  }
}