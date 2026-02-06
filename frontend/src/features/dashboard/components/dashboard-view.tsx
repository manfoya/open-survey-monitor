"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { DashboardStats, SurveyListResponse, SurveyPoint } from "../types";
import { StatsCards } from "./stats-cards";
import { QuotaProgress } from "./quota-progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SurveysDataTable } from "./surveys-data-table";
import { OverviewMap } from "./overview-map";
import { LayoutDashboard, TableProperties, Map as MapIcon } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { useCurrentUser } from "@/features/auth/contexts/user-context";
import { UserRole } from "@/features/auth/types";

interface DashboardViewProps {
  stats: DashboardStats;
  initialSurveys: SurveyListResponse;
  initialPoints: SurveyPoint[];
}

export function DashboardView({
  stats,
  initialSurveys,
  initialPoints,
}: DashboardViewProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const currentUser = useCurrentUser();

  const currentTab = searchParams.get("tab") || "stats";
  const currentScope = searchParams.get("scope") || "team";

  const isAgent = currentUser?.role === UserRole.AGENT;

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "stats") {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleScopeChange = (checked: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (checked) {
      params.set("scope", "me");
    } else {
      params.delete("scope");
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs
      value={currentTab}
      onValueChange={handleTabChange}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        
        {!isAgent && (
          <div className="flex items-center space-x-2">
            <Switch 
              id="scope-mode" 
              checked={currentScope === "me"}
              onCheckedChange={handleScopeChange}
            />
            <Label htmlFor="scope-mode">Vue personnelle</Label>
          </div>
        )}
      </div>

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
