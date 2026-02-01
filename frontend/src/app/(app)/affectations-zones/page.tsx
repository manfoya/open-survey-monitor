import { Suspense } from "react";
import { getAffectations } from "@/features/affectations-zones/services";
import AffectationsDataTable from "@/features/affectations-zones/components/affectations-data-table";
import { getMe } from "@/features/auth/services/auth";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import Search from "@/components/search";
import PageHeader from "@/components/page-header";
import { AffectationsTableSkeleton } from "@/features/affectations-zones/components/affectations-table-skeleton";
import { AffectationsEmptyState } from "@/features/affectations-zones/components/affectations-empty-state";

export default async function AffectationsPage(props: {
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
        title="Affectations des zones"
        description="Gérez les affectations des contrôleurs aux zones de recensement."
        actions={
          <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
            <Button asChild>
              <Link href="/affectations-zones/create">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle affectation
              </Link>
            </Button>
          </RoleGuard>
        }
      />

      <div className="flex items-center justify-between mb-6">
        <Search placeholder="Rechercher une affectation..." />
      </div>

      <Suspense fallback={<AffectationsTableSkeleton />}>
        <AffectationsTableAsync
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

async function AffectationsTableAsync({
  query,
}: {
  query: string;
  page?: string;
  size?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}) {
  const currentUser = await getMe();

  if (!currentUser) {
    return <div>Erreur lors du chargement du profil utilisateur.</div>;
  }

  const affectations = await getAffectations(query);

  if (affectations.length === 0) {
    return <AffectationsEmptyState query={query} />;
  }

  return <AffectationsDataTable affectations={affectations} query={query} />;
}
