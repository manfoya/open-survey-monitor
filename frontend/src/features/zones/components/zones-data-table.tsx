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
import { Edit, MoreVertical, Eye, MapPin } from "lucide-react";
import Link from "next/link";
import Pagination from "@/components/pagination";
import { Separator } from "@radix-ui/react-separator";
import DeleteZoneForm from "@/features/zones/components/delete-zone-form";

interface ZonesTableProps {
  zones: Zone[];
  query: string;
  page: number;
  per_page: number;
}

function filterZones(zones: Zone[], query: string) {
  if (!query) return zones;
  const lowerQuery = query.toLowerCase().trim();
  return zones.filter(
    (zone) =>
      zone.nom_zone.toLowerCase().includes(lowerQuery) ||
      zone.id.toString().includes(lowerQuery) ||
      zone.latitude_centrale.toString().includes(lowerQuery) ||
      zone.longitude_centrale.toString().includes(lowerQuery)
  );
}

function getRange(page: number, per_page: number) {
  const start = (page - 1) * per_page + 1;
  const end = page * per_page;
  return { start, end };
}

function formatCoordinate(value: number, type: 'lat' | 'lng'): string {
  const direction = type === 'lat' 
    ? (value >= 0 ? 'N' : 'S') 
    : (value >= 0 ? 'E' : 'W');
  return `${Math.abs(value).toFixed(6)}° ${direction}`;
}

function formatRadius(radius: number): string {
  if (radius >= 1000) {
    return `${(radius / 1000).toFixed(1)} km`;
  }
  return `${radius} m`;
}

interface ZoneActionsDropdownProps {
  zone: Zone;
}

function ZoneActionsDropdown({ zone }: ZoneActionsDropdownProps) {
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
        
        {/* Action Édition */}
        <DropdownMenuItem asChild>
          <Link href={`/zones/${zone.id}/edit`} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </DropdownMenuItem>
        
        {/* Action Voir sur carte */}
        <DropdownMenuItem asChild>
          <Link href={`/zones/${zone.id}/map`} className="cursor-pointer">
            <MapPin className="mr-2 h-4 w-4" />
            Voir sur carte
          </Link>
        </DropdownMenuItem>
        
        {/* Action Suppression avec composant réutilisable */}
        <DropdownMenuItem asChild>
          <DeleteZoneForm 
            zoneId={zone.id} 
            zoneName={zone.nom_zone}
            className="w-full"
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ZonesDataTable({ 
  zones, 
  query, 
  page = 1, 
  per_page = 5
}: ZonesTableProps) {
  const filteredZones = filterZones(zones, query);
  const { start, end } = getRange(page, per_page);
  const paginatedZones = filteredZones.slice(start - 1, end);
  const totalPages = Math.ceil(filteredZones.length / per_page);

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>
          <p className="m-4">Liste des zones géographiques configurées.</p>
        </TableCaption>
        
        {/* EN-TÊTE DU TABLEAU */}
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Nom de la zone</TableHead>
            <TableHead>Coordonnées</TableHead>
            <TableHead>Rayon</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        {/* CORPS DU TABLEAU */}
        <TableBody>
          {paginatedZones.length > 0 ? (
            paginatedZones.map((zone: Zone) => (
              <TableRow 
                key={zone.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => window.location.href = `/zones/${zone.id}`}
              >
                <TableCell className="font-medium">{zone.id}</TableCell>
                <TableCell className="font-medium">{zone.nom_zone}</TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <div className="font-mono text-xs">
                      {formatCoordinate(zone.latitude_centrale, 'lat')}
                    </div>
                    <div className="font-mono text-xs">
                      {formatCoordinate(zone.longitude_centrale, 'lng')}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {formatRadius(zone.rayon_tolerance_metres)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <ZoneActionsDropdown zone={zone} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                {query 
                  ? `Aucune zone trouvée pour "${query}".` 
                  : "Aucune zone configurée."
                }
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Separator className="my-2" />
      <Pagination totalPages={totalPages} />
    </div>
  );
}