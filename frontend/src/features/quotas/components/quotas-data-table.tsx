"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useTableColumnVisibility } from "@/hooks/use-table-column-visibility";
import React from "react";
import { DataTable } from "@/components/shared/data-table";
import { Quota } from "../types";
import QuotaActionsDropdown from "./quota-actions-dropdown";
import { TableColumn, ColumnVisibility } from "@/types/table";
import { Progress } from "@/components/ui/progress";

// Define columns here for simplicity or move to types/table-columns if reused
export const quotaColumns: TableColumn[] = [
  { key: "id", label: "ID", sortable: true, sortKey: "id" },
  {
    key: "description",
    label: "Description",
    sortable: true,
    sortKey: "description",
  },
  { key: "is_active", label: "Statut", sortable: true, sortKey: "is_active" },
  {
    key: "effectif_cible_total",
    label: "Cible Total",
    sortable: true,
    sortKey: "effectif_cible_total",
  },
  {
    key: "effectif_actuel_total",
    label: "Actuel Total",
    sortable: true,
    sortKey: "effectif_actuel_total",
  },
  { key: "taux_completion", label: "Avancement", sortable: false }, // Computed
  { key: "actions", label: "Actions", sortable: false },
];

export const defaultQuotaColumnVisibility: ColumnVisibility = {
  id: true,
  description: true,
  is_active: true,
  effectif_cible_total: true,
  effectif_actuel_total: true,
  taux_completion: true,
  actions: true,
};

interface QuotasTableProps {
  quotas: Quota[]; // Assuming List API returns array, not paginated wrapper yet based on services.ts
  query?: string;
}

export default function QuotasDataTable({
  quotas,
  query = "",
}: QuotasTableProps) {
  const { columnVisibility, updateColumnVisibility, isLoaded } =
    useTableColumnVisibility({
      storageKey: "quotas-table-column-visibility",
      defaultVisibility: defaultQuotaColumnVisibility,
    });

  // Since the current API helper getQuotas() returns Quota[] not PaginatedResponse,
  // we adapt here. If pagination is added later, we'll update this.
  const paginationMeta = {
    current_page: 1,
    page_size: quotas.length,
    total_items: quotas.length,
    total_pages: 1,
  };

  return (
    <DataTable
      data={quotas}
      paginationMeta={paginationMeta}
      columns={quotaColumns}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={updateColumnVisibility}
      entityLabel="quota"
      query={query}
      isLoaded={isLoaded}
      caption="Liste des quotas configurés."
      renderRow={(quota, visibleColumns) => (
        <TableRow
          key={quota.id}
          className="hover:bg-muted/50 transition-colors"
        >
          {visibleColumns.map((column) => (
            <TableCell
              key={column.key}
              className={column.key === "actions" ? "text-right" : ""}
            >
              {getCellValue(quota, column.key)}
            </TableCell>
          ))}
        </TableRow>
      )}
    />
  );
}

function getCellValue(quota: Quota, columnKey: string) {
  switch (columnKey) {
    case "id":
      return <span className="font-medium">{quota.id}</span>;

    case "description":
      return <span className="font-medium">{quota.description}</span>;

    case "is_active":
      return (
        <Badge variant={quota.is_active ? "default" : "secondary"}>
          {quota.is_active ? "Actif" : "Inactif"}
        </Badge>
      );

    case "effectif_cible_total":
      return <span>{quota.effectif_cible_total}</span>;

    case "effectif_actuel_total":
      return <span>{quota.effectif_actuel_total}</span>;

    case "taux_completion":
      // Utilisation du champ backend ou calcul
      // Si taux_completion_global est 0-1 ou 0-100 ? Check response mock: 0.
      // Assumption: 0-100 based on 'taux'. If it's float, multiply.
      // Let's assume it's percentage for now (0-100).
      const percent = Math.round(quota.taux_completion_global || 0);
      return (
        <div className="flex items-center gap-2 min-w-[100px]">
          <Progress value={percent} className="h-2 w-[60px]" />
          <span className="text-xs text-muted-foreground">{percent}%</span>
        </div>
      );

    case "actions":
      return <QuotaActionsDropdown quota={quota} />;

    default:
      return null;
  }
}
