import { Suspense } from "react";
import { getGlobalSettings } from "@/features/app-settings/services";
import GlobalSettingsForm from "@/features/app-settings/components/global-settings-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import ErrorState from "@/components/error-state";
import PageHeader from "@/components/page-header";
import { getAllVariables } from "@/features/variables/services";
import { AppSettingsSkeleton } from "@/features/app-settings/components/skeleton";

export default async function AppSettingsPage() {
  return (
    <RoleGuard
      allowedRoles={[UserRole.DIRECTEUR]}
      fallback={
        <div className="container mx-auto py-6 max-w-4xl">
          <ErrorState
            title="Accès refusé"
            message="Seuls les directeurs peuvent accéder aux paramètres de l'application."
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
  let error = null;

  try {
    const [fetchedSettings, fetchedVariables] = await Promise.all([
      getGlobalSettings(),
      getAllVariables(),
    ]);
    settings = fetchedSettings;
    variables = fetchedVariables;
  } catch (err) {
    console.error("Erreur lors du chargement des paramètres:", err);
    error = err;
  }

  if (error || !settings || !variables) {
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

  return <GlobalSettingsForm initialSettings={settings} variables={variables} />;
}
