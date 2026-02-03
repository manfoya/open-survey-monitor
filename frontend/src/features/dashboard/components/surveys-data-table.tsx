"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  availableColumns,
  defaultSurveyColumnVisibility,
} from "../types/table-columns";
import { useTableColumnVisibility } from "@/hooks/use-table-column-visibility";
import React from "react";
import { useSearchParams } from "next/navigation";
import { PageSizeSelector } from "@/components/page-size-selector";
import { DataTable } from "@/components/shared/data-table";
import { SurveyItem, SurveyListResponse, SurveyStatus } from "../types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import { ColumnVisibility } from "@/types/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QCResultsViewer } from "./qc-results-viewer";

interface SurveysTableProps {
  paginatedSurveys: SurveyListResponse;
}

export function SurveysDataTable({ paginatedSurveys }: SurveysTableProps) {
  const { columnVisibility, updateColumnVisibility, isLoaded } =
    useTableColumnVisibility({
      storageKey: "surveys-table-column-visibility",
      defaultVisibility: defaultSurveyColumnVisibility,
    });

  const searchParams = useSearchParams();
  const { items: surveys, meta: paginationMeta } = paginatedSurveys;

  const currentSort = searchParams.get("sort_by") || "id";
  const currentOrder =
    (searchParams.get("sort_order") as "asc" | "desc") || "asc";

  return (
    <DataTable
      data={surveys}
      paginationMeta={paginationMeta}
      columns={availableColumns}
      columnVisibility={columnVisibility as ColumnVisibility}
      onColumnVisibilityChange={
        updateColumnVisibility as (visibility: ColumnVisibility) => void
      }
      currentSort={currentSort}
      currentOrder={currentOrder}
      entityLabel="enquête"
      isLoaded={isLoaded}
      caption="Liste des enquêtes collectées."
      renderRow={(survey, visibleColumns) => (
        <TableRow
          key={survey.id}
          className="hover:bg-muted/50 transition-colors"
        >
          {visibleColumns.map((column) => (
            <TableCell key={column.key}>
              {getCellValue(survey, column.key)}
            </TableCell>
          ))}
        </TableRow>
      )}
    />
  );
}

function getCellValue(survey: SurveyItem, columnKey: string) {
  switch (columnKey) {
    case "id":
      return <span className="font-medium">{survey.id}</span>;

    case "agent":
      return (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{survey.agent_name}</span>
          <span className="text-xs text-muted-foreground">
            {survey.agent_code || "N/A"}
          </span>
        </div>
      );

    case "status":
      return getStatusBadge(survey.status);

    case "validation":
      return survey.is_valid ? (
        <div className="flex items-center gap-1 text-success text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" />
          <span>Valide</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-destructive text-sm font-medium">
          <XCircle className="h-4 w-4" />
          <span>Invalide</span>
        </div>
      );

    case "date":
      return (
        <div className="flex flex-col text-sm">
          <span>
            {format(new Date(survey.date_entretien), "dd/MM/yyyy", {
              locale: fr,
            })}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(survey.date_entretien), "HH:mm", { locale: fr })}
          </span>
        </div>
      );

    case "duree":
      return <span className="text-sm">{survey.duree_minutes} min</span>;

    case "actions":
      return (
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Eye className="h-4 w-4" />
                <span className="sr-only">Voir les contrôles</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  Résultats des contrôles - Enquête #{survey.id}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <QCResultsViewer results={survey.qc_results} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      );

    default:
      return null;
  }
}

const getStatusBadge = (status: SurveyStatus) => {
  switch (status) {
    case "complet":
      return (
        <Badge className="bg-success hover:bg-success/80 text-white">
          Complet
        </Badge>
      );
    case "partiel":
      return (
        <Badge className="bg-warning hover:bg-warning/80 text-white">
          Partiel
        </Badge>
      );
    case "refus":
      return <Badge variant="destructive">Refus</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};
