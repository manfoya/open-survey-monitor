"use client";

import { useState, useEffect, useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getZoneById } from "@/features/zones/services";
import { Zone } from "@/features/zones/types";
import {
  updateAffectationAction,
  UpdateAffectationState,
} from "../actions/update-affectation-action";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { errorDiv } from "@/features/app-shell/components/utils";
import { Affectation } from "../types";
import { UserProfile } from "@/features/auth/types";
import { getUserById } from "@/features/users/services";

interface UpdateAffectationFormProps {
  affectation: Affectation;
}

export default function UpdateAffectationForm({
  affectation,
}: UpdateAffectationFormProps) {
  const [zone, setZone] = useState<Zone | null>(null);
  const [controller, setController] = useState<UserProfile | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [isActive, setIsActive] = useState(affectation.est_actif);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const [fetchedZone, fetchedController] = await Promise.all([
          getZoneById(affectation.zone_id),
          getUserById(affectation.controleur_id),
        ]);
        setZone(fetchedZone);
        setController(fetchedController);
      } catch (err) {
        console.error("Failed to load dependency data", err);
        toast.error("Erreur lors du chargement des données.");
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, [affectation.zone_id, affectation.controleur_id]);

  const initialState: UpdateAffectationState = {
    success: false,
    message: null,
  };

  const updateActionWithId = updateAffectationAction.bind(null, affectation.id);
  const [state, formAction, isPending] = useActionState(
    updateActionWithId,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Affectation mise à jour avec succès !");
    }
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-6">
      {alertMessage(state)}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CONTROLLER (READ ONLY) */}
        <div className="space-y-2">
          <Label>Contrôleur</Label>
          <Input
            value={controller ? controller.username : "Chargement..."}
            disabled
            className="bg-muted"
          />
          <p className="text-[0.8rem] text-muted-foreground">
            Le contrôleur ne peut pas être modifié.
          </p>
        </div>

        {/* ZONE (READ ONLY) */}
        <div className="space-y-2">
          <Label>Zone</Label>
          <Input
            value={zone ? zone.nom_zone : "Chargement..."}
            disabled
            className="bg-muted"
          />
          <p className="text-[0.8rem] text-muted-foreground">
            La zone ne peut pas être modifiée.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DATE DEBUT */}
        <div className="space-y-2">
          <Label htmlFor="date_debut">Date de début</Label>
          <Input
            type="date"
            id="date_debut"
            name="date_debut"
            defaultValue={affectation.date_debut || ""}
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
            defaultValue={affectation.date_fin || ""}
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
        <input type="hidden" name="est_actif" value={isActive ? "on" : "off"} />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || isLoadingData}
      >
        {isPending ? "Mise à jour en cours..." : "Mettre à jour l'affectation"}
      </Button>
    </form>
  );
}

function alertMessage(state: UpdateAffectationState) {
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
