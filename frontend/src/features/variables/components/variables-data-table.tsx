"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  availableColumns,
  defaultVariableColumnVisibility,
} from "../types/table-columns";
import { useTableColumnVisibility } from "@/hooks/use-table-column-visibility";
import React from "react";
import { PaginatedResponse } from "@/lib/api-types";
import { useSearchParams } from "next/navigation";
import VariableActionsDropdown from "./variable-actions-dropdown";
import { DataTable } from "@/components/shared/data-table";

import { VariableDataType } from "../types";

interface VariablesTableProps {
  paginatedVariables: PaginatedResponse<VariableDataType>;
  query?: string;
}

export default function VariablesDataTable({
  paginatedVariables,
  query = "",
}: VariablesTableProps) {
  const { columnVisibility, updateColumnVisibility, isLoaded } =
    useTableColumnVisibility({
      storageKey: "variables-table-column-visibility",
      defaultVisibility: defaultVariableColumnVisibility,
    });

  const searchParams = useSearchParams();
  const { items: variables, meta: paginationMeta } = paginatedVariables;

  // Récupérer les paramètres de tri actuels depuis l'URL
  const currentSort = searchParams.get("sort_by") || "id";
  const currentOrder =
    (searchParams.get("sort_order") as "asc" | "desc") || "asc";

  return (
    <DataTable
      data={variables}
      paginationMeta={paginationMeta}
      columns={availableColumns}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={updateColumnVisibility}
      currentSort={currentSort}
      currentOrder={currentOrder}
      entityLabel="variable"
      query={query}
      isLoaded={isLoaded}
      caption="Liste des variables de données configurées."
      renderRow={(variable, visibleColumns) => (
        <TableRow
          key={variable.id}
          className="hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => (window.location.href = `/variables/${variable.id}`)}
        >
          {visibleColumns.map((column) => (
            <TableCell
              key={column.key}
              className={column.key === "actions" ? "text-right" : ""}
              onClick={
                column.key === "actions"
                  ? (e) => e.stopPropagation()
                  : undefined
              }
            >
              {getCellValue(variable, column.key)}
            </TableCell>
          ))}
        </TableRow>
      )}
    />
  );
}

// Fonction pour obtenir la valeur d'une cellule selon la colonne
function getCellValue(variable: VariableDataType, columnKey: string) {
  switch (columnKey) {
    case "id":
      return <span className="font-medium">{variable.id}</span>;

    case "label":
      return (
        <Link
          href={`/variables/${variable.id}`}
          className="hover:underline font-medium"
        >
          {variable.label}
        </Link>
      );

    case "slug":
      return (
        <span className="font-mono text-sm bg-muted/50 px-2 py-1 rounded">
          {variable.slug}
        </span>
      );

    case "data_type":
      return (
        <Badge
          variant="outline"
          className={getDataTypeBadge(variable.data_type)}
        >
          {getDataTypeLabel(variable.data_type)}
        </Badge>
      );

    case "is_quota":
      return (
        <Badge variant={variable.is_quota ? "default" : "secondary"}>
          {variable.is_quota ? "Oui" : "Non"}
        </Badge>
      );

    case "actions":
      return <VariableActionsDropdown variable={variable} />;

    default:
      return null;
  }
}

// Helper pour les labels des types de données
function getDataTypeLabel(dataType: string): string {
  const labels: Record<string, string> = {
    number: "Nombre",
    list: "Liste",
    text: "Texte",
    date: "Date",
    boolean: "Booléen",
    time: "Heure",
  };
  return labels[dataType.toLowerCase()] || dataType;
}

// Helper pour les couleurs des badges de type de données
function getDataTypeBadge(dataType: string): string {
  const styles: Record<string, string> = {
    number:
      "border-blue-500/20 text-blue-700 dark:text-blue-300 hover:border-blue-500/30",
    list: "border-green-500/20 text-green-700 dark:text-green-300 hover:border-green-500/30",
    text: "border-purple-500/20 text-purple-700 dark:text-purple-300 hover:border-purple-500/30",
    date: "border-orange-500/20 text-orange-700 dark:text-orange-300 hover:border-orange-500/30",
    boolean:
      "border-gray-500/20 text-gray-700 dark:text-gray-300 hover:border-gray-500/30",
    time: "border-teal-500/20 text-teal-700 dark:text-teal-300 hover:border-teal-500/30",
  };
  return (
    styles[dataType.toLowerCase()] ||
    "border-gray-500/20 text-gray-700 dark:text-gray-300"
  );
}
