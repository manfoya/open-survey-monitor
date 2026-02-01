"use client";

import { useState, useEffect, useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { UserProfile } from "@/features/auth/types";
import { getControllers } from "@/features/users/services";
import { getAllZones } from "@/features/zones/services";
import { Zone } from "@/features/zones/types";
import {
  createAffectationAction,
  CreateAffectationState,
} from "../actions/create-affectation-action";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { FormCombobox } from "@/components/form-combobox";
import { errorDiv } from "@/features/app-shell/components/utils";

export default function CreateAffectationForm() {
  const [controllers, setControllers] = useState<UserProfile[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Combobox selection states
  const [selectedController, setSelectedController] = useState("");
  const [selectedZone, setSelectedZone] = useState("");

  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const [fetchedControllers, fetchedZones] = await Promise.all([
          getControllers(),
          getAllZones(),
        ]);
        setControllers(fetchedControllers);
        setZones(fetchedZones);
      } catch (err) {
        console.error("Failed to load dependency data", err);
        toast.error("Erreur lors du chargement des contrôleurs ou des zones.");
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, []);

  const initialState: CreateAffectationState = {
    success: false,
    message: null,
  };

  const [state, formAction, isPending] = useActionState(
    createAffectationAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Affectation créée avec succès !");
      // Reset local state
      setSelectedController("");
      setSelectedZone("");
      setIsActive(true);
    }
  }, [state.success]);

  // Transform data for combobox
  const controllerItems = controllers.map((c) => ({
    value: c.id.toString(),
    label: c.username,
    subLabel: c.role,
  }));

  const zoneItems = zones.map((z) => ({
    value: z.id.toString(),
    label: z.nom_zone,
  }));

  return (
    <form action={formAction} className="space-y-6">
      {alertMessage(state)}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormCombobox
          label="Contrôleur"
          name="controleur_id"
          items={controllerItems}
          value={selectedController}
          onChange={setSelectedController}
          isLoading={isLoadingData}
          disabled={isPending}
          error={state.errors?.controleur_id}
          placeholder="Sélectionner un contrôleur..."
          searchPlaceholder="Rechercher un contrôleur..."
          emptyLabel="Aucun contrôleur trouvé."
        />

        <FormCombobox
          label="Zone"
          name="zone_id"
          items={zoneItems}
          value={selectedZone}
          onChange={setSelectedZone}
          isLoading={isLoadingData}
          disabled={isPending}
          error={state.errors?.zone_id}
          placeholder="Sélectionner une zone..."
          searchPlaceholder="Rechercher une zone..."
          emptyLabel="Aucune zone trouvée."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DATE DEBUT */}
        <div className="space-y-2">
          <Label htmlFor="date_debut">Date de début</Label>
          <Input
            type="date"
            id="date_debut"
            name="date_debut"
            disabled={isPending}
            aria-invalid={!!state.errors?.date_debut}
          />
          {errorDiv(state.errors?.date_debut)}
        </div>

        {/* DATE FIN */}
        <div className="space-y-2">
          <Label htmlFor="date_fin">Date de fin</Label>
          <Input
            type="date"
            id="date_fin"
            name="date_fin"
            disabled={isPending}
            aria-invalid={!!state.errors?.date_fin}
          />
          {errorDiv(state.errors?.date_fin)}
        </div>
      </div>

      {/* EST ACTIF */}
      <div className="flex items-center space-x-2">
        <Switch
          id="est_actif"
          checked={isActive}
          onCheckedChange={setIsActive}
          disabled={isPending}
        />
        <Label htmlFor="est_actif">Est actif</Label>
        {/* Hidden input to pass the switch value in formData. 
            If checked, value is "on". If not checked, input is not sent or logic handles it.
            Actually, we need to ensure "on" is sent if true.
        */}
        <input type="hidden" name="est_actif" value={isActive ? "on" : "off"} />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || isLoadingData}
      >
        {isPending ? "Création en cours..." : "Créer l'affectation"}
      </Button>
    </form>
  );
}

function alertMessage(state: CreateAffectationState) {
  if (!state.message) return null;

  return (
    <Alert
      variant={state.success ? "default" : "destructive"}
      className={state.success ? "border-green-600/50 text-green-600" : ""}
    >
      {state.success ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertTitle>{state.success ? "Succès" : "Erreur"}</AlertTitle>
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  );
}
