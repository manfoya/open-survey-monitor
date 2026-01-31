import { Suspense } from "react";
import { getVariables } from "@/features/variables/services";
import VariablesDataTable from "@/features/variables/components/variables-data-table";
import { getMe } from "@/features/auth/services/auth";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import Search from "@/components/search";
import PageHeader from "@/components/page-header";
import { PaginationQuery } from "@/lib/api-types";
import { VariablesTableSkeleton } from "@/features/variables/components/variables-table-skeleton";
import { VariablesEmptyState } from "@/features/variables/components/variables-empty-state";

export default async function VariablesPage(props: {
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
        title="Variables de données"
        description="Gérez les variables qui peuvent être collectées dans les enquêtes."
        actions={
          <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
            <Button asChild>
              <Link href="/variables/create">
                <Plus className="mr-2 h-4 w-4" />
                Créer une variable
              </Link>
            </Button>
          </RoleGuard>
        }
      />

      <div className="flex items-center justify-between mb-6">
        <Search placeholder="Rechercher une variable..." />
      </div>

      <Suspense fallback={<VariablesTableSkeleton />}>
        <VariablesTableAsync
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

async function VariablesTableAsync({
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
  const paginatedVariables = await getVariables(paginationParams);

  if (paginatedVariables.meta.total_items === 0) {
    return <VariablesEmptyState query={query} />;
  }

  return (
    <VariablesDataTable paginatedVariables={paginatedVariables} query={query} />
  );
}
