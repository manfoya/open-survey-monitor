"use server";

import { GlobalSettings } from "./types";
import { updateGlobalSettings } from "./services";

export async function updateSettingsAction(settings: Omit<GlobalSettings, "id">): Promise<GlobalSettings> {
  //! Add validation and error handling
  return updateGlobalSettings(settings);
}