import { Suspense } from "react";
import { Metadata } from "next";
import { getZones } from "@/features/zones/services";
import ZonesDataTable from "@/features/zones/components/zones-data-table";
import { getMe } from "@/features/auth/services/auth";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import Search from "@/components/search";
import PageHeader from "@/components/page-header";
import { PaginationQuery } from "@/lib/api-types";
import { ZonesTableSkeleton } from "@/features/zones/components/zones-table-skeleton";
import { ZonesEmptyState } from "@/features/zones/components/zones-empty-state";

export const metadata: Metadata = {
  title: "Zones géographiques",
  description: "Gérez les zones de collecte de données de votre enquête.",
};

export default async function ZonesPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    size?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const page = searchParams?.page || "1";
  const size = searchParams?.size || "10";
  const sort_by = searchParams?.sort_by || "id";
  const sort_order = searchParams?.sort_order || "asc";

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
        <ZonesTableAsync
          query={query}
          page={page}
          size={size}
          sort_by={sort_by}
          sort_order={sort_order}
        />
      </Suspense>
    </div>
  );
}

async function ZonesTableAsync({
  query,
  page,
  size,
  sort_by,
  sort_order,
}: {
  query: string;
  page: string;
  size: string;
  sort_by?: string;
  sort_order: "asc" | "desc";
}) {
  const currentUser = await getMe();

  if (!currentUser) {
    return <div>Erreur lors du chargement du profil utilisateur.</div>;
  }

  // Construire les paramètres pour l'API
  const paginationParams: PaginationQuery = {
    page,
    size,
    sort_by,
    sort_order,
  };

  // Ajouter la recherche seulement si elle n'est pas vide
  if (query.trim()) {
    paginationParams.search = query;
  }

  // Utiliser la nouvelle API avec pagination côté serveur
  const paginatedZones = await getZones(paginationParams);

  if (paginatedZones.meta.total_items === 0) {
    return <ZonesEmptyState query={query} />;
  }

  return <ZonesDataTable paginatedZones={paginatedZones} query={query} />;
}
