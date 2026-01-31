"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Zone } from "@/features/zones/types";
import { formatCoordinate, formatRadius } from "@/features/zones/utils";
import { Edit, MoreVertical, Eye, MapPin } from "lucide-react";
import Link from "next/link";
import DeleteZoneForm from "@/features/zones/components/delete-zone-form";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useRoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import { PaginatedResponse } from "@/lib/api-types";
import {
  availableColumns,
  defaultZoneColumnVisibility,
} from "@/features/zones/types/table-columns";
import { useTableColumnVisibility } from "@/hooks/use-table-column-visibility";
import { DataTable } from "@/components/shared/data-table";

interface ZonesTableProps {
  paginatedZones: PaginatedResponse<Zone>;
  query?: string;
}

interface ZoneActionsDropdownProps {
  zone: Zone;
}

function ZoneActionsDropdown({ zone }: ZoneActionsDropdownProps) {
  const { RoleGuard } = useRoleGuard();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Ouvrir le menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Action Détails */}
        <DropdownMenuItem asChild>
          <Link href={`/zones/${zone.id}`} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            Détails
          </Link>
        </DropdownMenuItem>

        {/* Action Édition - Protégée pour directeurs seulement */}
        <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
          <DropdownMenuItem asChild>
            <Link href={`/zones/${zone.id}/edit`} className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </DropdownMenuItem>
        </RoleGuard>

        {/* Action Voir sur carte */}
        <DropdownMenuItem asChild>
          <Link href={`/zones/${zone.id}/map`} className="cursor-pointer">
            <MapPin className="mr-2 h-4 w-4" />
            Voir sur carte
          </Link>
        </DropdownMenuItem>

        {/* Action Suppression - Protégée pour directeurs seulement */}
        <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
          <DropdownMenuItem asChild>
            <DeleteZoneForm zoneId={zone.id} className="w-full" />
          </DropdownMenuItem>
        </RoleGuard>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Fonction pour obtenir la valeur d'une cellule selon la colonne
function getCellValue(zone: Zone, columnKey: string) {
  switch (columnKey) {
    case "id":
      return <span className="font-medium">{zone.id}</span>;
    case "nom_zone":
      return (
        <Link
          href={`/zones/${zone.id}`}
          className="hover:underline font-medium"
        >
          {zone.nom_zone}
        </Link>
      );
    case "coordinates":
      return (
        <div className="space-y-1 text-sm">
          <div className="font-mono text-xs">
            {formatCoordinate(zone.latitude_centrale, "lat")}
          </div>
          <div className="font-mono text-xs">
            {formatCoordinate(zone.longitude_centrale, "lng")}
          </div>
        </div>
      );
    case "rayon_tolerance_metres":
      return (
        <Badge variant="secondary" className="font-mono text-xs">
          {formatRadius(zone.rayon_tolerance_metres)}
        </Badge>
      );
    case "actions":
      return <ZoneActionsDropdown zone={zone} />;
    default:
      return null;
  }
}

export default function ZonesDataTable({
  paginatedZones,
  query = "",
}: ZonesTableProps) {
  const { columnVisibility, updateColumnVisibility, isLoaded } =
    useTableColumnVisibility({
      storageKey: "zones-table-column-visibility",
      defaultVisibility: defaultZoneColumnVisibility,
    });

  const searchParams = useSearchParams();
  const { items: zones, meta: paginationMeta } = paginatedZones;

  // Récupérer les paramètres de tri actuels depuis l'URL
  const currentSort = searchParams.get("sort_by") || "id";
  const currentOrder =
    (searchParams.get("sort_order") as "asc" | "desc") || "asc";

  useEffect(() => {
    if (searchParams.get("deleted") === "true") {
      toast.success("Zone supprimée avec succès !");
    }
  }, [searchParams]);

  return (
    <DataTable
      data={zones}
      paginationMeta={paginationMeta}
      columns={availableColumns}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={updateColumnVisibility}
      currentSort={currentSort}
      currentOrder={currentOrder}
      entityLabel="zone"
      query={query}
      isLoaded={isLoaded}
      caption="Liste des zones géographiques configurées."
      renderRow={(zone, visibleColumns) => (
        <TableRow
          key={zone.id}
          className="hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => (window.location.href = `/zones/${zone.id}`)}
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
              {getCellValue(zone, column.key)}
            </TableCell>
          ))}
        </TableRow>
      )}
    />
  );
}
