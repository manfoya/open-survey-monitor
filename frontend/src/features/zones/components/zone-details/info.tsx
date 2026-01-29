import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import DeleteZoneForm from "@/features/zones/components/delete-zone-form";
import NavigationGPSButton from "@/features/zones/components/navigation-gps-button";
import { Zone } from "@/features/zones/types";
import {
  calculateZoneArea,
  formatCoordinate,
  formatRadius,
} from "@/features/zones/utils";
import { Edit } from "lucide-react";
import Link from "next/link";

interface ZoneDetailsInfoProps {
  zone: Zone;
}

export function ZoneDetailsInfo({ zone }: ZoneDetailsInfoProps) {
  return (
    <CardContent className="space-y-6">
      {/* Coordonnées - format simplifié */}
      <div>
        <h3 className="font-semibold text-sm text-muted-foreground mb-3">
          COORDONNÉES CENTRALES
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Latitude</div>
            <div className="font-mono text-sm bg-muted p-3 rounded-lg">
              {formatCoordinate(zone.latitude_centrale, "lat")}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Longitude</div>
            <div className="font-mono text-sm bg-muted p-3 rounded-lg">
              {formatCoordinate(zone.longitude_centrale, "lng")}
            </div>
          </div>
        </div>
      </div>

      {/* Rayon de tolérance */}
      <div>
        <h3 className="font-semibold text-sm text-muted-foreground mb-3">
          ZONE DE TOLÉRANCE
        </h3>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-base py-2 px-4">
            {formatRadius(zone.rayon_tolerance_metres)}
          </Badge>
          <div className="text-sm text-muted-foreground">
            <div>Rayon de {zone.rayon_tolerance_metres} mètres</div>
            <div className="text-xs">
              Aire d&apos;environ{" "}
              {calculateZoneArea(zone.rayon_tolerance_metres)} km²
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 border-t">
        <h3 className="font-semibold text-sm text-muted-foreground mb-3">
          ACTIONS
        </h3>
        <div className="flex flex-wrap gap-2">
          <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
            <Button asChild size="sm">
              <Link href={`/zones/${zone.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </Button>
          </RoleGuard>

          <NavigationGPSButton zone={zone} />

          <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
            <DeleteZoneForm
              zoneId={zone.id}
              buttonClassName="flex items-center text-destructive bg-destructive/10 hover:bg-destructive/20 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              buttonText="Supprimer"
              redirectOnSuccess={true}
            />
          </RoleGuard>
        </div>
      </div>
    </CardContent>
  );
}
