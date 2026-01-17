import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";
import { getZoneById } from "@/features/zones/services";
import UpdateZoneForm from "@/features/zones/components/update-zone-form";

interface EditZonePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditZonePage({ params }: EditZonePageProps) {
  const { id } = await params;
  const zoneId = Number(id);

  if (isNaN(zoneId)) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <PageHeader zoneId={zoneId} />
      
      <Suspense fallback={<EditZoneFormSkeleton />}>
        <EditZoneFormAsync zoneId={zoneId} />
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
        <h1 className="text-2xl font-bold tracking-tight">Modifier la Zone #{zoneId}</h1>
        <p className="text-muted-foreground">
          Modifiez les paramètres de cette zone géographique.
        </p>
      </div>
    </div>
  );
}

async function EditZoneFormAsync({ zoneId }: { zoneId: number }) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {zone.nom_zone}
        </CardTitle>
        <CardDescription>
          Modifiez les coordonnées géographiques et le rayon de tolérance de cette zone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UpdateZoneForm zone={zone} />
      </CardContent>
    </Card>
  );
}

function EditZoneFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
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
            Impossible de charger la zone #{zoneId}. Elle a peut-être été supprimée.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
            <Button asChild>
              <Link href="/zones">
                Retour aux zones
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}