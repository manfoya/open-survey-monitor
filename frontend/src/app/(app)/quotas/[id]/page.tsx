import { getQuotaById } from "@/features/quotas/services";
import { notFound } from "next/navigation";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import { getAllVariables } from "@/features/variables/services";
import QuotaStatsCards from "@/features/quotas/components/details/quota-stats-cards";
import QuotaUserList from "@/features/quotas/components/details/quota-user-list";
import QuotaDefinitionCard from "@/features/quotas/components/details/quota-definition-card";

export const dynamic = "force-dynamic";

interface QuotaDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function QuotaDetailsPage({
  params,
}: QuotaDetailsPageProps) {
  const { id } = await params;
  const quotaId = parseInt(id, 10);

  if (isNaN(quotaId)) {
    notFound();
  }

  // Fetch quota and variables for expression preview
  const [quota, variables] = await Promise.all([
    getQuotaById(quotaId),
    getAllVariables(),
  ]);

  if (!quota) {
    notFound();
  }

  const completionRate = Math.round(quota.taux_completion_global || 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title={quota.description}
        description={`ID: ${quota.id} • Créé le ${new Date(
          quota.created_at || "",
        ).toLocaleDateString()}`}
        backHref="/quotas"
        actions={
          <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
            <Button asChild variant="outline">
              <Link href={`/quotas/${quota.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </Button>
          </RoleGuard>
        }
      />

      <QuotaStatsCards quota={quota} completionRate={completionRate} />

      <QuotaDefinitionCard
        definition={quota.definition}
        variables={variables}
      />
      <QuotaUserList userQuotas={quota.user_quotas} />
    </div>
  );
}
