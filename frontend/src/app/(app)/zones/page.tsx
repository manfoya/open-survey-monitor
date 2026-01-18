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
import PageHeader from "@/components/page-header";

export default async function ZonesPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    per_page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const page = Number(searchParams?.page) || 1;
  const per_page = Number(searchParams?.per_page) || 5;

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Zones géographiques"
        description="Gérez les zones de collecte de données de votre enquête."
        actions={
          <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
            <Button asChild>
              <Link href="/zones/create">
                <MapPin className="mr-2 h-4 w-4" />
                Créer une zone
              </Link>
            </Button>
          </RoleGuard>
        }
      />

      <div className="flex items-center justify-between mb-6">
        <Search placeholder="Rechercher une zone..." />
      </div>

      <Suspense fallback={<ZonesTableSkeleton />}>
        <ZonesTableAsync query={query} page={page} per_page={per_page} />
      </Suspense>
    </div>
  );
}

async function ZonesTableAsync({
  query,
  page,
  per_page,
}: {
  query: string;
  page: number;
  per_page: number;
}) {
  const currentUser = await getMe();

  if (!currentUser) {
    return <div>Erreur lors du chargement du profil utilisateur.</div>;
  }

  const zones = await getZones();

  if (zones.length === 0) {
    return (
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
    );
  }

  return (
    <ZonesDataTable
      zones={zones}
      page={page}
      query={query}
      per_page={per_page}
    />
  );
}

function ZonesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="border rounded-md">
        <div className="border-b px-4 py-3">
          <div className="flex space-x-4">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b px-4 py-3">
            <div className="flex space-x-4">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
