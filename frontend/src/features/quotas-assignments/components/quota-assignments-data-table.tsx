"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { QuotaAssignment } from "../types";
import QuotaAssignmentActionsDropdown from "./quota-assignment-actions-dropdown";
import React from "react";
import { Progress } from "@/components/ui/progress";

// Definition des colonnes disponibles
export const availableColumns: {
  key: string;
  label: string;
}[] = [
  { key: "id", label: "ID" },
  { key: "agent", label: "Agent" },
  { key: "quota", label: "Quota" },
  { key: "cible", label: "Cible" },
  { key: "actuel", label: "Actuel" },
  { key: "completion", label: "Avancement" },
  { key: "status", label: "Statut" },
  { key: "actions", label: "Actions" },
];

interface QuotaAssignmentsTableProps {
  assignments: QuotaAssignment[];
  query?: string;
}

export default function QuotaAssignmentsDataTable({
  assignments,
  query = "",
}: QuotaAssignmentsTableProps) {
  const filteredAssignments = assignments.filter((assignment) => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();
    const agentMatch = assignment.user.username
      .toLowerCase()
      .includes(lowerQuery);
    const quotaMatch = assignment.quota.description
      .toLowerCase()
      .includes(lowerQuery);
    return agentMatch || quotaMatch;
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {availableColumns.map((column) => (
              <TableHead
                key={column.key}
                className={column.key === "actions" ? "text-right" : ""}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((assignment) => (
              <TableRow
                key={assignment.id}
                className="hover:bg-muted/50 transition-colors"
              >
                {availableColumns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={column.key === "actions" ? "text-right" : ""}
                  >
                    {getCellValue(assignment, column.key)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={availableColumns.length}
                className="h-24 text-center"
              >
                Aucune assignation trouvée.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function getCellValue(assignment: QuotaAssignment, columnKey: string) {
  switch (columnKey) {
    case "id":
      return <span className="font-medium">{assignment.id}</span>;

    case "agent":
      return (
        <Link
          href={`/users/${assignment.user.id}`}
          className="font-medium hover:underline flex items-center"
        >
          {assignment.user.username}
        </Link>
      );

    case "quota":
      return (
        <Link
          href={`/quotas/${assignment.quota.id}`}
          className="hover:underline"
        >
          {assignment.quota.description}
        </Link>
      );

    case "cible":
      return <span>{assignment.effectif_cible}</span>;

    case "actuel":
      return <span>{assignment.effectif_actuel}</span>;

    case "completion":
      return (
        <div className="flex items-center gap-2">
          <Progress
            value={Math.round(assignment.taux_completion)}
            className="w-[60px] h-2"
          />
          <span className="text-xs">
            {Math.round(assignment.taux_completion)}%
          </span>
        </div>
      );

    case "status":
      return (
        <div className="flex gap-1">
          {assignment.is_active ? (
            <Badge variant="default">Actif</Badge>
          ) : (
            <Badge variant="secondary">Inactif</Badge>
          )}
          {assignment.is_complete && (
            <Badge
              variant="outline"
              className="text-green-600 border-green-600"
            >
              Complet
            </Badge>
          )}
        </div>
      );

    case "actions":
      return <QuotaAssignmentActionsDropdown assignment={assignment} />;

    default:
      return null;
  }
}
