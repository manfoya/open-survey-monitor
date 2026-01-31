import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Quota } from "@/features/quotas/types";

interface QuotaStatsCardsProps {
  quota: Quota;
  completionRate: number;
}

export default function QuotaStatsCards({
  quota,
  completionRate,
}: QuotaStatsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Statut</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant={quota.is_active ? "default" : "secondary"}>
            {quota.is_active ? "Actif" : "Inactif"}
          </Badge>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Effectif Cible</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quota.effectif_cible_total}</div>
          <p className="text-xs text-muted-foreground">Total à atteindre</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Effectif Réalisé
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {quota.effectif_actuel_total}
          </div>
          <p className="text-xs text-muted-foreground">Collectés et validés</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Progression Globale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate}%</div>
          <Progress value={completionRate} className="mt-2 h-2" />
        </CardContent>
      </Card>
    </div>
  );
}
