import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Edit, Maximize2 } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";
import { getZoneById } from "@/features/zones/services";
import ZoneMap from "@/features/zones/components/zone-map";
import DeleteZoneForm from "@/features/zones/components/delete-zone-form";
import NavigationGPSButton from "@/features/zones/components/navigation-gps-button";
import PageHeader from "@/components/page-header";
import ErrorState from "@/components/error-state";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import {
  formatCoordinate,
  formatRadius,
  calculateZoneArea,
} from "@/features/zones/utils";

interface ZoneDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ZoneDetailsPage({
  params,
}: ZoneDetailsPageProps) {
  const { id } = await params;
  const zoneId = Number(id);

  if (isNaN(zoneId)) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Détails de la zone"
        description="Informations détaillées et localisation géographique."
        backHref="/zones"
        backLabel="Retour aux zones"
      />

      <Suspense fallback={<ZoneDetailsSkeleton />}>
        <ZoneDetailsAsync zoneId={zoneId} />
      </Suspense>
    </div>
  );
}

async function ZoneDetailsAsync({ zoneId }: { zoneId: number }) {
  let zone;

  try {
    zone = await getZoneById(zoneId);
  } catch (error) {
    console.error("Erreur lors du chargement de la zone:", error);
    return (
      <ErrorState
        title="Erreur de chargement"
        message={`Impossible de charger la zone #${zoneId}. Elle a peut-être été supprimée.`}
        primaryAction={{ label: "Retour aux zones", href: "/zones" }}
      />
    );
  }

  if (!zone) {
    notFound();
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Colonne principale - Informations */}
      <div className="xl:col-span-2 space-y-6">
        {/* Carte des informations principales */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <CardTitle>{zone.nom_zone}</CardTitle>
              </div>
              <Badge variant="outline" className="font-mono">
                #{zone.id}
              </Badge>
            </div>
            <CardDescription>
              Zone géographique configurée pour la collecte de données
            </CardDescription>
          </CardHeader>
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
        </Card>
      </div>

      {/* Colonne latérale - Carte */}
      <div className="xl:col-span-1">
        <div className="sticky top-6">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  Localisation
                </CardTitle>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Link href={`/zones/${zone.id}/map`}>
                    <Maximize2 className="h-4 w-4" />
                    <span className="sr-only">Voir la carte en grand</span>
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ZoneMap zone={zone} height="70vh" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ZoneDetailsSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Colonne principale - Informations */}
      <div className="xl:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Coordonnées skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>

            {/* Actions skeleton */}
            <div className="pt-4 space-y-3">
              <Skeleton className="h-4 w-16" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Colonne latérale - Carte */}
      <div className="xl:col-span-1">
        <div className="sticky top-6">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent className="p-0">
              <Skeleton className="h-[70vh] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
