import { Suspense } from "react";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getQuotaAssignments } from "@/features/quotas-assignments/services";
import QuotaAssignmentsDataTable from "@/features/quotas-assignments/components/quota-assignments-data-table";
import { getMe } from "@/features/auth/services/auth";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import Search from "@/components/search";
import PageHeader from "@/components/page-header";
import { QuotaAssignmentsTableSkeleton } from "@/features/quotas-assignments/components/quota-assignments-table-skeleton";
import { QuotaAssignmentsEmptyState } from "@/features/quotas-assignments/components/quota-assignments-empty-state";

import { getFieldWorkers } from "@/features/users/services";
import { getQuotas } from "@/features/quotas/services";
import CreateQuotaAssignmentDialog from "@/features/quotas-assignments/components/create-quota-assignment-dialog";
import { ActiveFilterCheckbox } from "@/components/active-filter-checkbox";

export const metadata: Metadata = {
  title: "Assignations de quotas",
  description:
    "Consultez les assignations de quotas aux agents et leur progression.",
};

export default async function QuotaAssignmentsPage(props: {
  searchParams?: Promise<{
    query?: string;
    active_only?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const activeOnly = searchParams?.active_only === "true";

  const [users, quotas] = await Promise.all([getFieldWorkers(), getQuotas()]);

  return (
    <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
      <div className="container mx-auto py-6">
        <PageHeader
          title="Assignations de quotas"
          description="Consultez les assignations de quotas aux agents et leur progression."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/quotas-assignments/bulk">
                  Assignation en masse
                </Link>
              </Button>
              <CreateQuotaAssignmentDialog users={users} quotas={quotas} />
            </div>
          }
        />

        <div className="flex flex-col mb-6 gap-4">
          <Search placeholder="Rechercher un agent ou un quota..." />
          <ActiveFilterCheckbox />
        </div>

        <Suspense fallback={<QuotaAssignmentsTableSkeleton />}>
          <QuotaAssignmentsTableAsync query={query} activeOnly={activeOnly} />
        </Suspense>
      </div>
    </RoleGuard>
  );
}

async function QuotaAssignmentsTableAsync({
  query,
  activeOnly,
}: {
  query: string;
  activeOnly: boolean;
}) {
  const currentUser = await getMe();

  if (!currentUser) {
    return <div>Erreur lors du chargement du profil utilisateur.</div>;
  }

  const assignments = await getQuotaAssignments(activeOnly);

  if (assignments.length === 0) {
    return <QuotaAssignmentsEmptyState query={query} />;
  }

  return <QuotaAssignmentsDataTable assignments={assignments} query={query} />;
}
