import { Suspense } from "react";
import { getVariables } from "@/features/variables/services";
import VariablesDataTable from "@/features/variables/components/variables-data-table";
import { getMe } from "@/features/auth/services/auth";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import Search from "@/components/search";
import PageHeader from "@/components/page-header";
import { PaginationQuery } from "@/lib/api-types";

export default async function VariablesPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    size?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const page = searchParams?.page || "1";
  const size = searchParams?.size || "10";
  const sort_by = searchParams?.sort_by || 'id';
  const sort_order = searchParams?.sort_order || 'asc';

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Variables de données"
        description="Gérez les variables qui peuvent être collectées dans les enquêtes."
        actions={
          <Button asChild>
            <Link href="/variables/create">
              <Plus className="mr-2 h-4 w-4" />
              Créer une variable
            </Link>
          </Button>
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
  sort_order: 'asc' | 'desc';
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
    return (
      <div className="text-center py-12">
        <Plus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {query 
            ? `Aucune variable trouvée pour "${query}"`
            : "Aucune variable configurée"
          }
        </h3>
        <p className="text-muted-foreground mb-4">
          {query 
            ? "Essayez de modifier votre recherche."
            : "Commencez par définir votre première variable de données."
          }
        </p>
        <Button asChild>
          <Link href="/variables/create">
            <Plus className="mr-2 h-4 w-4" />
            Créer une variable
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <VariablesDataTable
      paginatedVariables={paginatedVariables}
      query={query}
    />
  );
}

function VariablesTableSkeleton() {
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