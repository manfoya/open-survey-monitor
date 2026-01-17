import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import CreateZoneForm from "@/features/zones/components/create-zone-form";

export default async function CreateZonePage() {
  return (
    <RoleGuard allowedRoles={[UserRole.DIRECTEUR]} fallback={<UnauthorizedAccess />}>
      <div className="container mx-auto py-6 max-w-2xl">
        <PageHeader />
        
        <Suspense fallback={<CreateZoneFormSkeleton />}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Nouvelle Zone Géographique
              </CardTitle>
              <CardDescription>
                Définissez une nouvelle zone de collecte avec ses coordonnées géographiques
                et son rayon de tolérance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateZoneForm />
            </CardContent>
          </Card>
        </Suspense>
      </div>
    </RoleGuard>
  );
}

function PageHeader() {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/zones" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour aux zones
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Créer une Zone</h1>
        <p className="text-muted-foreground">
          Ajoutez une nouvelle zone géographique au système.
        </p>
      </div>
    </div>
  );
}

function CreateZoneFormSkeleton() {
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

function UnauthorizedAccess() {
  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
            <p className="text-muted-foreground mb-4">
              Seuls les directeurs peuvent créer de nouvelles zones.
            </p>
            <Button asChild>
              <Link href="/zones">
                Retour aux zones
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}