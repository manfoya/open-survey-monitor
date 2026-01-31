import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "../types";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  FileCheck,
  FileQuestion,
} from "lucide-react";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Reçus",
      value: stats.total_reçus,
      icon: FileText,
      description: "Total des formulaires reçus",
      className: "border-l-4 border-l-blue-500",
    },
    {
      title: "Complet",
      value: stats.total_complet,
      icon: CheckCircle2,
      description: "Formulaires complets",
      className: "border-l-4 border-l-green-500",
    },
    {
      title: "Partiel",
      value: stats.total_partiel,
      icon: HelpCircle,
      description: "Formulaires partiels",
      className: "border-l-4 border-l-yellow-500",
    },
    {
      title: "Refus",
      value: stats.total_refus,
      icon: XCircle,
      description: "Refus de répondre",
      className: "border-l-4 border-l-red-500",
    },
    {
      title: "Valide",
      value: stats.total_valide,
      icon: FileCheck,
      description: "Données validées",
      className: "border-l-4 border-l-emerald-600",
    },
    {
      title: "Suspect",
      value: stats.total_suspect,
      icon: FileQuestion,
      description: "Données suspectes",
      className: "border-l-4 border-l-orange-500",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className={`${card.className} h-full`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
