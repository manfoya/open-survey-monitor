"use client";

import { useState, useActionState, useEffect } from "react";
import { updateSettingsAction } from "@/features/app-settings/actions";
import { getTables } from "@/features/app-settings/services";
import { GlobalSettings } from "@/features/app-settings/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { VariableDataType } from "@/features/variables/types";
import { CommunicationCard } from "./sections/communication-card";
import { DataSourceCard } from "./sections/data-source-card";
import { DayRulesCard } from "./sections/day-rules-card";
import { DurationRulesCard } from "./sections/duration-rules-card";
import { GpsRulesCard } from "./sections/gps-rules-card";
import { SpeedRulesCard } from "./sections/speed-rules-card";
import { TimeRulesCard } from "./sections/time-rules-card";

interface GlobalSettingsFormProps {
  initialSettings: GlobalSettings;
  variables: VariableDataType[];
}

export default function GlobalSettingsForm({
  initialSettings,
  variables,
}: GlobalSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateSettingsAction, {
    success: false,
  });

  const [tables, setTables] = useState<string[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);

  // Load tables on mount
  useEffect(() => {
    async function loadTables() {
      try {
        setLoadingTables(true);
        const data = await getTables();
        setTables(data);
      } catch (error) {
        toast.error("Erreur lors du chargement des tables");
        console.error(error);
      } finally {
        setLoadingTables(false);
      }
    }
    loadTables();
  }, []);

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
        <DataSourceCard
          defaultValues={initialSettings}
          variables={variables}
          disabled={isPending}
          tables={tables}
          loadingTables={loadingTables}
        />

        <TimeRulesCard
          defaultValues={initialSettings}
          variables={variables}
          disabled={isPending}
          errors={state.errors}
        />

        <DayRulesCard
          defaultValues={initialSettings}
          disabled={isPending}
          joursInterdits={joursInterdits}
          onJourChange={handleJourChange}
        />

        <GpsRulesCard
          defaultValues={initialSettings}
          variables={variables}
          disabled={isPending}
          errors={state.errors}
        />

        <DurationRulesCard
          defaultValues={initialSettings}
          variables={variables}
          disabled={isPending}
          errors={state.errors}
        />

        <SpeedRulesCard
          defaultValues={initialSettings}
          disabled={isPending}
          errors={state.errors}
        />

        <CommunicationCard
          defaultValues={initialSettings}
          disabled={isPending}
        />

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
