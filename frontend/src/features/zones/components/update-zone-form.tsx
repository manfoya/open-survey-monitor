"use client";

import { useEffect, useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  updateZoneAction,
  UpdateZoneState,
} from "@/features/zones/actions/update-zone-action";
import { Zone } from "@/features/zones/types";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function errorDiv(messages: string[] | undefined) {
  if (!messages || messages.length === 0) return null;
  return <div className="mt-1 text-sm text-red-600">{messages[0]}</div>;
}

interface UpdateZoneFormProps {
  zone: Zone;
}

export default function UpdateZoneForm({ zone }: UpdateZoneFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateZoneAction.bind(null, zone.id),
    { success: false }
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Zone mise à jour avec succès !");
    }
  }, [state.success]);

  return (
    <form className="space-y-6" action={formAction}>
      {alertMessage(state)}

      {/* Nom de la zone */}
      <div className="space-y-2">
        <Label htmlFor="nom_zone">Nom de la zone</Label>
        <Input
          id="nom_zone"
          name="nom_zone"
          placeholder="ex: Zone Centre-Ville"
          disabled={isPending}
          defaultValue={state.data?.nom_zone || zone.nom_zone}
          aria-invalid={!!state.errors?.nom_zone}
        />
        <div className="text-xs text-muted-foreground">
          Donnez un nom descriptif pour identifier cette zone géographique
        </div>
        {errorDiv(state.errors?.nom_zone)}
      </div>

      {/* Coordonnées géographiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="latitude_centrale">Latitude centrale</Label>
          <Input
            id="latitude_centrale"
            name="latitude_centrale"
            type="number"
            step="0.000001"
            min="-90"
            max="90"
            placeholder="ex: 48.8566"
            disabled={isPending}
            defaultValue={state.data?.latitude_centrale || zone.latitude_centrale}
            aria-invalid={!!state.errors?.latitude_centrale}
          />
          <div className="text-xs text-muted-foreground">
            Valeur entre -90 et 90 degrés
          </div>
          {errorDiv(state.errors?.latitude_centrale)}
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude_centrale">Longitude centrale</Label>
          <Input
            id="longitude_centrale"
            name="longitude_centrale"
            type="number"
            step="0.000001"
            min="-180"
            max="180"
            placeholder="ex: 2.3522"
            disabled={isPending}
            defaultValue={state.data?.longitude_centrale || zone.longitude_centrale}
            aria-invalid={!!state.errors?.longitude_centrale}
          />
          <div className="text-xs text-muted-foreground">
            Valeur entre -180 et 180 degrés
          </div>
          {errorDiv(state.errors?.longitude_centrale)}
        </div>
      </div>

      {/* Rayon de tolérance */}
      <div className="space-y-2">
        <Label htmlFor="rayon_tolerance_metres">Rayon de tolérance (mètres)</Label>
        <Input
          id="rayon_tolerance_metres"
          name="rayon_tolerance_metres"
          type="number"
          min="1"
          max="50000"
          placeholder="500"
          disabled={isPending}
          defaultValue={
            state.data?.rayon_tolerance_metres || zone.rayon_tolerance_metres
          }
          aria-invalid={!!state.errors?.rayon_tolerance_metres}
        />
        <div className="text-xs text-muted-foreground">
          Définit la zone de tolérance autour du point central (1m - 50km)
        </div>
        {errorDiv(state.errors?.rayon_tolerance_metres)}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? "Mise à jour en cours..." : "Mettre à jour la zone"}
      </Button>
    </form>
  );
}

function alertMessage(state: UpdateZoneState) {
  return (
    <>
      {state.message && !state.success && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state.success && (
        <Alert className="border-green-600/50 text-green-600 dark:border-green-500 dark:text-green-500 [&>svg]:text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Succès</AlertTitle>
          <AlertDescription>
            Zone mise à jour avec succès !
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}