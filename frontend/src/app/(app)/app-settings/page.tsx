import { Suspense } from "react";
import { getGlobalSettings } from "@/features/app-settings/services";
import GlobalSettingsForm from "@/features/app-settings/components/global-settings-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import ErrorState from "@/components/error-state";
import PageHeader from "@/components/page-header";

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

        <Suspense fallback={<AppSettingsFormSkeleton />}>
          <AppSettingsFormAsync />
        </Suspense>
      </div>
    </RoleGuard>
  );
}

async function AppSettingsFormAsync() {
  let settings;
  let error = null;

  try {
    settings = await getGlobalSettings();
  } catch (err) {
    console.error("Erreur lors du chargement des paramètres:", err);
    error = err;
  }

  if (error || !settings) {
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

  return <GlobalSettingsForm initialSettings={settings} />;
}

function AppSettingsFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* Skeleton pour les cartes de paramètres */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
