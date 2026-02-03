import { DashboardStats, SurveyListResponse, SurveyPoint } from "../types";
import { StatsCards } from "./stats-cards";
import { QuotaProgress } from "./quota-progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SurveysDataTable } from "./surveys-data-table";
import { OverviewMap } from "./overview-map";
import { LayoutDashboard, TableProperties, Map as MapIcon } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardViewProps {
  stats: DashboardStats;
  initialSurveys: SurveyListResponse;
  initialPoints: SurveyPoint[];
}

export function DashboardView({ stats, initialSurveys, initialPoints }: DashboardViewProps) {
  return (
    <Tabs defaultValue="stats" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
        <TabsTrigger value="stats" className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden sm:inline">Statistiques</span>
          <span className="sm:hidden">Stats</span>
        </TabsTrigger>
        <TabsTrigger value="list" className="flex items-center gap-2">
          <TableProperties className="h-4 w-4" />
          <span className="hidden sm:inline">Liste</span>
          <span className="sm:hidden">Liste</span>
        </TabsTrigger>
        <TabsTrigger value="map" className="flex items-center gap-2">
          <MapIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Carte</span>
          <span className="sm:hidden">Carte</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="stats" className="space-y-6">
        <StatsCards stats={stats} />
        <QuotaProgress stats={stats} />
      </TabsContent>

      <TabsContent value="list" className="space-y-4">
        <SurveysDataTable paginatedSurveys={initialSurveys} />
      </TabsContent>

      <TabsContent value="map" className="space-y-4">
        <OverviewMap points={initialPoints} />
      </TabsContent>
    </Tabs>
  );
}
