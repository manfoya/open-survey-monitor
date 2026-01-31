"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface ErrorDistributionProps {
  stats: DashboardStats;
}

export function ErrorDistribution({ stats }: ErrorDistributionProps) {
  if (!stats.repartition_erreurs) {
    return null;
  }

  const data = Object.entries(stats.repartition_erreurs)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8 erreurs pour lisibilité

  const totalErrors = data.reduce((acc, curr) => acc + curr.count, 0);

  if (totalErrors === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Répartition des Erreurs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-10">
            Aucune erreur détectée. Excellent travail !
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 min-h-[400px] h-full">
      <CardHeader>
        <CardTitle>Top Erreurs Fréquentes</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            barSize={20}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              width={150}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) =>
                value.length > 20 ? `${value.substring(0, 20)}...` : value
              }
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Bar
              dataKey="count"
              fill="var(--chart-1)"
              radius={[0, 4, 4, 0]}
              barSize={32}
            >
              <LabelList
                dataKey="count"
                position="right"
                className="fill-foreground font-medium"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
