import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import CreateZoneForm from "@/features/zones/components/create-zone-form";
import PageHeader from "@/components/page-header";
import { ZoneFormSkeleton } from "@/features/zones/components/zone-form-skeleton";

export default async function CreateZonePage() {
  return (
    <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
      <div className="container mx-auto py-6 max-w-2xl">
        <PageHeader
          title="Créer une nouvelle zone"
          description="Configurez une zone géographique pour la collecte de données."
          backHref="/zones"
          backLabel="Retour aux zones"
        />

        <Suspense fallback={<ZoneFormSkeleton />}>
          <CreateZoneFormAsync />
        </Suspense>
      </div>
    </RoleGuard>
  );
}

async function CreateZoneFormAsync() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Nouvelle zone géographique
        </CardTitle>
        <CardDescription>
          Définissez les coordonnées centrales et le rayon de tolérance de votre
          zone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CreateZoneForm />
      </CardContent>
    </Card>
  );
}
