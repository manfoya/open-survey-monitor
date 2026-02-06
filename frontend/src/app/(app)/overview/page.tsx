import { Metadata } from "next";
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
import { getDayMessage } from "@/features/messages/services";

export const metadata: Metadata = {
  title: "Tableau de bord",
  description:
    "Aperçu global de l'activité de collecte et de la qualité des données.",
};

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    size?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    scope?: "me" | "team";
  }>;
}) {
  const searchParams = await props.searchParams;
  const page = searchParams?.page || "1";
  const size = searchParams?.size || "10";
  const sort_by = searchParams?.sort_by || "id";
  const sort_order = searchParams?.sort_order || "asc";
  const scope = (searchParams?.scope as "me" | "team") || "team";

  const [stats, surveys, points, dayMessage] = await Promise.all([
    getDashboardStats(scope),
    getSurveys({ page, size, sort_by, sort_order, scope }),
    getSurveysPoints(scope),
    getDayMessage(),
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
      {dayMessage && (
        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Message du jour</AlertTitle>
          <AlertDescription>{dayMessage}</AlertDescription>
        </Alert>
      )}
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
