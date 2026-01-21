"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import Pagination from "@/components/pagination";
import DeleteZoneForm from "@/features/zones/components/delete-zone-form";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useRoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import { PaginatedResponse } from "@/lib/api-types";
import { PageSizeSelector } from "@/components/page-size-selector";
import { SortableTableHead } from "@/components/sortable-table-head";

interface ZonesTableProps {
  paginatedZones: PaginatedResponse<Zone>;
  query?: string;
}

// Configuration des colonnes avec support du tri
const zoneColumns = [
  { key: 'id', label: 'ID', sortKey: 'id', className: 'w-[80px]', sortable: true },
  { key: 'nom_zone', label: 'Nom de la zone', sortKey: 'nom_zone', sortable: true },
  { key: 'coordinates', label: 'Coordonnées', sortable: false },
  { key: 'rayon_tolerance_metres', label: 'Rayon', sortKey: 'rayon_tolerance_metres', sortable: true },
  { key: 'actions', label: 'Action', className: 'text-right', sortable: false }
];

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
    case 'id':
      return <span className="font-medium">{zone.id}</span>;
    case 'nom_zone':
      return (
        <Link href={`/zones/${zone.id}`} className="hover:underline font-medium">
          {zone.nom_zone}
        </Link>
      );
    case 'coordinates':
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
    case 'rayon_tolerance_metres':
      return (
        <Badge variant="secondary" className="font-mono text-xs">
          {formatRadius(zone.rayon_tolerance_metres)}
        </Badge>
      );
    case 'actions':
      return <ZoneActionsDropdown zone={zone} />;
    default:
      return null;
  }
}

export default function ZonesDataTable({
  paginatedZones,
  query = ""
}: ZonesTableProps) {
  const searchParams = useSearchParams();
  const { items: zones, meta: paginationMeta } = paginatedZones;

  // Récupérer les paramètres de tri actuels depuis l'URL
  const currentSort = searchParams.get("sort_by") || 'id';
  const currentOrder = (searchParams.get("sort_order") as 'asc' | 'desc') || 'asc';

  useEffect(() => {
    if (searchParams.get("deleted") === "true") {
      toast.success("Zone supprimée avec succès !");
    }
  }, [searchParams]);

  return (
    <div className="space-y-4">
      {/* Barre d'outils avec info pagination et sélecteur de taille */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {paginationMeta.total_items} zone{paginationMeta.total_items > 1 ? 's' : ''} • 
            Page {paginationMeta.current_page} sur {paginationMeta.total_pages}
            {currentSort && (
              <span className="ml-2 text-xs">
                • Trié par {zoneColumns.find(col => col.sortKey === currentSort)?.label} 
                ({currentOrder === 'asc' ? 'croissant' : 'décroissant'})
              </span>
            )}
          </div>
          <PageSizeSelector currentPageSize={paginationMeta.page_size} />
        </div>
      </div>

      {/* Tableau avec tri */}
      <div className="rounded-md border">
        <Table>
          <TableCaption>
            <p className="m-4">Liste des zones géographiques configurées.</p>
          </TableCaption>

          {/* EN-TÊTE DYNAMIQUE AVEC TRI */}
          <TableHeader>
            <TableRow>
              {zoneColumns.map((column) => (
                column.sortKey ? (
                  <SortableTableHead
                    key={column.key}
                    column={column}
                    currentSort={currentSort}
                    currentOrder={currentOrder}
                  />
                ) : (
                  <TableHead key={column.key} className={column.className}>
                    {column.label}
                  </TableHead>
                )
              ))}
            </TableRow>
          </TableHeader>

          {/* CORPS DU TABLEAU */}
          <TableBody>
            {zones.length > 0 ? (
              zones.map((zone: Zone) => (
                <TableRow
                  key={zone.id}
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => (window.location.href = `/zones/${zone.id}`)}
                >
                  {zoneColumns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={column.key === 'actions' ? 'text-right' : ''}
                      onClick={column.key === 'actions' ? (e) => e.stopPropagation() : undefined}
                    >
                      {getCellValue(zone, column.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={zoneColumns.length} className="h-24 text-center">
                  {query
                    ? `Aucune zone trouvée pour "${query}".`
                    : "Aucune zone configurée."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {/* Pagination en bas du tableau */}
        <div className="border-t">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm text-muted-foreground">
              Affichage de {((paginationMeta.current_page - 1) * paginationMeta.page_size) + 1} à{" "}
              {Math.min(paginationMeta.current_page * paginationMeta.page_size, paginationMeta.total_items)} sur{" "}
              {paginationMeta.total_items} zones
            </div>
            <Pagination totalPages={paginationMeta.total_pages} />
          </div>
        </div>
      </div>
    </div>
  );
}
