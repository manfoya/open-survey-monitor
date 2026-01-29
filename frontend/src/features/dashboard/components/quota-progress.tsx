import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DashboardStats } from "../types";

interface QuotaProgressProps {
  stats: DashboardStats;
}

export function QuotaProgress({ stats }: QuotaProgressProps) {
  if (!stats.progression_quotas || stats.progression_quotas.length === 0) {
    return null;
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Progression des Quotas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.progression_quotas.map((quota) => (
          <div key={quota.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{quota.nom}</span>
              <span className="text-muted-foreground">
                {quota.fait} / {quota.cible} ({quota.pourcentage.toFixed(1)}%)
              </span>
            </div>
            <Progress 
              value={Math.min(quota.pourcentage, 100)} 
              className={quota.est_atteint ? "[&>[data-slot=progress-indicator]]:bg-green-500" : ""}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
