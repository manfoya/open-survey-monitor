import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { getZoneById } from "@/features/zones/services";
import PageHeader from "@/components/page-header";
import ErrorState from "@/components/error-state";
import { ZoneDetailsHeader } from "@/features/zones/components/zone-details/header";
import { ZoneDetailsInfo } from "@/features/zones/components/zone-details/info";
import { ZoneDetailsMap } from "@/features/zones/components/zone-details/map";
import { ZoneDetailsSkeleton } from "@/features/zones/components/zone-details/skeleton";

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
        <Card>
          <ZoneDetailsHeader zone={zone} />
          <ZoneDetailsInfo zone={zone} />
        </Card>
      </div>

      {/* Colonne latérale - Carte */}
      <div className="xl:col-span-1">
        <div className="sticky top-6">
          <ZoneDetailsMap zone={zone} />
        </div>
      </div>
    </div>
  );
}

