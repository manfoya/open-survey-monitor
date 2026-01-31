import { Suspense } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { notFound } from "next/navigation";
import { getZoneById } from "@/features/zones/services";
import UpdateZoneForm from "@/features/zones/components/update-zone-form";
import { User } from "lucide-react";
import PageHeader from "@/components/page-header";
import ErrorState from "@/components/error-state";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import { ZoneFormSkeleton } from "@/features/zones/components/zone-form-skeleton";

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
    <RoleGuard
      allowedRoles={[UserRole.DIRECTEUR]}
      fallback={
        <div className="container mx-auto py-6 max-w-2xl">
          <ErrorState
            title="Accès refusé"
            message="Seuls un directeur peut modifier les zones géographiques."
            primaryAction={{ label: "Retour aux zones", href: "/zones" }}
            showRefresh={false}
          />
        </div>
      }
    >
      <div className="container mx-auto py-6 max-w-2xl">
        <PageHeader
          title={`Modifier la Zone #${zoneId}`}
          description="Modifiez les paramètres de cette zone géographique."
          backHref="/zones"
          backLabel="Retour aux zones"
        />

        <Suspense fallback={<ZoneFormSkeleton />}>
          <EditZoneFormAsync zoneId={zoneId} />
        </Suspense>
      </div>
    </RoleGuard>
  );
}

async function EditZoneFormAsync({ zoneId }: { zoneId: number }) {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {zone.nom_zone}
        </CardTitle>
        <CardDescription>
          Modifiez les coordonnées géographiques et le rayon de tolérance de
          cette zone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UpdateZoneForm zone={zone} />
      </CardContent>
    </Card>
  );
}
