import {
  getDashboardStats,
  getSurveys,
  getSurveysPoints,
} from "@/features/dashboard/services";
import PageHeader from "@/components/page-header";
import { DashboardRefreshButton } from "@/features/dashboard/components/dashboard-refresh-button";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function Page() {
  const [stats, surveys, points] = await Promise.all([
    getDashboardStats(),
    getSurveys({ page: 1, size: 10 }),
    getSurveysPoints(),
  ]);

  if (!stats || !surveys || !points) {
    return <FallbackPage />;
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Tableau de bord"
        description="Aperçu global de l'activité de collecte et de la qualité des données."
        actions={<DashboardRefreshButton />}
      />
      <div className="mt-6">
        <DashboardView
          stats={stats}
          initialSurveys={surveys}
          initialPoints={points}
        />
      </div>
    </div>
  );
}

function FallbackPage() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Tableau de bord"
        description="Aperçu global de l'activité de collecte et de la qualité des données."
        actions={<DashboardRefreshButton />}
      />
      <div className="mt-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Impossible de charger les statistiques du tableau de bord. Veuillez
            réessayer plus tard.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
