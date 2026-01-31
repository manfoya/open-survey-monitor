import { Suspense } from "react";
import { getQuotas } from "@/features/quotas/services";
import QuotasDataTable from "@/features/quotas/components/quotas-data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import Search from "@/components/search";
import PageHeader from "@/components/page-header";
import { QuotasTableSkeleton } from "@/features/quotas/components/quotas-table-skeleton";
import { QuotasEmptyState } from "@/features/quotas/components/quotas-empty-state";

export const dynamic = "force-dynamic";

export default async function QuotasPage(props: {
  searchParams?: Promise<{
    query?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Gestion des quotas"
        description="Gérez les objectifs de représentativité pour vos enquêtes."
        actions={
          <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
            <Button asChild>
              <Link href="/quotas/create">
                <Plus className="mr-2 h-4 w-4" />
                Créer un quota
              </Link>
            </Button>
          </RoleGuard>
        }
      />

      <div className="flex items-center justify-between mb-6">
        <Search placeholder="Rechercher un quota..." />
      </div>

      <Suspense fallback={<QuotasTableSkeleton />}>
        <QuotasTableAsync query={query} />
      </Suspense>
    </div>
  );
}

async function QuotasTableAsync({ query }: { query: string }) {
  const quotas = await getQuotas();

  // Basic client-side filtering until backend search support
  const filteredQuotas = query
    ? quotas.filter((q) =>
        q.description.toLowerCase().includes(query.toLowerCase()),
      )
    : quotas;

  if (filteredQuotas.length === 0) {
    return <QuotasEmptyState query={query} />;
  }

  return <QuotasDataTable quotas={filteredQuotas} query={query} />;
}
