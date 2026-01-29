import { DashboardStats } from "../types";
import { StatsCards } from "./stats-cards";
import { QuotaProgress } from "./quota-progress";
import { ErrorDistribution } from "./error-distribution";

interface DashboardViewProps {
  stats: DashboardStats;
}

export function DashboardView({ stats }: DashboardViewProps) {
  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <QuotaProgress stats={stats} />
        <ErrorDistribution stats={stats} />
      </div>
    </div>
  );
}
