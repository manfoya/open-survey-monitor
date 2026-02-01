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
import { Affectation } from "../types";
import AffectationActionsDropdown from "./affectation-actions-dropdown";
import { useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Definition des colonnes disponibles
export const availableColumns: {
  key: string;
  label: string;
  alwaysVisible?: boolean;
}[] = [
  { key: "id", label: "ID", alwaysVisible: true },
  { key: "nom_zone", label: "Zone" },
  { key: "nom_controleur", label: "Contrôleur" },
  { key: "date_debut", label: "Date Début" },
  { key: "date_fin", label: "Date Fin" },
  { key: "est_actif", label: "Statut" },
  { key: "actions", label: "Actions", alwaysVisible: true }, // Not selectable but rendered
];

interface AffectationsTableProps {
  affectations: Affectation[];
  query?: string;
}

export default function AffectationsDataTable({
  affectations,
  query = "",
}: AffectationsTableProps) {
  const filteredAffectations = useMemo(
    () =>
      affectations.filter((affectation) => {
        if (!query) return true;
        const lowerQuery = query.toLowerCase();
        const zoneMatch = affectation.nom_zone
          ?.toLowerCase()
          .includes(lowerQuery);
        const controllerMatch = affectation.nom_controleur
          ?.toLowerCase()
          .includes(lowerQuery);
        return zoneMatch || controllerMatch;
      }),
    [affectations, query],
  );

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
          {filteredAffectations.length > 0 ? (
            filteredAffectations.map((affectation) => (
              <TableRow
                key={affectation.id}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() =>
                  (window.location.href = `/affectations-zones/${affectation.id}/edit`)
                }
              >
                {availableColumns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={column.key === "actions" ? "text-right" : ""}
                    onClick={
                      column.key === "actions"
                        ? (e) => e.stopPropagation()
                        : undefined
                    }
                  >
                    {getCellValue(affectation, column.key)}
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
                Aucune affectation trouvée.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function getCellValue(affectation: Affectation, columnKey: string) {
  switch (columnKey) {
    case "id":
      return <span className="font-medium">{affectation.id}</span>;

    case "nom_zone":
      return (
        <span className="font-medium">
          {affectation.nom_zone || `Zone #${affectation.zone_id}`}
        </span>
      );

    case "nom_controleur":
      return (
        <span>
          {affectation.nom_controleur ||
            `Contrôleur #${affectation.controleur_id}`}
        </span>
      );

    case "date_debut":
      return affectation.date_debut
        ? format(new Date(affectation.date_debut), "dd MMM yyyy", {
            locale: fr,
          })
        : "-";

    case "date_fin":
      return affectation.date_fin
        ? format(new Date(affectation.date_fin), "dd MMM yyyy", { locale: fr })
        : "-";

    case "est_actif":
      return (
        <Badge variant={affectation.est_actif ? "default" : "secondary"}>
          {affectation.est_actif ? "Actif" : "Inactif"}
        </Badge>
      );

    case "actions":
      return <AffectationActionsDropdown affectation={affectation} />;

    default:
      return null;
  }
}
