import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Maximize2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getZoneById } from "@/features/zones/services";
import ZoneMap from "@/features/zones/components/zone-map";

interface ZoneMapPageProps {
  params: Promise<{ id: string }>;
}

export default async function ZoneMapPage({ params }: ZoneMapPageProps) {
  const { id } = await params;
  const zoneId = Number(id);

  if (isNaN(zoneId)) {
    notFound();
  }

  return (
    <div className="h-screen flex flex-col">
      <Suspense fallback={<MapPageSkeleton />}>
        <ZoneMapAsync zoneId={zoneId} />
      </Suspense>
    </div>
  );
}

async function ZoneMapAsync({ zoneId }: { zoneId: number }) {
  let zone;
  
  try {
    zone = await getZoneById(zoneId);
  } catch (error) {
    console.error("Erreur lors du chargement de la zone:", error);
    return <MapErrorState zoneId={zoneId} />;
  }
  
  if (!zone) {
    notFound();
  }

  return (
    <>
      {/* Header compact */}
      <div className="bg-background border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/zones/${zone.id}`} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour aux détails
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <h1 className="text-lg font-semibold">{zone.nom_zone}</h1>
            <span className="text-sm text-muted-foreground">
              (Zone #{zone.id})
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Maximize2 className="h-4 w-4" />
          Vue cartographique étendue
        </div>
      </div>

      {/* Carte plein écran */}
      <div className="flex-1">
        <ZoneMap 
          zone={zone} 
          height="100%" 
          showPopup={true}
        />
      </div>
    </>
  );
}

function MapPageSkeleton() {
  return (
    <div className="h-screen flex flex-col">
      <div className="bg-background border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-20 h-8 bg-muted rounded animate-pulse" />
          <div className="w-48 h-6 bg-muted rounded animate-pulse" />
        </div>
        <div className="w-32 h-5 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex-1 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Chargement de la carte...</div>
      </div>
    </div>
  );
}

function MapErrorState({ zoneId }: { zoneId: number }) {
  return (
    <div className="h-screen flex flex-col">
      <div className="bg-background border-b px-4 py-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/zones" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour aux zones
          </Link>
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground mb-4">
            Impossible de charger la zone #{zoneId}.
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
      </div>
    </div>
  );
}