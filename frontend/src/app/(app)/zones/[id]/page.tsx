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
import { ArrowLeft, MapPin, Edit, Maximize2 } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";
import { getZoneById } from "@/features/zones/services";
import ZoneMap from "@/features/zones/components/zone-map";
import DeleteZoneForm from "@/features/zones/components/delete-zone-form";
import NavigationGPSButton from "@/features/zones/components/navigation-gps-button";

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
      <PageHeader zoneId={zoneId} />

      <Suspense fallback={<ZoneDetailsSkeleton />}>
        <ZoneDetailsAsync zoneId={zoneId} />
      </Suspense>
    </div>
  );
}

function PageHeader({ zoneId }: { zoneId: number }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/zones" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour aux zones
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Détails de la Zone #{zoneId}
        </h1>
        <p className="text-muted-foreground">
          Informations détaillées et localisation géographique.
        </p>
      </div>
    </div>
  );
}

async function ZoneDetailsAsync({ zoneId }: { zoneId: number }) {
  let zone;

  try {
    zone = await getZoneById(zoneId);
  } catch (error) {
    console.error("Erreur lors du chargement de la zone:", error);
    return <ErrorState zoneId={zoneId} />;
  }

  if (!zone) {
    notFound();
  }

  const formatCoordinate = (value: number, type: "lat" | "lng"): string => {
    const direction =
      type === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
    return `${Math.abs(value).toFixed(6)}° ${direction}`;
  };

  const formatRadius = (radius: number): string => {
    if (radius >= 1000) {
      return `${(radius / 1000).toFixed(1)} km`;
    }
    return `${radius} m`;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Colonne principale - Informations de la zone */}
      <div className="xl:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <CardTitle>{zone.nom_zone}</CardTitle>
              </div>
              <Badge variant="outline" className="font-mono">
                Zone #{zone.id}
              </Badge>
            </div>
            <CardDescription>
              Zone géographique configurée pour la collecte de données
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Coordonnées */}
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
                  <div className="text-xs text-muted-foreground">
                    {zone.latitude_centrale.toFixed(6)}°
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Longitude</div>
                  <div className="font-mono text-sm bg-muted p-3 rounded-lg">
                    {formatCoordinate(zone.longitude_centrale, "lng")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {zone.longitude_centrale.toFixed(6)}°
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
                  <div>({zone.rayon_tolerance_metres} mètres)</div>
                  <div className="text-xs">
                    Aire: ~{Math.round(
                      Math.PI * Math.pow(zone.rayon_tolerance_metres / 1000, 2) * 100
                    ) / 100} km²
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
                <Button asChild size="sm">
                  <Link href={`/zones/${zone.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Link>
                </Button>
                <NavigationGPSButton zone={zone} />
                <DeleteZoneForm
                  zoneId={zone.id}
                  zoneName={zone.nom_zone}
                  buttonClassName="flex items-center text-destructive bg-destructive/10 hover:bg-destructive/20 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  buttonText="Supprimer"
                  redirectOnSuccess={true}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations techniques */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations Techniques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="text-muted-foreground">Système de coordonnées</div>
                <div className="font-mono font-medium">WGS84 (GPS)</div>
              </div>
              <div className="space-y-2">
                <div className="text-muted-foreground">Format</div>
                <div className="font-mono font-medium">Degrés décimaux</div>
              </div>
              <div className="space-y-2">
                <div className="text-muted-foreground">Précision</div>
                <div className="font-mono font-medium">6 décimales (~1m)</div>
              </div>
              <div className="space-y-2">
                <div className="text-muted-foreground">Projection</div>
                <div className="font-mono font-medium">EPSG:4326</div>
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
                  <MapPin className="h-4 w-4" />
                  Localisation
                </CardTitle>
                {/* Icône pour voir la carte en grand */}
                <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
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
            <div className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-16" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
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
        
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
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

function ErrorState({ zoneId }: { zoneId: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <div className="text-destructive mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground mb-4">
            Impossible de charger la zone #{zoneId}. Elle a peut-être été
            supprimée.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
            <Button asChild>
              <Link href="/zones">Retour aux zones</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
