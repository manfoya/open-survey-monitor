"use client";

import { useState, useActionState, useEffect } from "react";
import { updateSettingsAction } from "@/features/app-settings/actions";
import { GlobalSettings } from "@/features/app-settings/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle,
  Clock,
  MapPin,
  Timer,
  Zap,
  MessageCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { errorDiv } from "@/features/app-shell/components/utils";

interface GlobalSettingsFormProps {
  initialSettings: GlobalSettings;
}

const JOURS_SEMAINE = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

export default function GlobalSettingsForm({
  initialSettings,
}: GlobalSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateSettingsAction, {
    success: false,
  });

  // État pour les jours interdits (conversion string -> array)
  const [joursInterdits, setJoursInterdits] = useState<string[]>(
    initialSettings.jours_interdits
      ? initialSettings.jours_interdits
      : ["Dimanche"],
  );

  const handleJourChange = (jour: string, checked: boolean) => {
    if (checked) {
      setJoursInterdits((prev) => [...prev, jour]);
    } else {
      setJoursInterdits((prev) => prev.filter((j) => j !== jour));
    }
  };

  const handleSubmit = (formData: FormData) => {
    // Ajouter les jours interdits au formData
    formData.set("jours_interdits", joursInterdits.join(","));
    formAction(formData);
  };

  // Affichage du toast pour les succès
  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message);
    }
  }, [state.success, state.message]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Message d'alerte global */}
      {state.message && !state.success && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state.success && (
        <Alert className="border-green-600/50 text-green-600 dark:border-green-500 dark:text-green-500 [&>svg]:text-green-600">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Succès</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <form action={handleSubmit} className="space-y-6">
        {/* 1. RÈGLES DE TEMPS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Règles de Temps
            </CardTitle>
            <CardDescription>
              Configuration des horaires de travail valides pour les enquêtes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="check_heure"
                name="check_heure"
                defaultChecked={initialSettings.check_heure}
              />
              <Label
                htmlFor="check_heure"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Activer la vérification des horaires
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heure_debut_travail">Heure de début</Label>
                <Input
                  type="time"
                  id="heure_debut_travail"
                  name="heure_debut_travail"
                  defaultValue={initialSettings.heure_debut_travail}
                  disabled={isPending}
                  aria-invalid={!!state.errors?.heure_debut_travail}
                />
                {errorDiv(state.errors?.heure_debut_travail)}
              </div>
              <div className="space-y-2">
                <Label htmlFor="heure_fin_travail">Heure de fin</Label>
                <Input
                  type="time"
                  id="heure_fin_travail"
                  name="heure_fin_travail"
                  defaultValue={initialSettings.heure_fin_travail}
                  disabled={isPending}
                  aria-invalid={!!state.errors?.heure_fin_travail}
                />
                {errorDiv(state.errors?.heure_fin_travail)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. RÈGLES DE JOURS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Règles de Jours
            </CardTitle>
            <CardDescription>
              Définissez les jours où les enquêtes ne sont pas autorisées.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="check_jours"
                name="check_jours"
                defaultChecked={initialSettings.check_jours}
              />
              <Label
                htmlFor="check_jours"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Activer l&apos;interdiction de certains jours
              </Label>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Jours interdits</Label>
              <div className="grid grid-cols-4 gap-3">
                {JOURS_SEMAINE.map((jour) => (
                  <div key={jour} className="flex items-center space-x-2">
                    <Checkbox
                      id={jour}
                      checked={joursInterdits.includes(jour)}
                      onCheckedChange={(checked) =>
                        handleJourChange(jour, checked as boolean)
                      }
                      disabled={isPending}
                    />
                    <Label htmlFor={jour} className="text-sm">
                      {jour}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. RÈGLES GPS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-yellow-500" />
              Règles GPS
            </CardTitle>
            <CardDescription>
              Configuration de la tolérance géographique pour les enquêtes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="check_gps"
                name="check_gps"
                defaultChecked={initialSettings.check_gps}
              />
              <Label
                htmlFor="check_gps"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Activer la vérification GPS
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tolerance_gps_metres">
                Tolérance GPS (mètres)
              </Label>
              <Input
                type="number"
                id="tolerance_gps_metres"
                name="tolerance_gps_metres"
                defaultValue={initialSettings.tolerance_gps_metres}
                min="0"
                max="50000"
                className="max-w-xs"
                disabled={isPending}
                aria-invalid={!!state.errors?.tolerance_gps_metres}
              />
              <div className="text-xs text-muted-foreground">
                Valeur entre 0 et 50000 mètres (50km)
              </div>
              {errorDiv(state.errors?.tolerance_gps_metres)}
            </div>
          </CardContent>
        </Card>

        {/* 4. RÈGLES DE DURÉE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-red-500" />
              Règles de Durée
            </CardTitle>
            <CardDescription>
              Définissez la durée minimale acceptable pour une enquête.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="check_duree"
                name="check_duree"
                defaultChecked={initialSettings.check_duree}
              />
              <Label
                htmlFor="check_duree"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Vérifier la durée minimale
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_duree_minutes">
                Durée minimale (minutes)
              </Label>
              <Input
                type="number"
                id="min_duree_minutes"
                name="min_duree_minutes"
                defaultValue={initialSettings.min_duree_minutes}
                min="1"
                max="1440"
                className="max-w-xs"
                disabled={isPending}
                aria-invalid={!!state.errors?.min_duree_minutes}
              />
              <div className="text-xs text-muted-foreground">
                Valeur entre 1 et 1440 minutes (24h)
              </div>
              {errorDiv(state.errors?.min_duree_minutes)}
            </div>
          </CardContent>
        </Card>

        {/* 5. RÈGLES DE VITESSE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              Règles de Vitesse
            </CardTitle>
            <CardDescription>
              Contrôlez le nombre maximum d&apos;enquêtes par jour par agent.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="check_vitesse"
                name="check_vitesse"
                defaultChecked={initialSettings.check_vitesse}
              />
              <Label
                htmlFor="check_vitesse"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Vérifier la vitesse de remplissage
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_enquetes_par_jour">
                Maximum d&apos;enquêtes par jour
              </Label>
              <Input
                type="number"
                id="max_enquetes_par_jour"
                name="max_enquetes_par_jour"
                defaultValue={initialSettings.max_enquetes_par_jour}
                min="1"
                max="200"
                className="max-w-xs"
                disabled={isPending}
                aria-invalid={!!state.errors?.max_enquetes_par_jour}
              />
              <div className="text-xs text-muted-foreground">
                Valeur entre 1 et 200 enquêtes par jour
              </div>
              {errorDiv(state.errors?.max_enquetes_par_jour)}
            </div>
          </CardContent>
        </Card>

        {/* 6. COMMUNICATION */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-indigo-500" />
              Communication
            </CardTitle>
            <CardDescription>
              Message affiché sur le tableau de bord de tous les utilisateurs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="message_du_jour">Message du jour</Label>
              <textarea
                id="message_du_jour"
                name="message_du_jour"
                defaultValue={initialSettings.message_du_jour || ""}
                rows={4}
                disabled={isPending}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Entrez un message à afficher sur le tableau de bord..."
              />
              <div className="text-xs text-muted-foreground">
                Ce message sera affiché sur la page d&apos;accueil de tous les
                utilisateurs
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Bouton de soumission */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending} size="lg">
            {isPending ? "Mise à jour..." : "Sauvegarder les paramètres"}
          </Button>
        </div>
      </form>
    </div>
  );
}
