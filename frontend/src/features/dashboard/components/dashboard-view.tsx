import { DashboardStats } from "../types";
import { StatsCards } from "./stats-cards";
import { QuotaProgress } from "./quota-progress";

interface DashboardViewProps {
  stats: DashboardStats;
}

export function DashboardView({ stats }: DashboardViewProps) {
  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />
      <QuotaProgress stats={stats} />
    </div>
  );
}
