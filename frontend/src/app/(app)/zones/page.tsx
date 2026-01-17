import { Suspense } from "react";
import { getZones } from "@/features/zones/services";
import ZonesDataTable from "@/features/zones/components/zones-data-table";
import { getMe } from "@/features/auth/services/auth";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import Search from "@/components/search";

export default async function ZonesPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    per_page?: string;
  }>;
}) {
  // Extraction des paramètres de recherche
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const page = Number(searchParams?.page) || 1;
  const per_page = Number(searchParams?.per_page) || 10;

  // Récupération de l'utilisateur connecté et des zones
  const [currentUser, zones] = await Promise.all([getMe(), getZones()]);

  // Protection : si pas d'utilisateur connecté, redirection gérée par le middleware
  if (!currentUser) {
    return <div>Erreur d&apos;authentification</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader />

      <Suspense fallback={<ZonesTableSkeleton />}>
        {zones.length > 0 ? (
          <ZonesDataTable
            zones={zones}
            page={page}
            query={query}
            per_page={per_page}
          />
        ) : (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune zone configurée</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par créer votre première zone géographique.
            </p>
            <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
              <Button asChild>
                <Link href="/zones/create">
                  <MapPin className="mr-2 h-4 w-4" />
                  Créer une zone
                </Link>
              </Button>
            </RoleGuard>
          </div>
        )}
      </Suspense>
    </div>
  );
}

// Titre et bouton d'action
function PageHeader() {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestion des Zones Géographiques
          </h1>
          <p className="text-muted-foreground">
            Configurez et gérez les zones de collecte de données.
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row-reverse items-stretch sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 sm:space-x-reverse">
        <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/zones/create">
              <MapPin className="mr-2 h-4 w-4" />
              Nouvelle Zone
            </Link>
          </Button>
        </RoleGuard>
        <Search placeholder="Rechercher une zone..." />
      </div>
    </div>
  );
}

// Un petit squelette de chargement pour l'élégance
function ZonesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}