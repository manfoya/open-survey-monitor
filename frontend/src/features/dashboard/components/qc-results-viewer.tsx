"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { SurveyQCResult } from "../types";

interface QCResultsViewerProps {
  results: Record<string, SurveyQCResult>;
}

export function QCResultsViewer({ results }: QCResultsViewerProps) {
  if (!results) return <div className="rounded-md border p-4">Permission insuffisante (sinon aucun résultat de contrôle disponible)</div>;

  const resultEntries = Object.entries(results);

  const getStatusIcon = (status: SurveyQCResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "warn":
        return <AlertCircle className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: SurveyQCResult["status"]) => {
    switch (status) {
      case "pass":
        return (
          <Badge variant="outline" className="border-success text-success">
            Pass
          </Badge>
        );
      case "fail":
        return (
          <Badge
            variant="outline"
            className="border-destructive text-destructive"
          >
            Fail
          </Badge>
        );
      case "warn":
        return (
          <Badge variant="outline" className="border-warning text-warning">
            Warning
          </Badge>
        );
    }
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Règle</TableHead>
            <TableHead>Valeur</TableHead>
            <TableHead className="text-right">Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resultEntries.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center h-24 text-muted-foreground"
              >
                Aucun résultat de contrôle disponible.
                (ou permission insuffisante)
              </TableCell>
            </TableRow>
          ) : (
            resultEntries.map(([key, result]) => (
              <TableRow key={key}>
                <TableCell className="font-medium capitalize">
                  {key.replace(/_/g, " ")}
                </TableCell>
                <TableCell>{String(result.val)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {getStatusBadge(result.status)}
                    {getStatusIcon(result.status)}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
