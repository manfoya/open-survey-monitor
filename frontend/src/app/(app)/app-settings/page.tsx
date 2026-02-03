import { Suspense } from "react";
import { Metadata } from "next";
import { getGlobalSettings, getTables } from "@/features/app-settings/services";
import GlobalSettingsForm from "@/features/app-settings/components/global-settings-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import ErrorState from "@/components/error-state";
import PageHeader from "@/components/page-header";
import { getAllVariables } from "@/features/variables/services";
import { AppSettingsSkeleton } from "@/features/app-settings/components/skeleton";

export const metadata: Metadata = {
  title: "Paramètres système",
  description: "Configuration globale de l'application et des règles métiers.",
};

export default async function AppSettingsPage() {
  return (
    <RoleGuard
      allowedRoles={[UserRole.DIRECTEUR]}
      fallback={
        <div className="container mx-auto py-6 max-w-4xl">
          <ErrorState
            title="Accès refusé"
            message="Seuls un directeur peut accéder aux paramètres de l'application."
            primaryAction={{ label: "Retour à l'accueil", href: "/overview" }}
            showRefresh={false}
          />
        </div>
      }
    >
      <div className="container mx-auto py-6 max-w-4xl">
        <PageHeader
          title="Paramètres de l'application"
          description="Configurez les règles de validation et contrôles qualité pour toutes les enquêtes."
        />

        <Suspense fallback={<AppSettingsSkeleton />}>
          <AppSettingsFormAsync />
        </Suspense>
      </div>
    </RoleGuard>
  );
}

async function AppSettingsFormAsync() {
  let settings;
  let variables;
  let tables;
  let error = null;

  try {
    const [fetchedSettings, fetchedVariables, fetchedTables] =
      await Promise.all([getGlobalSettings(), getAllVariables(), getTables()]);
    settings = fetchedSettings;
    variables = fetchedVariables;
    tables = fetchedTables;
  } catch (err) {
    console.error("Erreur lors du chargement des paramètres:", err);
    error = err;
  }

  if (error || !settings || !variables || !tables) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Impossible de charger les paramètres de l&apos;application. Veuillez
          vérifier que le serveur est accessible et réessayer.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <GlobalSettingsForm
      initialSettings={settings}
      variables={variables}
      tables={tables}
    />
  );
}
